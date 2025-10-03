import { fetchRecipes, fetchRecipeDetails, fetchNutrition, fetchIngredientDetails } from './api.js';
import { alertMessage, saveFavorite, getFavorites } from './utils.js';

const searchBtn = document.getElementById('search-btn');
const ingredientInput = document.getElementById('ingredient-input');
const recipesList = document.getElementById('recipes');
const detailsSection = document.getElementById('details-section');

// Closure to track recipe views
const viewCounter = (() => { let count = 0; return () => ++count; })();

// Search button click
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
    displayRecipes(recipes);
  } catch (error) {
    alertMessage('Error fetching recipes. Please try again.');
  }
});

// Display recipe list
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

// Display recipe details
async function displayRecipeDetails(recipe) {
  detailsSection.innerHTML = `
    <h2>${recipe.title}</h2>
    <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
    <p>You have viewed ${viewCounter()} recipes</p>
    <button id="fav-btn">Add to Favorites</button>

    <button class="toggle-btn" data-target="nutrition-info">Show/Hide Nutrition Info</button>
    <div id="nutrition-info" class="collapsible">Loading nutrition info...</div>

    <button class="toggle-btn" data-target="ingredient-details">Show/Hide Ingredient Details</button>
    <div id="ingredient-details" class="collapsible"></div>
  `;

  document.getElementById('fav-btn').addEventListener('click', () => saveFavorite(recipe));

  // Toggle buttons
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = document.getElementById(btn.dataset.target);
      section.classList.toggle('open');
    });
  });

  // Fetch nutrition info
  const nutritionData = await fetchNutrition(recipe);
  if (nutritionData) {
    document.getElementById('nutrition-info').innerHTML = `
      <h3>Nutrition</h3>
      <ul>
        <li>Calories: ${nutritionData.calories || 'N/A'}</li>
        <li>Protein: ${nutritionData.totalNutrients?.PROCNT?.quantity?.toFixed(1) || 'N/A'} g</li>
        <li>Fat: ${nutritionData.totalNutrients?.FAT?.quantity?.toFixed(1) || 'N/A'} g</li>
        <li>Carbs: ${nutritionData.totalNutrients?.CHOCDF?.quantity?.toFixed(1) || 'N/A'} g</li>
      </ul>
    `;
  } else {
    document.getElementById('nutrition-info').textContent = 'Nutrition info not available.';
  }

  // Ingredient details (first 3 ingredients)
  if (recipe.extendedIngredients?.length > 0) {
    const ingredientDiv = document.getElementById('ingredient-details');
    ingredientDiv.innerHTML = `<h3>Ingredient Details</h3>`;
    for (let i = 0; i < Math.min(3, recipe.extendedIngredients.length); i++) {
      const ingrName = recipe.extendedIngredients[i].original;
      const details = await fetchIngredientDetails(ingrName);
      if (details) {
        const p = document.createElement('p');
        p.textContent = `${details.label} — Calories: ${details.nutrients.ENERC_KCAL || 'N/A'}, Protein: ${details.nutrients.PROCNT || 'N/A'}g`;
        ingredientDiv.appendChild(p);
      }
    }
  }
}

// Display favorites (optional)
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
