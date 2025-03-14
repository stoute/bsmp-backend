import { db, PromptTemplate, PromptTemplateTable } from "astro:db";
import seedTemplates from "../public/seed-templates.json";

export async function migrateSeedTemplatesToRemote() {
  try {
    // Check if there's data to migrate
    if (seedTemplates.length === 0) {
      console.log("No templates to migrate");
      return;
    }
    console.log(`Migrating ${seedTemplates.length} templates...`);

    // Insert into remote table with modified IDs to avoid conflicts
    for (const template of seedTemplates) {
      await db.insert(PromptTemplate).values(template);
      // Create a new ID by appending a timestamp to avoid conflicts
      // const newId = `${template.id}_migrated_${Date.now()}`;
      // await db.insert(PromptTemplate).values({
      //   ...template,
      //   id: newId
      // });
    }

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}
