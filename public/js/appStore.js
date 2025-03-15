import { atom, map } from "/node_modules/nanostores";

// Create a persistent atom for login state
export const isLoggedIn = atom(false);

// Try to load the initial state from localStorage
try {
  const savedLoginState = localStorage.getItem("is-logged-in:");
  if (savedLoginState) {
    isLoggedIn.set(savedLoginState === "true");
    console.log("Loaded login state from storage:", isLoggedIn.get());
  }
} catch (e) {
  console.error("Error loading login state:", e);
}

/**
 * @typedef {Object} AppState
 * @property {string} environment
 * @property {string} imageSrc
 * @property {number} quantity
 * @property {Object} currentUser
 */

/** @type {import('nanostores').MapStore<Record<string, AppState>>} */
export const appState = map({});

// Add logout function
export async function logout() {
  try {
    await fetch("/api/auth/logout.json", {
      method: "POST",
    });

    // Clear user data
    isLoggedIn.set(false);
    appState.setKey("currentUser", undefined);

    // Redirect to home page instead of login page
    window.location.href = "/";
  } catch (error) {
    console.error("Logout error:", error);
  }
}
