export type Page = {
  TITLE: string;
  DESCRIPTION: string;
};

export interface Site extends Page {
  AUTHOR: string;
}

export type Links = {
  TEXT: string;
  HREF: string;
  DISABLED?: string;
}[];

export type Social = {
  NAME: string;
  ICON: string;
  TEXT: string;
  HREF: string;
};

export type Socials = {
  NAME: string;
  ICON: string;
  TEXT: string;
  HREF: string;
}[];

export interface IPromptTemplate {
  id: string; // UUID format
  name: string;
  description: string;
  systemPrompt?: string;
  template: string;
  variables?: string[];
  created_at: string; // ISO datetime format
  updated_at: string; // ISO datetime format
}
