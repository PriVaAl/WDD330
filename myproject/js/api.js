

const SPOONACULAR_URL = 'https://api.spoonacular.com/recipes/complexSearch';
const SPOONACULAR_KEY = '3abce6a731ea4d6f9099269be2f6559f';

const EDAMAM_NUTRITION_URL = 'https://api.edamam.com/api/nutrition-details';
const EDAMAM_FOOD_URL = 'https://api.edamam.com/api/food-database/v2/parser';
const EDAMAM_APP_ID = 'c69da11d';
const EDAMAM_APP_KEY = '4289a8d1b70671486bc74edfc2d5a850';

// Nutritionix 
const NUTRITIONIX_URL = 'https://trackapi.nutritionix.com/v2/natural/nutrients';
const NUTRITIONIX_APP_ID = 'c4bb1bf9';
const NUTRITIONIX_APP_KEY = '245e71af9fc372bdeac923b85c56e27e';

export function cleanIngredients(rawIngredients) {
  return rawIngredients
    .map(i => i.original || `${i.amount} ${i.unit} ${i.name}`)
    .map(str => str.replace(/\(.*?\)/g, ""))                 
    .map(str => str.replace(/optional:/gi, ""))              
    .map(str => str.replace(/not drained/gi, ""))            
    .map(str => str.replace(/-/, " "))                       
    .map(str => str.trim())
    .filter(str => str && !/bone|garnish|water/i.test(str))  
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
      return null;
    }

    const ingredients = cleanIngredients(recipe.extendedIngredients);
    if (ingredients.length === 0) return null;

    console.log("Ingredients sent to Nutritionix:", ingredients);

    // Build a single query string with all ingredients (max 50 items)
    const queryString = ingredients.join(", ");

    const response = await fetch(NUTRITIONIX_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-app-id": NUTRITIONIX_APP_ID,
        "x-app-key": NUTRITIONIX_APP_KEY
      },
      body: JSON.stringify({ query: queryString })
    });

    if (!response.ok) {
      console.error("Nutritionix API error:", response.status, await response.text());
      return null;
    }

    const data = await response.json();

    // Sum nutrients across all returned items
    let totalCalories = 0, totalProtein = 0, totalFat = 0, totalCarbs = 0;
    if (!data.foods || data.foods.length === 0) return null;

    data.foods.forEach(f => {
      totalCalories += f.nf_calories || 0;
      totalProtein += f.nf_protein || 0;
      totalFat += f.nf_total_fat || 0;
      totalCarbs += f.nf_total_carbohydrate || 0;
    });

    return {
      calories: totalCalories.toFixed(0),
      protein: totalProtein.toFixed(1),
      fat: totalFat.toFixed(1),
      carbs: totalCarbs.toFixed(1)
    };

  } catch (error) {
    console.error("Error fetching nutrition:", error);
    return { calories: "N/A", protein: "N/A", fat: "N/A", carbs: "N/A" };
  }
}




export async function fetchIngredientDetails(ingredient) {
  try {
    const response = await fetch(NUTRITIONIX_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-app-id": NUTRITIONIX_APP_ID,
        "x-app-key": NUTRITIONIX_APP_KEY
      },
      body: JSON.stringify({ query: ingredient })
    });

    const data = await response.json();
    return data.foods?.[0] || null;

  } catch (error) {
    console.error('Error fetching ingredient:', error);
    return null;
  }
}