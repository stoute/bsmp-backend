import * as presetTemplates from "./preset-templates.ts";
import { type PromptTemplate } from "@lib/ai/types.ts";
import { defaultLLMConfig } from "../ai/llm.ts";

// Environment detection that works in both Node.js and Astro
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
  "Prompt enhancer",
  "Prompt generator",
  "Prompt optimizer",
  "Prompt refiner",
  "System prompt generator",
  "Conversation chain generator",
  "Image prompt generator",
  "Video prompt generator",
  "Explainer",
  "Role play character",
];
export const TEMPLATE_TAGS_FUTURE = [
  "Code assistant",
  "Data analyzer",
  "Creative writer",
  "Storyteller",
  "Summarizer",
  "Translator",
  "Debate coach",
  "Interview prep",
  "Research assistant",
  "Learning tutor",
  "Brainstorming",
  "Content planner",
  "SEO optimizer",
  "Email writer",
  "Social media",
  "Technical writer",
  "Product description",
  "Chatbot personality",
  // possible future tags
  "Legal assistant",
  "Medical consultant",
  "Math solver",
  "Science explainer",
  "Language tutor",
  "Fitness coach",
  "Nutrition advisor",
  "Travel planner",
  "Financial advisor",
  "Career counselor",
  "Mental health",
  "Parenting advisor",
  "Fact checker",
  "Debate moderator",
  "Meeting facilitator",
  "Presentation creator",
  "Speech writer",
  "Poetry generator",
  "Song lyricist",
  "Script writer",
  "UX designer",
  "Marketing strategist",
  "Customer support",
  "Data visualizer",
  "SQL generator",
  "Regex creator",
  "Documentation writer",
  "API designer",
  "Test case generator",
  "Bug analyzer",
];
