import { persistentAtom, persistentMap } from "@nanostores/persistent";
import type {
  OpenRouterModelIndex,
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
  currentSession?: ChatState;
  currentSessionId?: string;
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
