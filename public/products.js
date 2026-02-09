// document.addEventListener("DOMContentLoaded", () => {
//   // Check if there's a category parameter in the URL
//   const urlParams = new URLSearchParams(window.location.search);
//   const categoryId = urlParams.get('category');
//   //recently added
  
//   if (categoryId) {
//     // Load products for the specific category
//     loadProductsByCategory(categoryId);
//   } else {
//     // Load all products if no category specified
//     loadAllProducts();
//   }
  
//   setupCategoryClicks();
//   setupSubcategoryClicks();
// });

// /* ------------------------------------------
//    LOAD ALL PRODUCTS
// ------------------------------------------- */
// function loadAllProducts() {
//   fetch("/products")
//     .then(res => res.json())
//     .then(data => renderProducts(data))
//     .catch(err => console.error("Error fetching products:", err));
// }

// /* ------------------------------------------
//    LOAD PRODUCTS BY CATEGORY
// ------------------------------------------- */
// function loadProductsByCategory(categoryId) {
//   fetch(`/categories/${categoryId}`)
//     .then(res => res.json())
//     .then(categoryData => {
//       const allProducts = categoryData.subcategories.flatMap(
//         sub => sub.products || []
//       );
//       renderProducts(allProducts);
//     })
//     .catch(err => console.error("Error fetching category:", err));
// }

// /* ------------------------------------------
//    LOAD PRODUCTS BY SUBCATEGORY
// ------------------------------------------- */
// function loadProductsBySubcategory(subcategoryId) {
//   fetch(`/subcategories/${subcategoryId}`)
//     .then(res => res.json())
//     .then(subData => renderProducts(subData.products || []))
//     .catch(err => console.error("Error fetching subcategory:", err));
// }

// /* ------------------------------------------
//    RENDER PRODUCTS INTO THE GRID
// ------------------------------------------- */
// function renderProducts(products) {
//   const container = document.querySelector(".product-grid");
//   container.innerHTML = "";

//   if (!products || products.length === 0) {
//     container.innerHTML = `<p style="text-align: center; color: #666; padding: 40px;">No products found.</p>`;
//     return;
//   }

//   products.forEach(p => {
//     const image = p.imageUrl?.trim() || "https://via.placeholder.com/150?text=No+Image";
//     const categoryName = p.category?.name || p.categoryName || p.subcategoryName || "General";

//     const card = document.createElement('div');
//     card.className = 'product-card';
//     card.dataset.id = p.id;

//     card.innerHTML = `
//       <img class="product-image" src="${image}" alt="${p.name}">
//       <div class="product-name">${p.name}</div>
//       <div class="product-price">$${parseFloat(p.price).toFixed(2)}</div>
//       <button class="btn btn-primary add-cart-btn">Add to Cart</button>
//     `;

//     // ⭐ Navigate to productDetails page
//     card.addEventListener("click", (event) => {
//       if (!event.target.classList.contains("add-cart-btn")) {
//         window.location.href = `/productDetails.html?id=${p.id}`;
//       }
//     });

//     container.appendChild(card);

//     // Make the whole card clickable (go to product details)
// card.addEventListener("click", (event) => {
//   // If the click was NOT on Add-to-Cart button → redirect to product details
//   if (!event.target.closest(".add-cart-btn")) {
//     window.location.href = `/productDetails.html?id=${p.id}`;
//   }
// });

// // Add-to-Cart button
// const addBtn = card.querySelector(".add-cart-btn");
// addBtn.addEventListener("click", (e) => {
//   e.stopPropagation(); // Don't trigger card click

//   addToCart({
//     id: p.id,
//     name: p.name,
//     price: parseFloat(p.price),
//     imageUrl: image,
//     category: categoryName
//   });

//   updateCartCount();
// });


//     // When clicking the card, go to product details
//  card.addEventListener("click", (e) => {
//     if (e.target.classList.contains("add-cart-btn")) return;
//     window.location.href = `/productDetails.html?id=${p.id}`;

//   });
//   });

//   // After rendering products, let wishlist.js add the heart icons
//   setTimeout(() => {
//     if (typeof window.addHeartIconsToProducts === 'function') {
//       window.addHeartIconsToProducts();
//     } else if (typeof addHeartIconsToProducts === 'function') {
//       addHeartIconsToProducts();
//     }
//   }, 100);
// }

// /* ------------------------------------------
//    CATEGORY CLICK HANDLER
// ------------------------------------------- */
// function setupCategoryClicks() {
//   document.querySelectorAll(".category-item > span").forEach((span, index) => {
//     span.addEventListener("click", (e) => {
//       e.preventDefault();
//       const categoryId = index + 1;
//       loadProductsByCategory(categoryId);
      
//       // Update URL without page reload
//       const newUrl = `${window.location.pathname}?category=${categoryId}`;
//       window.history.pushState({ categoryId }, '', newUrl);
//     });
//   });
// }

// /* ------------------------------------------
//    SUBCATEGORY CLICK HANDLER
// ------------------------------------------- */
// function setupSubcategoryClicks() {
//   document.querySelectorAll(".subcategory-menu a").forEach((a, index) => {
//     a.addEventListener("click", (e) => {
//       e.preventDefault();
//       const subId = index + 1;
//       loadProductsBySubcategory(subId);
      
//       // Update URL without page reload
//       const newUrl = `${window.location.pathname}?subcategory=${subId}`;
//       window.history.pushState({ subcategoryId: subId }, '', newUrl);
//     });
//   });
// }

// /* ------------------------------------------
//    HANDLE BROWSER BACK/FORWARD BUTTONS
// ------------------------------------------- */
// window.addEventListener('popstate', (event) => {
//   const urlParams = new URLSearchParams(window.location.search);
//   const categoryId = urlParams.get('category');
//   const subcategoryId = urlParams.get('subcategory');
  
//   if (categoryId) {
//     loadProductsByCategory(categoryId);
//   } else if (subcategoryId) {
//     loadProductsBySubcategory(subcategoryId);
//   } else {
//     loadAllProducts();
//   }
// });

// /* ------------------------------------------
//    CART FUNCTIONS
// ------------------------------------------- */
// function getCart() {
//   return JSON.parse(localStorage.getItem("cart")) || [];
// }

// function saveCart(cart) {
//   localStorage.setItem("cart", JSON.stringify(cart));
// }

// function addToCart(product) {
//   const cart = getCart();

//   // FORCE ID to always be integer if possible
//   product.id = Number(product.id);

//   // If conversion fails, stop immediately
//   if (isNaN(product.id)) {
//     console.error("❌ INVALID PRODUCT ID:", product.id, product);
//     alert("Product data is corrupted. Cannot add to cart.");
//     return;
//   }

//   const existingItem = cart.find(item => Number(item.id) === product.id);

//   if (existingItem) {
//     existingItem.quantity += 1;
//   } else {
//     cart.push({
//       id: product.id,
//       name: product.name,
//       price: product.price,
//       imageUrl: product.imageUrl,
//       quantity: 1
//     });
//   }

//   saveCart(cart);
//   showNotification('Added to cart!');
// }

// function updateCartCount() {
//   const cart = getCart();
//   const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
//   const badge = document.getElementById("cartCount");
//   if (badge) badge.textContent = totalItems;
// }

// /* ------------------------------------------
//    NOTIFICATION
// ------------------------------------------- */
// function showNotification(message) {
//   const notification = document.createElement('div');
//   notification.textContent = message;
//   notification.style.cssText = `
//     position: fixed;
//     top: 100px;
//     right: 30px;
//     background: linear-gradient(135deg,#4CAF50,#45a049);
//     color: white;
//     padding: 15px 25px;
//     border-radius: 10px;
//     box-shadow: 0 4px 15px rgba(76,175,80,.4);
//     z-index: 10000;
//     font-weight: 600;
//     animation: slideIn .3s ease-out;
//   `;

//   if (!document.getElementById('notificationStyles')) {
//     const style = document.createElement('style');
//     style.id = 'notificationStyles';
//     style.textContent = `
//       @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
//       @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
//     `;
//     document.head.appendChild(style);
//   }

//   document.body.appendChild(notification);

//   setTimeout(() => {
//     notification.style.animation = 'slideOut .3s ease-out';
//     setTimeout(() => notification.remove(), 300);
//   }, 3000);
// }

// // Initialize cart badge on page load
// document.addEventListener("DOMContentLoaded", updateCartCount);


// //for product searching and filtering
// // ================= PRODUCT SEARCHING + FILTERING =================
// // const productsContainer = document.getElementById("products-container");

// // // initial load shows ALL products (no pagination)
// // let isInitialLoad = true;

// // let currentPage = 1;
// // let totalPages = 1;
// // const PAGINATED_LIMIT = 25;

// // // Read subcategoryId from URL (optional)
// // const urlParams = new URLSearchParams(window.location.search);
// // const subcategoryId = urlParams.get("subcategoryId");

// // // NOTE: these elements exist only if you added pagination HTML
// // const paginationEl = document.getElementById("pagination");
// // const pageInfoEl = document.getElementById("pageInfo");
// // const prevBtn = document.getElementById("prevPageBtn");
// // const nextBtn = document.getElementById("nextPageBtn");

// // async function loadProducts(page = 1) {
// //   const q = document.getElementById("searchInput")?.value.trim();
// //   const sort = document.getElementById("sortSelect")?.value;
// //   const minPrice = document.getElementById("minPrice")?.value;
// //   const maxPrice = document.getElementById("maxPrice")?.value;
// //   const inStock = document.getElementById("inStockOnly")?.checked;

// //   const params = new URLSearchParams();

// //   // ✅ Initial load: show ALL products
// //   if (isInitialLoad) {
// //     params.set("limit", "9999");
// //   } else {
// //     // ✅ After Apply: paginate
// //     params.set("page", String(page));
// //     params.set("limit", String(PAGINATED_LIMIT));
// //   }

// //   // Optional: filter by subcategory from URL
// //   if (subcategoryId) params.set("subcategoryId", subcategoryId);

// //   if (q) params.set("q", q);
// //   if (sort) params.set("sort", sort);
// //   if (minPrice) params.set("minPrice", minPrice);
// //   if (maxPrice) params.set("maxPrice", maxPrice);
// //   if (inStock) params.set("inStock", "true");

// //   try {
// //     const url = `/products?${params.toString()}`;
// //     // console.log("Fetching:", url);

// //     const res = await fetch(url);
// //     const data = await res.json();

// //     // ✅ support both formats: array OR { products: [...] }
// //     const products = Array.isArray(data) ? data : data.products;
// //     renderProducts(products);

// //     // ✅ Only show pagination after Apply (non-initial)
// //     if (!isInitialLoad && !Array.isArray(data) && paginationEl) {
// //       totalPages = data.totalPages || 1;
// //       currentPage = page;
// //       paginationEl.style.display = "flex";
// //       updatePagination();
// //     } else if (paginationEl) {
// //       paginationEl.style.display = "none";
// //     }
// //   } catch (err) {
// //     console.error("Failed to load products:", err);
// //     productsContainer.innerHTML = "<p>Failed to load products.</p>";
// //   }
// // }


// // function updatePagination() {
// //   if (!pageInfoEl || !prevBtn || !nextBtn) return;

// //   pageInfoEl.textContent = `Page ${currentPage} of ${totalPages}`;
// //   prevBtn.disabled = currentPage === 1;
// //   nextBtn.disabled = currentPage === totalPages;
// // }

// // // Pagination button listeners (only if elements exist)
// // prevBtn?.addEventListener("click", () => {
// //   if (currentPage > 1) loadProducts(currentPage - 1);
// // });

// // nextBtn?.addEventListener("click", () => {
// //   if (currentPage < totalPages) loadProducts(currentPage + 1);
// // });

// // // Apply filters button
// // document.getElementById("applyFiltersBtn")?.addEventListener("click", () => {
// //   isInitialLoad = false;

// //   if (paginationEl) paginationEl.style.display = "flex";

// //   loadProducts(1);
// // });

// // // Auto-load products on page load (shows ALL products initially)
// // loadProducts();



// // ================= PRODUCT SEARCHING + FILTERING =================
// //const productsContainer = document.getElementById("products-container");

// // initial load shows ALL products (no pagination)
// let isInitialLoad = true;

// let currentPage = 1;
// let totalPages = 1;
// const PAGINATED_LIMIT = 25;

// // Read subcategoryId from URL (optional)
// const urlParams = new URLSearchParams(window.location.search);
// const subcategoryId = urlParams.get("subcategoryId");

// // Pagination elements (already in your HTML)
// const paginationEl = document.getElementById("pagination");
// const pageInfoEl = document.getElementById("pageInfo");
// const prevBtn = document.getElementById("prevPageBtn");
// const nextBtn = document.getElementById("nextPageBtn");

// async function loadProducts(page = 1) {
//   const q = document.getElementById("searchInput")?.value.trim();
//   const sort = document.getElementById("sortSelect")?.value;
//   const minPrice = document.getElementById("minPrice")?.value;
//   const maxPrice = document.getElementById("maxPrice")?.value;
//   const inStock = document.getElementById("inStockOnly")?.checked;

//   const params = new URLSearchParams();

//   params.set("page", String(page));
// params.set("limit", String(PAGINATED_LIMIT));


//   if (subcategoryId) params.set("subcategoryId", subcategoryId);
//   if (q) params.set("q", q);
//   if (sort) params.set("sort", sort);
//   if (minPrice) params.set("minPrice", minPrice);
//   if (maxPrice) params.set("maxPrice", maxPrice);
//   if (inStock) params.set("inStock", "true");

//   try {
//     const url = `/products?${params.toString()}`;
//     const res = await fetch(url);
//     const data = await res.json();

//     const products = Array.isArray(data) ? data : data.products;
//     renderProducts(products);

//     // ✅ PAGINATION LOGIC (added, minimal)
//     if (data.totalPages > 1 && paginationEl) {
//       totalPages = data.totalPages;
//       currentPage = page;
//       paginationEl.style.display = "flex";
//       updatePagination();
//     } else if (paginationEl) {
//       paginationEl.style.display = "none";
//     }

//   } catch (err) {
//     console.error("Failed to load products:", err);
//     document.querySelector(".product-grid").innerHTML =
//   "<p>Failed to load products.</p>";

//   }
// }

// // ---------------- PAGINATION UI ----------------
// function updatePagination() {
//   if (!pageInfoEl || !prevBtn || !nextBtn) return;

//   pageInfoEl.textContent = `Page ${currentPage} of ${totalPages}`;
//   prevBtn.disabled = currentPage === 1;
//   nextBtn.disabled = currentPage === totalPages;
// }

// // Pagination buttons
// prevBtn?.addEventListener("click", () => {
//   if (currentPage > 1) {
//     loadProducts(currentPage - 1);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   }
// });

// nextBtn?.addEventListener("click", () => {
//   if (currentPage < totalPages) {
//     loadProducts(currentPage + 1);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   }
// });

// // ---------------- APPLY FILTERS ----------------
// document.getElementById("applyFiltersBtn")?.addEventListener("click", () => {
//   loadProducts(1);               // reset to page 1
// });


//updated code
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const categoryId = urlParams.get("category");
  const subcategoryId = urlParams.get("subcategory");

  if (subcategoryId) {
    loadProductsBySubcategory(subcategoryId);
  } else if (categoryId) {
    loadProductsByCategory(categoryId);
  } else {
    loadAllProducts(); // ✅ default initial load
  }

  setupCategoryClicks();
  setupSubcategoryClicks();
  updateCartCount();
});

/* =====================================================
   BASIC PRODUCT LOADING (INITIAL LOAD)
===================================================== */
function loadAllProducts() {
  fetch("/products?limit=9999")
    .then(res => res.json())
    .then(data => renderProducts(extractProducts(data)))
    .catch(err => showError(err));
}

function loadProductsByCategory(categoryId) {
  fetch(`/categories/${categoryId}`)
    .then(res => res.json())
    .then(data => {
      const products = data.subcategories.flatMap(sub => sub.products || []);
      renderProducts(products);
    })
    .catch(err => showError(err));
}

function loadProductsBySubcategory(subcategoryId) {
  fetch(`/subcategories/${subcategoryId}`)
    .then(res => res.json())
    .then(data => renderProducts(data.products || []))
    .catch(err => showError(err));
}

/* =====================================================
   FILTERING (ONLY WHEN APPLY IS CLICKED)
===================================================== */
async function loadFilteredProducts(page = 1) {
  const q = document.getElementById("searchInput")?.value.trim();
  const sort = document.getElementById("sortSelect")?.value;
  const minPrice = document.getElementById("minPrice")?.value;
  const maxPrice = document.getElementById("maxPrice")?.value;
  const inStock = document.getElementById("inStockOnly")?.checked;

  const params = new URLSearchParams();
  params.set("limit", "9999"); // 🔥 load all so products never disappear

  if (q) params.set("q", q);
  if (sort) params.set("sort", sort);
  if (minPrice) params.set("minPrice", minPrice);
  if (maxPrice) params.set("maxPrice", maxPrice);
  if (inStock) params.set("inStock", "true");

  try {
    const res = await fetch(`/products/filter?${params.toString()}`);
    const data = await res.json();
    renderProducts(extractProducts(data));
  } catch (err) {
    showError(err);
  }
}

document.getElementById("applyFiltersBtn")?.addEventListener("click", () => {
  loadFilteredProducts();
});

/* =====================================================
   RENDER PRODUCTS
===================================================== */
function renderProducts(products) {
  const container = document.querySelector(".product-grid");
  container.innerHTML = "";

  if (!products || products.length === 0) {
    container.innerHTML =
      `<p style="text-align:center;color:#666;padding:40px;">No products found.</p>`;
    return;
  }

  products.forEach(p => {
    const image = p.imageUrl?.trim() || "https://via.placeholder.com/150";
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img class="product-image" src="${image}" alt="${p.name}">
      <div class="product-name">${p.name}</div>
      <div class="product-price">$${Number(p.price).toFixed(2)}</div>
      <button class="btn btn-primary add-cart-btn">Add to Cart</button>
    `;

    card.addEventListener("click", e => {
      if (!e.target.classList.contains("add-cart-btn")) {
        window.location.href = `/productDetails.html?id=${p.id}`;
      }
    });

    card.querySelector(".add-cart-btn").addEventListener("click", e => {
      e.stopPropagation();
      addToCart(p);
      updateCartCount();
    });

    container.appendChild(card);
  });

  setTimeout(() => {
    if (typeof addHeartIconsToProducts === "function") {
      addHeartIconsToProducts();
    }
  }, 100);
}

/* =====================================================
   CATEGORY / SUBCATEGORY NAV
===================================================== */
function setupCategoryClicks() {
  document.querySelectorAll(".category-item > span").forEach((span, i) => {
    span.addEventListener("click", e => {
      e.preventDefault();
      const id = i + 1;
      history.pushState({}, "", `?category=${id}`);
      loadProductsByCategory(id);
    });
  });
}

function setupSubcategoryClicks() {
  document.querySelectorAll(".subcategory-menu a").forEach((a, i) => {
    a.addEventListener("click", e => {
      e.preventDefault();
      const id = i + 1;
      history.pushState({}, "", `?subcategory=${id}`);
      loadProductsBySubcategory(id);
    });
  });
}

window.addEventListener("popstate", () => location.reload());

/* =====================================================
   CART
===================================================== */
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(p) {
  const cart = getCart();
  const id = Number(p.id);
  if (isNaN(id)) return;

  const existing = cart.find(i => i.id === id);
  if (existing) existing.quantity++;
  else cart.push({ id, name: p.name, price: p.price, imageUrl: p.imageUrl, quantity: 1 });

  saveCart(cart);
  showNotification("Added to cart!");
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((s, i) => s + i.quantity, 0);
  const badge = document.getElementById("cartCount");
  if (badge) badge.textContent = count;
}

/* =====================================================
   HELPERS
===================================================== */
function extractProducts(data) {
  return Array.isArray(data) ? data : data.products || [];
}

function showError(err) {
  console.error(err);
  document.querySelector(".product-grid").innerHTML =
    "<p style='text-align:center;'>Failed to load products.</p>";
}

function showNotification(msg) {
  const n = document.createElement("div");
  n.textContent = msg;
  n.style.cssText =
    "position:fixed;top:100px;right:30px;background:#4CAF50;color:#fff;padding:12px 20px;border-radius:8px;z-index:9999;";
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 2500);
}
