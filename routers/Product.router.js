const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/Product.controller");

// //for product search
// router.get("/", ProductController.getProductsWithFilters);
// // GET all products
// router.get("/", ProductController.getAllProducts);

// // GET products by subcategory
// router.get("/subcategory/:subcategoryId", ProductController.getProducts);

// // GET product details
// router.get("/:id", ProductController.getProductDetails);

// router.get("/:id", ProductController.getProductById);
// router.get("/products", ProductController.getAllProducts);
// router.get("/products/filter", ProductController.getProductsWithFilters);

// // Product details
// router.get("/products/:id", ProductController.getProductById);
// GET all products
router.get("/", ProductController.getAllProducts);

// GET filtered products
router.get("/filter", ProductController.getProductsWithFilters);

// GET product details
router.get("/:id", ProductController.getProductById);


module.exports = router;
