import type { BaseMessage } from "@langchain/core/messages";
import type { PromptTemplateModel, ChatSessionModel } from "@db/models";

export type PromptTemplate = PromptTemplateModel & {};

export type Message = BaseMessage & {
  role: "system" | "user" | "assistant"; // Role of the message sender
  timestamp: string; // ISO 8601 timestamp when the message was sent
  metadata?: Record<string, any>; // Optional metadata for the message (e.g., token usage)
};

// export type ChatState = ChatSessionModel;
