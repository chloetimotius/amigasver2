const EnhancedEmailService = require('../services/EnhancedEmailService');
const User = require('../models/User.model');
const bcrypt = require('bcrypt');
const prisma = require('../models/prismaClient');

/**
 * Enhanced Multi-Factor Authentication Controller with Email Verification
 */
module.exports = {

  /**
   * Send verification email during signup
   * POST /auth/verify-email/send
   */
  sendSignupVerification: async (req, res) => {
    try {
      const { email, name, password } = req.body;

      if (!email || !name || !password) {
        return res.status(400).json({ 
          error: 'Email, name, and password are required' 
        });
      }

      // Check if user already exists
      const existingUser = await User.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ 
          error: 'An account with this email already exists' 
        });
      }

      // Generate OTP
      const otpCode = EnhancedEmailService.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Store pending user data and OTP
      await prisma.otpCode.create({
        data: {
          userId: -1, // Temporary ID for pending signup
          code: otpCode,
          type: 'EMAIL_VERIFICATION',
          expiresAt,
          pendingUserData: JSON.stringify({
            email,
            name,
            password: hashedPassword
          })
        }
      });

      // Send verification email
      const result = await EnhancedEmailService.sendEnhancedOTP(email, otpCode, 'signup');

      if (!result.success) {
        throw new Error('Failed to send verification email');
      }

      res.json({
        message: 'Verification email sent! Please check your inbox.',
        email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        method: result.method
      });
    } catch (error) {
      console.error('Error sending signup verification:', error);
      
      if (error.message.includes('Too many requests')) {
        return res.status(429).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Failed to send verification email' });
    }
  },

  /**
   * Verify email and complete signup
   * POST /auth/verify-email/confirm
   */
  verifySignupEmail: async (req, res) => {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({ 
          error: 'Email and verification code are required' 
        });
      }

      // Find valid OTP for email verification
      const otpRecord = await prisma.otpCode.findFirst({
        where: {
          code,
          type: 'EMAIL_VERIFICATION',
          used: false,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      if (!otpRecord) {
        return res.status(400).json({ 
          error: 'Invalid or expired verification code' 
        });
      }

      // Parse pending user data
      let userData;
      try {
        userData = JSON.parse(otpRecord.pendingUserData);
      } catch (e) {
        return res.status(400).json({ 
          error: 'Invalid verification data' 
        });
      }

      if (userData.email !== email) {
        return res.status(400).json({ 
          error: 'Email mismatch' 
        });
      }

      // Create user account
      const newUser = await User.createUser({
        name: userData.name,
        email: userData.email,
        password: userData.password
      });

      // Mark OTP as used
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { used: true }
      });

      // Create session
      req.session.userId = newUser.id;
      req.session.userName = newUser.name;
      req.session.userEmail = newUser.email;
      req.session.emailVerified = true;

      // Send welcome email
      await EnhancedEmailService.sendWelcomeEmail(newUser.email, newUser.name);

      res.json({
        message: 'Email verified successfully! Welcome to our platform.',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email
        }
      });
    } catch (error) {
      console.error('Error verifying signup email:', error);
      res.status(500).json({ error: 'Failed to verify email' });
    }
  },

  /**
   * Send OTP for MFA login
   * POST /auth/mfa/send-otp
   */
  sendLoginOTP: async (req, res) => {
    try {
      const { email, type = 'MFA_LOGIN' } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Check if user exists
      const user = await User.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Generate OTP
      const otpCode = EnhancedEmailService.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Save OTP to database
      await prisma.otpCode.create({
        data: {
          userId: user.id,
          code: otpCode,
          type,
          expiresAt
        }
      });

      // Send email
      const result = await EnhancedEmailService.sendEnhancedOTP(email, otpCode, 'mfa_login');

      if (!result.success) {
        throw new Error('Failed to send OTP email');
      }

      res.json({
        message: 'Verification code sent successfully',
        email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        method: result.method
      });
    } catch (error) {
      console.error('Error sending login OTP:', error);
      
      if (error.message.includes('Too many requests')) {
        return res.status(429).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Failed to send verification code' });
    }
  },

  /**
   * Verify OTP for login
   * POST /auth/mfa/verify-otp
   */
  verifyLoginOTP: async (req, res) => {
    try {
      const { email, code, type = 'MFA_LOGIN' } = req.body;

      if (!email || !code) {
        return res.status(400).json({ 
          error: 'Email and verification code are required' 
        });
      }

      // Find user
      const user = await User.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Find valid OTP
      const otpRecord = await prisma.otpCode.findFirst({
        where: {
          userId: user.id,
          code,
          type,
          used: false,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      if (!otpRecord) {
        return res.status(400).json({ 
          error: 'Invalid or expired verification code' 
        });
      }

      // Mark OTP as used
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { used: true }
      });

      // Create session for login
      if (type === 'MFA_LOGIN') {
        req.session.userId = user.id;
        req.session.userName = user.name;
        req.session.userEmail = user.email;
        req.session.mfaVerified = true;
      }

      res.json({
        message: 'Verification successful!',
        verified: true,
        ...(type === 'MFA_LOGIN' && {
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        })
      });
    } catch (error) {
      console.error('Error verifying login OTP:', error);
      res.status(500).json({ error: 'Failed to verify code' });
    }
  },

  /**
   * Send password reset code
   * POST /auth/forgot-password/send
   */
  sendPasswordResetCode: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const user = await User.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists for security
        return res.json({
          message: 'If an account exists with this email, you will receive a password reset code.',
          email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
        });
      }

      // Generate OTP
      const otpCode = EnhancedEmailService.generateOTP();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes for password reset

      // Save OTP
      await prisma.otpCode.create({
        data: {
          userId: user.id,
          code: otpCode,
          type: 'PASSWORD_RESET',
          expiresAt
        }
      });

      // Send email
      const result = await EnhancedEmailService.sendEnhancedOTP(email, otpCode, 'password_reset');

      res.json({
        message: 'If an account exists with this email, you will receive a password reset code.',
        email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        method: result.method
      });
    } catch (error) {
      console.error('Error sending password reset:', error);
      
      if (error.message.includes('Too many requests')) {
        return res.status(429).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Failed to send reset code' });
    }
  },

  /**
   * Reset password with code
   * POST /auth/forgot-password/reset
   */
  resetPassword: async (req, res) => {
    try {
      const { email, code, newPassword } = req.body;

      if (!email || !code || !newPassword) {
        return res.status(400).json({ 
          error: 'Email, verification code, and new password are required' 
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          error: 'Password must be at least 6 characters long' 
        });
      }

      // Find user
      const user = await User.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify OTP
      const otpRecord = await prisma.otpCode.findFirst({
        where: {
          userId: user.id,
          code,
          type: 'PASSWORD_RESET',
          used: false,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      if (!otpRecord) {
        return res.status(400).json({ 
          error: 'Invalid or expired reset code' 
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await User.updateUser(user.id, { password: hashedPassword });

      // Mark OTP as used
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { used: true }
      });

      res.json({
        message: 'Password reset successful! You can now log in with your new password.'
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  },

  /**
   * Enable MFA for user
   * POST /profile/mfa/enable
   */
  enableMFA: async (req, res) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      await User.updateUser(userId, { mfaEnabled: true });

      res.json({
        message: 'Two-Factor Authentication enabled successfully',
        mfaEnabled: true
      });
    } catch (error) {
      console.error('Error enabling MFA:', error);
      res.status(500).json({ error: 'Failed to enable MFA' });
    }
  },

  /**
   * Disable MFA for user
   * POST /profile/mfa/disable
   */
  disableMFA: async (req, res) => {
    try {
      const userId = req.session.userId;
      const { currentPassword } = req.body;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!currentPassword) {
        return res.status(400).json({ 
          error: 'Current password is required to disable MFA' 
        });
      }

      // Verify password
      const user = await User.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const passwordValid = await bcrypt.compare(currentPassword, user.password);
      if (!passwordValid) {
        return res.status(400).json({ error: 'Invalid password' });
      }

      await User.updateUser(userId, { mfaEnabled: false });

      res.json({
        message: 'Two-Factor Authentication disabled successfully',
        mfaEnabled: false
      });
    } catch (error) {
      console.error('Error disabling MFA:', error);
      res.status(500).json({ error: 'Failed to disable MFA' });
    }
  },

  /**
   * Get MFA status
   * GET /profile/mfa/status
   */
  getMFAStatus: async (req, res) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const user = await User.getUserById(userId);
      
      res.json({
        mfaEnabled: user?.mfaEnabled || false,
        mfaVerified: req.session.mfaVerified || false
      });
    } catch (error) {
      console.error('Error getting MFA status:', error);
      res.status(500).json({ error: 'Failed to get MFA status' });
    }
  }
};