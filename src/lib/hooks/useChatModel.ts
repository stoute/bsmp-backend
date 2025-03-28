import { ChatOpenAI } from "@langchain/openai";
import { proxyFetchHandler } from "@lib/ai/utils";

export function useChatModel(model: string = "openai/gpt-3.5-turbo") {
  const chatModel = new ChatOpenAI({
    temperature: 0.7,
    configuration: {
      dangerouslyAllowBrowser: true,
      fetch: proxyFetchHandler,
    },
    model: model,
    apiKey: "none",
  });

  return chatModel;
}
