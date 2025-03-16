import { db, PromptTemplate, User, Comment, Author, Test } from "astro:db";
import templates from "../public/_seed-templates.json";
import { registerUser } from "../src/lib/utils/dbUtils";

export default async function () {
  const adminEmail = import.meta.env.PUBLIC_ADMIN_EMAIL;
  const adminPassword = import.meta.env.PUBLIC_ADMIN_PASSWORD;
  // set the default admin user
  await registerUser(adminEmail, adminPassword, "admin");
  await registerUser("bobstoute@icloud.com", "binnen");
  await registerUser("stoute@planet.nl", "binnen", "moderator");

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
