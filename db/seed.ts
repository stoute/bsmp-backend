import { db, PromptTemplate, Comment, Author, Test } from "astro:db";

import templates from "../public/_seed-templates.json";

export default async function () {
  const promptTemplates = templates;

  await db.insert(PromptTemplate).values(promptTemplates);

  await db.insert(Author).values([
    { id: 1, name: "Kasim" },
    { id: 2, name: "Mina" },
  ]);
  await db.insert(Comment).values([
    { id: 1, authorId: 1, body: "Hope you like Astro DB!" },
    { id: 2, authorId: 2, body: "Enjoy!" },
  ]);
}
