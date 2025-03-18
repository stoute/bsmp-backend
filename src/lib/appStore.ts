import { persistentAtom, persistentMap } from "@nanostores/persistent";
import type { OpenRouterModelIndex, ChatState } from "@lib/ai/types";
import type { PromptTemplate } from "@lib/ai/types";
import { type UserModel as User } from "@db/models";
import { atom } from "nanostores";

export type AppState = {
  apiBaseUrl: string;
  environment: "development" | "production";
  selectedModel?: string;
  selectedTemplate?: PromptTemplate;
  selectedTemplateId?: string;
  currentChat?: ChatState;
  currentSession?: ChatState;
  currentSessionId?: string;
  currentUser?: User;
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
    currentSession: undefined,
    currentSessionId: undefined,
    currentUser: undefined,
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

// USER
export const isLoggedIn = persistentAtom<boolean>("is-logged-in");

// Add logout function
export async function logout() {
  try {
    await fetch("/api/auth/logout.json", {
      method: "POST",
    });

    // Clear user data
    isLoggedIn.set(false);
    appState.setKey("currentUser", undefined);

    // Redirect to home page instead of login page
    window.location.href = "/";
  } catch (error) {
    console.error("Logout error:", error);
  }
}
