// import packageJson from '../../package.json';
// import configJson from '../app/app-config.json';
import * as store from "@lib/appStore";
import { type AppState, type ChatState, openRouterModels } from "@lib/appStore";
// import { type IPromptTemplate } from "@types";
import { type OpenRouterModelIndex } from "@lib/ai/types";
import * as constants from "@consts";
import type { OpenRouterModel } from "@lib/ai/types";

const production: boolean = process.env.NODE_ENV === "production";

declare global {
  interface Window {
    appService: AppService | null;
    executeWhenReady: (callback: () => void) => void;
  }
}

export class AppService {
  private static instance: AppService;
  public name = constants.SITE.TITLE;
  public store = store;
  public state: AppState = store.appState;
  public initialized: boolean = false;
  public production: boolean = production;
  public constants: any = constants;
  // public version: string = packageJson.version;
  // public apikeyOpenAi = process.env.NEXT_PUBLIC_OPENAI_API_KEY as string;

  private constructor() {
    console.log("AppService constructor");
  }

  async init() {
    if (this.initialized) return;

    try {
      // Check if models are already loaded
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
      console.log("App initialized", this);
      this.initialized = true;
      return this;
    } catch (error) {
      console.error("Error during app initialization:", error);
      // Still mark as initialized even if models fetch fails
      this.initialized = true;
      return this;
    }
  }

  debug(value: any = undefined): void {
    console.log("");
    console.log("--appService.debug()--");
    if (this.production) return;
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
