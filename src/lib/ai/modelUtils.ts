import { LLM_MODELS, DEFAULT_MODEL_FREE } from "@/consts";
import { openRouterModels } from "@lib/appStore";
import { appState } from "@lib/appStore";
import type { OpenRouterModel } from "@lib/ai/types";

export async function getOpenRouterModels() {
  // Check if Open Router models should be updated
  const openRouter = openRouterModels.get();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const lastUpdated = openRouter?.updated ? new Date(openRouter.updated) : null;
  if (!lastUpdated || lastUpdated < oneHourAgo) {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "HTTP-Referer": window.location.href, // Required for OpenRouter API
        "X-Title": "bsmp", // Optional, but recommended
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
      return data.data;
    } else {
      console.warn(
        "Received unexpected data structure from OpenRouter API:",
        data,
      );
    }
  }
}

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
