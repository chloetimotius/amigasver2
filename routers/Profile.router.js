const express = require('express');
const router = express.Router();
const ProfileController = require('../controllers/Profile.controller');
const { requireAuth } = require('../middleware/auth.middleware');

// Import MFA routes
const MFARouter = require('./MFA.router');

// Get user profile
router.get('/', requireAuth, ProfileController.getProfile);

// Update user profile
router.put('/', requireAuth, ProfileController.updateProfile);

// Change password
router.post('/change-password', requireAuth, ProfileController.changePassword);

// Get user analytics
router.get('/analytics', requireAuth, ProfileController.getAnalytics);

// Get recent orders
router.get('/recent-orders', requireAuth, ProfileController.getRecentOrders);

// Update profile image
router.put('/image', requireAuth, ProfileController.updateProfileImage);

// Remove profile image
router.delete('/image', requireAuth, ProfileController.removeProfileImage);

// MFA routes
router.use('/mfa', MFARouter);

module.exports = router;