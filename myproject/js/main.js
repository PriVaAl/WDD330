import { fetchRecipes, fetchRecipeDetails, fetchNutrition, fetchIngredientDetails } from './api.js';
import { alertMessage, saveFavorite, getFavorites } from './utils.js';

const searchBtn = document.getElementById('search-btn');
const ingredientInput = document.getElementById('ingredient-input');
const recipesList = document.getElementById('recipes');
const detailsSection = document.getElementById('details-section');
const hamburger = document.querySelector('.hamburger');
const desktopNav = document.querySelector('.desktop-nav');
const filters = document.querySelectorAll('#filters input[type="checkbox"]');

let currentRecipes = []; // Store last fetched recipes

// Hamburger menu toggle
hamburger.addEventListener('click', () => {
  desktopNav.classList.toggle('open');
});

// Search recipes
searchBtn.addEventListener('click', async () => {
  const query = ingredientInput.value.trim();
  if (!query) {
    alertMessage('Please enter at least one ingredient.');
    return;
  }

  try {
    const recipes = await fetchRecipes(query);
    if (!recipes.length) {
      alertMessage('No recipes found.');
      return;
    }
    currentRecipes = recipes;
    displayRecipes(recipes);
  } catch (error) {
    alertMessage('Error fetching recipes. Please try again.');
  }
});

// Apply dietary filters
filters.forEach(f => f.addEventListener('change', applyFilters));

function applyFilters() {
  const activeFilters = Array.from(filters)
    .filter(f => f.checked)
    .map(f => f.parentElement.textContent.trim().toLowerCase());

  const filteredRecipes = currentRecipes.filter(recipe => {
    return activeFilters.every(filter => {
      if (filter === 'vegetarian') return recipe.vegetarian;
      if (filter === 'vegan') return recipe.vegan;
      if (filter === 'gluten-free') return recipe.glutenFree;
      if (filter === 'low-calorie') return recipe.calories ? recipe.calories < 400 : true;
      return true;
    });
  });

  displayRecipes(filteredRecipes);
}

// Display recipes in grid/list
function displayRecipes(recipes) {
  recipesList.innerHTML = '';
  recipes.forEach(recipe => {
    const li = document.createElement('li');
    li.className = 'recipe-card';
    li.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}">
      <h2>${recipe.title}</h2>
    `;
    li.addEventListener('click', async () => {
      const fullRecipe = await fetchRecipeDetails(recipe.id);
      displayRecipeDetails(fullRecipe);
    });
    recipesList.appendChild(li);
  });
}

// Recipe view counter
const viewCounter = (() => { let count = 0; return () => ++count; })();

// Display recipe details
async function displayRecipeDetails(recipe) {
  detailsSection.innerHTML = `
    <h2>${recipe.title}</h2>
    <p>Servings: ${recipe.servings || 'N/A'}</p>
    <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
    <p>You have viewed ${viewCounter()} recipes</p>
    <button id="fav-btn">Add to Favorites</button>

    <button class="toggle-btn" data-target="nutrition-info">Show/Hide Nutrition Info</button>
    <div id="nutrition-info" class="collapsible">Loading nutrition info...</div>

    <button class="toggle-btn" data-target="ingredient-details">Show/Hide Ingredient Details</button>
    <div id="ingredient-details" class="collapsible">
      <h3>Ingredients</h3>
      <ul id="ingredient-list"></ul>
    </div>
  `;

  document.getElementById('fav-btn').addEventListener('click', () => saveFavorite(recipe));

  // Toggle collapsible sections
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = document.getElementById(btn.dataset.target);
      section.classList.toggle('open');
    });
  });

  // Nutrition info
  const nutritionData = await fetchNutrition(recipe);
  const nutritionDiv = document.getElementById('nutrition-info');
  if (nutritionData) {
    nutritionDiv.innerHTML = `
      <h3>Nutrition</h3>
      <ul>
        <li>Calories: ${nutritionData.calories || 'N/A'}</li>
        <li>Protein: ${nutritionData.totalNutrients?.PROCNT?.quantity?.toFixed(1) || 'N/A'} g</li>
        <li>Fat: ${nutritionData.totalNutrients?.FAT?.quantity?.toFixed(1) || 'N/A'} g</li>
        <li>Carbs: ${nutritionData.totalNutrients?.CHOCDF?.quantity?.toFixed(1) || 'N/A'} g</li>
      </ul>
    `;
  } else {
    nutritionDiv.textContent = 'Nutrition info not available.';
  }

  // Ingredient details (first 3 ingredients)
  const ingredientList = document.getElementById('ingredient-list');
  recipe.extendedIngredients?.forEach(ing => {
    const li = document.createElement('li');
    li.textContent = ing.original;
    ingredientList.appendChild(li);
  });
}

// Display saved favorites
export function displayFavorites() {
  const favorites = getFavorites();
  recipesList.innerHTML = '';
  favorites.forEach(recipe => {
    const li = document.createElement('li');
    li.className = 'recipe-card';
    li.innerHTML = `<img src="${recipe.image}" alt="${recipe.title}"><h2>${recipe.title}</h2>`;
    recipesList.appendChild(li);
  });
}
