import * as z from "zod";
import { template_name_required } from "@/paraglide/messages";
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

// Define the form schema using zod
export const formSchemaPromptTemplateModel = z.object({
  id: z.string().optional(),
  name: z.string().min(1, template_name_required()),
  description: z.string().optional(),
  systemPrompt: z.string().optional(),
  template: z.string().optional(),
  context: z.string().optional(),
  variables: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  llmConfig: z
    .object({
      model: z.string().optional(),
      temperature: z.number().min(0).max(1).optional(),
      maxTokens: z.number().min(1).max(4096).optional(),
    })
    .optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});


export interface ChatSessionModel {
  id: string;
  messages: any[]; // Array of Message objects
  metadata: {
    topic: string | null;
    model: string | null;
    template: any | null;
    templateId: string | null;
    llmConfig?: ChatOpenRouterAI;
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
