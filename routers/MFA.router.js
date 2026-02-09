const express = require('express');
const router = express.Router();
const MFAController = require('../controllers/MFA.controller');
const { requireAuth } = require('../middleware/auth.middleware');

// MFA routes for authentication flow
router.post('/send-otp', MFAController.sendOTP);
router.post('/verify-otp', MFAController.verifyOTP);

// MFA settings routes (require authentication)
router.get('/status', requireAuth, MFAController.getMFAStatus);
router.post('/enable', requireAuth, MFAController.enableMFA);
router.post('/disable', requireAuth, MFAController.disableMFA);

module.exports = router;