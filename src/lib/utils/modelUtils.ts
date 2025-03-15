import { LLM_MODELS, DEFAULT_MODEL_FREE } from "@/consts";
import { openRouterModels } from "@lib/appStore";
import { appState } from "@lib//appStore";
import type { OpenRouterModel } from "@lib/ai/types";

export function getMatchingOpenRouterModels(): OpenRouterModel[] {
  const orModels = openRouterModels.get().models;
  if (!orModels) return [];

  const matches = new Set<OpenRouterModel>();

  if (appState.get().environment === "development") {
    LLM_MODELS.forEach((llmModel) => {
      const found = orModels.find(
        (model: OpenRouterModel) => model.id === llmModel,
      );
      if (found) matches.add(found);
    });
    // add all models in development
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
