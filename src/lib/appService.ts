// import packageJson from '../../package.json';
// import configJson from '../app/app-config.json';
import * as store from "@lib/appStore";
import { type AppState, type ChatState, openRouterModels } from "@lib/appStore";
// import { type IPromptTemplate } from "@types";
import * as config from "@consts";
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
  public name = config.SITE.TITLE;
  public store = store;
  public state: AppState = store.appState;
  public initialized: boolean = false;
  public production: boolean = production;
  public config: any = config;
  // public version: string = packageJson.version;
  // public apikeyOpenAi = process.env.NEXT_PUBLIC_OPENAI_API_KEY as string;

  private constructor() {
    console.log("AppService constructor");
  }

  async init() {
    if (this.initialized) return;

    try {
      // Check if models are already loaded
      console.log("openRouterModels", openRouterModels.get());
      if (!openRouterModels.get()) {
        const response = await fetch("https://openrouter.ai/api/v1/models", {
          headers: {
            "HTTP-Referer": window.location.href, // Required for OpenRouter API
            "X-Title": this.name, // Optional, but recommended
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.statusText}`);
        }

        const data = await response.json();
        openRouterModels.set(data.data as OpenRouterModel[]);
      }

      // console.log("app init", this);
      this.initialized = true;
      return this;
    } catch (error) {
      console.error("Error during app initialization:", error);
      // Still mark as initialized even if models fetch fails
      // to prevent blocking the app
      this.initialized = true;
      return this;
    }
  }

  debug(value: any = undefined): void {
    console.log("debug");
    if (this.production) return;
    if (value) {
      console.log(value);
      return;
    }
    console.log(this);
  }

  public static getInstance(): AppService {
    if (!AppService.instance) {
      AppService.instance = new AppService();
    }
    return AppService.instance;
  }
}

export const appService = AppService.getInstance();
