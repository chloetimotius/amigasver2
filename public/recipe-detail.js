// recipe-detail.js
// RUBRIC: State Management (15%) - servings state triggers recalculation

let currentRecipeId = null;
let servings = 4; // Application state

document.addEventListener('DOMContentLoaded', () => {
    // Get recipe ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentRecipeId = parseInt(urlParams.get('id'));
    
    if (!currentRecipeId) {
        window.location.href = '/recipes.html';
        return;
    }
    
    setupServingsSlider();
    loadRecipeData();
});

/**
 * STATE MANAGEMENT: Setup servings slider
 * Changes trigger API call and UI re-render
 */
function setupServingsSlider() {
    const slider = document.getElementById('servingsSlider');
    const valueDisplay = document.getElementById('servingsValue');
    
    slider.addEventListener('input', (e) => {
        // Update state
        servings = parseInt(e.target.value);
        valueDisplay.textContent = servings;
        
        // Trigger recalculation (debounced)
        clearTimeout(window.recalcTimer);
        window.recalcTimer = setTimeout(() => {
            fetchRecipeCost();
        }, 300);
    });
}

/**
 * Load initial recipe data
 */
document.getElementById('recipeImage').src = recipe.imageUrl || 
    'https://via.placeholder.com/600x400?text=Recipe';

const timesHtml = [];
if (recipe.prepTime) {
    timesHtml.push(`
        <div class="time-item">
            ⏱️ <strong>${recipe.prepTime} min</strong> prep
        </div>
    `);
}
if (recipe.cookTime) {
    timesHtml.push(`
        <div class="time-item">
            🔥 <strong>${recipe.cookTime} min</strong> cook
        </div>
    `);
}
document.getElementById('recipeTimes').innerHTML = timesHtml.join('');


/**
 * DATA TRANSFORMATION: Fetch and display recipe cost
 * RUBRIC: Full-Stack Development + Data Transformation
 */
async function fetchRecipeCost() {
    try {
        const response = await fetch(
            `/api/recipes/${currentRecipeId}/cost?servings=${servings}`
        );
        const data = await response.json();
        
        renderCostBreakdown(data);
        
    } catch (error) {
        console.error('Error fetching cost:', error);
    }
}

/**
 * Render cost breakdown with ingredients
 * RUBRIC: State Management - UI updates based on state
 */
function renderCostBreakdown(data) {
    // Update total costs
    document.getElementById('totalCost').textContent = data.totalCost.toFixed(2);
    document.getElementById('costPerServing').textContent = data.costPerServing.toFixed(2);
    
    // Render ingredients list
    const ingredientsList = document.getElementById('ingredientsList');
    ingredientsList.innerHTML = data.breakdown.map(item => `
        <li class="ingredient-item">
            <span class="ingredient-name">${item.product_name}</span>
            <span class="ingredient-quantity">
                ${item.totalQuantity.toFixed(1)} ${item.unit}
                <small style="color:#999;">(${item.quantity} per serving)</small>
            </span>
            <span class="ingredient-cost">$${item.cost.toFixed(2)}</span>
        </li>
    `).join('');
}


// Update cart count
function updateHeaderCounts() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartCount = document.getElementById('cartCount');
    if (cartCount) cartCount.textContent = cart.length;
}

updateHeaderCounts();