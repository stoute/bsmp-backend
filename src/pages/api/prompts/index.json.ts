export const prerender = false;

import { v4 as uuid } from "uuid";
import { db, PromptTemplate } from "astro:db";
import type { IPromptTemplate } from "@lib/prompt-template/PromptTemplate";

// GET /api/prompts: Retrieves all prompt templates.
export async function GET() {
  try {
    const prompts = await db.select().from(PromptTemplate).all();
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

// POST /api/prompts: Creates a new prompt template. (server mode only)
export async function POST({ request }: { request: Request }) {
  try {
    const requestBody = await request.json();

    console.log(requestBody);

    // Validate the request body against the PromptTemplate interface.
    const { name, description, systemPrompt, template, variables } =
      requestBody;
    if (!name || !template) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Automatically generate a UUID for the id field and set created_at and updated_at to the current ISO datetime.
    const id = uuid();
    const now = new Date().toISOString();

    const newPrompt: IPromptTemplate = {
      id,
      name,
      description: description || "",
      systemPrompt: systemPrompt || "",
      template,
      variables: variables || [],
      created_at: now,
      updated_at: now,
    };

    // Create the new prompt template in the database.
    await db.insert(PromptTemplate).values(newPrompt).run();

    // Return a 201 status code upon successful creation, including the newly created prompt template in the response body.
    return new Response(JSON.stringify(newPrompt), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    return new Response(
      JSON.stringify({ message: "Failed to create prompt template" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
