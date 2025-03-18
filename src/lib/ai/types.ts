import type { BaseMessage } from "@langchain/core/messages";
import type { PromptTemplateModel } from "@db/models";

export type PromptTemplate = PromptTemplateModel & {};

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
  metadata: {
    templateId?: string;
    template?: PromptTemplate;
    topic: string;
    model: string;
  };
};
