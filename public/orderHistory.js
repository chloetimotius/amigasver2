document.addEventListener("DOMContentLoaded", () => {
  loadOrders();
  setupFilterPanel();
  setupInsightsPanel();
});

let allOrders = [];

async function loadOrders() {
  const token = localStorage.getItem("accessToken");

  const response = await fetch("/orders/my", {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  const container = document.getElementById("ordersContainer");

  if (!response.ok) {
    container.innerHTML = "<p>Error loading orders.</p>";
    return;
  }

  const orders = await response.json();
  allOrders = orders;

  // Contribution #2: compute & render insights in sections/cards
  renderInsights(orders);

  if (orders.length === 0) {
    container.innerHTML = `
      <p style="text-align:center; margin-top:20px;">You have no past orders.</p>
      <button class="browse-btn" onclick="window.location.href='/products.html'">
        Browse Products
      </button>
    `;
    return;
  }

  renderOrders(orders);
}

/* -----------------------------------------------------
   INSIGHTS PANEL TOGGLE
------------------------------------------------------ */
function setupInsightsPanel() {
  const toggle = document.getElementById("insightsToggle");
  const panel = document.getElementById("insightsPanel");
  if (!toggle || !panel) return;

  toggle.addEventListener("click", () => {
    const isHidden = panel.style.display === "none" || panel.style.display === "";
    panel.style.display = isHidden ? "block" : "none";
    toggle.textContent = isHidden ? "Hide Insights" : "Show Insights";
  });
}

/* -----------------------------------------------------
   INSIGHTS (Data Transformation)
   - total spend
   - average order value
   - highest order
   - most frequent product
   - monthly aggregation summary
------------------------------------------------------ */
function renderInsights(orders) {
  const panel = document.getElementById("insightsPanel");
  const content = document.getElementById("insightsContent");
  if (!panel || !content) return;

  if (!orders || orders.length === 0) {
    panel.style.display = "none";
    return;
  }

  // Total spend + average + highest
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const avgSpend = totalSpent / orders.length;
  const highest = orders.reduce(
    (max, o) => (Number(o.total || 0) > Number(max.total || 0) ? o : max),
    orders[0]
  );

  // Most frequent product (by quantity)
  const qtyByProduct = {};
  orders.forEach(o => {
    (o.items || []).forEach(i => {
      const name = i?.product?.name || "(Unknown product)";
      qtyByProduct[name] = (qtyByProduct[name] || 0) + Number(i.quantity || 0);
    });
  });

  let topProduct = null;
  let topQty = 0;
  Object.entries(qtyByProduct).forEach(([name, qty]) => {
    if (qty > topQty) {
      topProduct = name;
      topQty = qty;
    }
  });

  // Monthly aggregation
  const monthly = {};
  orders.forEach(o => {
    const d = new Date(o.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthly[key]) monthly[key] = { count: 0, total: 0 };
    monthly[key].count += 1;
    monthly[key].total += Number(o.total || 0);
  });

  const monthlyRows = Object.entries(monthly)
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .slice(0, 6)
    .map(([k, v]) => {
      return `<li><strong>${k}</strong>: ${v.count} order(s), $${v.total.toFixed(2)}</li>`;
    })
    .join("");

  const latestOrder = orders.reduce((latest, o) => {
    return new Date(o.createdAt) > new Date(latest.createdAt) ? o : latest;
  }, orders[0]);

  const latestDateText = latestOrder?.createdAt
    ? new Date(latestOrder.createdAt).toLocaleDateString()
    : "N/A";

  // Render as clean sections/cards (more readable)
  content.innerHTML = `
    <div class="insight-card">
      <p class="insight-title">Total Spent</p>
      <p class="insight-value">$${totalSpent.toFixed(2)}</p>
    </div>

    <div class="insight-card">
      <p class="insight-title">Total Orders</p>
      <p class="insight-value">${orders.length}</p>
    </div>

    <div class="insight-card">
      <p class="insight-title">Average Per Order</p>
      <p class="insight-value">$${avgSpend.toFixed(2)}</p>
    </div>

    <div class="insight-card">
      <p class="insight-title">Highest Order</p>
      <p class="insight-value">#${highest.id}</p>
      <p class="insight-sub">$${Number(highest.total || 0).toFixed(2)}</p>
    </div>

    <div class="insight-card">
      <p class="insight-title">Most Bought Item</p>
      <p class="insight-value">${topProduct ? topProduct : "N/A"}</p>
      <p class="insight-sub">${topProduct ? `×${topQty} purchased` : ""}</p>
    </div>

    <div class="insight-card">
      <p class="insight-title">Latest Order</p>
      <p class="insight-value">${latestDateText}</p>
      <p class="insight-sub">Order #${latestOrder.id}</p>
    </div>

    <div class="insight-card" style="grid-column: 1 / -1;">
      <p class="insight-title">Recent Months (Orders + Spend)</p>
      <ul class="monthly-list">${monthlyRows || ""}</ul>
    </div>
  `;
}

/* -----------------------------------------------------
   RENDER ORDERS
------------------------------------------------------ */
function renderOrders(orders) {
  const container = document.getElementById("ordersContainer");

  container.innerHTML = orders.map(order => `
    <div class="order-card">
      <h3>Order #${order.id}</h3>
      <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
      <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>

      <p><strong>Items:</strong></p>
      <ul class="order-items">
        ${(order.items || []).map(i => `
          <li>${i.product.name} × ${i.quantity} — $${(i.price * i.quantity).toFixed(2)}</li>
        `).join("")}
      </ul>

      <button class="reorder-btn" onclick='reorder(${JSON.stringify(order.items)})'>
        Reorder
      </button>
      <button 
  class="receipt-btn"
  data-order-id="${order.id}">
  Download Receipt (PDF)
</button>
    </div>
  `).join("");
}

function reorder(items) {
  const cart = (items || []).map(i => ({
    id: i.productId,
    name: i.product.name,
    price: i.price,
    quantity: i.quantity,
    imageUrl: i.product.imageUrl
  }));

  localStorage.setItem("cart", JSON.stringify(cart));
  window.location.href = "/cart.html";
}

/* -----------------------------------------------------
   SORT PANEL
------------------------------------------------------ */
function setupFilterPanel() {
  const toggle = document.getElementById("filterToggle");
  const panel = document.getElementById("filterPanel");

  toggle.addEventListener("click", () => {
    const isHidden = panel.style.display === "none" || panel.style.display === "";
    panel.style.display = isHidden ? "block" : "none";
    toggle.textContent = isHidden ? "Hide Sort ▲" : "Sort Orders ▼";
  });

  document.getElementById("sortFilter").addEventListener("change", applyFilters);
}

function applyFilters() {
  let filtered = [...allOrders];
  const sortFilter = document.getElementById("sortFilter").value;

  if (sortFilter === "latest") {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortFilter === "oldest") {
    filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sortFilter === "highest") {
    filtered.sort((a, b) => b.total - a.total);
  }

  renderOrders(filtered);
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".receipt-btn");
  if (!btn) return;

  const orderId = btn.dataset.orderId;
  if (!orderId) return;

  // open PDF in new tab
  window.open(`/orders/${orderId}/receipt`, "_blank");
});
