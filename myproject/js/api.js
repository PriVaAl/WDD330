// api.js

// Spoonacular API
const SPOONACULAR_URL = 'https://api.spoonacular.com/recipes/complexSearch';
const SPOONACULAR_KEY = '3abce6a731ea4d6f9099269be2f6559f';

// Edamam APIs
const EDAMAM_NUTRITION_URL = 'https://api.edamam.com/api/nutrition-details';
const EDAMAM_FOOD_URL = 'https://api.edamam.com/api/food-database/v2/parser';
const EDAMAM_APP_ID = 'c69da11d';
const EDAMAM_APP_KEY = '4289a8d1b70671486bc74edfc2d5a850';

/**
 * Fetch recipes from Spoonacular based on ingredients or query
 */
export async function fetchRecipes(query) {
  try {
    const response = await fetch(`${SPOONACULAR_URL}?query=${encodeURIComponent(query)}&number=10&apiKey=${SPOONACULAR_KEY}`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }
}

/**
 * Fetch full recipe info from Spoonacular (ingredients included)
 */
export async function fetchRecipeDetails(id) {
  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${SPOONACULAR_KEY}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    return null;
  }
}

/**
 * Fetch nutrition info from Edamam Nutrition API
 */
export async function fetchNutrition(recipe) {
  try {
    const response = await fetch(EDAMAM_NUTRITION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: recipe.title,
        yield: 1,
        ingr: recipe.extendedIngredients?.map(i => i.original) || []
      })
    });

    if (!response.ok) throw new Error('Failed to fetch nutrition');
    return await response.json();
  } catch (error) {
    console.error('Error fetching nutrition:', error);
    return null;
  }
}

/**
 * Fetch ingredient details from Edamam Food Database API
 */
export async function fetchIngredientDetails(ingredient) {
  try {
    const response = await fetch(`${EDAMAM_FOOD_URL}?ingr=${encodeURIComponent(ingredient)}&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`);
    const data = await response.json();
    return data.hints[0]?.food || null;
  } catch (error) {
    console.error('Error fetching ingredient:', error);
    return null;
  }
}
