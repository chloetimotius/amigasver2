const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const { authenticateToken } = require('./JWTAuth.router');

// Hybrid Authentication Middleware - supports both Session and JWT
function hybridAuth(req, res, next) {
  // Check for JWT token first
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    // JWT Authentication
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = { id: user.userId, name: user.name, email: user.email };
        req.authType = 'jwt';
        return next();
      }
    });
  }
  
  // Fall back to session authentication
  if (req.session && req.session.userId) {
    req.user = { 
      id: req.session.userId, 
      name: req.session.userName || 'User' 
    };
    req.authType = 'session';
    return next();
  }
  
  // No valid authentication
  return res.status(401).json({ error: 'Authentication required' });
}

// Get user profile (JWT + Session support)
router.get('/jwt', hybridAuth, async (req, res) => {
  try {
    const profile = await User.getUserProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json({
      ...profile,
      authType: req.authType // Include auth type for debugging
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile (JWT + Session support)
router.put('/jwt', hybridAuth, async (req, res) => {
  try {
    const { name, email, bio } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const updatedProfile = await User.updateUserProfile(req.user.id, {
      name,
      email,
      bio
    });

    // Update session if using session auth
    if (req.authType === 'session' && req.session) {
      req.session.userName = name;
    }
    
    res.json({
      ...updatedProfile,
      authType: req.authType
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
});

// Change password (JWT + Session support)
router.put('/jwt/password', hybridAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const success = await User.changePassword(req.user.id, currentPassword, newPassword);
    
    if (!success) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    res.json({ 
      message: 'Password changed successfully',
      authType: req.authType
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get user analytics (JWT + Session support)
router.get('/jwt/analytics', hybridAuth, async (req, res) => {
  try {
    const analytics = await User.getUserAnalytics(req.user.id);
    
    // Enhanced analytics with auth type info
    const enhancedAnalytics = {
      ...analytics,
      authType: req.authType,
      sessionInfo: {
        authenticatedVia: req.authType,
        isJWT: req.authType === 'jwt',
        isSession: req.authType === 'session',
        securityLevel: req.authType === 'jwt' ? 'High' : 'Standard'
      }
    };
    
    res.json(enhancedAnalytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;