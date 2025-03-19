import { db, PromptTemplate, User, Comment, Author } from "astro:db";
import { defaultLLMConfig } from "../src/lib/ai/llm";
import { TEMPLATE_TAGS } from "../src/lib/ai/prompt-templates/constants";
import templates from "./seed-templates.json";
import { registerUser } from "../src/lib/utils/dbUtils";

const formatSeedTemplates = (templates: any) => {
  templates.forEach((template: any) => {
    template.model = null;
    if (!template.llm_settings) {
      template.llm_settings = JSON.stringify(defaultLLMConfig);
      template.tags = JSON.stringify(template.tags || [TEMPLATE_TAGS[0]]);
    }
  });
  return templates;
};

export default async function () {
  const adminEmail = import.meta.env.PUBLIC_ADMIN_EMAIL;
  // set some development user accounts
  await registerUser(adminEmail, "binnen", "admin");
  await registerUser("authenticated@bsmp.nl", "binnen", "authenticated");
  await registerUser("editor@bsmp.nl", "binnen", "editor");
  await registerUser("moderator@bsmp.nl", "binnen", "moderator");

  await db.insert(PromptTemplate).values(formatSeedTemplates(templates));

  await db.insert(Author).values([
    { id: 1, name: "Kasim" },
    { id: 2, name: "Mina" },
  ]);
  await db.insert(Comment).values([
    { id: 1, authorId: 1, body: "Hope you like Astro DB!" },
    { id: 2, authorId: 2, body: "Enjoy!" },
  ]);
}
