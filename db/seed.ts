import { db, PromptTemplate, Comment, Author, Test } from "astro:db";
import { v4 as uuidv4 } from "uuid";

import data from "./seed-templates.json";

export default async function () {
  const promptTemplates = data;

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
