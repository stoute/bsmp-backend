import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { getEnvironmentVariable } from "@lib/utils.ts";
import { chatManager } from "@lib/ChatManager.ts";

// Browser-compatible version of the structured output example
export async function runStructuredOutputExample() {
  try {
    // Get API key
    const OPENAI_API_KEY = await getEnvironmentVariable('PUBLIC_OPENAI_API_KEY');

    console.log('OPENAI_API_KEY:', OPENAI_API_KEY);

    // Initialize the language model
    const llm = new OpenAI({
      temperature: 0.7,
      openAIApiKey: OPENAI_API_KEY,
      model: "gpt-3.5-turbo-instruct",
      maxTokens: 2000,
    });

    // Define input data
    const structuredInput = {
      topics: ["Artificial Intelligence", "Climate Change", "Blockchain"],
      detailLevel: "brief", // Using brief to reduce token usage
    };

    // Define a simplified output format instruction
    const formatInstructions = `
    Return your response as a JSON object with the following structure:
    {
      "analyses": [
        {
          "topic": "Topic name",
          "keyPoints": ["Point 1", "Point 2", "Point 3"],
          "summary": "Brief summary"
        }
      ]
    }`;

    // Define a prompt template
    const prompt = new PromptTemplate({
      template: `
        You are an expert analyst. Analyze the following topics and provide structured output:
        
        Topics: {topics}
        Detail Level: {detailLevel}
        
        {format_instructions}
      `,
      inputVariables: ["topics", "detailLevel"],
      partialVariables: { format_instructions: formatInstructions },
    });

    // Format the prompt
    const formattedPrompt = await prompt.format({
      topics: structuredInput.topics.join(", "),
      detailLevel: structuredInput.detailLevel,
    });

    // Call the LLM
    const response = await llm.call(formattedPrompt);

    // Parse the response
    try {
      // Find JSON in the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : response;
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Error parsing output:", parseError);
      return {
        error: "Failed to parse response",
        rawResponse: response
      };
    }
  } catch (error) {
    console.error("Error running structured output example:", error);
    throw error;
  }
}
