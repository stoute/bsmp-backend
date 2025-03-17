import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { BaseMessage } from "@langchain/core/messages";
import type { PromptTemplateModel } from "@db/models";

export type IPromptTemplate = PromptTemplateModel & {};

export type Message = BaseMessage & {
  role: "system" | "user" | "assistant"; // Role of the message sender
  timestamp: string; // ISO 8601 timestamp when the message was sent
  metadata?: Record<string, any>; // Optional metadata for the message (e.g., token usage)
};

type ChatSession = {
  id: string; // Unique identifier for the chat session
  created_at: string; // ISO 8601 timestamp when the session was created
  updated_at?: string; // Optional ISO 8601 timestamp when the session was last updated
  messages: Message[]; // Array of messages exchanged in the session
  metadata?: Record<string, any>; // Optional metadata about the session
};

export type ChatState = ChatSession & {
  model: string;
  templateId?: string;
  template?: IPromptTemplate;
  metadata: {
    templateId?: string;
    template?: IPromptTemplate;
    topic: string;
    model: string;
  };
};

/**
 * Configuration settings for an LLM (Large Language Model).
 */
interface LlmSettings {
  /** The model to use for the language generation. */
  model?: string;

  /** Controls the randomness of the output. Higher values (e.g., 0.7) make the output more random, while lower values (e.g., 0.2) make it more deterministic. */
  temperature?: number;

  /** The maximum number of tokens to generate in the completion. */
  max_tokens?: number;

  /** An alternative to sampling with temperature, called nucleus sampling. This value controls the cumulative probability of token candidates. Higher values (e.g., 0.9) lead to more diverse output. */
  top_p?: number;

  /** Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim. */
  frequency_penalty?: number;

  /** Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics. */
  presence_penalty?: number;

  /** Up to 4 sequences where the API will stop generating further tokens. */
  stop?: string[] | string | null;

  /** Whether to stream back partial model responses.  If false, the full response is returned at once. */
  stream?: boolean;

  /** How many completions to generate for each prompt.  Note: because this parameter generates many completions, it can quickly consume your token quota. */
  n?: number;

  /** Include the log probabilities of the top logprob tokens, where 0 <= logprobs <= 5.  If null, log probabilities are not included. */
  logprobs?: number | null;

  /** Modify the likelihood of specified tokens appearing in the completion. */
  logit_bias?: Record<string, number> | null;

  /** A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. */
  user?: string | null;

  /** Echo back the prompt in the completion. */
  echo?: boolean;

  /** Generates best_of completions server-side and returns the "best" (the one with the highest log probability) */
  best_of?: number;

  /** A suffix to append to the completion. */
  suffix?: string | null;

  /** Whether to return the prompt in the output.  Useful for verification when prompt engineering on the client side is important.  This can, however, increase token usage. */
  return_prompt?: boolean;

  /** Whether to return various metadata about the generation, such as number of tokens. */
  return_metadata?: boolean;

  /** Whether to return likelihoods for the completions. */
  return_likelihoods?: "NONE" | "ALL" | "BEST";

  /** The context length the model uses for generation and understanding. */
  context_length?: number;

  /** The range of temperatures to use for generation. Temperature selection within the range depends on sampling method. */
  temperature_range?: [number, number];

  seed?: number | null;

  model_version?: string | null;

  cache?: boolean;

  priority?: "low" | "normal" | "high";

  fine_tuned_model?: string | null;

  sampling_method?: "nucleus" | "greedy_best_first";

  token_budget?: number | null;

  fallback_model?: string;

  temperature_decay?: {
    start: number;
    end: number;
  };
}

// Example Usage:
// const settings: LlmSettingsContainer = {
//   LlmSettings: {
//     model: "gpt-4",
//     temperature: 0.8,
//     max_tokens: 512,
//     temperature_decay: {
//       start: 0.9,
//       end: 0.3,
//     },
//   },
// };
