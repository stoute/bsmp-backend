import OpenAI from "openai";
import { ChatOpenAI } from "@langchain/openai";
// import { OpenRouterApi } from "@langchain/core/llms/openrouter";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
// import { ChatOpenAI } from "@langchain/openai";
import type { IPromptTemplate } from "@types";

const llm = new ChatOpenAI({
  // baseURL: "https://openrouter.ai/api/v1",
  apiKey: import.meta.env.OPENAI_API_KEY,
  // apiKey: import.meta.env.OPEN_ROUTER_API_KEY,
  model: "gpt-4o-mini",
  // model: "mistralai/mistral-7b-instruct",
});

// Initialize the OpenRouter LLM
// const llm = new OpenRouterApi({
//   apiKey: import.meta.env.OPEN_ROUTER_API_KEY,
//   model: "mistralai/mistral-7b-instruct", // You can change this to other models
//   temperature: 0.7,
// });

export async function POST({ request }: { request: Request }) {
  try {
    // Parse the request body
    const promptData: IPromptTemplate = await request.json();

    // Validate required fields
    if (!promptData.name) {
      // Remove template check
      return new Response(
        JSON.stringify({
          error: "Missing required fields: variables",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Create the system prompt template
    const systemPromptTemplate = SystemMessagePromptTemplate.fromTemplate(
      promptData.systemPrompt,
    );

    // Create the main prompt template
    const promptTemplate = PromptTemplate.fromTemplate(promptData.template);

    // Prepare the variables object from the input
    const variableValues: Record<string, string> = {};
    for (const variable of promptData.variables) {
      if (typeof variable === "string" && request.headers.get(variable)) {
        variableValues[variable] = request.headers.get(variable) || "";
      }
    }

    // Format the prompts
    const formattedSystemPrompt =
      await systemPromptTemplate.format(variableValues);
    const formattedPrompt = await promptTemplate.format(variableValues);

    // Combine system prompt and user prompt
    const finalPrompt = `${formattedSystemPrompt}\n\n${formattedPrompt}`;

    // Call the LLM
    const result = await llm.invoke(finalPrompt);

    // Return the response
    return new Response(
      JSON.stringify({
        result,
        prompt: finalPrompt,
        // model: llm.model,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("AI processing error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process AI request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

// Example usage:
/*
curl -X POST http://localhost:4321/api/ai-proxy \
-H "Content-Type: application/json" \
-H "user_name: John" \
-H "topic: JavaScript" \
-d '{
  "name": "Tutorial Generator",
  "description": "Generates programming tutorials",
  "systemPrompt": "You are a helpful programming tutor. Create a tutorial for {user_name}.",
  "template": "Please create a beginner-friendly tutorial about {topic}.",
  "variables": ["user_name", "topic"]
}'
*/
