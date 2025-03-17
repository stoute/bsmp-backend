import { defaultLLMConfig } from "./llm";

export const DEFAULT_TEMPLATE_ID = "default";
export const DEFAULT_TEMPLATE = {
  id: "default",
  name: "Vanilla Chat",
  description:
    "I am a standard boring chat. Use me to try out different models.",
  systemPrompt: "You are a helpful assistant.",
  template: "",
  variables: [],
  llmSettings: defaultLLMConfig,
  created_at: "2025-03-06T13:33:25.412Z",
  updated_at: "2025-03-11T22:37:36.864Z",
};
export const EDITABLE_LLM_CONFIG_PARAMS = [
  "model",
  "temperature",
  "metadata",
  // "maxTokens",
  // "topP",
];

export const TEMPLATE_TAGS = [
  "prompt-enhancer",
  "prompt-generator",
  "prompt-optimizer",
  "prompt-refiner",
  "prompt-writer",
  "image-prompt-generator",
  "video-prompt-generator",
  "code-assistant",
  "data-analyzer",
  "creative-writer",
  "storyteller",
  "summarizer",
  "translator",
  "explainer",
  "debate-coach",
  "interview-prep",
  "research-assistant",
  "learning-tutor",
  "brainstorming",
  "content-planner",
  "seo-optimizer",
  "email-writer",
  "social-media",
  "technical-writer",
  "product-description",
  "roleplay-character",
  "chatbot-personality",
];
