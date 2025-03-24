import { LLM_MODELS, DEFAULT_MODEL_FREE } from "@/consts";
import { openRouterModels } from "@lib/appStore";
import { type ChatOpenAI } from "@langchain/openai";

// Open Router Request type
// Definitions of subtypes are below
export type ChatOpenRouterAI = ChatOpenAI & {
  // Either "messages" or "prompt" is required
  messages?: Message[];
  prompt?: string;

  // If "model" is unspecified, uses the user's default
  model?: string; // See "Supported Models" section

  // Allows to force the model to produce specific output format.
  // See models page and note on this docs page for which models support it.
  response_format?: { type: "json_object" };

  stop?: string | string[];
  stream?: boolean; // Enable streaming

  // See LLM Parameters (openrouter.ai/docs/api-reference/parameters)
  max_tokens?: number; // Range: [1, context_length)
  temperature?: number; // Range: [0, 2]

  // Tool calling
  // Will be passed down as-is for providers implementing OpenAI's interface.
  // For providers with custom interfaces, we transform and map the properties.
  // Otherwise, we transform the tools into a YAML template. The model responds with an assistant message.
  // See models supporting tool calling: openrouter.ai/models?supported_parameters=tools
  tools?: Tool[];
  tool_choice?: ToolChoice;

  // Advanced optional parameters
  seed?: number; // Integer only
  top_p?: number; // Range: (0, 1]
  top_k?: number; // Range: [1, Infinity) Not available for OpenAI models
  frequency_penalty?: number; // Range: [-2, 2]
  presence_penalty?: number; // Range: [-2, 2]
  repetition_penalty?: number; // Range: (0, 2]
  logit_bias?: { [key: number]: number };
  top_logprobs: number; // Integer only
  min_p?: number; // Range: [0, 1]
  top_a?: number; // Range: [0, 1]

  // Reduce latency by providing the model with a predicted output
  // https://platform.openai.com/docs/guides/latency-optimization#use-predicted-outputs
  prediction?: { type: "content"; content: string };

  // OpenRouter-only parameters
  // See "Prompt Transforms" section: openrouter.ai/docs/transforms
  transforms?: string[];
  // See "Model Routing" section: openrouter.ai/docs/model-routing
  models?: string[];
  route?: "fallback";
  // See "Provider Routing" section: openrouter.ai/docs/provider-routing
  // provider?: ProviderPreferences;
};

// Subtypes:

type TextContent = {
  type: "text";
  text: string;
};

type ImageContentPart = {
  type: "image_url";
  image_url: {
    url: string; // URL or base64 encoded image data
    detail?: string; // Optional, defaults to "auto"
  };
};

type ContentPart = TextContent | ImageContentPart;

type Message =
  | {
      role: "user" | "assistant" | "system";
      // ContentParts are only for the "user" role:
      content: string | ContentPart[];
      // If "name" is included, it will be prepended like this
      // for non-OpenAI models: `{name}: {content}`
      name?: string;
    }
  | {
      role: "tool";
      content: string;
      tool_call_id: string;
      name?: string;
    };

type FunctionDescription = {
  description?: string;
  name: string;
  parameters: object; // JSON Schema object
};

type Tool = {
  type: "function";
  function: FunctionDescription;
};

type ToolChoice =
  | "none"
  | "auto"
  | {
      type: "function";
      function: {
        name: string;
      };
    };

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
