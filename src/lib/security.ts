// Frontend Security Utilities

// Input sanitization for XSS prevention
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .trim();
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password strength validation
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// SQL injection prevention for search queries
export const sanitizeSearchQuery = (query: string): string => {
  if (typeof query !== 'string') return '';
  
  return query
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
    .trim();
};

// URL validation
export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// File type validation
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

// File size validation
export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

// Rate limiting for frontend actions
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  canProceed(key: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt || now > attempt.resetTime) {
      // Reset or create new attempt
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (attempt.count >= this.maxAttempts) {
      return false;
    }

    attempt.count++;
    return true;
  }

  getRemainingTime(key: string): number {
    const attempt = this.attempts.get(key);
    if (!attempt) return 0;
    
    const remaining = attempt.resetTime - Date.now();
    return Math.max(0, remaining);
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// CSRF token generation and validation
export class CSRFProtection {
  private static generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  static getToken(): string {
    let token = sessionStorage.getItem('csrf_token');
    if (!token) {
      token = this.generateToken();
      sessionStorage.setItem('csrf_token', token);
    }
    return token;
  }

  static validateToken(token: string): boolean {
    const storedToken = sessionStorage.getItem('csrf_token');
    return token === storedToken;
  }

  static refreshToken(): string {
    const token = this.generateToken();
    sessionStorage.setItem('csrf_token', token);
    return token;
  }
}

// Secure storage utilities
export class SecureStorage {
  private static encryptionKey = 'skillswap-secure-key';

  static setItem(key: string, value: any): void {
    try {
      const encryptedValue = btoa(JSON.stringify(value));
      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error('Error storing secure data:', error);
    }
  }

  static getItem(key: string): any {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;
      
      const decryptedValue = atob(encryptedValue);
      return JSON.parse(decryptedValue);
    } catch (error) {
      console.error('Error retrieving secure data:', error);
      return null;
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing secure data:', error);
    }
  }

  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing secure data:', error);
    }
  }
}

// Input validation for forms
export const validateFormInput = (input: any, rules: {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required validation
  if (rules.required && (!input || input.toString().trim() === '')) {
    errors.push('This field is required');
  }

  if (input && typeof input === 'string') {
    // Length validation
    if (rules.minLength && input.length < rules.minLength) {
      errors.push(`Minimum length is ${rules.minLength} characters`);
    }

    if (rules.maxLength && input.length > rules.maxLength) {
      errors.push(`Maximum length is ${rules.maxLength} characters`);
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(input)) {
      errors.push('Invalid format');
    }
  }

  // Custom validation
  if (rules.custom && !rules.custom(input)) {
    errors.push('Invalid value');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitize HTML content
export const sanitizeHTML = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

// Prevent common XSS vectors
export const preventXSS = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validate and sanitize user input
export const validateAndSanitizeUserInput = (input: any, type: 'text' | 'email' | 'password' | 'url' | 'search'): {
  isValid: boolean;
  sanitizedValue: any;
  errors: string[];
} => {
  let sanitizedValue = input;
  const errors: string[] = [];

  if (typeof input === 'string') {
    // Sanitize input
    sanitizedValue = sanitizeInput(input);
    
    // Type-specific validation
    switch (type) {
      case 'email':
        if (!validateEmail(sanitizedValue)) {
          errors.push('Invalid email format');
        }
        break;
      
      case 'password':
        const passwordValidation = validatePassword(sanitizedValue);
        if (!passwordValidation.isValid) {
          errors.push(...passwordValidation.errors);
        }
        break;
      
      case 'url':
        if (sanitizedValue && !validateURL(sanitizedValue)) {
          errors.push('Invalid URL format');
        }
        break;
      
      case 'search':
        sanitizedValue = sanitizeSearchQuery(sanitizedValue);
        break;
      
      case 'text':
      default:
        // Basic text validation
        if (sanitizedValue.length > 1000) {
          errors.push('Text is too long (maximum 1000 characters)');
        }
        break;
    }
  } else if (input !== null && input !== undefined) {
    errors.push('Input must be a string');
  }

  return {
    isValid: errors.length === 0,
    sanitizedValue,
    errors
  };
};

// Export all security utilities
export default {
  sanitizeInput,
  validateEmail,
  validatePassword,
  sanitizeSearchQuery,
  validateURL,
  validateFileType,
  validateFileSize,
  RateLimiter,
  CSRFProtection,
  SecureStorage,
  validateFormInput,
  sanitizeHTML,
  preventXSS,
  validateAndSanitizeUserInput
}; 