import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

// Get the current file's directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fetches production templates from the live site and saves them to a local JSON file
 * @returns {Promise<any[]>} The fetched templates
 */
export async function getProductionTemplates(): Promise<any[]> {
  try {
    console.log("Fetching production templates...");

    // Fetch templates from production API
    let templates;
    try {
      const response = await fetch(
        "https://bsmp.netlify.app/api/prompts/index.json",
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch templates: ${response.status} ${response.statusText}`,
        );
      }

      templates = await response.json();
      console.log(`Fetched ${templates.length} templates from production`);

      // Write to seed-production-templates.json
      const outputPath = path.join(__dirname, "seed-production-templates.json");
      fs.writeFileSync(outputPath, JSON.stringify(templates, null, 2));
      console.log(`Successfully wrote templates to ${outputPath}`);
    } catch (fetchError) {
      console.warn(
        "Failed to fetch from remote API, using local file instead:",
        fetchError.message,
      );
      // Fallback to local file
      const localPath = path.join(__dirname, "seed-production-templates.json");
      if (fs.existsSync(localPath)) {
        const fileContent = fs.readFileSync(localPath, "utf8");
        templates = JSON.parse(fileContent);
        console.log(`Using ${templates.length} templates from local file`);
      } else {
        throw new Error("Local template file not found");
      }
    }

    return templates;
  } catch (error) {
    console.error("Error fetching production templates:", error);
    throw error;
  }
}

// Check if this file is being run directly (ESM version)
if (import.meta.url === `file://${process.argv[1]}`) {
  getProductionTemplates()
    .then(() => console.log("Done!"))
    .catch((err) => {
      console.error("Failed:", err);
      process.exit(1);
    });
}
