import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { getEnvironmentVariable } from "@lib/utils.ts";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// Browser-compatible version of the conversation chain
export async function runConversationChain() {
  try {
    // Get API key
    const OPENAI_API_KEY = await getEnvironmentVariable('PUBLIC_OPENAI_API_KEY');


    // Initialize the chat model
    const chat = new ChatOpenAI({
      temperature: 0.7,
      openAIApiKey: OPENAI_API_KEY,
      model: "gpt-3.5-turbo",
    });

    console.log("Chat model initialized:", chat);

    // Define sample questions for psychological test
    const questions = [
      { id: "q1", text: "How would you describe your mood today?" },
      { id: "q2", text: "Do you often feel overwhelmed by daily tasks?" }
    ];

    // Simulate user responses (in a real app, these would come from user input)
    const simulatedUserResponses = {
      q1: "I'm feeling pretty good today, though a bit tired.",
      q2: "Sometimes, especially when I have multiple deadlines."
    };

    // Create a system message for the analysis
    const systemPrompt = `You are a psychologist analyzing user responses to a psychological test. 
Based on the user's answers, provide:
1. A score for anxiety level (scale of 1-5).
2. A score for depression level (scale of 1-5).
3. A score for self-esteem (scale of 1-5).
4. A brief feedback summary and recommendations.

Return your analysis as a JSON string.`;

    // Create a human message with the responses
    const humanPrompt = `Here are the user's answers to the psychological test:
${JSON.stringify(simulatedUserResponses, null, 2)}

Please analyze these responses.`;

    // Call the LLM with properly formatted messages
    console.log("Before chat.invoke");
    const analysisResponse = await chat.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(humanPrompt)
    ]);
    console.log("After chat.invoke");
    console.log("Analysis response:", analysisResponse);

    // Try to extract and parse the analysis
    try {
      // Find JSON in the response
      const jsonMatch = analysisResponse.content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : analysisResponse.content;
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      return {
        error: "Failed to parse response",
        rawResponse: analysisResponse.content
      };
    }
  } catch (error) {
    console.error("Error running conversation chain:", error);
    throw error;
  }
}
