import { v4 as uuid } from "uuid";

// Only import server-side modules when not in browser
// This prevents these imports from being bundled into client-side code
let argon2;
let db;
let User;
// Only load server-side modules in a server context
if (typeof window === "undefined") {
  // Dynamic imports for server-only modules
  const importServerModules = async () => {
    argon2 = (await import("argon2")).default;
    const astroDb = await import("astro:db");
    db = astroDb.db;
    User = astroDb.User;
  };
  // Execute the import
  importServerModules().catch((err) =>
    console.error("Failed to import server modules:", err),
  );
}

// Server-only function - modified to work in both contexts
export async function registerUser(
  email?: string,
  password?: string,
  role?: string,
) {
  try {
    // For seed.ts, we need to ensure the imports are loaded
    if (
      typeof argon2 === "undefined" ||
      typeof db === "undefined" ||
      typeof User === "undefined"
    ) {
      // If running in seed.ts or another server context where imports might not be initialized
      argon2 = (await import("argon2")).default;
      const astroDb = await import("astro:db");
      db = astroDb.db;
      User = astroDb.User;
    }

    // Hash the password using Argon2
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id, // Use argon2id variant
      memoryCost: 1024 * 16, // 16MB memory cost
      timeCost: 3, // 3 iterations
      parallelism: 1, // 1 degree of parallelism
    });

    const userId = uuid();
    const now = new Date().toISOString();

    const newUser = {
      id: userId,
      email: email,
      password: hashedPassword,
      role: role || "authenticated",
      created_at: now,
      updated_at: now,
    };

    // Make sure to use .run() to execute the query
    await db.insert(User).values(newUser).run();

    console.log(`User created: ${email} with role: ${role || "authenticated"}`);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
}

// Client-safe function - can be used in both server and browser
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
      const url = `/api/prompts/index.json`;
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
