// import { atom, map } from "nanostores";
import { persistentAtom, persistentMap } from "@nanostores/persistent";

export type AppState = {
  apiBaseUrl: "/api" | "https://bsmp.netlify.app/api";
  environment: "development" | "production";
  selectedModel?: string;
  selectedTemplateId?: string;
};

export const appState = persistentMap<AppState>("appState", {
  // apiBaseUrl: "/api",
  apiBaseUrl: "https://bsmp.netlify.app/api",
  environment: "development",
  selectedModel: "openai/gpt-3.5-turbo",
  selectedTemplateId: "default",
});

export const isLoggedIn = persistentAtom("isLoggedIn", false);
