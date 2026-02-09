// reviews.js - Review Management
let currentUser = null;
let selectedRating = 0;
let isEditMode = false;
let editingReviewId = null;

// Initialize reviews when page loads
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  setupReviewForm();
  await loadReviews();
  await loadRatingSummary();
});

// ✅ Check if user is authenticated
async function checkAuth() {
  try {
    const response = await fetch('/auth/me');
    if (response.ok) {
      const data = await response.json();
      console.log('Auth response:', data);
      
      if (data.loggedIn) {
        currentUser = {
          id: data.userId,
          name: data.name || '',
          email: data.email || '',
          loggedIn: true
        };
        console.log('Current user logged in:', currentUser);
        await showWriteReviewButton();
      } else {
        console.log('User not logged in');
        currentUser = null;
        showLoginPrompt();
      }
    } else {
      console.log('Auth check failed - status:', response.status);
      currentUser = null;
      showLoginPrompt();
    }
  } catch (error) {
    console.error('Error checking auth:', error);
    currentUser = null;
    showLoginPrompt();
  }
}

// Show login prompt
function showLoginPrompt() {
  currentUser = null;
  const loginPrompt = document.getElementById('loginPrompt');
  const writeReviewBtn = document.getElementById('writeReviewBtn');
  if (loginPrompt) loginPrompt.style.display = 'block';
  if (writeReviewBtn) writeReviewBtn.style.display = 'none';
}

// Show write review button
async function showWriteReviewButton() {
  const productId = new URLSearchParams(window.location.search).get('id');
  
  try {
    const response = await fetch(`/api/products/${productId}/my-review`);
    const data = await response.json();
    
    const loginPrompt = document.getElementById('loginPrompt');
    const writeReviewBtn = document.getElementById('writeReviewBtn');
    
    if (data.review) {
      // User already has a review - hide write button
      console.log('User already reviewed this product');
      if (loginPrompt) loginPrompt.style.display = 'none';
      if (writeReviewBtn) writeReviewBtn.style.display = 'none';
    } else {
      // Show write review button
      console.log('User can write a review');
      if (loginPrompt) loginPrompt.style.display = 'none';
      if (writeReviewBtn) writeReviewBtn.style.display = 'block';
    }
  } catch (error) {
    console.error('Error checking user review:', error);
    // If error, still show write button if logged in
    const loginPrompt = document.getElementById('loginPrompt');
    const writeReviewBtn = document.getElementById('writeReviewBtn');
    if (currentUser && currentUser.loggedIn) {
      if (loginPrompt) loginPrompt.style.display = 'none';
      if (writeReviewBtn) writeReviewBtn.style.display = 'block';
    }
  }
}

// Setup review form
function setupReviewForm() {
  const writeReviewBtn = document.getElementById('writeReviewBtn');
  const cancelReviewBtn = document.getElementById('cancelReviewBtn');
  const submitReviewBtn = document.getElementById('submitReviewBtn');
  const reviewForm = document.getElementById('reviewForm');
  const starRating = document.getElementById('starRating');

  // Show form
  writeReviewBtn?.addEventListener('click', () => {
    reviewForm.classList.add('active');
    writeReviewBtn.style.display = 'none';
  });

  // Cancel form
  cancelReviewBtn?.addEventListener('click', () => {
    resetReviewForm();
  });

  // Star rating selection
  if (starRating) {
    starRating.querySelectorAll('.star').forEach(star => {
      star.addEventListener('click', () => {
        selectedRating = parseInt(star.dataset.rating);
        updateStarDisplay(selectedRating);
      });

      star.addEventListener('mouseenter', () => {
        const rating = parseInt(star.dataset.rating);
        updateStarDisplay(rating, true);
      });
    });

    starRating.addEventListener('mouseleave', () => {
      updateStarDisplay(selectedRating);
    });
  }

  // Submit review
  submitReviewBtn?.addEventListener('click', async () => {
    if (isEditMode) {
      await updateReview();
    } else {
      await submitReview();
    }
  });
}

// Update star display
function updateStarDisplay(rating, isHover = false) {
  const stars = document.querySelectorAll('#starRating .star');
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

// Submit new review
async function submitReview() {
  const productId = new URLSearchParams(window.location.search).get('id');
  const comment = document.getElementById('reviewComment').value.trim();

  // Validation
  if (selectedRating === 0) {
    alert('Please select a rating');
    return;
  }

  if (comment.length < 10) {
    alert('Review must be at least 10 characters long');
    return;
  }

  try {
    const response = await fetch(`/api/products/${productId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        rating: selectedRating,
        comment: comment
      })
    });

    if (response.ok) {
      showNotification('Review submitted successfully!');
      resetReviewForm();
      await loadReviews();
      await loadRatingSummary();
      // Hide write button since user now has a review
      const writeReviewBtn = document.getElementById('writeReviewBtn');
      if (writeReviewBtn) writeReviewBtn.style.display = 'none';
    } else {
      const error = await response.json();
      alert(error.error || 'Failed to submit review');
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    alert('Failed to submit review. Please try again.');
  }
}

// Update existing review
async function updateReview() {
  const comment = document.getElementById('reviewComment').value.trim();

  // Validation
  if (selectedRating === 0) {
    alert('Please select a rating');
    return;
  }

  if (comment.length < 10) {
    alert('Review must be at least 10 characters long');
    return;
  }

  try {
    const response = await fetch(`/api/reviews/${editingReviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        rating: selectedRating,
        comment: comment
      })
    });

    if (response.ok) {
      showNotification('Review updated successfully!');
      resetReviewForm();
      await loadReviews();
      await loadRatingSummary();
    } else {
      const error = await response.json();
      alert(error.error || 'Failed to update review');
    }
  } catch (error) {
    console.error('Error updating review:', error);
    alert('Failed to update review. Please try again.');
  }
}

// Reset review form
function resetReviewForm() {
  const reviewForm = document.getElementById('reviewForm');
  const writeReviewBtn = document.getElementById('writeReviewBtn');
  
  if (reviewForm) reviewForm.classList.remove('active');
  if (currentUser && currentUser.loggedIn && !isEditMode && writeReviewBtn) {
    writeReviewBtn.style.display = 'block';
  }
  
  const commentField = document.getElementById('reviewComment');
  if (commentField) commentField.value = '';
  selectedRating = 0;
  updateStarDisplay(0);
  isEditMode = false;
  editingReviewId = null;
  
  const submitBtn = document.getElementById('submitReviewBtn');
  if (submitBtn) submitBtn.textContent = 'Submit Review';
}

// Load rating summary
async function loadRatingSummary() {
  const productId = new URLSearchParams(window.location.search).get('id');
  
  try {
    const response = await fetch(`/api/products/${productId}/rating`);
    const data = await response.json();

    const summaryDiv = document.getElementById('ratingSummary');
    if (!summaryDiv) return;
    
    const averageRating = data.averageRating || 0;
    const totalReviews = data.totalReviews || 0;

    // Update average rating number
    const avgEl = summaryDiv.querySelector('.average-rating');
    if (avgEl) avgEl.textContent = averageRating.toFixed(1);

    // Update stars display
    const starsHtml = generateStarDisplay(averageRating);
    const starsEl = summaryDiv.querySelector('.stars-display');
    if (starsEl) starsEl.innerHTML = starsHtml;

    // Update total reviews
    const totalEl = summaryDiv.querySelector('.total-reviews');
    if (totalEl) {
      totalEl.textContent = `${totalReviews} ${totalReviews === 1 ? 'review' : 'reviews'}`;
    }
  } catch (error) {
    console.error('Error loading rating summary:', error);
  }
}

// Generate star display HTML
function generateStarDisplay(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars += '★'; // Full star
    } else if (i - rating < 1) {
      stars += '⯨'; // Half star
    } else {
      stars += '☆'; // Empty star
    }
  }
  return stars;
}

// Load reviews
async function loadReviews() {
  const productId = new URLSearchParams(window.location.search).get('id');
  const reviewsList = document.getElementById('reviewsList');

  if (!reviewsList) return;

  try {
    const response = await fetch(`/api/products/${productId}/reviews`);
    const reviews = await response.json();

    console.log('Loaded reviews:', reviews);
    console.log('Current user:', currentUser);

    if (reviews.length === 0) {
      reviewsList.innerHTML = '<div class="no-reviews">No reviews yet. Be the first to review!</div>';
      return;
    }

    reviewsList.innerHTML = reviews.map(review => renderReviewCard(review)).join('');

    // Setup event listeners for each review
    reviews.forEach(review => {
      setupReviewActions(review);
    });
  } catch (error) {
    console.error('Error loading reviews:', error);
    reviewsList.innerHTML = '<div class="no-reviews">Failed to load reviews</div>';
  }
}

// Render review card
function renderReviewCard(review) {
  // ✅ Backend tells us if this review belongs to current user
  const isOwn = review.isOwn === true;
  
  console.log(`🔍 Rendering review ${review.id}:`, {
    reviewUserId: review.userId,
    currentUserId: currentUser?.id,
    isOwn: isOwn,
    showButtons: isOwn
  });
  
  const date = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const avatar = review.user.profileImage 
    ? `<img src="${review.user.profileImage}" alt="${review.user.name}">`
    : review.user.name.charAt(0).toUpperCase();

  return `
    <div class="review-card" data-review-id="${review.id}">
      <div class="review-header">
        <div class="reviewer-info">
          <div class="reviewer-avatar">
            ${avatar}
          </div>
          <div class="reviewer-details">
            <div class="reviewer-name">${review.user.name}${isOwn ? ' <span style="color: #4CAF50; font-size: 12px;">(You)</span>' : ''}</div>
            <div class="review-date">${date}</div>
          </div>
        </div>
        <div class="review-rating">
          ${generateStarDisplay(review.rating)}
        </div>
      </div>
      
      <div class="review-content">
        ${review.comment}
      </div>

      <div class="review-footer">
        <button class="like-btn ${review.isLikedByUser ? 'liked' : ''}" data-review-id="${review.id}">
          <span class="like-icon">👍</span>
          <span class="like-count">${review.likeCount || 0}</span>
        </button>
        
        ${isOwn ? `
          <div class="review-actions">
            <button class="review-action-btn edit-btn" data-review-id="${review.id}">
              Edit
            </button>
            <button class="review-action-btn delete-btn" data-review-id="${review.id}">
              Delete
            </button>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// Setup review actions
function setupReviewActions(review) {
  const reviewCard = document.querySelector(`.review-card[data-review-id="${review.id}"]`);
  if (!reviewCard) return;

  // Like button
  const likeBtn = reviewCard.querySelector('.like-btn');
  likeBtn?.addEventListener('click', () => toggleLike(review.id));

  // Edit button (only for own reviews)
  const editBtn = reviewCard.querySelector('.edit-btn');
  editBtn?.addEventListener('click', () => startEditReview(review));

  // Delete button (only for own reviews)
  const deleteBtn = reviewCard.querySelector('.delete-btn');
  deleteBtn?.addEventListener('click', () => deleteReview(review.id));
}

// Toggle like
async function toggleLike(reviewId) {
  if (!currentUser || !currentUser.loggedIn) {
    alert('Please login to like reviews');
    window.location.href = '/login.html';
    return;
  }

  try {
    const response = await fetch(`/api/reviews/${reviewId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      
      // Update UI
      const likeBtn = document.querySelector(`.like-btn[data-review-id="${reviewId}"]`);
      if (!likeBtn) return;
      
      const likeCount = likeBtn.querySelector('.like-count');
      if (likeCount) likeCount.textContent = data.likeCount;
      
      if (data.liked) {
        likeBtn.classList.add('liked');
      } else {
        likeBtn.classList.remove('liked');
      }
    } else {
      const error = await response.json();
      if (response.status === 401) {
        alert('Please login to like reviews');
        window.location.href = '/login.html';
      } else {
        alert(error.error || 'Failed to like review');
      }
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    alert('Failed to like review. Please try again.');
  }
}

// Start editing review
function startEditReview(review) {
  isEditMode = true;
  editingReviewId = review.id;

  // Populate form
  const commentField = document.getElementById('reviewComment');
  if (commentField) commentField.value = review.comment;
  
  selectedRating = review.rating;
  updateStarDisplay(selectedRating);

  // Show form
  const reviewForm = document.getElementById('reviewForm');
  const writeReviewBtn = document.getElementById('writeReviewBtn');
  const submitBtn = document.getElementById('submitReviewBtn');
  
  if (reviewForm) reviewForm.classList.add('active');
  if (writeReviewBtn) writeReviewBtn.style.display = 'none';
  if (submitBtn) submitBtn.textContent = 'Update Review';

  // Scroll to form
  if (reviewForm) reviewForm.scrollIntoView({ behavior: 'smooth' });
}

// Delete review
async function deleteReview(reviewId) {
  if (!confirm('Are you sure you want to delete this review?')) {
    return;
  }

  try {
    const response = await fetch(`/api/reviews/${reviewId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      showNotification('Review deleted successfully');
      await loadReviews();
      await loadRatingSummary();
      // Show write button again
      if (currentUser && currentUser.loggedIn) {
        const writeReviewBtn = document.getElementById('writeReviewBtn');
        if (writeReviewBtn) writeReviewBtn.style.display = 'block';
      }
    } else {
      const error = await response.json();
      alert(error.error || 'Failed to delete review');
    }
  } catch (error) {
    console.error('Error deleting review:', error);
    alert('Failed to delete review. Please try again.');
  }
}

// Show notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 30px;
    background: linear-gradient(135deg, #4CAF50, #45a049);
    color: white;
    padding: 15px 25px;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
    z-index: 10000;
    font-weight: 600;
    animation: slideIn 0.3s ease-out;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}