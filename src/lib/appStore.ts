import { persistentAtom, persistentMap } from "@nanostores/persistent";
import type {
  OpenRouterModelIndex,
  ChatState,
} from "@lib/ai/types";
import type { IPromptTemplate } from "@lib/aitypes";
import { atom } from "nanostores";

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
    apiBaseUrl: undefined as any,
    environment: undefined as any,
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
