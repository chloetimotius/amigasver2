const express = require("express");
const router = express.Router();
const SubcategoryController = require("../controllers/Subcategory.controller");

// GET subcategories that belong to a category
router.get("/category/:categoryId", SubcategoryController.getSubcategories);

// GET subcategory + its products
router.get("/:id", SubcategoryController.getSubcategoryDetails);

module.exports = router;
