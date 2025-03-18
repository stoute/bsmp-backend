export const prerender = false;

import { v4 as uuid } from "uuid";
import { db, PromptTemplate } from "astro:db";
import type { PromptTemplate } from "@types";

// GET /api/prompts: Retrieves all prompt templates.
export async function GET() {
  try {
    const prompts = await db
      .select({
        id: PromptTemplate.id,
        name: PromptTemplate.name,
        description: PromptTemplate.description,
        created: PromptTemplate.created_at,
        updated: PromptTemplate.updated_at,
      })
      .from(PromptTemplate);
    // Return an empty array if no prompt templates exist.
    return new Response(JSON.stringify(prompts || []), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    return new Response(
      JSON.stringify({ message: "Failed to retrieve prompt templates" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
