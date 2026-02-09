/**
 * Multi-Factor Authentication Frontend Logic
 */

let currentEmail = '';
let countdownTimer = null;
let resendAvailable = false;

// DOM Elements
const stepEmail = document.getElementById('step-email');
const stepOTP = document.getElementById('step-otp');
const stepSuccess = document.getElementById('step-success');
const messageContainer = document.getElementById('message-container');
const maskedEmailSpan = document.getElementById('masked-email');
const countdownDiv = document.getElementById('countdown');

// Forms
const emailForm = document.getElementById('mfa-email-form');
const otpForm = document.getElementById('mfa-otp-form');
const resendLink = document.getElementById('resend-code');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    checkAuthStatus();
    
    // Event listeners
    emailForm.addEventListener('submit', handleEmailSubmit);
    otpForm.addEventListener('submit', handleOTPSubmit);
    resendLink.addEventListener('click', handleResendCode);
    
    // Auto-focus and input formatting
    document.getElementById('email').addEventListener('input', clearMessages);
    document.getElementById('otp').addEventListener('input', function(e) {
        // Only allow numbers
        this.value = this.value.replace(/[^0-9]/g, '');
        clearMessages();
        
        // Auto-submit when 6 digits are entered
        if (this.value.length === 6) {
            setTimeout(() => {
                if (this.value.length === 6) {
                    handleOTPSubmit(new Event('submit'));
                }
            }, 500);
        }
    });
});

// Check if user is already authenticated
async function checkAuthStatus() {
    try {
        const response = await fetch('/auth/me');
        const data = await response.json();
        
        if (data.loggedIn) {
            // User is already logged in, redirect to profile
            window.location.href = 'profile.html';
        }
    } catch (error) {
        console.log('Not authenticated');
    }
}

// Handle email form submission
async function handleEmailSubmit(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    if (!email) {
        showMessage('Please enter your email address', 'error');
        return;
    }
    
    try {
        showMessage('Sending verification code...', 'info');
        
        const response = await fetch('/auth/mfa/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email: email,
                type: 'MFA_LOGIN'
            }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentEmail = email;
            maskedEmailSpan.textContent = data.email || maskEmail(email);
            showStep('step-otp');
            startCountdown();
            showMessage('Verification code sent! Please check your email.', 'success');
        } else {
            showMessage(data.error || 'Failed to send verification code', 'error');
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

// Handle OTP form submission
async function handleOTPSubmit(event) {
    event.preventDefault();
    
    const otp = document.getElementById('otp').value.trim();
    if (!otp || otp.length !== 6) {
        showMessage('Please enter a 6-digit verification code', 'error');
        return;
    }
    
    try {
        showMessage('Verifying code...', 'info');
        
        const response = await fetch('/auth/mfa/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: currentEmail,
                code: otp,
                type: 'MFA_LOGIN'
            }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            clearCountdown();
            showStep('step-success');
            showMessage('Verification successful! Redirecting...', 'success');
            
            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 2000);
        } else {
            showMessage(data.error || 'Invalid verification code', 'error');
            document.getElementById('otp').value = '';
            document.getElementById('otp').focus();
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

// Handle resend code
async function handleResendCode(event) {
    event.preventDefault();
    
    if (!resendAvailable) {
        showMessage('Please wait before requesting a new code', 'error');
        return;
    }
    
    try {
        showMessage('Sending new verification code...', 'info');
        
        const response = await fetch('/auth/mfa/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email: currentEmail,
                type: 'MFA_LOGIN'
            }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('otp').value = '';
            startCountdown();
            showMessage('New verification code sent!', 'success');
        } else {
            showMessage(data.error || 'Failed to resend verification code', 'error');
        }
    } catch (error) {
        console.error('Error resending OTP:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

// Show specific step
function showStep(stepId) {
    document.querySelectorAll('.mfa-step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(stepId).classList.add('active');
    
    // Focus on input field
    setTimeout(() => {
        if (stepId === 'step-email') {
            document.getElementById('email').focus();
        } else if (stepId === 'step-otp') {
            document.getElementById('otp').focus();
        }
    }, 100);
}

// Start countdown timer
function startCountdown() {
    let timeLeft = 600; // 10 minutes in seconds
    resendAvailable = false;
    
    countdownTimer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        countdownDiv.textContent = `Code expires in ${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Enable resend after 1 minute
        if (timeLeft === 540) { // 9 minutes left = 1 minute passed
            resendAvailable = true;
            resendLink.style.color = '#007bff';
            resendLink.style.pointerEvents = 'auto';
        }
        
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(countdownTimer);
            countdownDiv.textContent = 'Code has expired. Please request a new one.';
            showMessage('Verification code has expired', 'error');
            resendAvailable = true;
        }
    }, 1000);
    
    // Initially disable resend link
    resendLink.style.color = '#ccc';
    resendLink.style.pointerEvents = 'none';
}

// Clear countdown timer
function clearCountdown() {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
}

// Mask email address
function maskEmail(email) {
    const [username, domain] = email.split('@');
    if (username.length <= 2) {
        return `${username[0]}*@${domain}`;
    }
    return `${username.substring(0, 2)}***@${domain}`;
}

// Show message
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    
    messageContainer.innerHTML = '';
    messageContainer.appendChild(messageDiv);
    
    // Auto-clear success/info messages
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Clear messages
function clearMessages() {
    messageContainer.innerHTML = '';
}

// Add CSS for info messages
const style = document.createElement('style');
style.textContent = `
    .info-message {
        background: #cce7ff;
        color: #004085;
        padding: 10px;
        border-radius: 5px;
        margin: 10px 0;
        border: 1px solid #99d6ff;
    }
`;
document.head.appendChild(style);