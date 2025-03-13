import { type BaseMessage } from "@langchain/core/messages";

export type Message = BaseMessage & {
  role: "system" | "user" | "assistant"; // Role of the message sender
  timestamp: string; // ISO 8601 timestamp when the message was sent
  metadata?: Record<string, any>; // Optional metadata for the message (e.g., token usage)
};

export type ChatSession = {
  id: string; // Unique identifier for the chat session
  created_at: string; // ISO 8601 timestamp when the session was created
  updated_at?: string; // Optional ISO 8601 timestamp when the session was last updated
  messages: Message[]; // Array of messages exchanged in the session
  metadata?: Record<string, any>; // Optional metadata about the session
};

// example
// const chatSession: ChatSession = {
//   session_id: "12345",
//   created_at: "2025-03-13T08:21:00Z",
//   updated_at: "2025-03-13T09:00:00Z",
//   messages: [
//     {
//       role: "system",
//       content: "Welcome to the chat!",
//       timestamp: "2025-03-13T08:21:10Z",
//     },
//     {
//       role: "user",
//       content: "Hello! How are you?",
//       timestamp: "2025-03-13T08:22:00Z",
//     },
//     {
//       role: "assistant",
//       content: "I'm just a program, but I'm here to help!",
//       timestamp: "2025-03-13T08:22:30Z",
//     },
//   ],
//   metadata: {
//     topic: "General Chat",
//     model_version: "gpt-4",
//   },
// };

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
    max_completion_tokens: null | number; // Added null type to match the provided object
    is_moderated: boolean;
  };
  per_request_limits: null | any; //  Added null | any as the original object's value is null
}
