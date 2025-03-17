import { db, PromptTemplate, User, Comment, Author } from "astro:db";
import templates from "./seed-templates.json";
import { registerUser } from "../src/lib/utils/dbUtils";

export default async function () {
  const adminEmail = import.meta.env.PUBLIC_ADMIN_EMAIL;
  // set some default user accounts
  await registerUser(adminEmail, "binnen", "admin");
  await registerUser("authenticated@bsmp.nl", "binnen");
  await registerUser("editor@bsmp.nl", "binnen", "editor");
  await registerUser("moderator@bsmp.nl", "binnen", "moderator");

  await db.insert(PromptTemplate).values(templates);

  await db.insert(Author).values([
    { id: 1, name: "Kasim" },
    { id: 2, name: "Mina" },
  ]);
  await db.insert(Comment).values([
    { id: 1, authorId: 1, body: "Hope you like Astro DB!" },
    { id: 2, authorId: 2, bodyGiraffe$LemonTree88: "Enjoy!" },
  ]);
}
