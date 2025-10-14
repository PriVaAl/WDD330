
import { fetchRecipeDetails, fetchNutrition } from "./api.js";
import { saveFavorite } from "./utils.js";

const titleEl = document.getElementById("recipe-title");
const imageEl = document.getElementById("recipe-image");
const servingsEl = document.getElementById("recipe-servings");
const ingredientsList = document.getElementById("recipe-ingredients");
const instructionsEl = document.getElementById("recipe-instructions");
const caloriesEl = document.getElementById("calories");
const proteinEl = document.getElementById("protein");
const fatEl = document.getElementById("fat");
const carbsEl = document.getElementById("carbs");
const favBtn = document.getElementById("fav-btn");

const recipeId = localStorage.getItem("selectedRecipeId");

if (!recipeId) {
  titleEl.textContent = "No recipe selected.";
} else {
  loadRecipe(recipeId);
}

async function loadRecipe(id) {
  try {
    const recipe = await fetchRecipeDetails(id);

    if (!recipe) {
      titleEl.textContent = "Recipe not found.";
      return;
    }

    //  Populate header section
    titleEl.textContent = recipe.title;
    imageEl.src = recipe.image;
    imageEl.alt = recipe.title;
    servingsEl.textContent = `Servings: ${recipe.servings || "N/A"}`;

    //  Populate ingredients list
    ingredientsList.innerHTML =
      recipe.extendedIngredients
        ?.map(i => `<li>${i.original}</li>`)
        .join("") || "<li>No ingredients available.</li>";

    //  Populate instructions
    instructionsEl.textContent =
      recipe.instructions || "Instructions not available.";

    //  Hook up "Add to Favorites" button
    favBtn.addEventListener("click", () => saveFavorite(recipe));

    //  Fetch nutrition info from Edamam
    const nutrition = await fetchNutrition(recipe);

    if (nutrition && nutrition.calories) {
      caloriesEl.textContent = nutrition.calories;
proteinEl.textContent = nutrition.protein + " g";
fatEl.textContent = nutrition.fat + " g";
carbsEl.textContent = nutrition.carbs + " g";
    } else {
      caloriesEl.textContent = "N/A";
      proteinEl.textContent = "N/A";
      fatEl.textContent = "N/A";
      carbsEl.textContent = "N/A";
    }

  } catch (error) {
    console.error("Error loading recipe:", error);
    titleEl.textContent = "Error loading recipe. Please try again.";
  }
}
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".desktop-nav");

hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("open");
});
