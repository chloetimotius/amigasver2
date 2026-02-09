//cart.js
// ---------- LOCAL STORAGE UTILS ----------
function getCart() { return JSON.parse(localStorage.getItem('cart') || '[]'); }
function saveCart(cart) { 
  localStorage.setItem('cart', JSON.stringify(cart)); 
  updateHeaderCounts();
  window.dispatchEvent(new Event('storage'));
}

function getWishlist() { return JSON.parse(localStorage.getItem('wishlist') || '[]'); }
function saveWishlist(wl) { 
  localStorage.setItem('wishlist', JSON.stringify(wl)); 
  updateHeaderCounts();
  window.dispatchEvent(new Event('storage'));
}

function getOrderStatuses() {
  return JSON.parse(localStorage.getItem('orderStatuses') || '{}');
}

// ---------- COINS ----------
function getCoins() {
  return Number(localStorage.getItem("coins")) || 0;
}

function setCoins(amount) {
  localStorage.setItem("coins", amount);
}

// ---------- LOAD BONUSES FROM STORAGE ----------
const todayStr = new Date().toLocaleDateString();

let boxBonus = Number(localStorage.getItem("boxBonus")) || 0;
let slotBonus = Number(localStorage.getItem("slotBonus")) || 0;

let boxBonusDate = localStorage.getItem("boxBonusDate") || null;
let lastSpinDate = localStorage.getItem("lastSpinDate") || null;

// Expire old bonuses
if (boxBonusDate && boxBonusDate !== todayStr) {
  boxBonus = 0;
  localStorage.removeItem("boxBonus");
  localStorage.removeItem("boxBonusDate");
}

if (lastSpinDate && lastSpinDate !== todayStr) {
  slotBonus = 0;
  localStorage.removeItem("slotBonus");
  localStorage.removeItem("lastSpinDate");
}

let cartItems = getCart();

// ---------- HEADER COUNTS ----------
function updateHeaderCounts() {
  const cartCount = document.getElementById("cartCount");
  const wishlistCount = document.getElementById("wishlistCount");
  const ordersCount = document.getElementById("ordersCount");
  
  if (cartCount) cartCount.textContent = getCart().length;
  if (wishlistCount) wishlistCount.textContent = getWishlist().length;
  
  // Update orders count (active orders only)
  if (ordersCount) {
    const statuses = getOrderStatuses();
    const activeCount = Object.values(statuses).filter(s => s !== 'Completed').length;
    ordersCount.textContent = activeCount;
    ordersCount.style.display = activeCount > 0 ? 'inline-block' : 'none';
  }
}

// Initialize counts on page load
document.addEventListener('DOMContentLoaded', () => {
  updateHeaderCounts();
});

// Listen for storage changes
window.addEventListener('storage', updateHeaderCounts);
window.addEventListener('orderUpdated', updateHeaderCounts);

// ---------- RENDER CART ----------
function renderCartTable() {
  const tbody = document.getElementById("cartTableBody");
  tbody.innerHTML = "";

  if (cartItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:20px;">Your cart is empty.</td></tr>`;
    computeSummary();
    updateHeaderCounts();
    return;
  }

  cartItems.forEach((item, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><img src="${item.image || item.imageUrl}" width="60" style="border-radius:8px;margin-right:8px;"> ${item.name}</td>
      <td class="qty-cell">
        <button class="qty-btn" data-index="${i}" data-action="minus">−</button>
        <span class="qty">${item.quantity}</span>
        <button class="qty-btn" data-index="${i}" data-action="plus">+</button>
        <button class="delete-btn" data-index="${i}">🗑</button>
      </td>
      <td>$${(item.price * item.quantity).toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  });

  attachQuantityButtons();
  attachDeleteButtons();
  computeSummary();
  updateHeaderCounts();
}

// ---------- QTY BUTTONS ----------
function attachQuantityButtons() {
  document.querySelectorAll(".qty-btn").forEach(btn => {
    btn.onclick = () => {
      const i = Number(btn.dataset.index);
      if (btn.dataset.action === "minus") {
        cartItems[i].quantity--;
        if (cartItems[i].quantity <= 0) cartItems.splice(i, 1);
      } else {
        cartItems[i].quantity++;
      }
      saveCart(cartItems);
      renderCartTable();
    };
  });
}

// ---------- DELETE BUTTONS ----------
function attachDeleteButtons() {
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = () => {
      cartItems.splice(Number(btn.dataset.index), 1);
      saveCart(cartItems);
      renderCartTable();
    };
  });
}

// ---------- SUMMARY ----------
function computeSummary() {
  let subtotal = 0;
  cartItems.forEach(i => subtotal += i.price * i.quantity);

  const gst = subtotal * 0.08;
  const serviceFee = 0.50;
  const normalDiscount = subtotal > 20 ? subtotal * 0.05 : 0;
  const gamifiedDiscount = subtotal * (boxBonus + slotBonus) / 100;
  const deliveryFee = Number(localStorage.getItem("deliveryFee")) || 0;

  // COIN DISCOUNT
  const coinBalance = getCoins();
  const redeemInput = document.getElementById("redeemCoins");
  let coinsUsed = redeemInput ? Number(redeemInput.value) : 0;

  coinsUsed = Math.min(coinsUsed, coinBalance);
  const COIN_VALUE = 0.10;
  const coinDiscount = coinsUsed * COIN_VALUE;


  const total = Math.max(
    0,
    subtotal + gst + serviceFee - normalDiscount - gamifiedDiscount - coinDiscount + deliveryFee
  );

  document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("gst").textContent = `$${gst.toFixed(2)}`;
  document.getElementById("discount").textContent =
    `-$${(normalDiscount + gamifiedDiscount + coinDiscount).toFixed(2)}`;
  document.querySelector(".deliveryFeeRow").textContent = `$${deliveryFee.toFixed(2)}`;
  document.getElementById("finalTotal").textContent = `$${total.toFixed(2)}`;
  document.getElementById("coinBalance").textContent = `${coinBalance} 🪙`;
}


renderCartTable();

const redeemCoinsInput = document.getElementById("redeemCoins");
if (redeemCoinsInput) {
  redeemCoinsInput.addEventListener("input", computeSummary);
}

// ---------- MYSTERY BOX ----------
const mysteryValues = [5, 8, 10, 12, 15];

function disableMysteryBoxes() {
  document.querySelectorAll(".mystery-box").forEach(b => {
    b.style.pointerEvents = "none";
    b.style.opacity = "0.85";
  });
}

document.querySelectorAll(".mystery-box").forEach(box => {
  box.onclick = () => {
    disableMysteryBoxes();

    boxBonus = mysteryValues[Math.floor(Math.random() * mysteryValues.length)];
    localStorage.setItem("boxBonus", boxBonus);
    localStorage.setItem("boxBonusDate", todayStr);

    box.textContent = boxBonus + "%";
    document.getElementById("mysteryBoxResult").textContent = `🎉 Mystery Bonus: +${boxBonus}%`;

    computeSummary();
  };
});

// ---------- SLOT MACHINE ----------
function canSpinToday() {
  return lastSpinDate !== todayStr;
}

const slotBtn = document.getElementById("slotSpinBtn");

function updateSpinButtonState() {
  if (!canSpinToday()) {
    slotBtn.disabled = true;
    slotBtn.textContent = "Come back tomorrow!";
    slotBtn.style.background = "#ccc";
    slotBtn.style.cursor = "not-allowed";
  } else {
    slotBtn.disabled = false;
    slotBtn.textContent = "SPIN!";
    slotBtn.style.background = "";
    slotBtn.style.cursor = "pointer";
  }
}

updateSpinButtonState();

// CONFETTI
function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = [];
  let active = true;

  for (let i = 0; i < 120; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: -20,
      size: Math.random() * 6 + 3,
      speed: Math.random() * 3 + 2,
      color: `hsl(${Math.random() * 360}, 80%, 60%)`
    });
  }

  function update() {
    if (!active) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y += p.speed;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });

    requestAnimationFrame(update);
  }

  update();

  setTimeout(() => {
    active = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 3500);
}

// SPIN
slotBtn.onclick = () => {
  if (!canSpinToday()) return;

  const r1 = document.getElementById("reel1");
  const r2 = document.getElementById("reel2");

  let spin1 = setInterval(() => r1.textContent = Math.floor(Math.random() * 10), 50);
  let spin2 = setInterval(() => r2.textContent = Math.floor(Math.random() * 10), 50);

  document.getElementById("slotResult").textContent = "Spinning... 🎰";

  setTimeout(() => {
    clearInterval(spin1);
    clearInterval(spin2);

    const d1 = Math.floor(Math.random() * 2);
    const d2 = Math.floor(Math.random() * 10);

    r1.textContent = d1;
    r2.textContent = d2;

    slotBonus = Number(`${d1}${d2}`) || 5;
    localStorage.setItem("slotBonus", slotBonus);

    document.getElementById("slotResult").textContent = `🎉 Slot Bonus: +${slotBonus}%`;

    launchConfetti();
    computeSummary();

    lastSpinDate = todayStr;
    localStorage.setItem("lastSpinDate", lastSpinDate);

    updateSpinButtonState();
  }, 1500);
};

// ---------- RESTORE BONUS UI ----------
if (boxBonus > 0) {
  document.getElementById("mysteryBoxResult").textContent = `🎉 Mystery Bonus: +${boxBonus}% (today)`;
  disableMysteryBoxes();
}

if (slotBonus > 0) {
  document.getElementById("slotResult").textContent = `🎉 Slot Bonus: +${slotBonus}% (today)`;
}

// ---------- TEST TOOL ----------
const startNewDayBtn = document.getElementById("startNewDayBtn");
if (startNewDayBtn) {
  startNewDayBtn.onclick = () => {
    boxBonus = 0;
    slotBonus = 0;
    boxBonusDate = null;
    lastSpinDate = null;

    localStorage.removeItem("boxBonus");
    localStorage.removeItem("slotBonus");
    localStorage.removeItem("boxBonusDate");
    localStorage.removeItem("lastSpinDate");

    document.getElementById("mysteryBoxResult").textContent = "";
    document.getElementById("slotResult").textContent = "";
    document.querySelectorAll(".mystery-box").forEach(b => {
      b.style.pointerEvents = "auto";
      b.style.opacity = "1";
      b.textContent = "?";
    });

    updateSpinButtonState();
    computeSummary();

    alert("New day simulated. Bonuses reset.");
  };
}

// ---------- DELIVERY ----------
function loadSelectedDelivery() {
  const data = JSON.parse(localStorage.getItem("selectedDelivery"));
  const placeOrderBtn = document.getElementById("placeOrderBtn");

  if (!data) {
    document.getElementById("selectedDeliveryText").textContent = "No delivery option selected.";
    placeOrderBtn.disabled = true;
    return;
  }

  document.getElementById("selectedDeliveryText").textContent =
    `${data.name} — $${data.fee.toFixed(2)} (${data.estimated})`;

  placeOrderBtn.disabled = false;
}

loadSelectedDelivery();

// ---------- PLACE ORDER ----------
document.getElementById("placeOrderBtn").onclick = async () => {
  if (cartItems.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const token = localStorage.getItem("accessToken");

  //  FINAL TOTAL FROM CHECKOUT (single source of truth)
  const finalTotal = Number(
    document.getElementById("finalTotal").textContent.replace("$", "")
  );

  //  COINS USED & EARNED
  const coinsUsed = Number(document.getElementById("redeemCoins")?.value || 0);
  const coinsEarned = Math.floor(finalTotal / 5);

  try {
    const response = await fetch("/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        items: cartItems,
        finalTotal      //  SEND FINAL TOTAL TO BACKEND
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert("Order failed: " + (data.error || "Unknown error"));
      return;
    }

    //  UPDATE COINS (deduct used + add earned)
    setCoins(getCoins() - coinsUsed + coinsEarned);

    // CRITICAL: Track order as ACTIVE
    const orderId = data.order?.id || data.id;
    if (orderId) {
      const orderStatuses = getOrderStatuses();
      orderStatuses[orderId] = "Active";
      localStorage.setItem("orderStatuses", JSON.stringify(orderStatuses));
      window.dispatchEvent(new CustomEvent("orderUpdated"));
    }

    // CLEAR CART 
    localStorage.removeItem("cart");
    cartItems = [];

    // Show success
    document.getElementById("orderSuccess").style.display = "block";
    updateHeaderCounts();

    setTimeout(() => {
      window.location.href = "/orderTracking.html";
    }, 1000);

  } catch (error) {
    console.error("Order placement error:", error);
    alert("Failed to place order. Please try again.");
  }
};
