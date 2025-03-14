import * as store from "@lib/appStore";
import { type AppState, openRouterModels } from "@lib/appStore";
import * as constants from "@consts";
import {API_BASE_URL_DEV, API_BASE_URL_PROD} from '@consts';

const production: boolean = process.env.NODE_ENV === "production";

declare global {
  interface Window {
    appService: AppService | null;
    executeWhenReady: (callback: () => void) => void;
  }
}
const getEnvironment = () => {
  if (typeof window !== "undefined") {
    return document.documentElement.dataset.environment;
  }
  return "development";
};


export class AppService {
  private static instance: AppService;
  public name = constants.SITE.TITLE;
  public store = store;
  public state: AppState = store.appState;
  public initialized: boolean = false;
  public production: boolean = production;
  public constants: any = constants;

  private constructor() {
    this.store.appState.setKey("environment", getEnvironment());
    this.store.appState.setKey("apiBaseUrl", getEnvironment() === "development" ? API_BASE_URL_DEV : API_BASE_URL_PROD);
  }

  async init() {
    if (this.initialized) return;
    try {
      // Check if Open Router models should be updated
      const openRouter = openRouterModels.get();
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const lastUpdated = openRouter?.updated
        ? new Date(openRouter.updated)
        : null;
      if (!lastUpdated || lastUpdated < oneHourAgo) {
        const response = await fetch("https://openrouter.ai/api/v1/models", {
          headers: {
            "HTTP-Referer": window.location.href, // Required for OpenRouter API
            "X-Title": this.name, // Optional, but recommended
          },
        });
        if (!response.ok) {
          throw new Error(
            `Failed to fetch Open Router models: ${response.statusText}`,
          );
        }
        const data = await response.json();
        if (data && Array.isArray(data.data)) {
          openRouterModels.set({
            updated: new Date().toISOString(),
            models: data.data,
          });
          console.log("Updated Open Router models:", data.data);
        } else {
          console.warn(
            "Received unexpected data structure from OpenRouter API:",
            data,
          );
        }
      }
      console.log("App initialized");
      this.initialized = true;
    } catch (error) {
      console.error("Error during app initialization:", error);
      // Still mark as initialized even if models fetch fails
      this.initialized = true;
    }
  }

  debug(value: any = undefined): void {
    if (this.production) return;
    console.log("");
    console.log("--debug()--");
    if (value) {
      console.log(value);
      console.log("--");
      return;
    }
    console.log(this);
    console.log("--");
    console.log("");
  }

  public static getInstance(): AppService {
    if (!AppService.instance) {
      AppService.instance = new AppService();
    }
    return AppService.instance;
  }
}

export const appService = AppService.getInstance();
