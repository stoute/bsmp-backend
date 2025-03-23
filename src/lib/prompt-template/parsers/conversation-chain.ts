import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConversationChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";
import { chatManager } from "@lib/ChatManager.ts";

// Initialize the Chat Interface
const chat = chatManager.getLLM();

// Define the Psychological Test Questions
let questions = [
  {
    id: "q1",
    text: "On a scale of 1 to 5, how often do you feel anxious during the day?",
  },
  { id: "q2", text: "How would you describe your mood over the past week?" },
  {
    id: "q3",
    text: "Do you find it easy to build confidence in yourself? Why or why not?",
  },
];

// Define a prompt template for asking questions and analyzing responses
const questionPromptTemplate = new PromptTemplate({
  inputVariables: ["question"],
  template: `
You are conducting a psychological test. Ask the following question to the user:
{{question}}
`,
});

const analysisPromptTemplate = new PromptTemplate({
  inputVariables: ["responses"],
  template: `
You are a psychologist analyzing user responses to a psychological test. Here are the user's answers:
{{responses}}

Based on these answers, provide:
1. A score for anxiety level (scale of 1-5).
2. A score for depression level (scale of 1-5).
3. A score for self-esteem (scale of 1-5).
4. A brief feedback summary and recommendations.
`,
});

// Conduct the Psychological Test
async function conductPsychologicalTest() {
  const chain = new ConversationChain({ llm: chat });

  let userResponses = {};

  // Ask each question sequentially and collect responses
  for (const question of questions) {
    const prompt = await questionPromptTemplate.format({
      question: question.text,
    });
    const response = await chain.call({ input: prompt });
    console.log(`Question: ${question.text}`);
    console.log(`User Response: ${response.response}`);
    userResponses[question.id] = response.response;
  }

  // Analyze Responses
  const analysisPrompt = await analysisPromptTemplate.format({
    responses: JSON.stringify(userResponses),
  });

  const analysisResponse = await chain.call({ input: analysisPrompt });

  console.log("Analysis Response:", analysisResponse.response);

  // Parse and return results
  return {
    testResults: JSON.parse(analysisResponse.response.testResults), // Anxiety, Depression, Self-Esteem Scores
    feedback: analysisResponse.response.feedback, // Feedback Summary
  };
}

// Run the Test
(async () => {
  const results = await conductPsychologicalTest();

  console.log("Final Results:", JSON.stringify(results, null, 2));
})();
