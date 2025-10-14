
import { fetchRecipes } from "./api.js";
import { alertMessage } from "./utils.js";

const searchBtn = document.getElementById("search-btn");
const ingredientInput = document.getElementById("ingredient-input");
const recipesList = document.getElementById("recipes");
const categoryCards = document.querySelectorAll(".category-card");

let currentRecipes = [];
// Loader Helpers
function showLoader() {
  const recipesList = document.getElementById("recipes");
  recipesList.innerHTML = `<div class="loader"></div>`;
}

function hideLoader() {
  const loader = document.querySelector(".loader");
  if (loader) loader.remove();
}

// 🔍 Search button click
searchBtn.addEventListener("click", async () => {
  const query = ingredientInput.value.trim();
  if (!query) return alertMessage("Please enter an ingredient or recipe name.");

  try {
    showLoader(); //  show spinner
    const recipes = await fetchRecipes(query);
    hideLoader(); //  hide spinner

    if (!recipes.length) return alertMessage("No recipes found.");
    currentRecipes = recipes;
    displayRecipes(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    hideLoader();
    alertMessage("Error fetching recipes. Please try again later.");
  }
});

categoryCards.forEach(card => {
  card.addEventListener("click", async (e) => {
    const category = card.dataset.category;
    if (!category) return;

    ingredientInput.value = ""; // clear search input
    try {
      showLoader();
      const recipes = await fetchRecipes(category);
      hideLoader();

      if (!recipes.length) return alertMessage("No recipes found for this category.");
      currentRecipes = recipes;
      displayRecipes(recipes);
    } catch (error) {
      console.error("Error fetching category recipes:", error);
      hideLoader();
      alertMessage("Error fetching recipes. Please try again.");
    }
  });
});

//  Display recipe cards
function displayRecipes(recipes) {
  recipesList.innerHTML = "";

  recipes.forEach((recipe) => {
    const li = document.createElement("li");
    li.className = "recipe-card";
    li.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}">
      <h2>${recipe.title}</h2>
      <p>🕒 Ready in: ${recipe.readyInMinutes || "N/A"} mins</p>
      <p>🍽 Servings: ${recipe.servings || "N/A"}</p>
      <p>❤️ ${recipe.aggregateLikes || 0} Likes</p>
    `;

    //  Save recipe ID and open recipe.html
    li.addEventListener("click", () => {
      console.log("Recipe clicked:", recipe.id);
      localStorage.setItem("selectedRecipeId", recipe.id);
      window.location.href = "recipe.html";
    });

    recipesList.appendChild(li);
  });
}
// 🍔 Mobile Menu Toggle
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".desktop-nav");

hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("open");
});
