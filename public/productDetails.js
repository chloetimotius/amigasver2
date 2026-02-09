// =====================================================
// GET PRODUCT ID FROM URL
// =====================================================
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

// Fetch product details
fetch(`/products/${productId}`)
  .then(res => res.json())
  .then(product => {
    renderProduct(product);
    fetchSimilarProducts(product);
  })
  .catch(err => console.error(err));


// =====================================================
// RENDER PRODUCT DETAILS
// =====================================================
function renderProduct(p) {
  const container = document.getElementById("product-details-container");
  const isWishlisted = isInWishlist(p.id);

  container.innerHTML = `
    <div class="product-box">

      <!-- LEFT: IMAGE -->
      <div class="details-left">
        <img src="${p.imageUrl}" class="details-image-large" alt="${p.name}">
      </div>

      <!-- RIGHT: INFO -->
      <div class="details-right">
        <h1>${p.name}</h1>

        <p class="details-price">$${p.price}</p>
        <p class="details-stock">Stock: ${p.stock}</p>

        <p>Select quantity</p>

        <!-- Quantity box -->
        <div class="quantity-box">
          <button class="qty-btn" onclick="changeQty(-1)">-</button>
          <span id="qty">1</span>
          <button class="qty-btn" onclick="changeQty(1)">+</button>
        </div>

        <!-- ACTION ROW -->
        <div class="actions-row">
          <button class="add-to-cart-btn" onclick="addToCartFromDetails(${p.id})">
            Add to Cart
          </button>

          <button class="details-heart-btn" onclick="toggleWishlistFromDetails(this)">
            <span class="heart ${isWishlisted ? "active" : ""}">♥</span>
          </button>
        </div>

      </div>
    </div>
  `;
}



// =====================================================
// QUANTITY HANDLER
// =====================================================
let quantity = 1;

function changeQty(num) {
  quantity += num;
  if (quantity < 1) quantity = 1;
  document.getElementById("qty").textContent = quantity;
}



// =====================================================
// ADD TO CART (Product Details Page)
// With popup & instant cart icon update
// =====================================================
function addToCartFromDetails(id) {
  id = Number(id);
  const name = document.querySelector("h1").textContent;
  const price = parseFloat(document.querySelector(".details-price").textContent.replace("$",""));
  const imageUrl = document.querySelector(".details-image-large").src;

  const product = {
    id,
    name,
    price,
    imageUrl,
    quantity
  };

  // Add to localStorage cart
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push(product);
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  // 🔥 Show beautiful notification like products page
  showNotification(`Added ${quantity} item(s) to cart!`);

  // 🔥 Immediate cart badge update
  updateCartCount();
}



// =====================================================
// BEAUTIFUL NOTIFICATION POPUP (same as products page)
// =====================================================
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
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut .3s ease-out";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}



// =====================================================
// REMOVE AUTO-INJECTED HEARTS FROM wishlist.js
// =====================================================
function removeAutoHearts() {
  if (!window.location.pathname.includes("productDetails")) return;
  document.querySelectorAll(".wishlist-heart").forEach(el => el.remove());
}
setTimeout(removeAutoHearts, 800);



// =====================================================
// TOGGLE WISHLIST (Details Page)
// =====================================================
function toggleWishlistFromDetails(btn) {
  const heart = btn.querySelector(".heart");

  const product = {
    id: productId,
    name: document.querySelector("h1").textContent,
    price: parseFloat(document.querySelector(".details-price").textContent.replace("$","")),
    image: document.querySelector(".details-image-large").src
  };

  const isNowWishlisted = toggleWishlist(product);

  // Update heart visual
  if (isNowWishlisted) {
    heart.classList.add("active");
  } else {
    heart.classList.remove("active");
  }
}
// =====================================================
// SIMILAR PRODUCTS (Smart Add-Ons)
// =====================================================
function fetchSimilarProducts(currentProduct) {
  fetch("/products")
    .then(res => res.json())
    .then(allProducts => {
      // Filter similar products:
      const similar = allProducts
        .filter(p =>
          p.id !== currentProduct.id &&
          p.categoryId === currentProduct.categoryId
        )
        .slice(0, 4); // limit to 4 items

      renderSimilarProducts(similar);
    })
    .catch(err => console.error(err));
}

function renderSimilarProducts(products) {
  const container = document.getElementById("similarProductsContainer");

  if (!products.length) {
    container.innerHTML = "<p>No similar products available.</p>";
    return;
  }

  container.innerHTML = products.map(p => `
    <div class="similar-product-card"
         onclick="window.location.href='/productDetails.html?id=${p.id}'">
      <img src="${p.imageUrl}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>$${p.price}</p>
    </div>
  `).join("");
}
