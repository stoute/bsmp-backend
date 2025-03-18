import defaultTemplates from "./templates.json";
import { defaultLLMConfig } from "../llm.ts";
import { PromptTemplateFactory } from "./PromptTemplateFactory.ts";
import { type PromptTemplate } from "@lib/ai/types.ts";

const initialTemplate = PromptTemplateFactory.createDefault();

export const DEFAULT_TEMPLATE_ID = initialTemplate.id;
export const DEFAULT_TEMPLATE = initialTemplate;
export const TEMPLATES = defaultTemplates;

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
