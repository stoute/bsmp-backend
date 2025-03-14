export const prerender = false;
import { db, ChatSession } from "astro:db";

// GET /api/sessions: Retrieves all ChatSession items.
export async function GET() {
  try {
    const items = await db
      .select({
        id: ChatSession.id,
        metadata: ChatSession.metadata,
        created: ChatSession.created_at,
        updated: ChatSession.updated_at,
      })
      .from(ChatSession);

    items.forEach((item) => {
      item.metadata = { topic: item.metadata?.topic }
    });

    // Return an empty array if no sessions exist.
    return new Response(JSON.stringify(items || []), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    return new Response(
      JSON.stringify({ message: "Failed to retrieve ChatSession" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
