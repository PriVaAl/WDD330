

const SPOONACULAR_URL = 'https://api.spoonacular.com/recipes/complexSearch';
const SPOONACULAR_KEY = '3abce6a731ea4d6f9099269be2f6559f';

const EDAMAM_NUTRITION_URL = 'https://api.edamam.com/api/nutrition-details';
const EDAMAM_FOOD_URL = 'https://api.edamam.com/api/food-database/v2/parser';
const EDAMAM_APP_ID = 'c69da11d';
const EDAMAM_APP_KEY = '4289a8d1b70671486bc74edfc2d5a850';


function cleanIngredients(rawIngredients) {
  return rawIngredients
    .map(i => (i.original ? i.original : `${i.amount} ${i.unit} ${i.name}`))
    .map(str => str.replace(/\(.*?\)/g, "").trim())        
    .filter(str => str && !/bone|garnish|water/i.test(str)) 
    .filter(str => !/to taste/i.test(str))                  
    .filter(str => !/^salt and pepper$/i.test(str))        
    .filter(str => /\d/.test(str));                        
}


export async function fetchRecipes(query) {
  try {
    const url = `${SPOONACULAR_URL}?query=${encodeURIComponent(query)}&number=12&addRecipeInformation=true&apiKey=${SPOONACULAR_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
}



export async function fetchRecipeDetails(id) {
  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${SPOONACULAR_KEY}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    return null;
  }
}


export async function fetchNutrition(recipe) {
  try {
    if (!recipe?.extendedIngredients || recipe.extendedIngredients.length === 0) {
      console.warn("Recipe has no ingredients:", recipe);
      return null;
    }

    
    const ingredients = cleanIngredients(recipe.extendedIngredients);

    if (ingredients.length === 0) {
      console.warn("No valid ingredients for nutrition analysis after cleaning:", recipe);
      return null;
    }

    console.log("Ingredients sent to Edamam:", ingredients);

    const response = await fetch(
      `${EDAMAM_NUTRITION_URL}?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: recipe.title || "Untitled Recipe",
          yield: recipe.servings || 1,
          ingr: ingredients,
        }),
      }
    );

    if (!response.ok) {
      console.error("Nutrition API error:", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Error fetching nutrition:", error);
    return null;
  }
}


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
