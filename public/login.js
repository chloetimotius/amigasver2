// Login page JavaScript with MFA support

const loginForm = document.getElementById('loginForm');
const mfaForm = document.getElementById('mfaForm');
const loginMessage = document.getElementById('loginMessage');
const loginBtn = document.getElementById('loginBtn');
const verifyBtn = document.getElementById('verifyBtn');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.querySelector('.toggle-password');

// MFA elements
const mfaSection = document.getElementById('mfaSection');
const mfaEmail = document.getElementById('mfaEmail');
const otpInput = document.getElementById('otpCode');
const resendBtn = document.getElementById('resendOTP');
const backToLoginBtn = document.getElementById('backToLogin');

// Store MFA session data
let mfaSessionData = null;

// Password toggle functionality
if (togglePasswordBtn && passwordInput) {
  togglePasswordBtn.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    togglePasswordBtn.textContent = isHidden ? 'Hide' : 'Show';
  });
}

// Main login form submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await handleLogin();
});

// MFA form submission
mfaForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await handleMFAVerification();
});

// Back to login button
backToLoginBtn.addEventListener('click', () => {
  showLoginForm();
  clearForm();
});

// Resend OTP button
resendBtn.addEventListener('click', async () => {
  if (mfaSessionData?.email) {
    await resendOTP();
  }
});

// Auto-submit when 6 digits are entered
otpInput.addEventListener('input', () => {
  // Remove any non-digit characters
  otpInput.value = otpInput.value.replace(/\D/g, '');
  
  if (otpInput.value.length === 6) {
    setTimeout(handleMFAVerification, 300);
  }
});

// Handle initial login
async function handleLogin() {
  clearMessage();
  setLoading(loginBtn, 'Logging in...');

  const email = document.getElementById('email').value.trim();
  const password = passwordInput.value;

  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showMessage(data.error || 'Login failed. Please check your credentials.', 'error');
      return;
    }

    // Check if MFA is required
    if (data.mfaRequired) {
      // Store session data and show MFA form
      mfaSessionData = {
        email: email,
        tempToken: data.tempToken,
        maskedEmail: data.email
      };
      
      showMFAForm();
      showMessage('Verification code sent. Check server console for testing.', 'success');
    } else {
      // Normal login success
      showMessage('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    }
  } catch (err) {
    console.error('Login error:', err);
    showMessage('Something went wrong. Please try again.', 'error');
  } finally {
    setLoading(loginBtn, 'Login', false);
  }
}

// Handle MFA verification
async function handleMFAVerification() {
  const otpCode = otpInput.value.trim();
  
  if (!otpCode || otpCode.length !== 6) {
    showOTPError('Please enter a 6-digit code');
    return;
  }

  if (!mfaSessionData?.email) {
    showMessage('Session expired. Please login again.', 'error');
    showLoginForm();
    return;
  }

  setLoading(verifyBtn, 'Verifying...');

  try {
    const res = await fetch('/auth/mfa/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: mfaSessionData.email,
        code: otpCode,
        type: 'MFA_LOGIN'
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showOTPError(data.error || 'Invalid code. Please try again.');
      otpInput.classList.add('error');
      setTimeout(() => otpInput.classList.remove('error'), 500);
      return;
    }

    // Success
    otpInput.classList.add('success');
    showMessage('Verification successful. Redirecting...', 'success');
    
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);

  } catch (err) {
    console.error('MFA verification error:', err);
    showOTPError('Something went wrong. Please try again.');
  } finally {
    setLoading(verifyBtn, 'Verify', false);
  }
}

// Resend OTP
async function resendOTP() {
  if (!mfaSessionData?.email) return;

  resendBtn.disabled = true;
  resendBtn.textContent = 'Sending...';

  try {
    const res = await fetch('/auth/mfa/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: mfaSessionData.email,
        type: 'MFA_LOGIN'
      }),
    });

    if (res.ok) {
      showMessage('New verification code sent.', 'success');
      otpInput.value = '';
      otpInput.focus();
    } else {
      showMessage('Failed to resend code. Please try again.', 'error');
    }
  } catch (err) {
    console.error('Resend OTP error:', err);
    showMessage('Failed to resend code. Please try again.', 'error');
  } finally {
    resendBtn.disabled = false;
    resendBtn.textContent = 'Resend code';
  }
}

// Show MFA form
function showMFAForm() {
  document.body.classList.add('mfa-active');
  mfaEmail.textContent = mfaSessionData.maskedEmail || 'your email';
  otpInput.value = '';
  otpInput.focus();
  clearMessage();
}

// Show login form
function showLoginForm() {
  document.body.classList.remove('mfa-active');
  mfaSessionData = null;
  clearMessage();
}

// Show message
function showMessage(text, type) {
  loginMessage.textContent = text;
  loginMessage.className = `form-message ${type}`;
}

// Show OTP specific error
function showOTPError(text) {
  const errorDiv = document.querySelector('.otp-error') || createOTPError();
  errorDiv.textContent = text;
  errorDiv.style.display = 'block';
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

// Create OTP error element
function createOTPError() {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'otp-error form-message error';
  errorDiv.style.display = 'none';
  mfaForm.appendChild(errorDiv);
  return errorDiv;
}

// Clear message
function clearMessage() {
  loginMessage.textContent = '';
  loginMessage.className = 'form-message';
}

// Set loading state
function setLoading(button, text, loading = true) {
  button.disabled = loading;
  button.textContent = text;
}

// Clear form
function clearForm() {
  document.getElementById('email').value = '';
  passwordInput.value = '';
  otpInput.value = '';
  clearMessage();
}
