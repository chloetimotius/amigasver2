const express = require('express');
const router = express.Router();
const EnhancedMFAController = require('../controllers/EnhancedMFA.controller');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * Enhanced Authentication Routes with Email Verification
 */

// ===== EMAIL VERIFICATION FOR SIGNUP =====
/**
 * @route   POST /auth/verify-email/send
 * @desc    Send email verification code for new user signup
 * @access  Public
 * @body    { name, email, password }
 */
router.post('/verify-email/send', EnhancedMFAController.sendSignupVerification);

/**
 * @route   POST /auth/verify-email/confirm
 * @desc    Verify email and complete user registration
 * @access  Public  
 * @body    { email, code }
 */
router.post('/verify-email/confirm', EnhancedMFAController.verifySignupEmail);

// ===== MULTI-FACTOR AUTHENTICATION =====
/**
 * @route   POST /auth/mfa/send-otp
 * @desc    Send OTP for MFA login
 * @access  Public
 * @body    { email, type? }
 */
router.post('/mfa/send-otp', EnhancedMFAController.sendLoginOTP);

/**
 * @route   POST /auth/mfa/verify-otp
 * @desc    Verify OTP and complete login
 * @access  Public
 * @body    { email, code, type? }
 */
router.post('/mfa/verify-otp', EnhancedMFAController.verifyLoginOTP);

// ===== FORGOT PASSWORD =====
/**
 * @route   POST /auth/forgot-password/send
 * @desc    Send password reset code to email
 * @access  Public
 * @body    { email }
 */
router.post('/forgot-password/send', EnhancedMFAController.sendPasswordResetCode);

/**
 * @route   POST /auth/forgot-password/reset
 * @desc    Reset password with verification code
 * @access  Public
 * @body    { email, code, newPassword }
 */
router.post('/forgot-password/reset', EnhancedMFAController.resetPassword);

// ===== MFA SETTINGS (Authenticated Routes) =====
/**
 * @route   POST /auth/mfa/enable
 * @desc    Enable MFA for authenticated user
 * @access  Private
 */
router.post('/mfa/enable', authMiddleware, EnhancedMFAController.enableMFA);

/**
 * @route   POST /auth/mfa/disable
 * @desc    Disable MFA for authenticated user
 * @access  Private
 * @body    { currentPassword }
 */
router.post('/mfa/disable', authMiddleware, EnhancedMFAController.disableMFA);

/**
 * @route   GET /auth/mfa/status
 * @desc    Get current MFA status for user
 * @access  Private
 */
router.get('/mfa/status', authMiddleware, EnhancedMFAController.getMFAStatus);

module.exports = router;