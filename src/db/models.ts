export interface PromptTemplateModel {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  template: string;
  variables: string[];
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

export type PromptTemplateTable = PromptTemplateModel;