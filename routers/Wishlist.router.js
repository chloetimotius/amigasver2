const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/Wishlist.controller');

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Basic wishlist routes
router.get('/', requireAuth, wishlistController.getWishlist);
router.post('/add', requireAuth, wishlistController.addToWishlist);
router.delete('/remove/:productId', requireAuth, wishlistController.removeFromWishlist);
router.delete('/clear', requireAuth, wishlistController.clearWishlist);
router.get('/check/:productId', wishlistController.checkWishlist);
router.post('/sync', requireAuth, wishlistController.syncWishlist);

module.exports = router;