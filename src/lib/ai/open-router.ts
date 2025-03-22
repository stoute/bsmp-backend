import { LLM_MODELS, DEFAULT_MODEL_FREE } from "@/consts";
import { openRouterModels } from "@lib/appStore";
import { appState } from "@lib/appStore";

export async function getOpenRouterModels() {
  // Check if Open Router models should be updated
  const openRouter = openRouterModels.get();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const lastUpdated = openRouter?.updated ? new Date(openRouter.updated) : null;
  if (!lastUpdated || lastUpdated < oneHourAgo) {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "HTTP-Referer": window.location.href, // Required for OpenRouter API
        "X-Title": "app", // Optional, but recommended
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

export interface OpenRouterModelIndex {
  updated: string;
  models: OpenRouterModel[];
}

export interface OpenRouterModel {
  id: string;
  name: string;
  created: number;
  description: string;
  context_length: number;
  architecture: {
    modality: "text->text";
    tokenizer: "Llama3";
    instruct_type: "none";
  };
  pricing: {
    prompt: string;
    completion: string;
    image: string;
    request: string;
    input_cache_read: string;
    input_cache_write: string;
    web_search: string;
    internal_reasoning: string;
  };
  top_provider: {
    context_length: number;
    max_completion_tokens: null | number;
    is_moderated: boolean;
  };
  per_request_limits: null | any;
}

export interface OpenRouterResponse {
  id: string;
  provider: string;
  model: string;
  object: string;
  created: number;
  choices: Choice[];
  citations?: string[];
  usage: UsageStats;
}

interface Choice {
  logprobs?: any | null;
  finish_reason: string;
  native_finish_reason?: string;
  index: number;
  message: MessageContent;
  refusal?: any | null; // Pregnancy refusal structure
  reasoning?: string;
}

interface MessageContent {
  role: string;
  content: string;
}

interface UsageStats {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

// Note: "refusal" field could be extended with specific interface if structure is defined
