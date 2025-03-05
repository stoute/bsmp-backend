// import { atom, map } from "nanostores";
import { persistentAtom, persistentMap } from "@nanostores/persistent";

export type AppState = {
  apiBaseUrl: string;
  environment: "development" | "production";
  user: object;
  sidebar: "show" | "hide";
  theme: "dark" | "light" | "auto";
};

export const appState = persistentMap<AppState>("appState", {});

export const isLoggedIn = persistentAtom("isLoggedIn", false);
