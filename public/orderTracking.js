// orderTracking.js

// ============================================
// STATUS CONFIGURATION
// ============================================

const STATUSES = [
  {
    name: "Pending",
    icon: "●",
    progress: 0,
    eta: "Estimated delivery: 30 minutes",
    description: "We're processing your order"
  },
  {
    name: "Packed",
    icon: "▣",
    progress: 33,
    eta: "Estimated delivery: 20 minutes",
    description: "Order packed and ready for dispatch"
  },
  {
    name: "Out for Delivery",
    icon: "▶",
    progress: 66,
    eta: "Estimated delivery: 10 minutes",
    description: "Your order is on the way!"
  },
  {
    name: "Delivered",
    icon: "✓",
    progress: 100,
    eta: "Order delivered successfully",
    description: "Enjoy your purchase!"
  }
];

let isRendering = false;
let currentOrders = [];

// ============================================
// INITIALIZE
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  updateHeaderCounts();
  loadOrders();
  setupAuthUI();
  setupLogout();
});

// ============================================
// AUTH UI
// ============================================

function updateAuthUI() {
  const token = localStorage.getItem("accessToken");
  const loginLink = document.getElementById("loginLink");
  const signupLink = document.getElementById("signupLink");
  const profileLink = document.getElementById("profileLink");
  const logoutContainer = document.getElementById("logoutContainer");

  if (token) {
    if (loginLink) loginLink.style.display = "none";
    if (signupLink) signupLink.style.display = "none";
    if (profileLink) profileLink.style.display = "block";
    if (logoutContainer) logoutContainer.style.display = "block";
  } else {
    if (loginLink) loginLink.style.display = "block";
    if (signupLink) signupLink.style.display = "block";
    if (profileLink) profileLink.style.display = "none";
    if (logoutContainer) logoutContainer.style.display = "none";
  }
}

function setupAuthUI() {
  updateAuthUI();
}

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("accessToken");
      window.location.href = "/login.html";
    });
  }
}

// ============================================
// GET ORDER STATUSES FROM STORAGE
// ============================================

function getOrderStatuses() {
  return JSON.parse(localStorage.getItem('orderStatuses') || '{}');
}

function saveOrderStatus(orderId, status) {
  const statuses = getOrderStatuses();
  statuses[orderId] = status;
  localStorage.setItem('orderStatuses', JSON.stringify(statuses));
  
  // Trigger storage event for other tabs/pages
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('orderUpdated'));
}

function getOrderStatus(orderId) {
  const statuses = getOrderStatuses();
  return statuses[orderId] || null;
}

// ============================================
// HEADER COUNTS
// ============================================

function updateHeaderCounts() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  
  const cartCount = document.getElementById("cartCount");
  const wishlistCount = document.getElementById("wishlistCount");
  const ordersCount = document.getElementById("ordersCount");
  
  if (cartCount) cartCount.textContent = cart.length;
  if (wishlistCount) wishlistCount.textContent = wishlist.length;
  
  // Count active orders (not completed)
  if (ordersCount) {
    const statuses = getOrderStatuses();
    const activeCount = Object.values(statuses).filter(s => s !== 'Completed').length;
    ordersCount.textContent = activeCount;
    ordersCount.style.display = activeCount > 0 ? 'inline-block' : 'none';
  }
}

// Listen for storage changes
window.addEventListener('storage', updateHeaderCounts);
window.addEventListener('orderUpdated', updateHeaderCounts);

// ============================================
// LOAD ORDERS
// ============================================

async function loadOrders() {
  if (isRendering) return;
  
  const container = document.getElementById("ordersContainer");
  const noOrders = document.getElementById("noOrders");
  const token = localStorage.getItem("accessToken");

  try {
    const response = await fetch("/orders/my", {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!response.ok) {
      throw new Error("Failed to load orders");
    }

    const orders = await response.json();

    // CRITICAL FIX: Filter ONLY active orders (not completed AND status exists)
    const statuses = getOrderStatuses();
    const activeOrders = orders.filter(order => {
      const orderStatus = statuses[order.id];
      // Only show orders that have a status AND are not completed
      return orderStatus && orderStatus !== 'Completed';
    });

    // Check if orders have actually changed
    const ordersChanged = JSON.stringify(activeOrders.map(o => o.id)) !== 
                          JSON.stringify(currentOrders.map(o => o.id));

    if (!ordersChanged && currentOrders.length > 0) {
      // Just update progress bars without re-rendering
      activeOrders.forEach(order => {
        updateOrderProgress(order);
      });
      return;
    }

    currentOrders = activeOrders;

    if (activeOrders.length === 0) {
      container.style.display = "none";
      noOrders.style.display = "block";
      return;
    }

    container.style.display = "grid";
    noOrders.style.display = "none";
    
    renderOrders(activeOrders);
    updateHeaderCounts();
    
  } catch (error) {
    console.error("Error loading orders:", error);
    container.innerHTML = `
      <div class="error-message">
        <p>Unable to load orders. Please try again later.</p>
      </div>
    `;
  }
}

// ============================================
// UPDATE ORDER PROGRESS (WITHOUT RE-RENDERING)
// ============================================

function updateOrderProgress(order) {
  const currentStatusIndex = getCurrentStatusIndex(order);
  const currentStatus = STATUSES[currentStatusIndex];
  
  // Update progress bar
  const progressFill = document.getElementById(`progress-fill-${order.id}`);
  if (progressFill && progressFill.style.width !== `${currentStatus.progress}%`) {
    progressFill.style.width = `${currentStatus.progress}%`;
  }
  
  // Update status steps
  const card = document.getElementById(`order-card-${order.id}`);
  if (card) {
    const steps = card.querySelectorAll('.progress-step');
    steps.forEach((step, i) => {
      step.classList.remove('active', 'completed');
      if (i < currentStatusIndex) {
        step.classList.add('completed');
      } else if (i === currentStatusIndex) {
        step.classList.add('active');
      }
    });
    
    // Update status text
    const statusText = card.querySelector('.current-status');
    const etaText = card.querySelector('.eta-time');
    if (statusText) statusText.textContent = currentStatus.description;
    if (etaText) {
      etaText.textContent = currentStatus.eta;
    }
    
    // Show complete button if delivered
    const existingBtn = card.querySelector('.complete-order-btn');
    if (currentStatusIndex === 3 && !existingBtn) {
      const itemsSection = card.querySelector('.items-section');
      const completeBtn = document.createElement('button');
      completeBtn.className = 'complete-order-btn';
      completeBtn.onclick = () => completeOrder(order.id);
      completeBtn.innerHTML = '✓ Complete Order';
      itemsSection.parentNode.insertBefore(completeBtn, itemsSection);
    }
  }
}

// ============================================
// RENDER ORDERS
// ============================================

function renderOrders(orders) {
  isRendering = true;
  const container = document.getElementById("ordersContainer");
  container.innerHTML = "";

  orders.forEach((order, index) => {
    const orderCard = createOrderCard(order, index);
    container.appendChild(orderCard);
  });
  
  isRendering = false;
}

// ============================================
// CREATE ORDER CARD
// ============================================

function createOrderCard(order, index) {
  const card = document.createElement("div");
  card.className = "order-card";
  card.style.animationDelay = `${index * 0.1}s`;
  card.id = `order-card-${order.id}`;

  // Determine current status
  const currentStatusIndex = getCurrentStatusIndex(order);
  const currentStatus = STATUSES[currentStatusIndex];
  const isDelivered = currentStatusIndex === 3;

  card.innerHTML = `
    <div class="order-header">
      <div>
        <div class="order-id">Order #${order.id}</div>
        <div class="order-date">${formatDate(order.createdAt)}</div>
      </div>
      <div class="order-total">$${order.total.toFixed(2)}</div>
    </div>

    <div class="progress-tracker">
      <div class="progress-steps">
        <div class="progress-line">
          <div class="progress-line-fill" id="progress-fill-${order.id}" style="width: 0%;"></div>
        </div>
        ${STATUSES.map((status, i) => `
          <div class="progress-step ${i < currentStatusIndex ? 'completed' : ''} ${i === currentStatusIndex ? 'active' : ''}">
            <div class="step-icon">${status.icon}</div>
            <div class="step-label">${status.name}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="status-info">
      <div class="current-status">${currentStatus.description}</div>
      <div class="eta-time">${currentStatus.eta}</div>
    </div>

    ${isDelivered ? `
      <button class="complete-order-btn" onclick="completeOrder(${order.id})">
        ✓ Complete Order
      </button>
    ` : ''}

    <div class="items-section">
      <button class="toggle-items-btn" onclick="toggleItems(${order.id})">
        <span>View Order Details (${order.items.length} items)</span>
        <span class="arrow">▼</span>
      </button>
      <div class="items-list" id="items-${order.id}">
        ${order.items.map(item => `
          <div class="item-card">
            <img src="${item.product.imageUrl || '/placeholder.png'}" alt="${item.product.name}" class="item-image">
            <div class="item-details">
              <div class="item-name">${item.product.name}</div>
              <div class="item-meta">
                <span class="item-quantity">Qty: ${item.quantity}</span>
                <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Trigger progress animation after card is in DOM
  requestAnimationFrame(() => {
    setTimeout(() => {
      const progressFill = document.getElementById(`progress-fill-${order.id}`);
      if (progressFill) {
        progressFill.style.width = `${currentStatus.progress}%`;
      }
    }, 100);
  });

  return card;
}

// ============================================
// GET CURRENT STATUS INDEX (10 SECONDS TOTAL)
// ============================================

function getCurrentStatusIndex(order) {
  // Check if order has saved status
  const savedStatus = getOrderStatus(order.id);
  if (savedStatus === 'Completed') {
    return 3; // Delivered
  }

  // Calculate status based on order age (10 seconds total)
  const orderDate = new Date(order.createdAt);
  const now = new Date();
  const secondsElapsed = (now - orderDate) / 1000;

  if (secondsElapsed < 3) return 0; // Pending (0-3 seconds)
  if (secondsElapsed < 6) return 1; // Packed (3-6 seconds)
  if (secondsElapsed < 10) return 2; // Out for Delivery (6-10 seconds)
  return 3; // Delivered (10+ seconds)
}

// ============================================
// COMPLETE ORDER WITH ANIMATION
// ============================================

window.completeOrder = function(orderId) {
  const card = document.getElementById(`order-card-${orderId}`);
  if (!card) return;

  // Disable button to prevent double clicks
  const btn = card.querySelector('.complete-order-btn');
  if (btn) btn.disabled = true;

  // Create completion overlay
  const overlay = document.createElement('div');
  overlay.className = 'completion-overlay';
  overlay.innerHTML = `
    <div class="completion-animation">
      <div class="checkmark-circle">
        <div class="checkmark">✓</div>
      </div>
      <div class="completion-text">Order Completed!</div>
    </div>
  `;
  
  card.style.position = 'relative';
  card.appendChild(overlay);

  // Trigger animation
  requestAnimationFrame(() => {
    setTimeout(() => overlay.classList.add('show'), 10);
  });

  // Save completion status
  saveOrderStatus(orderId, 'Completed');
  updateHeaderCounts();
  
  // Remove card after animation
  setTimeout(() => {
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
      card.remove();
      
      // Update current orders array
      currentOrders = currentOrders.filter(o => o.id !== orderId);
      
      // Check if there are any orders left
      const container = document.getElementById("ordersContainer");
      if (container.children.length === 0) {
        container.style.display = "none";
        document.getElementById("noOrders").style.display = "block";
      }
    }, 500);
  }, 2500);
};

// ============================================
// TOGGLE ITEMS VISIBILITY
// ============================================

window.toggleItems = function(orderId) {
  const itemsList = document.getElementById(`items-${orderId}`);
  const button = event.currentTarget;
  
  if (itemsList.classList.contains('show')) {
    itemsList.classList.remove('show');
    button.classList.remove('active');
  } else {
    itemsList.classList.add('show');
    button.classList.add('active');
  }
};

// ============================================
// FORMAT DATE
// ============================================

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('en-US', options);
}

// ============================================
// AUTO-REFRESH FOR ACTIVE ORDERS (EVERY 1 SECOND)
// ============================================

setInterval(() => {
  const statuses = getOrderStatuses();
  const hasActiveOrders = Object.values(statuses).some(s => s !== 'Completed');
  if (hasActiveOrders) {
    loadOrders();
  }
}, 1000); // Refresh every second for updates