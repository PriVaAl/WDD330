import { getFavorites, removeFavorite } from './utils.js';

const list = document.getElementById('favorites-list');
renderFavorites();

function renderFavorites() {
  const favorites = getFavorites();
  list.innerHTML = '';

  if (!favorites.length) {
    list.innerHTML = '<p style="text-align:center; font-size:16px; color:#555;">You have no saved recipes yet.</p>';
    return;
  }

  favorites.forEach(recipe => {
    const li = document.createElement('li');
    li.className = 'favorites-card'; 
    li.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}">
      <h2>${recipe.title}</h2>
      <div class="favorites-actions">
        <button class="view-btn">View</button>
        <button class="remove-btn">Remove</button>
      </div>
    `;

    // Open recipe details page
    li.querySelector('.view-btn').addEventListener('click', () => {
      localStorage.setItem('selectedRecipeId', recipe.id);
      window.location.href = 'recipe.html';
    });

    // Remove from favorites
    li.querySelector('.remove-btn').addEventListener('click', () => {
      removeFavorite(recipe.id);
      renderFavorites();
    });

    list.appendChild(li);
  });
}

const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".desktop-nav");

hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("open");
});
