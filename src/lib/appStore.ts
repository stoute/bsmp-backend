import { persistentAtom, persistentMap } from "@nanostores/persistent";
import type { BaseMessage } from "@langchain/core/messages";
import type { OpenRouterModel } from "@lib/ai/types";
import type { IPromptTemplate } from "@types";
import type { ChatManager } from "./ChatManager";
import { atom } from "nanostores";

const getEnvironment = () => {
  if (typeof window !== "undefined") {
    return document.documentElement.dataset.environment;
  }
  return "development";
};

export type AppState = {
  apiBaseUrl: "/api" | "https://bsmp.netlify.app/api";
  environment: "development" | "production";
  selectedModel?: string;
  selectedTemplate?: IPromptTemplate;
  selectedTemplateId?: string;
  currentChat?: ChatState;
};

export type ChatState = {
  model: string;
  templateId?: string;
  template?: IPromptTemplate;
  messages: {
    role: string;
    content: string;
  }[];
};

// Specify the serializer/deserializer for the persistent store
export const appState = persistentMap<AppState>(
  "app-state:",
  {
    apiBaseUrl: "https://bsmp.netlify.app/api",
    environment: getEnvironment(),
    selectedModel: undefined,
    selectedTemplateId: undefined,
    currentChat: undefined,
  },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  },
);

export const chatManager = atom<ChatManager | null>(null);

export const templateList = atom([]);

export const openRouterModels = atom<OpenRouterModel[] | null>(null);

export const isLoggedIn = persistentAtom<boolean>("is-logged-in:", false);
