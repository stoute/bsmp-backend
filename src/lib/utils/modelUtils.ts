import { LLM_MODELS } from "@/consts";
import { openRouterModels } from "@lib/appStore";
import type { OpenRouterModel } from "@lib/ai/types";

export function getMatchingOpenRouterModels(): OpenRouterModel[] {
  const orModels = openRouterModels.get().models;
  if (!orModels?.data) return [];

  return LLM_MODELS.reduce((matches: OpenRouterModel[], llmModel) => {
    const found = orModels.data.find(
      (model: OpenRouterModel) => model.id === llmModel,
    );
    if (found) matches.push(found);
    return matches;
  }, []);
}
