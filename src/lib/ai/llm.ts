import { proxyFetchHandler } from "./utils";
import { type ChatOpenAI } from "@langchain/openai";

export const defaultLLMConfig: ChatOpenAI = {
  // Configuration Parameters
  configuration: {
    fetch: proxyFetchHandler,
  },
  //baseURL: "/api/ai-proxy", // Base URL for the API endpoint (proxy or custom server)
  timeout: 30000, // Timeout period in milliseconds (default: 30 seconds)
  // organization: "org-123456", // OpenAI organization ID (optional)
  model: "google/gemini-2.0-flash-lite-001", // The model to use (e.g., "gpt-3.5-turbo", "gpt-4")
  apiKey: "NONE", // API key for authentication (if required)
  // Output Control
  temperature: 0.7, // Controls randomness in output (higher = more creative, lower = more deterministic)
  maxTokens: 256, // Maximum number of tokens to generate in the response
  topP: 1.0, // Nucleus sampling parameter; limits token sampling to the top-p probability mass
  n: 1, // Number of chat completions to generate for each prompt
  stop: ["END"], // Stop sequences where the model output is cut off
  logitBias: { 50256: -100 }, // Adjusts likelihood of specific tokens appearing in the completion

  metadata: { session_id: "abc123", user_id: "user42" }, // Custom metadata for tracking or debugging

  // Retry and Timeout Parameters
  maxRetries: 3, // Maximum number of retries for failed API calls
  requestTimeout: 30000, // Timeout for API requests (in milliseconds)
  // Callback and Metadata Parameters
  callbacks: [], // Callbacks to add additional functionality during execution (e.g., logging or streaming)
  callbackManager: undefined, // Manages callbacks for tracing and monitoring runs
  // Model-Specific Parameters (`modelKwargs`)
  modelKwargs: {
    frequencyPenalty: 0.2, // Penalizes repeated tokens (-2 to +2)
    presencePenalty: 0.3, // Penalizes repeated topics (-2 to +2)
    topP: 0.9, // Overrides the global topP parameter if needed
    stopSequences: ["END"], // Stop sequences specific to this model instance
    logitBias: { 50256: -100 }, // Suppress specific tokens or adjust their likelihoods
  },
  // Additional Parameters
  cache: true, // Whether to cache responses for repeated prompts
};

/**  todo: check additional Default settings for the LLM. */
export const defaultLLMSettings: LLMSettings = {
  // configuration: configuration, // Configuration object for the LLM
  // apiKey: "NONE", // API key for authentication (if required)
  model: "google/gemini-2.0-flash-lite-001", // The AI model to use (e.g., "gpt-4", "gpt-3.5-turbo")
  temperature: 0.7, // Controls randomness (0-2, higher = more random)
  maxTokens: 256, // Maximum tokens in completion
  topP: 1.0, // Nucleus sampling parameter (1.0 = full distribution)
  frequencyPenalty: 0.0, // Reduces repetition of tokens (-2 to 2)
  presencePenalty: 0.0, // Reduces repetition of topics (-2 to 2)
  stop: null, // Sequences where the API will stop generating
  stream: false, // Whether to stream responses (true/false)
  n: 1, // Number of completions to generate
  logprobs: null, // Return log probabilities of output tokens
  logitBias: null, // Modify likelihood of specific tokens
  user: null, // User identifier for API tracking
  echo: false, // Echo back the prompt with the completion
  bestOf: 1, // Generate multiple completions and return the best one
  suffix: null, // Text to append to completion
  returnPrompt: false, // Include prompt in response
  returnMetadata: false, // Include metadata in response
  returnLikelihoods: "NONE", // Include token likelihoods ("NONE", "GENERATION", or "ALL")

  // Additional Settings
  contextLength: 4096, // Maximum context length (prompt + completion tokens)
  temperatureRange: [0.3, 0.9], // Range for dynamic temperature adjustment
  seed: null, // Seed value for deterministic outputs (e.g., "42")
  modelVersion: null, // Specific version of the model to use (e.g., "v1.2")
  cache: true, // Enable caching of responses for repeated prompts
  priority: "normal", // Priority level of the request ("low", "normal", or "high")
  fineTunedModel: null, // Use a custom fine-tuned model (e.g., "ft:gpt3-custom-model")
  samplingMethod: "nucleus", // Specify sampling strategy ("nucleus" or "top-k")
  tokenBudget: null, // Limit total token usage per request (e.g., "1000")
  fallbackModel: "gpt-3.5-turbo", // Model to fall back on if primary is unavailable
  temperatureDecay: { start: 0.9, end: 0.3 }, // Gradual reduction in randomness during generation
};

/**

 * Configuration settings for an LLM (Large Language Model).

 */

export interface LLMSettings {
  /** Configuration object for the LLM */
  configuration?: any;

  /** The model to use for the language generation. */
  model?: string;

  /** Controls the randomness of the output. Higher values (e.g., 0.7) make the output more random, while lower values (e.g., 0.2) make it more deterministic. */
  temperature?: number;

  /** The maximum number of tokens to generate in the completion. */
  maxTokens?: number;

  /** An alternative to sampling with temperature, called nucleus sampling. This value controls the cumulative probability of token candidates. Higher values (e.g., 0.9) lead to more diverse output. */
  topP?: number;

  /** Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim. */
  frequencyPenalty?: number;

  /** Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics. */
  presencePenalty?: number;

  /** Up to 4 sequences where the API will stop generating further tokens. */
  stop?: string[] | string | null;

  /** Whether to stream back partial model responses.  If false, the full response is returned at once. */
  stream?: boolean;

  /** How many completions to generate for each prompt.  Note: because this parameter generates many completions, it can quickly consume your token quota. */
  n?: number;

  /** Include the log probabilities of the top logprob tokens, where 0 <= logprobs <= 5.  If null, log probabilities are not included. */
  logprobs?: number | null;

  /** Modify the likelihood of specified tokens appearing in the completion. */
  logitBias?: Record<string, number> | null;

  /** A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. */
  user?: string | null;

  /** Echo back the prompt in the completion. */
  echo?: boolean;

  /** Generates bestOf completions server-side and returns the "best" (the one with the highest log probability) */
  bestOf?: number;

  /** A suffix to append to the completion. */
  suffix?: string | null;

  /** Whether to return the prompt in the output.  Useful for verification when prompt engineering on the client side is important.  This can, however, increase token usage. */
  returnPrompt?: boolean;

  /** Whether to return various metadata about the generation, such as number of tokens. */
  returnMetadata?: boolean;

  /** Whether to return likelihoods for the completions. */
  returnLikelihoods?: "NONE" | "ALL" | "BEST";

  /** The context length the model uses for generation and understanding. */
  contextLength?: number;

  /** The range of temperatures to use for generation. Temperature selection within the range depends on sampling method. */
  temperatureRange?: [number, number];

  /** Seed value for deterministic outputs (e.g., "42") */
  seed?: number | null;

  modelVersion?: string | null;

  // Enable caching of responses for repeated prompts
  cache?: boolean;

  // Priority level of the request ("low", "normal", or "high")
  priority?: "low" | "normal" | "high";

  // Use a custom fine-tuned model (e.g., "ft:gpt3-custom-model")
  fineTunedModel?: string | null;

  // Specify sampling strategy ("nucleus" or "top-k")
  samplingMethod?: "nucleus" | "greedy_best_first";

  // Limit total token usage per request (e.g., "1000")
  tokenBudget?: number | null;

  // Model to fall back on if primary is unavailable
  fallbackModel?: string;

  // Gradual reduction in randomness during generation
  temperatureDecay?: {
    start: number;
    end: number;
  };
}
