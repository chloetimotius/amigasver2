function loadDeliveryInfo() {
  const info = JSON.parse(localStorage.getItem("deliveryInfo"));

  const box = document.getElementById("deliveryInfoBox");
  box.innerHTML = `
    <h3>Delivery Details</h3>
    <p><strong>Name:</strong> ${info.fullName}</p>
    <p><strong>Phone:</strong> ${info.phone}</p>
    <p><strong>Address:</strong> ${info.address1}, ${info.unit}</p>
    <p><strong>Postal Code:</strong> ${info.postal}</p>
    <p><strong>Method:</strong> ${info.method} ($${info.deliveryFee.toFixed(2)})</p>
  `;
}

function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("cartItems");

  container.innerHTML = "";

  cart.forEach(item => {
    container.innerHTML += `
      <div class="summary-item">
        <img src="${item.imageUrl}" class="summary-img">
        <div>${item.name} (x${item.quantity})</div>
        <div>$${(item.price * item.quantity).toFixed(2)}</div>
      </div>
    `;
  });
}

function calculateCosts() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const delivery = JSON.parse(localStorage.getItem("deliveryInfo"));

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = subtotal * 0.09;
  const serviceFee = 1.00;
  const deliveryFee = delivery.deliveryFee;

  const finalTotal = subtotal + gst + serviceFee + deliveryFee;

  document.getElementById("costBox").innerHTML = `
    <p>Subtotal: $${subtotal.toFixed(2)}</p>
    <p>GST (9%): $${gst.toFixed(2)}</p>
    <p>Service Fee: $${serviceFee.toFixed(2)}</p>
    <p>Delivery Fee: $${deliveryFee.toFixed(2)}</p>
    <h3>Total: $${finalTotal.toFixed(2)}</h3>
  `;
}

loadDeliveryInfo();
loadCart();
calculateCosts();

// Checkout
document.getElementById("placeOrderBtn").addEventListener("click", async () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const delivery = JSON.parse(localStorage.getItem("deliveryInfo"));

  const orderData = {
    cart,
    delivery
  };

  const res = await fetch("/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData)
  });

  const data = await res.json();

  if (data.success) {
    localStorage.removeItem("cart");
    window.location.href = `/success.html?order=${data.orderId}`;
  }
});
