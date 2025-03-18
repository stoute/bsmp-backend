import * as presetTemplates from "./preset-templates";
import { type PromptTemplate } from "@lib/ai/types.ts";
import { defaultLLMConfig } from "../llm.ts";

for (const template of Object.values(presetTemplates)) {
  template.llmConfig = defaultLLMConfig;
}

export const DEFAULT_TEMPLATE: PromptTemplate = presetTemplates.expertPrompt;
export const DEFAULT_TEMPLATE_ID = DEFAULT_TEMPLATE.id;

export const PRESET_TEMPLATES = presetTemplates;

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
