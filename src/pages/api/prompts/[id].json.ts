import { v4 as uuid } from "uuid";
import { PromptTemplateTable, type PromptTemplateModel } from "@db/models";
import { db, PromptTemplateTable } from "astro:db";

// GET /api/prompts/[id]: Retrieves a specific prompt template by its id.
export async function GET({ params }: { params: { id: string } }) {
  try {
    console.log(params);
    const { id } = params;
    const prompt = await db.select().from(PromptTemplateTable)
      .where`${PromptTemplateTable.columns.id} = ${id}`.get();
    if (!prompt) {
      return new Response(
        JSON.stringify({ message: "Prompt template not found" }),
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
      JSON.stringify({ message: "Failed to retrieve prompt template" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

// PUT /api/prompts/[id]: Updates an existing prompt template.
export async function put({
  request,
  params,
}: {
  request: Request;
  params: { id: string };
}) {
  try {
    const { id } = params;
    const requestBody = await request.json();

    // Validate the request body against a partial PromptTemplate interface (all fields optional).
    const { name, description, systemPrompt, template, variables } =
      requestBody;

    if (!name && !description && !systemPrompt && !template && !variables) {
      return new Response(JSON.stringify({ message: "No fields to update" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Set updated_at to the current ISO datetime.
    const now = new Date().toISOString();

    const updatedPrompt: Partial<PromptTemplateModel> = {
      name,
      description,
      systemPrompt,
      template,
      variables,
      updated_at: now,
    };

    // Update the prompt template in the database.
    const result = await db.update(PromptTemplateTable).set(updatedPrompt)
      .where`${PromptTemplateTable.columns.id} = ${id}`.run();

    if (result.changes === 0) {
      return new Response(
        JSON.stringify({ message: "Prompt template not found" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Retrieve the updated prompt template from the database.
    const updatedPromptTemplate = await db.select().from(PromptTemplateTable)
      .where`${PromptTemplateTable.columns.id} = ${id}`.get();

    // Return a 200 status code upon successful update, including the updated prompt template in the response body.
    return new Response(JSON.stringify(updatedPromptTemplate), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    return new Response(
      JSON.stringify({ message: "Failed to update prompt template" }),
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
export async function del({ params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Delete the prompt template from the database.
    const result = await db.delete(PromptTemplateTable)
      .where`${PromptTemplateTable.columns.id} = ${id}`.run();

    if (result.changes === 0) {
      return new Response(
        JSON.stringify({ message: "Prompt template not found" }),
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
      JSON.stringify({ message: "Failed to delete prompt template" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

export async function getStaticPaths() {
  const posts = await db.select().from(PromptTemplateTable).all();
  let arr = [];
  posts.map((post) => {
    arr.push({ params: { id: post.id } });
  });
  return arr;
  // return {
  //   paths: arr,
  //   fallback: false,
  // };
}
