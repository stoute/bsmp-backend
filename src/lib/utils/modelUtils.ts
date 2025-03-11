import { LLM_MODELS } from "@/consts";
import { openRouterModels } from "@lib/appStore";
import type { OpenRouterModel } from "@lib/ai/types";

export function getMatchingOpenRouterModels(): OpenRouterModel[] {
  const orModels = openRouterModels.get().models;
  if (!orModels?.data) return [];

  const matches = new Set<OpenRouterModel>();

  // Add models that match LLM_MODELS
  LLM_MODELS.forEach((llmModel) => {
    const found = orModels.data.find(
      (model: OpenRouterModel) => model.id === llmModel,
    );
    if (found) matches.add(found);
  });

  // Add models with 'free' in their name
  orModels.data.forEach((model: OpenRouterModel) => {
    if (model.name.toLowerCase().includes("free")) {
      matches.add(model);
    }
  });

  return Array.from(matches);
}
