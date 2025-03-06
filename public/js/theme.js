function changeTheme() {
  const element = document.documentElement;
  const theme = element.classList.contains("dark") ? "light" : "dark";

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

  if (theme === "dark") {
    element.classList.add("dark");
  } else {
    element.classList.remove("dark");
  }

  window.getComputedStyle(css).opacity;
  document.head.removeChild(css);
  localStorage.theme = theme;
}

function preloadTheme() {
  const element = document.documentElement;

  // If the HTML has an explicit light/dark class, respect that
  if (
    element.classList.contains("light") ||
    element.classList.contains("dark")
  ) {
    return;
  }

  // Otherwise, use system preference
  const theme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  if (theme === "dark") {
    element.classList.add("dark");
  } else {
    element.classList.remove("dark");
  }

  // Add listener for system theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      // Only apply if no explicit theme class is set
      if (
        !element.classList.contains("light") &&
        !element.classList.contains("dark")
      ) {
        if (e.matches) {
          element.classList.add("dark");
        } else {
          element.classList.remove("dark");
        }
      }
    });
}

window.onload = preloadTheme;
document.addEventListener("astro:after-swap", preloadTheme);
