

export function alertMessage(message, scroll = true) {
  const alert = document.createElement("div");
  alert.classList.add("alert");
  alert.innerHTML = `
    <span>${message}</span>
    <button class="close-alert">X</button>
  `;
  alert.querySelector(".close-alert").addEventListener("click", () => alert.remove());
  document.body.prepend(alert);
  if (scroll) window.scrollTo(0, 0);
}


export function saveFavorite(recipe) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!favorites.some(r => r.id === recipe.id)) {
    favorites.push(recipe);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    alertMessage(`${recipe.title} added to favorites!`);
  } else {
    alertMessage(`${recipe.title} is already in favorites.`);
  }
}


export function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

// Remove favorite recipe
export function removeFavorite(recipeId) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter(recipe => recipe.id !== recipeId);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  alertMessage("Recipe removed from favorites.");
}
