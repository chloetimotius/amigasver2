/* ----------------------------------------------
   WISHLIST + ADD-TO-CART WITH BACKEND SYNC
---------------------------------------------- */

// Check if user is authenticated
function isAuthenticated() {
  return !!sessionStorage.getItem('userId') || !!localStorage.getItem('userId');
}

// ----------------------------
// WISHLIST STORAGE FUNCTIONS (with backend sync)
// ----------------------------
function getWishlist() {
  const wishlist = localStorage.getItem('wishlist');
  return wishlist ? JSON.parse(wishlist) : [];
}

function saveWishlist(wishlist) {
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateWishlistCount();
  
  // Sync to backend if authenticated
  if (isAuthenticated()) {
    syncWishlistToBackend();
  }
}

// Sync wishlist from backend
async function loadWishlistFromBackend() {
  if (!isAuthenticated()) return;
  
  try {
    const response = await fetch('/api/wishlist', {
      credentials: 'include'
    });
    
    if (response.ok) {
      const backendWishlist = await response.json();
      localStorage.setItem('wishlist', JSON.stringify(backendWishlist));
      updateWishlistCount();
      
      if (window.location.pathname.includes("wishlist.html")) {
        displayWishlist();
      }
      refreshWishlistHearts();
    }
  } catch (error) {
    console.error('Error loading wishlist from backend:', error);
  }
}

// Sync local wishlist to backend
async function syncWishlistToBackend() {
  if (!isAuthenticated()) return;
  
  try {
    const localWishlist = getWishlist();
    const productIds = localWishlist.map(item => item.id);
    
    const response = await fetch('/api/wishlist/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ localWishlist: productIds })
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('wishlist', JSON.stringify(data.wishlist));
      updateWishlistCount();
      refreshWishlistHearts();
    }
  } catch (error) {
    console.error('Error syncing wishlist to backend:', error);
  }
}

// ----------------------------
// CART STORAGE FUNCTIONS
// ----------------------------
function getCart() {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

// ----------------------------
// ADD TO CART
// ----------------------------
function addToCart(product) {
  let cart = getCart();

  const productId = Number(product.id);
  
  if (isNaN(productId)) {
    console.error("❌ INVALID PRODUCT ID:", product.id, product);
    alert("Product data is corrupted. Cannot add to cart.");
    return;
  }

  const existing = cart.find(item => Number(item.id) === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ 
      id: productId,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl || product.image,
      quantity: 1
    });
  }

  saveCart(cart);
  showNotification("Added to cart!");
}

function addToCartFromWishlist(productId) {
  const wishlist = getWishlist();
  const numericId = Number(productId);
  const product = wishlist.find(item => Number(item.id) === numericId);

  if (product) {
    addToCart(product);   // Adds item + saves cart + shows popup
    updateCartCount();    // 🔥 Immediately update cart icon badge
  }
}

// ----------------------------
// WISHLIST FUNCTIONS (with backend sync)
// ----------------------------
async function addToWishlist(product) {
  let wishlist = getWishlist();
  
  const productId = Number(product.id);
  
  if (isNaN(productId)) {
    console.error("❌ INVALID PRODUCT ID:", product.id, product);
    return false;
  }
  
  const exists = wishlist.some(item => Number(item.id) === productId);

  if (!exists) {
    wishlist.push({
      id: productId,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl || product.image,
      category: product.category || "General"
    });
    saveWishlist(wishlist);
    
    // Add to backend
    if (isAuthenticated()) {
      try {
        await fetch('/api/wishlist/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ productId })
        });
      } catch (error) {
        console.error('Error adding to backend wishlist:', error);
      }
    }
    
    showNotification("Added to wishlist!");
    return true;
  } else {
    showNotification("Already in wishlist!");
    return false;
  }
}

async function removeFromWishlist(productId) {
  let wishlist = getWishlist();
  const numericId = Number(productId);
  wishlist = wishlist.filter(item => Number(item.id) !== numericId);

  saveWishlist(wishlist);
  
  // Remove from backend
  if (isAuthenticated()) {
    try {
      await fetch(`/api/wishlist/remove/${numericId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error removing from backend wishlist:', error);
    }
  }
  
  showNotification("Removed from wishlist");

  if (window.location.pathname.includes("wishlist.html")) {
    displayWishlist();
  }
  
  refreshWishlistHearts();
}

function isInWishlist(productId) {
  const numericId = Number(productId);
  return getWishlist().some(item => Number(item.id) === numericId);
}

function toggleWishlist(product) {
  if (isInWishlist(product.id)) {
    removeFromWishlist(product.id);
    return false;
  } else {
    addToWishlist(product);
    return true;
  }
}

// ----------------------------
// UPDATE BADGES
// ----------------------------
function updateWishlistCount() {
  const wishlist = getWishlist();
  document.querySelectorAll("#wishlistCount, #wishlistCountHeader").forEach(b => {
    b.textContent = wishlist.length;
  });
}

function updateCartCount() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll("#cartCount").forEach(b => {
    b.textContent = totalItems;
  });
}

// ----------------------------
// DISPLAY WISHLIST PAGE
// ----------------------------
function displayWishlist() {
  const wishlist = getWishlist();
  const wishlistGrid = document.getElementById("wishlistGrid");
  const emptyWishlist = document.getElementById("emptyWishlist");

  if (!wishlistGrid) return;

  if (wishlist.length === 0) {
    wishlistGrid.style.display = "none";
    emptyWishlist.style.display = "block";
    return;
  }

  wishlistGrid.style.display = "grid";
  emptyWishlist.style.display = "none";

  wishlistGrid.innerHTML = wishlist.map(product => `
    <div class="wishlist-card" data-id="${product.id}">
      <button class="remove-from-wishlist">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>

      <img class="product-image" src="${product.imageUrl}" alt="${product.name}">
      <div class="product-name">${product.name}</div>
      <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>

      <div class="wishlist-actions">
        <button class="add-to-cart-btn">Add to Cart</button>
      </div>
    </div>
  `).join("");

  wishlistGrid.querySelectorAll(".remove-from-wishlist").forEach(btn => {
    btn.addEventListener("click", e => {
      const productId = e.target.closest(".wishlist-card").dataset.id;
      removeFromWishlist(productId);
    });
  });

  wishlistGrid.querySelectorAll(".add-to-cart-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const productId = e.target.closest(".wishlist-card").dataset.id;
      addToCartFromWishlist(productId);
    });
  });

  updateHeaderCount();
}


// ----------------------------
// NOTIFICATION POPUP
// ----------------------------
function showNotification(message) {
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 30px;
    background: linear-gradient(135deg,#4CAF50,#45a049);
    color: white;
    padding: 15px 25px;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(76,175,80,.4);
    z-index: 10000;
    font-weight: 600;
    animation: slideIn .3s ease-out;
  `;

  if (!document.getElementById("notificationStyles")) {
    const style = document.createElement("style");
    style.id = "notificationStyles";
    style.textContent = `
      @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut .3s ease-out";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ----------------------------
// INITIALIZE
// ----------------------------
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeWishlist);
} else {
  initializeWishlist();
}

async function initializeWishlist() {
  // Load from backend if authenticated
  if (isAuthenticated()) {
    await loadWishlistFromBackend();
  }
  
  updateWishlistCount();
  updateCartCount();

  if (window.location.pathname.includes("wishlist.html")) {
    displayWishlist();
  }

  addHeartIconStyles();
  setTimeout(() => window.addHeartIconsToProducts(), 500);
}

// ----------------------------
// ADD HEART ICON STYLES TO HEAD
// ----------------------------
function addHeartIconStyles() {
  if (document.getElementById("wishlistHeartStyles")) return;
  
  const style = document.createElement("style");
  style.id = "wishlistHeartStyles";
  style.textContent = `
    .product-card .wishlist-heart,
    .deal-card .wishlist-heart,
    .reorder-card .wishlist-heart {
      position: absolute !important;
      top: 15px !important;
      right: 15px !important;
      width: 40px !important;
      height: 40px !important;
      min-width: 40px !important;
      min-height: 40px !important;
      background: rgba(255, 255, 255, 0.95) !important;
      border: none !important;
      border-radius: 50% !important;
      cursor: pointer !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15) !important;
      transition: all 0.3s ease !important;
      z-index: 10 !important;
      backdrop-filter: blur(10px) !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    
    .product-card .wishlist-heart:hover,
    .deal-card .wishlist-heart:hover,
    .reorder-card .wishlist-heart:hover {
      background: white !important;
      transform: scale(1.1) !important;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25) !important;
    }
    
    .wishlist-heart svg {
      width: 22px !important;
      height: 22px !important;
      transition: all 0.3s ease !important;
      display: block !important;
    }
    
    @keyframes heartBeat {
      0%, 100% { transform: scale(1); }
      25% { transform: scale(1.3); }
      50% { transform: scale(1.1); }
      75% { transform: scale(1.2); }
    }
    
    .wishlist-heart.animating {
      animation: heartBeat 0.3s ease-out !important;
    }
    
    .product-card,
    .deal-card,
    .reorder-card {
      position: relative !important;
    }
  `;
  document.head.appendChild(style);
}

// ----------------------------
// HEART ICONS ON PRODUCT CARDS
// ----------------------------
window.addHeartIconsToProducts = function addHeartIconsToProducts() {
  const productCards = document.querySelectorAll(
    ".product-card:not(.wishlist-card), .deal-card, .reorder-card"
  );

  productCards.forEach(card => {
    if (card.querySelector(".wishlist-heart")) return;

    let productId = card.dataset.productId || card.dataset.id;
    
    const nameElement = card.querySelector(".product-name, h3");
    const priceElement = card.querySelector(".product-price, .current-price, p");
    const imageElement = card.querySelector(".product-image, img");

    if (!nameElement || !priceElement || !imageElement) return;

    const productName = nameElement.textContent.trim();
    let priceText = priceElement.textContent.replace("$", "").split("/")[0];
    const productPrice = parseFloat(priceText);
    const productImage = imageElement.src;

    if (!productId) {
      console.warn("⚠️ Product card missing data-product-id:", productName);
      return;
    }

    productId = Number(productId);
    
    if (isNaN(productId)) {
      console.error("❌ Invalid product ID:", productId, productName);
      return;
    }

    const product = {
      id: productId,
      name: productName,
      price: productPrice,
      imageUrl: productImage,
      category: card.dataset.category || "General"
    };

    const heartBtn = document.createElement("button");
    heartBtn.className = "wishlist-heart";
    heartBtn.setAttribute("aria-label", "Add to wishlist");

    const updateIcon = filled => {
      heartBtn.innerHTML = filled
        ? `<svg width="22" height="22" fill="#ff4444" viewBox="0 0 24 24">
             <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
           </svg>`
        : `<svg width="22" height="22" fill="none" stroke="#ff4444" stroke-width="2" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
           </svg>`;
    };

    updateIcon(isInWishlist(productId));

    heartBtn.onclick = e => {
      e.preventDefault();
      e.stopPropagation();
      
      const nowIn = toggleWishlist(product);
      updateIcon(nowIn);

      heartBtn.classList.add("animating");
      setTimeout(() => heartBtn.classList.remove("animating"), 300);
    };

    if (getComputedStyle(card).position === 'static') {
      card.style.position = "relative";
    }
    
    card.appendChild(heartBtn);
  });
};

// ----------------------------
// REFRESH HEART ICONS
// ----------------------------
window.refreshWishlistHearts = function() {
  document.querySelectorAll(".wishlist-heart").forEach(heart => {
    const card = heart.closest(".product-card, .deal-card, .reorder-card");
    if (!card) return;
    
    const productId = Number(card.dataset.productId || card.dataset.id);
    if (isNaN(productId)) return;
    
    const filled = isInWishlist(productId);
    
    heart.innerHTML = filled
      ? `<svg width="22" height="22" fill="#ff4444" viewBox="0 0 24 24">
           <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
         </svg>`
      : `<svg width="22" height="22" fill="none" stroke="#ff4444" stroke-width="2" viewBox="0 0 24 24">
           <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
         </svg>`;
  });
};

// ----------------------------
// CLEAR LIST MENU + MODAL
// ----------------------------
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const clearListBtn = document.getElementById("clearListBtn");
  const confirmModal = document.getElementById("confirmModal");
  const cancelBtn = document.getElementById("cancelBtn");
  const confirmBtn = document.getElementById("confirmBtn");

  if (!menuBtn) return;

  menuBtn.addEventListener("click", e => {
    e.stopPropagation();
    dropdownMenu.classList.toggle("show");
  });

  document.addEventListener("click", e => {
    if (!dropdownMenu.contains(e.target) && !menuBtn.contains(e.target)) {
      dropdownMenu.classList.remove("show");
    }
  });

  if (clearListBtn) {
    clearListBtn.addEventListener("click", () => {
      dropdownMenu.classList.remove("show");

      if (getWishlist().length === 0) {
        showNotification("Wishlist is already empty!");
        return;
      }

      confirmModal.classList.add("show");
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      confirmModal.classList.remove("show");
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener("click", async () => {
      localStorage.setItem("wishlist", "[]");
      
      // Clear from backend
      if (isAuthenticated()) {
        try {
          await fetch('/api/wishlist/clear', {
            method: 'DELETE',
            credentials: 'include'
          });
        } catch (error) {
          console.error('Error clearing backend wishlist:', error);
        }
      }
      
      updateWishlistCount();
      displayWishlist();
      confirmModal.classList.remove("show");
      showNotification("Wishlist cleared!");
    });
  }

  if (confirmModal) {
    confirmModal.addEventListener("click", e => {
      if (e.target === confirmModal) confirmModal.classList.remove("show");
    });
  }
});

function updateHeaderCount() {
  const wishlist = getWishlist();
  const headerCount = document.getElementById("wishlistCountHeader");
  if (headerCount) headerCount.textContent = wishlist.length;
}

// Listen for login events to sync wishlist
window.addEventListener('storage', (e) => {
  if (e.key === 'userId' && e.newValue) {
    loadWishlistFromBackend();
  }
});