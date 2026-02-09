const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/Category.controller");

// GET all categories
router.get("/", CategoryController.getCategories);

// GET one category + its subcategories
router.get("/:id", CategoryController.getCategoryDetails);

module.exports = router;
