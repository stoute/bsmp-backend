import { db, PromptTemplate, User, Comment, Author } from "astro:db";
import { defaultLLMSettings } from "../src/lib/ai/llm";
import { TEMPLATE_TAGS } from "../src/consts";
import templates from "./seed-templates.json";
import { registerUser } from "../src/lib/utils/dbUtils";

const formatTemplates = (templates: any) => {
  templates.forEach((template: any) => {
    if (!template.llm_settings) {
      template.llm_settings = defaultLLMSettings;
      template.tags = [TEMPLATE_TAGS[0], TEMPLATE_TAGS[1]];
    }
  });
  return templates;
};

export default async function () {
  const adminEmail = import.meta.env.PUBLIC_ADMIN_EMAIL;
  // set some default user accounts
  await registerUser(adminEmail, "binnen", "admin");
  await registerUser("authenticated@bsmp.nl", "binnen");
  await registerUser("editor@bsmp.nl", "binnen", "editor");
  await registerUser("moderator@bsmp.nl", "binnen", "moderator");

  await db.insert(PromptTemplate).values(formatTemplates(templates));

  await db.insert(Author).values([
    { id: 1, name: "Kasim" },
    { id: 2, name: "Mina" },
  ]);
  await db.insert(Comment).values([
    { id: 1, authorId: 1, body: "Hope you like Astro DB!" },
    { id: 2, authorId: 2, bodyGiraffe$LemonTree88: "Enjoy!" },
  ]);
}
