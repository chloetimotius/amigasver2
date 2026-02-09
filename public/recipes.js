// recipes.js

document.addEventListener('DOMContentLoaded', () => {
    loadRecipes();
    updateHeaderCounts();
});

async function loadRecipes() {
    try {
        const response = await fetch('/api/recipes');
        const recipes = await response.json();
        
        renderRecipes(recipes);
    } catch (error) {
        console.error('Error loading recipes:', error);
        document.getElementById('recipesGrid').innerHTML = 
            '<p style="text-align:center; color:#666;">Failed to load recipes</p>';
    }
}

function renderRecipes(recipes) {
    const grid = document.getElementById('recipesGrid');
    
    if (recipes.length === 0) {
        grid.innerHTML = '<p style="text-align:center; color:#666;">No recipes available</p>';
        return;
    }
    
    grid.innerHTML = recipes.map(recipe => `
    <div class="recipe-card" onclick="viewRecipe(${recipe.id})">
        <img src="${recipe.imageUrl || 'https://via.placeholder.com/350x250?text=Recipe'}" 
             alt="${recipe.name}" 
             class="recipe-image"
             onerror="this.src='https://via.placeholder.com/350x250?text=Recipe'">
        
        <div class="recipe-content">
            <h3 class="recipe-title">${recipe.name}</h3>
            <p class="recipe-description">${recipe.description || 'Delicious recipe'}</p>
            
            <div class="recipe-meta">
                ${recipe.prepTime ? `
                    <div class="recipe-meta-item">
                        ⏱️ ${recipe.prepTime} min prep
                    </div>
                ` : ''}
                ${recipe.cookTime ? `
                    <div class="recipe-meta-item">
                        🔥 ${recipe.cookTime} min cook
                    </div>
                ` : ''}
            </div>
            
            <div class="recipe-stats">
                <span class="ingredient-count">
                    ${recipe.ingredients.length} ingredients
                </span>
                <button class="view-recipe-btn" onclick="event.stopPropagation(); viewRecipe(${recipe.id})">
                    View Recipe
                </button>
            </div>
        </div>
    </div>
`).join('');

                }
function viewRecipe(recipeId) {
    window.location.href = `/recipe-detail.html?id=${recipeId}`;
}

function updateHeaderCounts() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    const cartCount = document.getElementById('cartCount');
    const wishlistCount = document.getElementById('wishlistCount');
    
    if (cartCount) cartCount.textContent = cart.length;
    if (wishlistCount) wishlistCount.textContent = wishlist.length;
}