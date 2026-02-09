/* ================================================
   HOME PAGE (INDEX.HTML) - DYNAMIC PRODUCT LOADING
================================================ */

// Carousel functionality
let currentSlide = 0;
const totalSlides = 2;
let autoSlideInterval;

function updateCarousel() {
  const container = document.getElementById('carouselContainer');
  const dots = document.querySelectorAll('.carousel-dot');

  container.style.transform = `translateX(-${currentSlide * 100}%)`;

  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentSlide);
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  updateCarousel();
  resetAutoSlide();
}

function previousSlide() {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  updateCarousel();
  resetAutoSlide();
}

function goToSlide(index) {
  currentSlide = index;
  updateCarousel();
  resetAutoSlide();
}

function startAutoSlide() {
  autoSlideInterval = setInterval(nextSlide, 5000);
}

function resetAutoSlide() {
  clearInterval(autoSlideInterval);
  startAutoSlide();
}

// Countdown timer
let countdownElement = document.getElementById('countdown');

function updateCountdown() {
  if (!countdownElement) return;
  
  let timeParts = countdownElement.textContent.split(':');
  let hours = parseInt(timeParts[0]);
  let minutes = parseInt(timeParts[1]);
  let seconds = parseInt(timeParts[2]);

  let totalSeconds = hours * 3600 + minutes * 60 + seconds;
  totalSeconds = Math.max(totalSeconds - 1, 0);

  hours = Math.floor(totalSeconds / 3600);
  minutes = Math.floor((totalSeconds % 3600) / 60);
  seconds = totalSeconds % 60;

  countdownElement.textContent =
    `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// ================================================
// LOAD PRODUCTS FROM DATABASE
// ================================================

function loadHomePageProducts() {
  fetch('/products')
    .then(res => res.json())
    .then(products => {
      if (!products || products.length === 0) {
        console.warn('No products found');
        return;
      }

      // Load recommended products (first 4 products)
      loadRecommendedProducts(products.slice(89, 92));

      // Load flash deals (products 5-6 if available)
      loadFlashDeals(products.slice(4, 6));

      // Load timer products (products 7-8 if available)
      loadTimerProducts(products.slice(6, 8));

      // Load quick reorder (products 9-10 if available)
      loadQuickReorder(products.slice(8, 10));

      // Add heart icons after products load
      setTimeout(() => {
        if (typeof window.addHeartIconsToProducts === 'function') {
          window.addHeartIconsToProducts();
        }
      }, 200);
    })
    .catch(err => console.error('Error loading products:', err));
}

// ================================================
// RECOMMENDED PRODUCTS
// ================================================
function loadRecommendedProducts(products) {
  const container = document.getElementById('recommendedProducts');
  if (!container) return;

  container.innerHTML = '';

  products.forEach(product => {
    const card = createProductCard(product);
    container.appendChild(card);
  });
}

// ================================================
// FLASH DEALS
// ================================================
function loadFlashDeals(products) {
  const flashDealsContainer = document.querySelector('.flash-deals');
  if (!flashDealsContainer) return;

  // Find existing deal cards and remove them (keep timer card)
  const existingDeals = flashDealsContainer.querySelectorAll('.deal-card');
  existingDeals.forEach(card => card.remove());

  products.forEach((product, index) => {
    const discount = index === 0 ? 30 : 20;
    const oldPrice = (product.price * (1 + discount / 100)).toFixed(2);

    const card = document.createElement('div');
    card.className = 'deal-card';
    card.dataset.productId = product.id;
    card.dataset.id = product.id;
    card.dataset.category = product.category?.name || 'General';

    card.innerHTML = `
      <div class="discount-badge">${discount}%</div>
      <img class="product-image" src="${product.imageUrl || 'https://via.placeholder.com/200'}" alt="${product.name}">
      <div class="product-name">${product.name}</div>
      <div class="price-container">
        <span class="current-price">$${parseFloat(product.price).toFixed(2)}</span>
        <span class="old-price">$${oldPrice}</span>
      </div>
    `;

    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-primary add-cart-btn';
    addBtn.style.cssText = 'margin-top: 10px; padding: 10px 20px; font-size: 14px;';
    addBtn.textContent = 'Add to Cart';
    
    addBtn.addEventListener('click', () => {
      addToCart({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        imageUrl: product.imageUrl,
        category: product.category?.name || 'General'
      });
      updateCartCount();
    });

    card.appendChild(addBtn);
    flashDealsContainer.appendChild(card);
  });
}

// ================================================
// TIMER PRODUCTS
// ================================================
function loadTimerProducts(products) {
  const container = document.getElementById('timerProducts');
  if (!container) return;

  container.innerHTML = '';

  products.forEach(product => {
    const item = document.createElement('div');
    item.className = 'timer-product-item';
    item.dataset.productId = product.id;
    item.dataset.id = product.id;
    item.dataset.category = product.category?.name || 'General';

    item.innerHTML = `
      <img class="product-image" src="${product.imageUrl || 'https://via.placeholder.com/100'}" alt="${product.name}">
      <span>${product.name}</span>
    `;

    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
      addToCart({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        imageUrl: product.imageUrl,
        category: product.category?.name || 'General'
      });
      updateCartCount();
      showNotification('Added to cart!');
    });

    container.appendChild(item);
  });
}

// ================================================
// QUICK REORDER
// ================================================
function loadQuickReorder(products) {
  const container = document.getElementById('quickReorder');
  if (!container) return;

  container.innerHTML = '';

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'reorder-card';
    card.dataset.productId = product.id;
    card.dataset.id = product.id;
    card.dataset.category = product.category?.name || 'General';

    card.innerHTML = `
      <img class="product-image" src="${product.imageUrl || 'https://via.placeholder.com/200'}" alt="${product.name}">
      <div class="product-name">${product.name}</div>
      <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
      <button class="btn btn-primary add-cart-btn" style="margin-top: 10px; padding: 10px 20px; font-size: 14px;">
        Reorder
      </button>
    `;

    const addBtn = card.querySelector('.add-cart-btn');
    addBtn.addEventListener('click', () => {
      addToCart({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        imageUrl: product.imageUrl,
        category: product.category?.name || 'General'
      });
      updateCartCount();
    });

    container.appendChild(card);
  });
}

// ================================================
// CREATE PRODUCT CARD (HELPER)
// ================================================
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.dataset.productId = product.id;
  card.dataset.id = product.id;
  card.dataset.category = product.category?.name || 'General';

  card.innerHTML = `
    <img class="product-image" src="${product.imageUrl || 'https://via.placeholder.com/200'}" alt="${product.name}">
    <div class="product-name">${product.name}</div>
    <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
    <button class="btn btn-primary add-cart-btn" style="margin-top: 10px; padding: 10px 20px; font-size: 14px;">
      Add to Cart
    </button>
  `;

  const addBtn = card.querySelector('.add-cart-btn');
  addBtn.addEventListener('click', () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      imageUrl: product.imageUrl,
      category: product.category?.name || 'General'
    });
    updateCartCount();
  });

  return card;
}

// ================================================
// CART FUNCTIONS
// ================================================
function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(product) {
  const cart = getCart();

  product.id = Number(product.id);

  if (isNaN(product.id)) {
    console.error('❌ INVALID PRODUCT ID:', product.id, product);
    alert('Product data is corrupted. Cannot add to cart.');
    return;
  }

  const existingItem = cart.find(item => Number(item.id) === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1
    });
  }

  saveCart(cart);
  showNotification('Added to cart!');
}

function updateCartCount() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cartCount');
  if (badge) badge.textContent = totalItems;
}

// ================================================
// CATEGORY NAVIGATION - NAVIGATES TO PRODUCTS PAGE
// ================================================
function setupCategoryNavigation() {
  const categoryItems = document.querySelectorAll('.categories .category-item');
  
  // Map category names to their database IDs
  const categoryMap = {
    'Fresh Produce': 1,
    'Meat & Seafood': 3,
    'Dairy & Eggs': 2,
    'Beverages': 6,
    'Snacks': 5,
    'Pantry Staples': 7,
    'Household Essentials': 8
  };
  
  categoryItems.forEach((item) => {
    const categoryText = item.querySelector('span').textContent.trim();
    const categoryId = categoryMap[categoryText];
    
    if (categoryId) {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        // Navigate to products page with category parameter
        window.location.href = `/products.html?category=${categoryId}`;
      });
    }
  });
}

// ================================================
// NOTIFICATION
// ================================================
function showNotification(message) {
  const notification = document.createElement('div');
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

  if (!document.getElementById('notificationStyles')) {
    const style = document.createElement('style');
    style.id = 'notificationStyles';
    style.textContent = `
      @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut .3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ================================================
// INITIALIZE
// ================================================
document.addEventListener('DOMContentLoaded', () => {
  // Start carousel
  startAutoSlide();
  
  // Start countdown
  setInterval(updateCountdown, 1000);
  
  // Load all products
  loadHomePageProducts();
  
  // Setup category navigation
  setupCategoryNavigation();
  
  // Update cart count
  updateCartCount();
});