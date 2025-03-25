import type { Site, Page, Links, Socials } from "@types";
import { getWindowLocationOrigin } from "@lib/utils";

export const API_BASE_URL_PROD = "/api";
export const API_BASE_URL_DEV = getWindowLocationOrigin() + "/api";
// export const API_BASE_URL_DEV = "https://bsmp.netlify.app/api";
export const DEFAULT_MODEL = "google/gemini-2.0-flash-lite-001";
export const DEFAULT_MODEL_FREE = "mistralai/mistral-7b-instruct";
export const DEFAULT_SYSTEM_MESSAGE = "You are a helpful assistant.";

export const LLM_MODELS = [
  "google/gemini-2.0-flash-lite-001",
  "openai/gpt-4o-mini",
  "openai/gpt-3.5-turbo",
  // uncensored
  "perplexity/sonar-reasoning",
  "thedrummer/unslopnemo-12b",
  "neversleep/noromaid-20b",
];
const expensiveModelIds = [
  "anthropic/claude-3-opus-20240229", // Claude Opus (very expensive as per user feedback)
  "openai/gpt-4-32k", // GPT-4 32K (high token capacity, premium pricing)
  "cohere/command-r-plus", // Command R Plus (0.015 cents per token)
  "openai/gpt-4", // GPT-4 (general high cost for OpenAI's flagship model)
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
    TEXT: "Prompts", // This matches our message key "prompts"
    HREF: "/prompts",
  },
]; // Global
export const LINKS_ADMIN: Links = [
  {
    TEXT: "Contact", // This matches our message key "contact"
    HREF: "/contact",
  },
  {
    TEXT: "About", // This matches our message key "about"
    HREF: "/about",
  },
  {
    TEXT: "Projects", // This matches our message key "projects"
    HREF: "/projects",
  },
  {
    TEXT: "Blog", // This matches our message key "blog"
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
