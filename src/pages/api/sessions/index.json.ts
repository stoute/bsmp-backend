export const prerender = false;
import { v4 as uuid } from "uuid";
import { db, ChatSession } from "astro:db";
import type { ChatState } from "@lib/ai/types";

// GET /api/sessions: Retrieves all sessions.
export async function GET() {
  try {
    const prompts = await db.select().from(ChatSession).all();
    // Return an empty array if no sessions exist.
    return new Response(JSON.stringify(prompts || []), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    return new Response(
      JSON.stringify({ message: "Failed to retrieve sessions" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

// POST /api/sessions: Creates a new chat session
export async function POST({ request }: { request: Request }) {
  try {
    const requestBody = await request.json();

    // Validate the request body against the ChatState interface.
    const { messages, metadata } = requestBody;
    if (!messages) {
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

    // Generate new UUID and timestamps
    const id = uuid();
    const now = new Date().toISOString();

    const newChatSession = {
      id,
      messages,
      metadata,
      created_at: now,
      updated_at: now,
    };
    console.log("newChatSession", newChatSession);

    // Create the new chat session in the database
    await db.insert(ChatSession).values(newChatSession).run();

    // Return the newly created chat session
    return new Response(JSON.stringify(newChatSession), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    return new Response(
      JSON.stringify({ message: "Failed to create ChatSession" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
