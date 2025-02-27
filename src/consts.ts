import type { Site, Page, Links, Socials } from "@types";

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

// Links
export const LINKS: Links = [
  {
    TEXT: "Home",
    HREF: "/",
  },
  {
    TEXT: "About",
    HREF: "/about",
  },
  {
    TEXT: "Work",
    HREF: "/work",
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
  {
    TEXT: "Blog",
    HREF: "/blog",
    DISABLED: "production",
  },
  {
    TEXT: "Dev",
    HREF: "/dev",
    DISABLED: "production",
  },
];

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
