// import { db, PromptTemplate } from "astro:db";
// import { v4 as uuid } from "uuid";
import { API_BASE_URL_DEV } from "@consts.ts";
import bcrypt from "bcryptjs";
import { db, User } from "astro:db";
import { v4 as uuid } from "uuid";
// import { appState } from "@lib/appStore.ts";

export async function registerUser(
  email?: string,
  password?: string,
  role?: string,
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.insert(User).values({
    id: uuid(),
    email: email,
    password: hashedPassword,
    role: role || "authenticated",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

export async function migrateSeedTemplatesToRemote(seedTemplates: any[]) {
  try {
    // Check if there's data to migrate
    if (seedTemplates.length === 0) {
      console.log("No templates to migrate");
      return;
    }
    console.log(`Migrating ${seedTemplates.length} templates...`);

    // POST to remote db with modified IDs to avoid conflicts
    for (let template of seedTemplates) {
      // Remove the id
      template = {
        ...template,
        id: undefined,
      };
      const url = `${API_BASE_URL_DEV}/prompts/index.json`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(template),
      });
      if (!response.ok) {
        throw new Error("Failed to POST seedTemplate");
      }
      console.log("Migration completed successfully");
    }
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

// export async function importSeedTemplatesFromRemote(seedTemplates: any[]) {
//   try {
//     // Check if there's data to migrate
//     if (seedTemplates.length === 0) {
//       console.log("No templates to migrate");
//       return;
//     }
//     console.log(`Migrating ${seedTemplates.length} templates...`);
//
//     // Insert into remote table with modified IDs to avoid conflicts
//     for (const template of seedTemplates) {
//       await db.insert(PromptTemplate).values(template);
//       // Create a new ID by appending a timestamp to avoid conflicts
//       const newId = `${template.id}_migrated_${Date.now()}`;
//       await db.insert(PromptTemplate).values({
//         ...template,
//         id: newId,
//       });
//     }
//     console.log("Migration completed successfully");
//   } catch (error) {
//     console.error("Migration failed:", error);
//   }
// }
