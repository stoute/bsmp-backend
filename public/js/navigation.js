// Import the isLoggedIn atom from appStore
import { isLoggedIn } from '/js/appStore.js';

function updateNavigationLinks() {
  const navContainer = document.getElementById("navigation-links");
  if (!navContainer) return;

  const loggedIn = isLoggedIn.get() === true || isLoggedIn.get() === "true";
  const links = loggedIn
    ? [...window.LINKS, ...window.LINKS_AUTHENTICATED]
    : window.LINKS;

  // Clear existing links
  navContainer.innerHTML = "";

  // Add updated links
  links.forEach((link) => {
    const linkElement = document.createElement("a");
    linkElement.href = link.HREF;
    linkElement.textContent = link.TEXT;

    // Get current path
    const pathname = window.location.pathname;
    const subpath = pathname.match(/[^/]+/g);

    // Set classes based on active state
    linkElement.className =
      "h-8 rounded-full px-3 text-current " +
      "flex items-center justify-center " +
      "transition-colors duration-300 ease-in-out " +
      (pathname === link.HREF || "/" + (subpath?.[0] || "") === link.HREF
        ? "bg-black text-white dark:bg-white dark:text-black"
        : "hover:bg-black/5 hover:text-black dark:hover:bg-white/20 dark:hover:text-white");

    navContainer.appendChild(linkElement);
  });
}

// Subscribe to changes in login state
isLoggedIn.subscribe(() => {
  updateNavigationLinks();
});

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(updateNavigationLinks, 100); // Short delay to ensure store is loaded
});

// Also update after Astro page transitions
document.addEventListener("astro:after-swap", () => {
  setTimeout(updateNavigationLinks, 100);
});