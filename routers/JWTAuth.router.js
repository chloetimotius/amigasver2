const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User.model');
const { validatePasswordStrength } = require('../utils/passwordValidation');

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = '24h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

// Generate JWT tokens
function generateTokens(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });

  return { accessToken, refreshToken };
}

// JWT Middleware for protecting routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// JWT Login Endpoint
router.post('/jwt-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Set refresh token as httpOnly cookie for security
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('JWT Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// JWT Register Endpoint
router.post('/jwt-register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
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
    const existingUser = await User.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create new user
    const newUser = await User.createUser({ name, email, password });

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens(newUser);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: 'Registration successful',
      accessToken,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('JWT Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Verify JWT Token
router.get('/jwt-verify', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.user.userId,
      name: req.user.name,
      email: req.user.email
    }
  });
});

// Refresh JWT Token
router.post('/jwt-refresh', (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token not found' });
  }

  jwt.verify(refreshToken, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Generate new access token
    const { accessToken } = generateTokens(user);

    res.json({
      accessToken,
      user: {
        id: user.userId,
        name: user.name,
        email: user.email
      }
    });
  });
});

// JWT Logout
router.post('/jwt-logout', (req, res) => {
  // Clear refresh token cookie
  res.clearCookie('refreshToken');
  res.json({ message: 'Logout successful' });
});

// Get current JWT user info
router.get('/jwt-me', authenticateToken, async (req, res) => {
  try {
    const user = await User.getUserProfile(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      loggedIn: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching JWT user:', error);
    res.status(500).json({ error: 'Failed to fetch user information' });
  }
});

// Export both the router and middleware for use in other routes
module.exports = {
  jwtAuthRouter: router,
  authenticateToken
};