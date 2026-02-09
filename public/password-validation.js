/**
 * Client-side password validation utilities
 */

/**
 * Password strength validation rules
 */
const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '@$!%*?&'
};

/**
 * Validates password strength on the client side
 * @param {string} password - The password to validate
 * @returns {Object} - { isValid: boolean, errors: string[], strength: string }
 */
function validatePasswordStrength(password) {
  const errors = [];
  let score = 0;
  
  // Length check
  if (password.length < PASSWORD_RULES.minLength) {
    errors.push(`Password must be at least ${PASSWORD_RULES.minLength} characters long`);
  } else {
    score += 1;
  }
  
  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }
  
  // Lowercase check  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }
  
  // Number check
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }
  
  // Special character check
  const specialCharRegex = new RegExp(`[${PASSWORD_RULES.specialChars}]`);
  if (!specialCharRegex.test(password)) {
    errors.push(`Password must contain at least one special character (${PASSWORD_RULES.specialChars})`);
  } else {
    score += 1;
  }
  
  // Determine strength level
  let strength = 'weak';
  if (score >= 5) {
    strength = 'strong';
  } else if (score >= 3) {
    strength = 'medium';
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    strength: strength,
    score: score
  };
}

/**
 * Updates password strength indicator in the UI
 * @param {HTMLElement} passwordInput - The password input element
 * @param {HTMLElement} strengthElement - The element to display strength
 */
function setupPasswordStrengthIndicator(passwordInput, strengthElement) {
  if (!passwordInput || !strengthElement) return;
  
  passwordInput.addEventListener('input', function() {
    const password = this.value;
    const validation = validatePasswordStrength(password);
    
    // Clear previous content
    strengthElement.innerHTML = '';
    strengthElement.className = 'password-strength';
    
    if (password.length === 0) {
      return; // Don't show anything for empty password
    }
    
    // Add strength class
    strengthElement.classList.add(`strength-${validation.strength}`);
    
    // Create strength bar
    const strengthBar = document.createElement('div');
    strengthBar.className = 'strength-bar';
    
    const strengthFill = document.createElement('div');
    strengthFill.className = 'strength-fill';
    strengthFill.style.width = `${(validation.score / 5) * 100}%`;
    
    strengthBar.appendChild(strengthFill);
    
    // Create strength text
    const strengthText = document.createElement('div');
    strengthText.className = 'strength-text';
    strengthText.textContent = `Password strength: ${validation.strength.charAt(0).toUpperCase() + validation.strength.slice(1)}`;
    
    strengthElement.appendChild(strengthBar);
    strengthElement.appendChild(strengthText);
    
    // Show errors if any
    if (validation.errors.length > 0) {
      const errorList = document.createElement('ul');
      errorList.className = 'password-errors';
      validation.errors.forEach(error => {
        const errorItem = document.createElement('li');
        errorItem.textContent = error;
        errorList.appendChild(errorItem);
      });
      strengthElement.appendChild(errorList);
    }
  });
}

/**
 * Setup password confirmation matching
 * @param {HTMLElement} passwordInput - The password input element
 * @param {HTMLElement} confirmInput - The confirm password input element  
 * @param {HTMLElement} matchElement - The element to display match status
 */
function setupPasswordConfirmation(passwordInput, confirmInput, matchElement) {
  if (!passwordInput || !confirmInput || !matchElement) return;
  
  function checkPasswordMatch() {
    const password = passwordInput.value;
    const confirm = confirmInput.value;
    
    matchElement.innerHTML = '';
    matchElement.className = 'password-match';
    
    if (confirm.length === 0) {
      return; // Don't show anything for empty confirm
    }
    
    if (password === confirm) {
      matchElement.classList.add('match-success');
      matchElement.textContent = '✓ Passwords match';
    } else {
      matchElement.classList.add('match-error');
      matchElement.textContent = '✗ Passwords do not match';
    }
  }
  
  passwordInput.addEventListener('input', checkPasswordMatch);
  confirmInput.addEventListener('input', checkPasswordMatch);
}

/**
 * Initialize password validation for a form
 * @param {string} formId - The ID of the form to initialize
 */
function initializePasswordValidation(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  
  const passwordInput = form.querySelector('#password');
  const confirmInput = form.querySelector('#confirmPassword');
  const strengthElement = form.querySelector('#passwordStrength, .password-strength');
  const matchElement = form.querySelector('#passwordMatch, .password-match');
  
  if (passwordInput && strengthElement) {
    setupPasswordStrengthIndicator(passwordInput, strengthElement);
  }
  
  if (passwordInput && confirmInput && matchElement) {
    setupPasswordConfirmation(passwordInput, confirmInput, matchElement);
  }
  
  // Add form validation on submit
  form.addEventListener('submit', function(e) {
    if (passwordInput) {
      const validation = validatePasswordStrength(passwordInput.value);
      if (!validation.isValid) {
        e.preventDefault();
        alert('Please fix password requirements before submitting.');
        return false;
      }
    }
    
    if (confirmInput && passwordInput.value !== confirmInput.value) {
      e.preventDefault();
      alert('Passwords do not match.');
      return false;
    }
  });
}

// Auto-initialize if DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    // Try to initialize common signup forms
    initializePasswordValidation('signupForm');
    initializePasswordValidation('registrationForm');
  });
} else {
  // DOM already loaded
  initializePasswordValidation('signupForm');
  initializePasswordValidation('registrationForm');
}