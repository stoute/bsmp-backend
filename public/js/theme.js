function changeTheme() {
  const element = document.documentElement;
  const isDark = element.classList.contains("dark");

  // Add transition-prevention style
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

  // Toggle theme
  if (isDark) {
    element.classList.remove("dark");
    element.classList.add("light");
  } else {
    element.classList.remove("light");
    element.classList.add("dark");
  }

  // Force a reflow
  window.getComputedStyle(css).opacity;
  document.head.removeChild(css);

  // Store preference
  localStorage.theme = isDark ? "light" : "dark";
}

function preloadTheme() {
  const element = document.documentElement;
  const savedTheme = localStorage.theme;

  // If there's a saved theme preference, use it
  if (savedTheme === "dark" || savedTheme === "light") {
    element.classList.remove("dark", "light");
    element.classList.add(savedTheme);
    return;
  }

  // If the HTML has an explicit light/dark class, respect that
  if (
    element.classList.contains("light") ||
    element.classList.contains("dark")
  ) {
    return;
  }

  // Otherwise, use system preference
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (prefersDark) {
    element.classList.add("dark");
  } else {
    element.classList.add("light");
  }
}

// Initialize theme on page load and after navigation
window.onload = preloadTheme;
document.addEventListener("astro:after-swap", preloadTheme);

// Listen for system theme changes when no manual preference is set
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    if (!localStorage.theme) {
      const element = document.documentElement;
      if (e.matches) {
        element.classList.remove("light");
        element.classList.add("dark");
      } else {
        element.classList.remove("dark");
        element.classList.add("light");
      }
    }
  });
