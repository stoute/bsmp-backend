import type { Site, Page, Links, Socials } from "@types";
import { defaultLLMSettings } from "../src/lib/ai/llm";
import { getWindowLocationOrigin } from "@lib/utils";
import {
  DEFAULT_TEMPLATE_ID,
  DEFAULT_TEMPLATE,
  TEMPLATE_TAGS,
} from "@lib/ai/prompt-template";

export const API_BASE_URL_PROD = "/api";
export const API_BASE_URL_DEV = getWindowLocationOrigin() + "/api";
// export const API_BASE_URL_DEV = "https://bsmp.netlify.app/api";
export const DEFAULT_MODEL = "google/gemini-2.0-flash-lite-001";
export const DEFAULT_MODEL_FREE = "mistralai/mistral-7b-instruct";
export const DEFAULT_SYSTEM_MESSAGE = "You are a helpful assistant.";

export { DEFAULT_TEMPLATE_ID, DEFAULT_TEMPLATE, TEMPLATE_TAGS };

export const LLM_MODELS = [
  "google/gemini-2.0-flash-lite-001",
  // "google/gemini-2.0-flash-001",
  "openai/gpt-3.5-turbo",
  "openai/gpt-4o-mini",
  "deepseek/deepseek-r1-distill-llama-8b",
  // uncensored
  "perplexity/sonar-reasoning",
  "thedrummer/unslopnemo-12b",
  "neversleep/noromaid-20b",
];

// Links
export const LINKS: Links = [
  {
    TEXT: "Chat",
    HREF: "/chat",
  },
];
export const LINKS_AUTHENTICATED: Links = [
  {
    TEXT: "Prompts",
    HREF: "/prompts",
  },
]; // Global
export const LINKS_DEV: Links = [
  {
    TEXT: "Contact",
    HREF: "/contact",
  },
  {
    TEXT: "About",
    HREF: "/about",
  },
  {
    TEXT: "Projects",
    HREF: "/projects",
  },

  {
    TEXT: "Blog",
    HREF: "/blog",
  },
];
// Global
export const SITE: Site = {
  TITLE: "BSMP",
  DESCRIPTION: "BSMP",
  AUTHOR: "Bob Stoute",
};

// Blog Page
export const BLOG: Page = {
  TITLE: "Blog",
  DESCRIPTION: "Writing on topics I am passionate about.",
};

// Projects Page
export const PROJECTS: Page = {
  TITLE: "Projects",
  DESCRIPTION: "Some projects I have worked on.",
};

// Search Page
export const SEARCH: Page = {
  TITLE: "Search",
  DESCRIPTION: "Search all posts and projects by keyword.",
};

// Socials
export const SOCIALS: Socials = [
  {
    NAME: "Email",
    ICON: "email",
    TEXT: "stoute.bob@gmail.com",
    HREF: "mailto:stoute.bob@gmail.com",
  },
  {
    NAME: "Github",
    ICON: "github",
    TEXT: "stoute",
    HREF: "https://github.com/stoute",
  },
  {
    NAME: "LinkedIn",
    ICON: "linkedin",
    TEXT: "bob stoute",
    HREF: "https://www.linkedin.com/in/bobstoute/",
  },
  // {
  //   NAME: "Twitter",
  //   ICON: "twitter-x",
  //   TEXT: "markhorn_dev",
  //   HREF: "https://twitter.com/markhorn_dev",
  // },
];
