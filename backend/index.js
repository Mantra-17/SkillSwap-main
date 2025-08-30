const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const winston = require('winston');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import security middleware
const {
  authRateLimit,
  generalRateLimit,
  swapRateLimit,
  validateAndSanitizeInput,
  validateEmail,
  validatePassword,
  validateJWT,
  limitRequestSize,
  securityHeaders,
  bruteForceDetection,
  logFailedAuth,
  preventXSS,
  preventParameterPollution,
  corsOptions
} = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
app.use(cors(corsOptions));

// Body parsing middleware with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Security headers
app.use(securityHeaders);

// Input sanitization
app.use(validateAndSanitizeInput);

// XSS protection
app.use(preventXSS);

// Parameter pollution protection
app.use(preventParameterPollution);

// Request size limiting
app.use(limitRequestSize);

// Logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'skill-swap-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// HTTP request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Rate limiting
app.use('/api/auth', authRateLimit);
app.use('/api/swaps', swapRateLimit);
app.use('/api', generalRateLimit);

// Brute force protection for sensitive endpoints
app.use('/api/auth/login', bruteForceDetection);
app.use('/api/auth/register', bruteForceDetection);

// Log failed authentication attempts
app.use('/api/auth', logFailedAuth);

// File paths
const USERS_FILE = path.join(__dirname, 'users.json');
const REQUESTS_FILE = path.join(__dirname, 'swap-requests.json');

// Ensure data files exist
function ensureDataFiles() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }));
  }
  if (!fs.existsSync(REQUESTS_FILE)) {
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify({ requests: [] }));
  }
}

ensureDataFiles();

// Helper functions for file operations
function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data).users || [];
  } catch (error) {
    logger.error('Error reading users file:', error);
    return [];
  }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
  } catch (error) {
    logger.error('Error writing users file:', error);
  }
}

function readRequests() {
  try {
    const data = fs.readFileSync(REQUESTS_FILE, 'utf8');
    return JSON.parse(data).requests || [];
  } catch (error) {
    logger.error('Error reading requests file:', error);
    return [];
  }
}

function writeRequests(requests) {
  try {
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify({ requests }, null, 2));
  } catch (error) {
    logger.error('Error writing requests file:', error);
  }
}

// JWT token generation
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
}

// JWT token verification middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied', 
      message: 'No token provided' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    return res.status(403).json({ 
      error: 'Invalid token', 
      message: 'Token is invalid or expired' 
    });
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Skill Swap API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// User registration with enhanced security
app.post('/api/auth/register', validateEmail, validatePassword, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Username, email, and password are required' 
      });
    }

    const users = readUsers();
    
    // Check if user already exists
    if (users.find(user => user.email === email)) {
      return res.status(400).json({ 
        error: 'User already exists',
        message: 'A user with this email already exists' 
      });
    }

    // Hash password with salt rounds
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      failedLoginAttempts: 0,
      accountLocked: false,
      lockUntil: null
    };

    users.push(newUser);
    writeUsers(users);

    // Generate token
    const token = generateToken(newUser.id);

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      message: 'Internal server error' 
    });
  }
});

// User login with enhanced security
app.post('/api/auth/login', validateEmail, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing credentials',
        message: 'Email and password are required' 
      });
    }

    const users = readUsers();
    const user = users.find(user => user.email === email);

    if (!user) {
      logger.warn(`Failed login attempt for non-existent user: ${email}`);
      return res.status(400).json({ 
        error: 'Invalid credentials',
        message: 'Invalid email or password' 
      });
    }

    // Check if account is locked
    if (user.accountLocked && user.lockUntil && new Date() < new Date(user.lockUntil)) {
      return res.status(423).json({
        error: 'Account locked',
        message: 'Account is temporarily locked due to too many failed attempts',
        lockUntil: user.lockUntil
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      // Increment failed attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      
      // Lock account after 5 failed attempts for 15 minutes
      if (user.failedLoginAttempts >= 5) {
        user.accountLocked = true;
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        logger.warn(`Account locked for user: ${email}`);
      }
      
      writeUsers(users);
      
      logger.warn(`Failed login attempt for user: ${email}, attempts: ${user.failedLoginAttempts}`);
      return res.status(400).json({ 
        error: 'Invalid credentials',
        message: 'Invalid email or password' 
      });
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.accountLocked = false;
    user.lockUntil = null;
    user.lastLogin = new Date().toISOString();
    
    writeUsers(users);

    // Generate token
    const token = generateToken(user.id);

    logger.info(`Successful login for user: ${email}`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: 'Internal server error' 
    });
  }
});

// Protected route example
app.get('/api/profile', authenticateToken, (req, res) => {
  try {
    const users = readUsers();
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User profile not found' 
      });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({ 
      error: 'Profile fetch failed',
      message: 'Internal server error' 
    });
  }
});

// Create swap request with authentication
app.post('/api/swaps/request', authenticateToken, swapRateLimit, async (req, res) => {
  try {
    const { toUserId, skillOffered, skillWanted, message } = req.body;
    const fromUserId = req.user.userId;

    if (!toUserId || !skillOffered || !skillWanted || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'All fields are required' 
      });
    }

    const users = readUsers();
    const fromUser = users.find(u => u.id === fromUserId);
    const toUser = users.find(u => u.id === toUserId);

    if (!fromUser || !toUser) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'One or both users not found' 
      });
    }

    if (fromUserId === toUserId) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Cannot request swap with yourself' 
      });
    }

    const requests = readRequests();
    
    // Check for existing pending request
    const existingRequest = requests.find(r => 
      r.fromUserId === fromUserId && 
      r.toUserId === toUserId && 
      r.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({ 
        error: 'Duplicate request',
        message: 'You already have a pending request with this user' 
      });
    }

    const newRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromUserId,
      toUserId,
      skillOffered,
      skillWanted,
      message,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    requests.push(newRequest);
    writeRequests(requests);

    logger.info(`New swap request created: ${fromUserId} -> ${toUserId}`);

    res.status(201).json({
      message: 'Swap request sent successfully',
      request: newRequest
    });
  } catch (error) {
    logger.error('Create swap request error:', error);
    res.status(500).json({ 
      error: 'Request creation failed',
      message: 'Internal server error' 
    });
  }
});

// Get incoming requests (authenticated)
app.get('/api/swaps/incoming/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user can only access their own requests
    if (req.user.userId !== userId) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'You can only view your own requests' 
      });
    }

    const requests = readRequests();
    const users = readUsers();
    
    const incomingRequests = requests
      .filter(r => r.toUserId === userId && r.status === 'pending')
      .map(request => {
        const requester = users.find(u => u.id === request.fromUserId);
        return {
          id: request.id,
          fromUser: {
            name: requester?.username || 'Unknown User',
            email: requester?.email || '',
            rating: requester?.rating || 0
          },
          skillOffered: request.skillOffered,
          skillWanted: request.skillWanted,
          message: request.message,
          date: request.createdAt,
          status: request.status
        };
      });

    res.json(incomingRequests);
  } catch (error) {
    logger.error('Get incoming requests error:', error);
    res.status(500).json({ 
      error: 'Request fetch failed',
      message: 'Internal server error' 
    });
  }
});

// Accept swap request
app.put('/api/swaps/accept/:requestId', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.userId;

    const requests = readRequests();
    const request = requests.find(r => r.id === requestId);

    if (!request) {
      return res.status(404).json({ 
        error: 'Request not found',
        message: 'Swap request not found' 
      });
    }

    // Verify user can only accept requests sent to them
    if (request.toUserId !== userId) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'You can only accept requests sent to you' 
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Request is not pending' 
      });
    }

    request.status = 'accepted';
    request.updatedAt = new Date().toISOString();
    
    writeRequests(requests);

    logger.info(`Swap request accepted: ${requestId}`);

    res.json({ 
      message: 'Swap request accepted successfully',
      request 
    });
  } catch (error) {
    logger.error('Accept request error:', error);
    res.status(500).json({ 
      error: 'Request acceptance failed',
      message: 'Internal server error' 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'Something went wrong' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: 'Endpoint not found' 
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Skill Swap API running on port ${PORT}`);
  logger.info(`📊 Using local JSON database`);
  logger.info(`🔗 API endpoints available at http://localhost:${PORT}/api`);
  logger.info(`🛡️ Security measures enabled`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});