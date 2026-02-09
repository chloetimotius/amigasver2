// src/models/Recipe.model.js
const prisma = require('./prismaClient');

exports.getAllRecipes = async () => {
  return await prisma.recipe.findMany({
    include: {
      ingredients: {           // must match Prisma schema
        include: { product: true }
      }
    },
    orderBy: { name: 'asc' }
  });
};

exports.getRecipeById = async (recipeId) => {
  const recipe = await prisma.recipe.findUnique({
    where: { id: Number(recipeId) },
    include: {
      ingredients: {       // <-- was recipe_ingredients
        include: { product: true }
      }
    }
  });

  if (!recipe) return null;

  const ingredients = recipe.ingredients.map(ri => ({
    id: ri.id,
    quantity: ri.quantity,
    unit: ri.unit,
    product_id: ri.product.id,
    product_name: ri.product.name,
    product_price: parseFloat(ri.product.price),
    product_image: ri.product.image_url
  }));

  return { ...recipe, ingredients };
};

exports.calculateRecipeCost = async (recipeId, servings = 1) => {
  const recipe = await exports.getRecipeById(recipeId);
  if (!recipe) return null;

  const breakdown = recipe.ingredients.map(ing => {
    const totalQuantity = ing.quantity * servings;
    const cost = ing.product_price * totalQuantity;
    return { ...ing, totalQuantity, cost };
  });

  const totalCost = breakdown.reduce((sum, ing) => sum + ing.cost, 0);
  const costPerServing = totalCost / servings;

  return {
    recipe: {
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      baseServings: recipe.servings,
      prepTime: recipe.prep_time,
      cookTime: recipe.cook_time,
      imageUrl: recipe.image_url
    },
    servings,
    breakdown,
    totalCost,
    costPerServing
  };
};
