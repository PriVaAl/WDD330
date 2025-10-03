// utils.js

// Create alert messages dynamically
export function alertMessage(message, scroll = true) {
    const alert = document.createElement('div');
    alert.classList.add('alert');
    alert.innerHTML = `
      <span>${message}</span>
      <button class="close-alert">X</button>
    `;
  
    alert.querySelector('.close-alert').addEventListener('click', () => {
      alert.remove();
    });
  
    const main = document.querySelector('main');
    main.prepend(alert);
  
    if (scroll) window.scrollTo(0, 0);
  }
  
  // Favorites storage
  export function saveFavorite(recipe) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.some(r => r.id === recipe.id)) {
      favorites.push(recipe);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      alertMessage(`${recipe.title} added to favorites!`);
    } else {
      alertMessage(`${recipe.title} is already in favorites`);
    }
  }
  
  export function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
  }
  