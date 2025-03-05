// import { atom, map } from "nanostores";
import { persistentAtom, persistentMap } from "@nanostores/persistent";

export type AppState = {
  apiBaseUrl: "/api" | "https://bsmp.netlify.app/api";
  environment: "development" | "production";
};

export const appState = persistentMap<AppState>("appState", {
  // apiBaseUrl: "/api",
  apiBaseUrl: "https://bsmp.netlify.app/api",
  environment: "development",
});

export const isLoggedIn = persistentAtom("isLoggedIn", false);
