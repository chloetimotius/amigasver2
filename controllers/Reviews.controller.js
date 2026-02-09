const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper function to get user ID from session - Following Auth.router pattern
function getUserId(req) {
  // Auth.router stores userId in req.session.userId
  const userId = req.session?.userId;
  console.log('Session data:', { userId, sessionExists: !!req.session });
  return userId || null;
}

// Get all reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const reviews = await prisma.review.findMany({
      where: { productId: parseInt(productId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        },
        likes: {
          select: {
            userId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const currentUserId = getUserId(req);
    console.log('Current user ID when loading reviews:', currentUserId);

    // ✅ Add like count, user's like status, and ownership flag
    const reviewsWithMetadata = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      userId: review.userId,
      user: review.user,
      likeCount: review.likes.length,
      isLikedByUser: currentUserId 
        ? review.likes.some(like => like.userId === currentUserId)
        : false,
      isOwn: currentUserId ? review.userId === currentUserId : false // ✅ Backend tells frontend if this is user's review
    }));

    res.json(reviewsWithMetadata);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Get average rating for a product
exports.getProductRating = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const reviews = await prisma.review.findMany({
      where: { productId: parseInt(productId) },
      select: { rating: true }
    });

    if (reviews.length === 0) {
      return res.json({ 
        averageRating: 0, 
        totalReviews: 0 
      });
    }

    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    res.json({
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error('Error fetching rating:', error);
    res.status(500).json({ error: 'Failed to fetch rating' });
  }
};

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const currentUserId = getUserId(req);
    
    if (!currentUserId) {
      console.log('No user ID in session - user not logged in');
      return res.status(401).json({ error: 'Please login to write a review' });
    }

    console.log('Creating review for user ID:', currentUserId);

    const { productId } = req.params;
    const { rating, comment } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Validate comment
    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({ error: 'Review must be at least 10 characters' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: currentUserId,
          productId: parseInt(productId)
        }
      }
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment: comment.trim(),
        userId: currentUserId,
        productId: parseInt(productId)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    });

    console.log('Review created successfully:', review.id);
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const currentUserId = getUserId(req);
    
    if (!currentUserId) {
      console.log('No user ID in session - user not logged in');
      return res.status(401).json({ error: 'Please login to update review' });
    }

    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    // Validate rating
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Validate comment
    if (comment && comment.trim().length < 10) {
      return res.status(400).json({ error: 'Review must be at least 10 characters' });
    }

    // Check if review exists and belongs to user
    const existingReview = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) }
    });

    if (!existingReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (existingReview.userId !== currentUserId) {
      console.log(`User ${currentUserId} trying to edit review by user ${existingReview.userId}`);
      return res.status(403).json({ error: 'You can only edit your own reviews' });
    }

    // Update review
    const review = await prisma.review.update({
      where: { id: parseInt(reviewId) },
      data: {
        ...(rating && { rating: parseInt(rating) }),
        ...(comment && { comment: comment.trim() })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    });

    console.log('Review updated successfully:', review.id);
    res.json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const currentUserId = getUserId(req);
    
    if (!currentUserId) {
      console.log('No user ID in session - user not logged in');
      return res.status(401).json({ error: 'Please login to delete review' });
    }

    const { reviewId } = req.params;

    // Check if review exists and belongs to user
    const existingReview = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) }
    });

    if (!existingReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (existingReview.userId !== currentUserId) {
      console.log(`User ${currentUserId} trying to delete review by user ${existingReview.userId}`);
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }

    // Delete review (likes will be cascade deleted)
    await prisma.review.delete({
      where: { id: parseInt(reviewId) }
    });

    console.log('Review deleted successfully:', reviewId);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

// Like/Unlike a review
exports.toggleReviewLike = async (req, res) => {
  try {
    const currentUserId = getUserId(req);
    
    if (!currentUserId) {
      console.log('No user ID in session - user not logged in');
      return res.status(401).json({ error: 'Please login to like reviews' });
    }

    const { reviewId } = req.params;

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) }
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if already liked
    const existingLike = await prisma.reviewLike.findUnique({
      where: {
        userId_reviewId: {
          userId: currentUserId,
          reviewId: parseInt(reviewId)
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.reviewLike.delete({
        where: { id: existingLike.id }
      });
      
      const likeCount = await prisma.reviewLike.count({
        where: { reviewId: parseInt(reviewId) }
      });

      console.log(`User ${currentUserId} unliked review ${reviewId}`);
      return res.json({ 
        liked: false, 
        likeCount 
      });
    } else {
      // Like
      await prisma.reviewLike.create({
        data: {
          userId: currentUserId,
          reviewId: parseInt(reviewId)
        }
      });

      const likeCount = await prisma.reviewLike.count({
        where: { reviewId: parseInt(reviewId) }
      });

      console.log(`User ${currentUserId} liked review ${reviewId}`);
      return res.json({ 
        liked: true, 
        likeCount 
      });
    }
  } catch (error) {
    console.error('Error toggling review like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
};

// Get user's review for a product
exports.getUserReview = async (req, res) => {
  try {
    const currentUserId = getUserId(req);
    
    if (!currentUserId) {
      console.log('No user logged in - returning null review');
      return res.json({ review: null });
    }

    const { productId } = req.params;

    const review = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: currentUserId,
          productId: parseInt(productId)
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    });

    if (review) {
      console.log(`Found review for user ${currentUserId} on product ${productId}`);
    } else {
      console.log(`No review found for user ${currentUserId} on product ${productId}`);
    }

    res.json({ review });
  } catch (error) {
    console.error('Error fetching user review:', error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
};