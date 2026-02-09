const MFAService = require('../services/MFAService');
const User = require('../models/User.model');

/**
 * Multi-Factor Authentication Controller
 */
module.exports = {
  /**
   * Send OTP for MFA verification
   * POST /auth/mfa/send-otp
   */
  sendOTP: async (req, res) => {
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

      // Send OTP
      await MFAService.sendOTP(user.id, user.email, type);

      res.json({ 
        message: 'OTP sent successfully',
        email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Mask email
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  },

  /**
   * Verify OTP code
   * POST /auth/mfa/verify-otp
   */
  verifyOTP: async (req, res) => {
    try {
      const { email, code, type = 'MFA_LOGIN' } = req.body;

      if (!email || !code) {
        return res.status(400).json({ error: 'Email and OTP code are required' });
      }

      // Find user
      const user = await User.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify OTP
      const result = await MFAService.verifyOTP(user.id, code, type);
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      // For login MFA, create session
      if (type === 'MFA_LOGIN') {
        req.session.userId = user.id;
        req.session.userName = user.name;
        req.session.userEmail = user.email;
        req.session.mfaVerified = true;
      }

      res.json({ 
        message: result.message,
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
      console.error('Error verifying OTP:', error);
      res.status(500).json({ error: 'Failed to verify OTP' });
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

      const success = await MFAService.enableMFA(userId);
      
      if (!success) {
        return res.status(500).json({ error: 'Failed to enable MFA' });
      }

      res.json({ 
        message: 'Multi-Factor Authentication enabled successfully',
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
        return res.status(400).json({ error: 'Current password is required to disable MFA' });
      }

      // Verify password before disabling MFA
      const user = await User.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const bcrypt = require('bcrypt');
      const passwordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!passwordValid) {
        return res.status(400).json({ error: 'Invalid password' });
      }

      const success = await MFAService.disableMFA(userId);
      
      if (!success) {
        return res.status(500).json({ error: 'Failed to disable MFA' });
      }

      res.json({ 
        message: 'Multi-Factor Authentication disabled successfully',
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

      const mfaEnabled = await MFAService.isMFAEnabled(userId);
      
      res.json({ 
        mfaEnabled,
        mfaVerified: req.session.mfaVerified || false
      });
    } catch (error) {
      console.error('Error getting MFA status:', error);
      res.status(500).json({ error: 'Failed to get MFA status' });
    }
  }
};