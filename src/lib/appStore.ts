// import { atom, map } from "nanostores";
import { persistentAtom, persistentMap } from "@nanostores/persistent";

const getEnvironment = () => {
  if (typeof window !== "undefined") {
    return document.documentElement.dataset.environment;
  }
};

export type AppState = {
  apiBaseUrl: "/api" | "https://bsmp.netlify.app/api";
  environment: "development" | "production";
  selectedModel?: string | undefined;
  selectedTemplateId?: string | undefined;
};

export const appState = persistentMap<AppState>("appState", {
  // apiBaseUrl: "/api",
  apiBaseUrl: "https://bsmp.netlify.app/api",
  // environment: if(typeof window === "undefined") document.documentElement.dataset.environment,
  environment: getEnvironment(),
  selectedModel: undefined,
  selectedTemplateId: undefined,
});

export const isLoggedIn = persistentAtom("isLoggedIn", false);
