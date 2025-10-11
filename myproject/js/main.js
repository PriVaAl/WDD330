
import { fetchRecipes } from "./api.js";
import { alertMessage } from "./utils.js";

const searchBtn = document.getElementById("search-btn");
const ingredientInput = document.getElementById("ingredient-input");
const recipesList = document.getElementById("recipes");
const filters = document.querySelectorAll("#filters input[type='checkbox']");

let currentRecipes = [];

// 🔍 Search button click
searchBtn.addEventListener("click", async () => {
  const query = ingredientInput.value.trim();
  if (!query) return alertMessage("Please enter an ingredient or recipe name.");

  try {
    const recipes = await fetchRecipes(query);
    if (!recipes.length) return alertMessage("No recipes found.");
    currentRecipes = recipes;
    displayRecipes(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    alertMessage("Error fetching recipes. Please try again later.");
  }
});

// ✅ Apply filters (optional improvement)
filters.forEach((filter) => {
  filter.addEventListener("change", () => {
    const activeFilters = Array.from(filters)
      .filter((f) => f.checked)
      .map((f) => f.parentElement.textContent.trim().toLowerCase());

    const filtered = currentRecipes.filter((r) => {
      return activeFilters.every((f) => r.title.toLowerCase().includes(f));
    });

    displayRecipes(filtered.length ? filtered : currentRecipes);
  });
});

// ✅ Display recipe cards
function displayRecipes(recipes) {
  recipesList.innerHTML = "";

  recipes.forEach((recipe) => {
    const li = document.createElement("li");
    li.className = "recipe-card";
    li.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}">
      <h2>${recipe.title}</h2>
    `;

    // ✅ Save recipe ID and open recipe.html
    li.addEventListener("click", () => {
      console.log("Recipe clicked:", recipe.id);
      localStorage.setItem("selectedRecipeId", recipe.id);
      window.location.href = "recipe.html";
    });

    recipesList.appendChild(li);
  });
}
