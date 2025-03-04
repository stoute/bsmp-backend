import { ChatOpenAI } from "@langchain/openai";

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

const proxyFetchHandler = async (url: string, options: any) => {
  const urlObj = new URL(url);
  const endpoint = urlObj.pathname.split("/v1/")[1];

  // Forward to our proxy with the necessary data
  const response: Response = await fetch("/api/ai-proxy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      endpoint,
      data: JSON.parse(options.body),
    }),
  });

  return response;
};
