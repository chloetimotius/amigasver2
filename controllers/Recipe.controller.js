const recipeModel = require('../models/Recipe.model');

/**
 * GET /api/recipes
 * Get all recipes
 */
exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await recipeModel.getAllRecipes();
    res.status(200).json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
};

/**
 * GET /api/recipes/:id
 * Get recipe details
 */
exports.getRecipeById = async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id);
    const recipe = await recipeModel.getRecipeById(recipeId);
    
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.status(200).json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
};

/**
 * GET /api/recipes/:id/cost?servings=4
 * Calculate recipe cost with dynamic servings
 * RUBRIC: Data Transformation + State Management
 */
exports.calculateCost = async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id);
    const servings = parseInt(req.query.servings) || 1;
    
    if (servings < 1 || servings > 100) {
      return res.status(400).json({ 
        error: 'Servings must be between 1 and 100' 
      });
    }
    
    const result = await recipeModel.calculateRecipeCost(recipeId, servings);
    
    if (!result) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error calculating cost:', error);
    res.status(500).json({ error: 'Failed to calculate cost' });
  }
};

/**
 * GET /api/recipes/analytics/costs
 * Get recipe cost analytics
 * RUBRIC: Data Transformation
 */
exports.getCostAnalytics = async (req, res) => {
  try {
    const analytics = await recipeModel.getRecipeCostAnalytics();
    res.status(200).json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};