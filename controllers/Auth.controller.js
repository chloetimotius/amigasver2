const bcrypt = require('bcrypt');
const User = require('../models/User.model');
const { validatePasswordStrength } = require('../utils/passwordValidation');
const MFAService = require('../services/MFAService');

/**
 * Authentication Controller
 * Handles all authentication-related business logic
 */
module.exports = {
  /**
   * User Registration
   * POST /auth/register
   */
  register: async (req, res, next) => {
    try {
      const { name, email, password, confirmPassword } = req.body;

      // Input validation
      if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({ error: 'All fields are required.' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
      }

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ 
          error: 'Password does not meet security requirements', 
          details: passwordValidation.errors 
        });
      }

      // Check if user already exists
      const existing = await User.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: 'Email is already registered.' });
      }

      // Create new user
      const user = await User.createUser({ name, email, password });

      // Auto-login after registration
      req.session.userId = user.id;
      req.session.userName = user.name;

      res.json({ 
        message: 'Registration successful', 
        name: user.name,
        userId: user.id 
      });
    } catch (err) {
      console.error('Registration error:', err);
      next(err);
    }
  },

  /**
   * User Login
   * POST /auth/login
   */
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');

      // Input validation
      if (!email || !password) {
        await MFAService.recordLoginAttempt(email, false, {
          failureReason: 'Missing credentials',
          ipAddress,
          userAgent
        });
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      // Find user by email
      const user = await User.getUserByEmail(email);
      if (!user) {
        await MFAService.recordLoginAttempt(email, false, {
          failureReason: 'User not found',
          ipAddress,
          userAgent
        });
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Check for suspicious activity
      const suspiciousActivity = await MFAService.checkSuspiciousActivity(email, ipAddress);
      if (suspiciousActivity.suspicious && suspiciousActivity.lockoutTime) {
        return res.status(429).json({ 
          error: 'Account temporarily locked due to suspicious activity',
          lockoutTime: suspiciousActivity.lockoutTime
        });
      }

      // Verify password
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        await MFAService.recordLoginAttempt(email, false, {
          failureReason: 'Invalid password',
          ipAddress,
          userAgent
        });
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Check if MFA is enabled or required due to suspicious activity
      const mfaEnabled = await MFAService.isMFAEnabled(user.id);
      const requireMFA = mfaEnabled || suspiciousActivity.requireMFA;

      if (requireMFA) {
        // Send OTP for MFA verification
        try {
          await MFAService.sendOTP(user.id, user.email, 'MFA_LOGIN');
          
          // Record partial login success
          await MFAService.recordLoginAttempt(email, false, {
            failureReason: 'MFA required',
            ipAddress,
            userAgent
          });

          return res.json({
            mfaRequired: true,
            message: 'MFA verification required. Please check your email for the verification code.',
            email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
            tempToken: `mfa_pending_${user.id}` // For frontend to track MFA state
          });
        } catch (mfaError) {
          console.error('MFA send error:', mfaError);
          // Fall back to normal login if MFA fails
        }
      }

      // Normal login (no MFA required)
      req.session.userId = user.id;
      req.session.userName = user.name;
      req.session.userEmail = user.email;
      req.session.mfaVerified = !requireMFA; // Mark as verified if no MFA was required

      // Record successful login
      await MFAService.recordLoginAttempt(email, true, {
        ipAddress,
        userAgent
      });

      res.json({ 
        message: 'Login successful', 
        name: user.name,
        userId: user.id,
        email: user.email,
        mfaEnabled
      });
    } catch (err) {
      console.error('Login error:', err);
      next(err);
    }
  },

  /**
   * User Logout
   * POST /auth/logout
   */
  logout: async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Logout error:', err);
          return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logged out successfully' });
      });
    } catch (err) {
      console.error('Logout error:', err);
      res.status(500).json({ error: 'Logout failed' });
    }
  },

  /**
   * Get Current User
   * GET /auth/me
   */
  getCurrentUser: async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ loggedIn: false });
      }
      
      res.json({
        loggedIn: true,
        userId: req.session.userId,
        name: req.session.userName,
        email: req.session.userEmail || ''
      });
    } catch (err) {
      console.error('Get current user error:', err);
      res.status(500).json({ error: 'Failed to get user info' });
    }
  }
};