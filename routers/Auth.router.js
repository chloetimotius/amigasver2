const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/Auth.controller');

// Import MFA routes
const MFARouter = require('./MFA.router');

// POST /auth/register
router.post('/register', AuthController.register);

// POST /auth/login
router.post('/login', AuthController.login);

// POST /auth/logout
router.post('/logout', AuthController.logout);

// GET /auth/me → current logged-in user
router.get('/me', AuthController.getCurrentUser);

// MFA routes
router.use('/mfa', MFARouter);

module.exports = router;