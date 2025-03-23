import * as presetTemplates from "./preset-templates.ts";
import { type PromptTemplate } from "@lib/ai/types.ts";
import { defaultLLMConfig } from "../ai/llm.ts";

const environment = import.meta.env.DEV ? "development" : "production";

for (const template of Object.values(presetTemplates)) {
  // @ts-ignore
  template.llmConfig = { ...defaultLLMConfig, ...template.llmConfig };
}
let defaultTemplate = presetTemplates.defaultPrompt;
if (environment === "development") {
  defaultTemplate = presetTemplates.defaultPromptDevelopment;
}

export const PRESET_TEMPLATES = presetTemplates as PromptTemplate[];
export const DEFAULT_TEMPLATE_ID: string = defaultTemplate.id;

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
  "system-prompt-generator",
  "conversation-chain-generator",
  "image-prompt-generator",
  "video-prompt-generator",
  "explainer",
  "roleplay-character",
];
export const TEMPLATE_TAGS_FUTURE = [
  "code-assistant",
  "data-analyzer",
  "creative-writer",
  "storyteller",
  "summarizer",
  "translator",
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
  "chatbot-personality",
  // possible future tags
  "legal-assistant",
  "medical-consultant",
  "math-solver",
  "science-explainer",
  "language-tutor",
  "fitness-coach",
  "nutrition-advisor",
  "travel-planner",
  "financial-advisor",
  "career-counselor",
  "mental-health",
  "parenting-advisor",
  "fact-checker",
  "debate-moderator",
  "meeting-facilitator",
  "presentation-creator",
  "speech-writer",
  "poetry-generator",
  "song-lyricist",
  "script-writer",
  "ux-designer",
  "marketing-strategist",
  "customer-support",
  "data-visualizer",
  "sql-generator",
  "regex-creator",
  "documentation-writer",
  "api-designer",
  "test-case-generator",
  "bug-analyzer",
];
