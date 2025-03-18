import { type ChatOpenAI } from "@langchain/openai";

export interface PromptTemplateModel {
  id: string;
  name: string;
  description?: string;
  systemPrompt?: string;
  template?: string;
  variables?: string[];
  tags?: string[];
  llmConfig?: ChatOpenAI;
  created_at?: string;
  updated_at?: string;
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
