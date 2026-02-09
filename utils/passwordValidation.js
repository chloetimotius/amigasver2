/**
 * Password validation utilities for strong password enforcement
 */

/**
 * Validates password strength according to security requirements
 * @param {string} password - The password to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
function validatePasswordStrength(password) {
  const errors = [];
  
  // Minimum length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Uppercase letter check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Lowercase letter check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Number check
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Special character check
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Quick password strength check (returns boolean)
 * @param {string} password - The password to validate
 * @returns {boolean} - True if password meets all requirements
 */
function isStrongPassword(password) {
  return validatePasswordStrength(password).isValid;
}

module.exports = {
  validatePasswordStrength,
  isStrongPassword
};