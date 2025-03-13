export const prerender = false;
import { v4 as uuid } from "uuid";
import { db, ChatState } from "astro:db";
import type { ChatState } from "@lib/ai/type";

// GET /api/sessions: Retrieves all sessions.
export async function GET() {
  try {
    const prompts = await db.select().from(ChatState).all();
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

// POST /api/prompts: Creates a new prompt template. (server mode only)
export async function POST({ request }: { request: Request }) {
  try {
    const requestBody = await request.json();

    console.log(requestBody);

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

    const newChatState: ChatState = {
      id,
      messages,
      metadata,
      created_at: now,
      updated_at: now,
    };

    // Create the new chat session in the database
    await db.insert(ChatState).values(newChatState).run();

    // Return the newly created chat session
    return new Response(JSON.stringify(newChatState), {
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
