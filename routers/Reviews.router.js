const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/Reviews.controller.js');

// Get all reviews for a product
router.get('/products/:productId/reviews', reviewController.getProductReviews);

// Get average rating for a product
router.get('/products/:productId/rating', reviewController.getProductRating);

// Get user's review for a product (if logged in)
router.get('/products/:productId/my-review', reviewController.getUserReview);

// Create a new review
router.post('/products/:productId/reviews', reviewController.createReview);

// Update a review
router.put('/reviews/:reviewId', reviewController.updateReview);

// Delete a review
router.delete('/reviews/:reviewId', reviewController.deleteReview);

// Like/Unlike a review
router.post('/reviews/:reviewId/like', reviewController.toggleReviewLike);

module.exports = router;