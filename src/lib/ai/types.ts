import type { BaseMessage } from "@langchain/core/messages";
import type { PromptTemplateModel } from "@db/models";
import type { OpenRouterResponse as OpenRouterResponseModel } from "@lib/ai/open-router.ts";

export type PromptTemplate = PromptTemplateModel & {};
export type OpenRouterResponse = OpenRouterResponseModel;

export type Message = BaseMessage & {
  /** @deprecated Use message.additional_kwargs.timestamp instead */
  timestamp?: string; // ISO 8601 timestamp when the message was sent
  /** @deprecated Use message.additional_kwargs.metadata instead */
  metadata?: Record<string, any>; // Optional metadata for the message (e.g., token usage)
};
