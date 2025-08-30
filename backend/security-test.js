// Security Test Suite for SkillSwap Backend
// This file demonstrates and tests all security measures

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'TestPass123!';

// Test data for security testing
const maliciousInputs = [
  // SQL Injection attempts
  "'; DROP TABLE users; --",
  "' OR '1'='1",
  "'; INSERT INTO users VALUES ('hacker', 'hacker@evil.com', 'password'); --",
  "'; EXEC xp_cmdshell('dir'); --",
  
  // XSS attempts
  "<script>alert('XSS')</script>",
  "javascript:alert('XSS')",
  "<img src=x onerror=alert('XSS')>",
  "<svg onload=alert('XSS')>",
  
  // Command injection
  "test; rm -rf /",
  "test && cat /etc/passwd",
  "test | whoami",
  
  // Path traversal
  "../../../etc/passwd",
  "..\\..\\..\\windows\\system32\\config\\sam",
  
  // NoSQL injection
  '{"$where": "function() { return true; }"}',
  '{"$ne": null}'
];

// Test rate limiting
async function testRateLimiting() {
  console.log('\n🔒 Testing Rate Limiting...');
  
  try {
    // Test authentication rate limiting
    console.log('Testing auth rate limiting (5 attempts per 15 minutes)...');
    
    for (let i = 0; i < 6; i++) {
      try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: 'test@example.com',
          password: 'wrongpassword'
        });
        console.log(`Attempt ${i + 1}: Success`);
      } catch (error) {
        if (error.response?.status === 429) {
          console.log(`Attempt ${i + 1}: Rate limited - ${error.response.data.message}`);
          break;
        } else {
          console.log(`Attempt ${i + 1}: Failed - ${error.response?.status}`);
        }
      }
    }
    
    // Test general rate limiting
    console.log('\nTesting general rate limiting (100 requests per 15 minutes)...');
    const promises = [];
    for (let i = 0; i < 105; i++) {
      promises.push(axios.get(`${BASE_URL}/health`));
    }
    
    const results = await Promise.allSettled(promises);
    const rateLimited = results.filter(r => r.status === 'rejected' && r.reason.response?.status === 429).length;
    console.log(`Rate limited requests: ${rateLimited}`);
    
  } catch (error) {
    console.error('Rate limiting test error:', error.message);
  }
}

// Test input sanitization
async function testInputSanitization() {
  console.log('\n🧹 Testing Input Sanitization...');
  
  try {
    for (const maliciousInput of maliciousInputs) {
      try {
        const response = await axios.post(`${BASE_URL}/api/auth/register`, {
          username: maliciousInput,
          email: maliciousInput,
          password: 'TestPass123!'
        });
        console.log(`Input "${maliciousInput.substring(0, 30)}..." - Sanitized and processed`);
      } catch (error) {
        if (error.response?.status === 400) {
          console.log(`Input "${maliciousInput.substring(0, 30)}..." - Blocked as expected`);
        } else {
          console.log(`Input "${maliciousInput.substring(0, 30)}..." - Error: ${error.response?.status}`);
        }
      }
    }
  } catch (error) {
    console.error('Input sanitization test error:', error.message);
  }
}

// Test brute force protection
async function testBruteForceProtection() {
  console.log('\n🛡️ Testing Brute Force Protection...');
  
  try {
    // Register a test user first
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, {
        username: 'testuser',
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      console.log('Test user registered');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('already exists')) {
        console.log('Test user already exists');
      } else {
        console.log('User registration failed:', error.response?.data);
        return;
      }
    }
    
    // Test brute force attempts
    console.log('Testing brute force protection (5 attempts before lock)...');
    
    for (let i = 0; i < 7; i++) {
      try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: TEST_EMAIL,
          password: 'wrongpassword'
        });
        console.log(`Attempt ${i + 1}: Unexpected success`);
      } catch (error) {
        if (error.response?.status === 423) {
          console.log(`Attempt ${i + 1}: Account locked - ${error.response.data.message}`);
          break;
        } else if (error.response?.status === 400) {
          console.log(`Attempt ${i + 1}: Failed login - ${error.response.data.message}`);
        } else {
          console.log(`Attempt ${i + 1}: Error - ${error.response?.status}`);
        }
      }
    }
    
  } catch (error) {
    console.error('Brute force protection test error:', error.message);
  }
}

// Test authentication security
async function testAuthenticationSecurity() {
  console.log('\n🔐 Testing Authentication Security...');
  
  try {
    // Test weak password
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/register`, {
        username: 'weakuser',
        email: 'weak@example.com',
        password: 'weak'
      });
      console.log('Weak password accepted - Security issue!');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('Weak password')) {
        console.log('Weak password rejected - Security working correctly');
      } else {
        console.log('Password validation error:', error.response?.data);
      }
    }
    
    // Test invalid email
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/register`, {
        username: 'invaliduser',
        email: 'invalid-email',
        password: 'TestPass123!'
      });
      console.log('Invalid email accepted - Security issue!');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('Invalid email format')) {
        console.log('Invalid email rejected - Security working correctly');
      } else {
        console.log('Email validation error:', error.response?.data);
      }
    }
    
    // Test JWT token validation
    try {
      const response = await axios.get(`${BASE_URL}/api/profile`, {
        headers: { Authorization: 'Bearer invalid-token' }
      });
      console.log('Invalid token accepted - Security issue!');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('Invalid token rejected - Security working correctly');
      } else {
        console.log('Token validation error:', error.response?.status);
      }
    }
    
  } catch (error) {
    console.error('Authentication security test error:', error.message);
  }
}

// Test request size limiting
async function testRequestSizeLimiting() {
  console.log('\n📏 Testing Request Size Limiting...');
  
  try {
    // Create a large payload
    const largePayload = {
      message: 'A'.repeat(1024 * 1024 + 100) // Slightly over 1MB
    };
    
    try {
      const response = await axios.post(`${BASE_URL}/api/swaps/request`, largePayload, {
        headers: { Authorization: 'Bearer test-token' }
      });
      console.log('Large request accepted - Security issue!');
    } catch (error) {
      if (error.response?.status === 413) {
        console.log('Large request rejected - Security working correctly');
      } else {
        console.log('Request size validation error:', error.response?.status);
      }
    }
    
  } catch (error) {
    console.error('Request size limiting test error:', error.message);
  }
}

// Test CORS protection
async function testCORSProtection() {
  console.log('\n🌐 Testing CORS Protection...');
  
  try {
    // Test with different origin
    const response = await axios.get(`${BASE_URL}/health`, {
      headers: { Origin: 'https://evil-site.com' }
    });
    
    // Check if CORS headers are present
    const corsHeaders = response.headers;
    if (corsHeaders['access-control-allow-origin']) {
      console.log('CORS headers present - Protection active');
    } else {
      console.log('CORS headers missing - Security issue!');
    }
    
  } catch (error) {
    console.error('CORS protection test error:', error.message);
  }
}

// Test security headers
async function testSecurityHeaders() {
  console.log('\n🛡️ Testing Security Headers...');
  
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    const headers = response.headers;
    
    const securityHeaders = {
      'X-Content-Type-Options': headers['x-content-type-options'],
      'X-Frame-Options': headers['x-frame-options'],
      'X-XSS-Protection': headers['x-xss-protection'],
      'Referrer-Policy': headers['referrer-policy'],
      'Permissions-Policy': headers['permissions-policy']
    };
    
    console.log('Security Headers:');
    Object.entries(securityHeaders).forEach(([header, value]) => {
      if (value) {
        console.log(`  ✅ ${header}: ${value}`);
      } else {
        console.log(`  ❌ ${header}: Missing`);
      }
    });
    
  } catch (error) {
    console.error('Security headers test error:', error.message);
  }
}

// Main test runner
async function runSecurityTests() {
  console.log('🚀 Starting Security Test Suite for SkillSwap Backend');
  console.log('=' .repeat(60));
  
  try {
    // Wait for server to be ready
    console.log('Waiting for server to be ready...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test server health
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Server is running and healthy');
    } catch (error) {
      console.log('❌ Server is not responding, make sure it\'s running on port 3001');
      return;
    }
    
    // Run all security tests
    await testSecurityHeaders();
    await testCORSProtection();
    await testInputSanitization();
    await testAuthenticationSecurity();
    await testRateLimiting();
    await testBruteForceProtection();
    await testRequestSizeLimiting();
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 Security Test Suite Completed!');
    console.log('Check the logs directory for detailed security logs.');
    
  } catch (error) {
    console.error('Security test suite error:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runSecurityTests().catch(console.error);
}

module.exports = {
  runSecurityTests,
  testRateLimiting,
  testInputSanitization,
  testBruteForceProtection,
  testAuthenticationSecurity,
  testRequestSizeLimiting,
  testCORSProtection,
  testSecurityHeaders
}; 