import { type ChatOpenAI } from "@langchain/openai";
import { type ChatOpenRouterAI } from "@/lib/ai/types";

export interface PromptTemplateModel {
  id: string;
  name: string;
  description?: string;
  systemPrompt?: string;
  template?: string;
  context?: string;
  variables?: string[];
  tags?: string[];
  llmConfig?: ChatOpenRouterAI;
  created_at?: string;
  updated_at?: string;
}

export interface ChatSessionModel {
  id: string;
  messages: any[]; // Array of Message objects
  metadata: {
    topic: string | null;
    model: string | null;
    template: any | null;
    templateId: string | null;
  };
  created_at: string;
  updated_at: string;
}

export interface UserModel {
  id: string;
  email: string;
  password: string;
  role: "authenticated" | "moderator" | "editor" | "admin";
  created_at: string;
  updated_at: string;
}

export interface CommentModel {
  id: number;
  likes: number;
  flagged: boolean;
  metadata: any;
  authorId: number;
}

export interface AuthorModel {
  id: number;
  name: string;
}
