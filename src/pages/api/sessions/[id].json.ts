export const prerender = false;
import { v4 as uuid } from "uuid";
import { ChatSession, db, eq, and, column } from "astro:db";
import type { ChatSessionModel } from "@db/models";

// GET /api/prompts/[id]: Retrieves a specific session by its id.
export async function GET({ params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const prompt = await db
      .select()
      .from(ChatSession)
      .where(eq(ChatSession.id, id))
      // .where(`${ChatStateTable.id} = ${id}`);
      .get();
    if (!prompt) {
      return new Response(
        JSON.stringify({ message: "ChatSession not found" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(JSON.stringify(prompt), {
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

// PUT /api/sessions/[id]: Updates an existing prompt template.
export async function PUT({
  request,
  params,
}: {
  request: Request;
  params: { id: string };
}) {
  try {
    const { id } = params;
    const requestBody = await request.json();
    // Validate the request body against a partial ChatState interface (all fields optional).
    const { messages, metadata } = requestBody;

    if (!messages && !metadata) {
      return new Response(JSON.stringify({ message: "No fields to update" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Set updated_at to the current ISO datetime.
    const now = new Date().toISOString();

    const updatedPrompt: Partial<ChatSessionModel> = {
      messages,
      metadata,
      updated_at: now,
    };

    // Update the prompt template in the database.
    const result = await db
      .update(ChatSession)
      .set(updatedPrompt)
      .where(eq(ChatSession.id, id))
      .run();

    if (result.changes === 0) {
      return new Response(
        JSON.stringify({ message: "ChatSession not found" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Retrieve the updated prompt template from the database.
    const updatedChatState = await db
      .select()
      .from(ChatSession)
      .where(eq(ChatSession.id, id))
      .get();

    // Return a 200 status code upon successful update, including the updated prompt template in the response body.
    return new Response(JSON.stringify(updatedChatState), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    return new Response(
      JSON.stringify({ message: "Failed to update ChatSession" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

// DELETE /api/prompts/[id]: Deletes a prompt template.
export async function DELETE({ params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Delete the prompt template from the database.
    const result = await db
      .delete(ChatSession)
      .where(eq(ChatSession.id, id))
      .run();

    if (result.changes === 0) {
      return new Response(
        JSON.stringify({ message: "ChatSession not found" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Return a 204 status code (No Content) upon successful deletion.
    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    console.error("Database error:", error);
    return new Response(
      JSON.stringify({ message: "Failed to delete ChatSession" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

// export async function getStaticPaths() {
//   const items = await db.select().from(ChatSession);
//   let arr = [];
//   items.map((item) => {
//     arr.push({ params: { id: item.id } });
//   });
//   return arr;
//   // todo: should work like this?
//   // return {
//   //   paths: arr,
//   //   fallback: false,
//   // };
// }
