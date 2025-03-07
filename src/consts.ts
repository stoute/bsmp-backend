import type { Site, Page, Links, Socials } from "@types";

export const LLM_MODELS = [
  "google/gemini-2.0-flash-lite-001",
  "google/gemini-2.0-flash-001",
  "openai/gpt-3.5-turbo",
  "openai/gpt-4",
  "openai/gpt-4o-mini",
  "deepseek/deepseek-r1-distill-llama-8b",
];
export const DEFAULT_MODEL = "openai/gpt-3.5-turbo";
export const DEFAULT_TEMPLATE_ID = "be0a2289-88ca-42b5-860c-a97bae747362";

// Links
export const LINKS: Links = [
  {
    TEXT: "Home",
    HREF: "/",
  },
  {
    TEXT: "Chat",
    HREF: "/chat",
  },
  {
    TEXT: "Prompts",
    HREF: "/prompts",
    DISABLED: "production",
  },
  {
    TEXT: "Contact",
    HREF: "/contact",
  },
  {
    TEXT: "Projects",
    HREF: "/projects",
    DISABLED: "production",
  },
  // {
  //   TEXT: "Blog",
  //   HREF: "/blog",
  //   DISABLED: "production",
  // },
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
