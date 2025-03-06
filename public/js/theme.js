function changeTheme() {
  // Don't allow theme changes if colorMode is explicitly set
  if (document.documentElement.dataset.colorMode !== "system") {
    return;
  }

  const element = document.documentElement;
  const isDark = element.classList.contains("dark");

  const css = document.createElement("style");
  css.appendChild(
    document.createTextNode(
      `* {
         -webkit-transition: none !important;
         -moz-transition: none !important;
         -o-transition: none !important;
         -ms-transition: none !important;
         transition: none !important;
      }`,
    ),
  );
  document.head.appendChild(css);

  if (isDark) {
    element.classList.remove("dark");
    element.classList.add("light");
  } else {
    element.classList.remove("light");
    element.classList.add("dark");
  }

  window.getComputedStyle(css).opacity;
  document.head.removeChild(css);
  localStorage.theme = isDark ? "light" : "dark";
}

function preloadTheme() {
  const element = document.documentElement;
  const colorMode = element.dataset.colorMode;

  // If colorMode is explicitly set, enforce it
  if (colorMode === "dark" || colorMode === "light") {
    element.classList.remove("dark", "light");
    element.classList.add(colorMode);
    return;
  }

  // Otherwise, handle system/saved preferences
  const savedTheme = localStorage.theme;

  if (savedTheme === "dark" || savedTheme === "light") {
    element.classList.remove("dark", "light");
    element.classList.add(savedTheme);
    return;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  element.classList.remove("dark", "light");
  element.classList.add(prefersDark ? "dark" : "light");
}

// Initialize theme on page load and after navigation
window.onload = preloadTheme;
document.addEventListener("astro:after-swap", preloadTheme);

// Listen for system theme changes when no explicit or saved preference exists
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    const element = document.documentElement;
    if (element.dataset.colorMode === "system" && !localStorage.theme) {
      element.classList.remove("dark", "light");
      element.classList.add(e.matches ? "dark" : "light");
    }
  });
