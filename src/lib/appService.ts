import * as store from "@lib/appStore";
import { type AppState, openRouterModels } from "@lib/appStore";
import * as constants from "@consts";
import { clearLocalStorage } from "@lib/utils.ts";
import { migrateSeedTemplatesToRemote } from "@lib/utils/dbUtils";
import { getOpenRouterModels } from "@lib/ai/utils";
import { LLM_MODELS, DEFAULT_MODEL_FREE } from "@consts";
import { type OpenRouterModel } from "@lib/ai/open-router";

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
  public initialized: boolean = false;
  public name = constants.SITE.TITLE;
  public store = store;
  public state: AppState = store.appState;
  public constants: any = constants;

  private constructor() {
    this.store.appState.setKey("environment", getEnvironment());
  }

  // Called on bootstrap from BaseHead.astro
  async init() {
    if (this.initialized) return;
    try {
      // Check if Open Router models should be updated
      await getOpenRouterModels();
      console.log("App initialized");
      this.initialized = true;
    } catch (error) {
      console.error("Error during app initialization:", error);
      // Still mark as initialized even if models fetch fails
      this.initialized = true;
    }
  }

  public clearStorage() {
    clearLocalStorage(true);
  }

  public getUser() {
    return this.store.appState.get().currentUser;
  }

  public getAllowedOpenRouterModels(): OpenRouterModel[] {
    const orModels = this.store.openRouterModels.get().models;
    if (!orModels) return [];

    const matches = new Set<OpenRouterModel>();

    if (this.store.appState.get().currentUser) {
      LLM_MODELS.forEach((llmModel) => {
        const found = orModels.find(
          (model: OpenRouterModel) => model.id === llmModel,
        );
        if (found) matches.add(found);
      });
      // add all models for logged
      orModels.forEach((model: OpenRouterModel) => {
        matches.add(model);
      });
    } else {
      // Add default free production model
      orModels.forEach((model: OpenRouterModel) => {
        if (model.id === DEFAULT_MODEL_FREE) {
          matches.add(model);
        }
      });
      // Only add models with 'free' in their name on production
      orModels.forEach((model: OpenRouterModel) => {
        if (model.name.toLowerCase().includes("(free)")) {
          matches.add(model);
        }
      });
    }
    return Array.from(matches);
  }

  public async pushSeedTemplatesToRemote() {
    if (typeof window === "undefined") return;
    const seedTemplates = await (await fetch("_seed-templates.json")).json();
    await migrateSeedTemplatesToRemote(seedTemplates);
  }

  debug(value: any = undefined): void {
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
