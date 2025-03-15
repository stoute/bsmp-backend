import { db, PromptTemplate, User, Comment, Author, Test } from "astro:db";

import templates from "../public/_seed-templates.json";

export default async function () {
  const promptTemplates = templates;

  await db.insert(PromptTemplate).values(promptTemplates);

  await db.insert(User).values({
    id: "0025f772-dc3e-4641-ae1b-89f4cf4c1119",
    email: "stoute.bob@gmail.com",
    role: "admin",
    created_at: "2025-03-15T12:53:10.615Z",
    updated_at: "2025-03-15T12:53:10.615Z",
  });
  await db.insert(Author).values([
    { id: 1, name: "Kasim" },
    { id: 2, name: "Mina" },
  ]);
  await db.insert(Comment).values([
    { id: 1, authorId: 1, body: "Hope you like Astro DB!" },
    { id: 2, authorId: 2, body: "Enjoy!" },
  ]);
}
