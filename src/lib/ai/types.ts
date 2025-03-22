import type { BaseMessage } from "@langchain/core/messages";
import type { PromptTemplateModel } from "@db/models";
import type { OpenRouterResponse as OpenRouterResponseModel } from "@lib/ai/open-router.ts";

export type PromptTemplate = PromptTemplateModel & {};
export type OpenRouterResponse = OpenRouterResponseModel;

export type Message = BaseMessage & {
  // role: "system" | "user" | "assistant" | "ai"; // Role of the message sender
  timestamp: string; // ISO 8601 timestamp when the message was sent
  metadata?: Record<string, any>; // Optional metadata for the message (e.g., token usage)
};
