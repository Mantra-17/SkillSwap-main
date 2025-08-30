const rateLimit = require('express-rate-limit');
const { validationResult } = require('express-validator');

// Rate limiting configuration
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs: windowMs,
    max: max,
    message: {
      error: 'Too many requests',
      message: message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Specific rate limits for different endpoints
const authRateLimit = createRateLimit(15 * 60 * 1000, 5, 'Too many authentication attempts. Please try again later.');
const generalRateLimit = createRateLimit(15 * 60 * 1000, 100, 'Too many requests. Please slow down.');
const swapRateLimit = createRateLimit(15 * 60 * 1000, 20, 'Too many swap requests. Please slow down.');

// Input validation and sanitization middleware
const validateAndSanitizeInput = (req, res, next) => {
  try {
    // Sanitize all string inputs
    const sanitizeString = (str) => {
      if (typeof str === 'string') {
        // Remove SQL injection patterns
        let sanitized = str
          .replace(/['";]/g, '') // Remove SQL delimiters
          .replace(/--/g, '') // Remove SQL comments
          .replace(/\/\*/g, '') // Remove SQL comment start
          .replace(/\*\//g, '') // Remove SQL comment end
          .replace(/xp_/gi, '') // Remove dangerous SQL procedures
          .replace(/sp_/gi, '') // Remove dangerous SQL procedures
          .replace(/exec/gi, '') // Remove dangerous SQL commands
          .replace(/execute/gi, '') // Remove dangerous SQL commands
          .replace(/union/gi, '') // Remove dangerous SQL commands
          .replace(/select/gi, '') // Remove dangerous SQL commands
          .replace(/insert/gi, '') // Remove dangerous SQL commands
          .replace(/update/gi, '') // Remove dangerous SQL commands
          .replace(/delete/gi, '') // Remove dangerous SQL commands
          .replace(/drop/gi, '') // Remove dangerous SQL commands
          .replace(/create/gi, '') // Remove dangerous SQL commands
          .replace(/alter/gi, '') // Remove dangerous SQL commands
          .replace(/script/gi, '') // Remove XSS patterns
          .replace(/javascript/gi, '') // Remove XSS patterns
          .replace(/onload/gi, '') // Remove XSS patterns
          .replace(/onerror/gi, '') // Remove XSS patterns
          .replace(/onclick/gi, '') // Remove XSS patterns
          .replace(/onmouseover/gi, '') // Remove XSS patterns
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .trim();
        
        return sanitized;
      }
      return str;
    };

    // Recursively sanitize all request body, query, and params
    const sanitizeObject = (obj) => {
      if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
          if (typeof obj[key] === 'string') {
            obj[key] = sanitizeString(obj[key]);
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeObject(obj[key]);
          }
        });
      }
    };

    // Sanitize request body, query, and params
    if (req.body) sanitizeObject(req.body);
    if (req.query) sanitizeObject(req.query);
    if (req.params) sanitizeObject(req.params);

    next();
  } catch (error) {
    console.error('Input sanitization error:', error);
    res.status(400).json({
      error: 'Invalid input detected',
      message: 'Input contains potentially dangerous content'
    });
  }
};

// Email validation middleware
const validateEmail = (req, res, next) => {
  const { email } = req.body;
  
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
    }
  }
  
  next();
};

// Password strength validation middleware
const validatePassword = (req, res, next) => {
  const { password } = req.body;
  
  if (password) {
    // Password must be at least 8 characters with uppercase, lowercase, number, and special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: 'Weak password',
        message: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
      });
    }
  }
  
  next();
};

// JWT token validation middleware
const validateJWT = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      error: 'No token provided',
      message: 'Access token is required'
    });
  }
  
  // Basic JWT format validation
  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
  if (!jwtRegex.test(token)) {
    return res.status(401).json({
      error: 'Invalid token format',
      message: 'Token format is invalid'
    });
  }
  
  next();
};

// Request size limiting middleware
const limitRequestSize = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 1024 * 1024; // 1MB
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      error: 'Request too large',
      message: 'Request body exceeds maximum allowed size'
    });
  }
  
  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  
  next();
};

// Brute force detection middleware
const bruteForceDetection = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const endpoint = req.path;
  
  // Store failed attempts in memory (in production, use Redis or database)
  if (!req.app.locals.failedAttempts) {
    req.app.locals.failedAttempts = new Map();
  }
  
  const key = `${clientIP}:${endpoint}`;
  const attempts = req.app.locals.failedAttempts.get(key) || { count: 0, firstAttempt: Date.now() };
  
  // Reset if 15 minutes have passed
  if (Date.now() - attempts.firstAttempt > 15 * 60 * 1000) {
    attempts.count = 0;
    attempts.firstAttempt = Date.now();
  }
  
  // Check if too many attempts
  if (attempts.count >= 10) {
    return res.status(429).json({
      error: 'Too many failed attempts',
      message: 'Account temporarily locked. Please try again later.',
      retryAfter: Math.ceil((15 * 60 * 1000 - (Date.now() - attempts.firstAttempt)) / 1000)
    });
  }
  
  // Store current attempt
  req.app.locals.failedAttempts.set(key, attempts);
  
  next();
};

// Log failed authentication attempts
const logFailedAuth = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    if (res.statusCode === 401 || res.statusCode === 403) {
      const clientIP = req.ip || req.connection.remoteAddress;
      const endpoint = req.path;
      const key = `${clientIP}:${endpoint}`;
      
      if (req.app.locals.failedAttempts && req.app.locals.failedAttempts.has(key)) {
        const attempts = req.app.locals.failedAttempts.get(key);
        attempts.count++;
        req.app.locals.failedAttempts.set(key, attempts);
        
        console.log(`Failed authentication attempt from ${clientIP} on ${endpoint}. Total attempts: ${attempts.count}`);
      }
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// XSS protection middleware
const preventXSS = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    const sanitizeXSS = (obj) => {
      if (typeof obj === 'string') {
        return obj
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
      } else if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => {
          obj[key] = sanitizeXSS(obj[key]);
        });
      }
      return obj;
    };
    
    req.body = sanitizeXSS(req.body);
  }
  
  next();
};

// Parameter pollution protection middleware
const preventParameterPollution = (req, res, next) => {
  // Remove duplicate parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (Array.isArray(req.query[key])) {
        req.query[key] = req.query[key][req.query[key].length - 1];
      }
    });
  }
  
  next();
};

module.exports = {
  // Rate limiting
  authRateLimit,
  generalRateLimit,
  swapRateLimit,
  
  // Input validation and sanitization
  validateAndSanitizeInput,
  validateEmail,
  validatePassword,
  
  // Authentication
  validateJWT,
  
  // Request validation
  limitRequestSize,
  
  // Security headers
  securityHeaders,
  
  // Brute force protection
  bruteForceDetection,
  logFailedAuth,
  
  // XSS and parameter pollution protection
  preventXSS,
  preventParameterPollution,
  
  // CORS configuration
  corsOptions: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:8080'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count']
  }
}; 