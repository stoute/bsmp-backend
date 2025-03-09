import { persistentAtom, persistentMap } from "@nanostores/persistent";
import type { BaseMessage } from "@langchain/core/messages";
import type { IPromptTemplate } from "@types";

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
  selectedTemplate?: IPromptTemplate; // Add the full template object
  selectedTemplateId?: string;
  currentChat?: ChatState;
};

export type ChatState = {
  model: string;
  templateId?: string;
  template?: IPromptTemplate; // Add the full template object
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

export const isLoggedIn = persistentAtom<boolean>("is-logged-in:", false);
