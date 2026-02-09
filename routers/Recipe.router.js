const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/Recipe.controller');

// Get all recipes
router.get('/', recipeController.getAllRecipes);

// Get recipe analytics
router.get('/analytics/costs', recipeController.getCostAnalytics);

// Get recipe by ID
router.get('/:id', recipeController.getRecipeById);

// Calculate recipe cost with servings
router.get('/:id/cost', recipeController.calculateCost);

module.exports = router;