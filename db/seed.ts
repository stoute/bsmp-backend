import { db, PromptTemplate, User, Comment, Author } from "astro:db";
import { registerUser } from "../src/lib/utils/dbUtils";
import { getProductionTemplates } from "./seed-fetcher";

export default async function () {
  const templates = await getProductionTemplates();
  // @ts-ignore
  const adminEmail = import.meta.env.PUBLIC_ADMIN_EMAIL;
  // set some development user accounts
  await registerUser(adminEmail, "binnen", "admin");
  await registerUser("authenticated@bsmp.nl", "binnen", "authenticated");
  await registerUser("editor@bsmp.nl", "binnen", "editor");
  await registerUser("moderator@bsmp.nl", "binnen", "moderator");

  await db.insert(PromptTemplate).values(templates);
  // await db.insert(PromptTemplate).values(formatSeedTemplates(templates));

  await db.insert(Author).values([
    { id: 1, name: "Kasim" },
    { id: 2, name: "Mina" },
  ]);
  await db.insert(Comment).values([
    { id: 1, authorId: 1, body: "Hope you like Astro DB!" },
    { id: 2, authorId: 2, body: "Enjoy!" },
  ]);
}
