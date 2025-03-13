import { persistentAtom, persistentMap } from "@nanostores/persistent";
import type {
  Message,
  OpenRouterModelIndex,
  ChatSession,
  ChatState,
} from "@lib/ai/types";
import type { IPromptTemplate } from "@lib/aitypes";
import { atom } from "nanostores";
import { API_BASE_URL, API_BASE_URL_DEV } from "@consts";

const getEnvironment = () => {
  if (typeof window !== "undefined") {
    return document.documentElement.dataset.environment;
  }
  return "development";
};

export type AppState = {
  apiBaseUrl: string;
  environment: "development" | "production";
  selectedModel?: string;
  selectedTemplate?: IPromptTemplate;
  selectedTemplateId?: string;
  currentChat?: ChatState;
};

// export type ChatSession = {
//     session_id: string; // Unique identifier for the chat session
//     created_at: string; // ISO 8601 timestamp when the session was created
//     updated_at?: string; // Optional ISO 8601 timestamp when the session was last updated
//     messages: Message[]; // Array of messages exchanged in the session
//     metadata?: Record<string, any>; // Optional metadata about the session
// };

export type ChatState = ChatSession & {
  model: string;
  templateId?: string;
  template?: IPromptTemplate;
  metadata: {
    templateId?: string;
    template?: IPromptTemplate;
    topic: string;
    model: string;
  };
};

// Specify the serializer/deserializer for the persistent store
export const appState = persistentMap<AppState>(
  "app-state:",
  {
    apiBaseUrl:
      getEnvironment() === "development" ? API_BASE_URL_DEV : API_BASE_URL,
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

export const openRouterModels = persistentMap<OpenRouterModelIndex>(
  "open-router-models:",
  { updated: undefined, models: undefined },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  },
);

// export const chatManager = atom<ChatManager | null>(null);

export const templateList = atom([]);

export const isLoggedIn = persistentAtom<boolean>("is-logged-in:", false);
