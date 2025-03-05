import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import type { IPromptTemplate } from "@types";

export async function parseTemplate(
  template: IPromptTemplate,
  llm: ChatOpenAI,
): Promise<IPromptTemplate> {
  try {
    // Create LangChain prompt templates
    const systemTemplate = SystemMessagePromptTemplate.fromTemplate(
      template.systemPrompt || "",
    );
    const humanTemplate = HumanMessagePromptTemplate.fromTemplate(
      template.template,
    );

    // Combine into a chat prompt template
    const chatPrompt = ChatPromptTemplate.fromMessages([
      systemTemplate,
      humanTemplate,
    ]);

    // Here you can add your chain logic to manipulate the template
    // For example:
    // const chain = new LLMChain({
    //   llm: llm,
    //   prompt: chatPrompt,
    // });

    // For now, we'll just return the original template
    // You can modify this based on your specific needs
    // return template;

    return chatPrompt;
  } catch (error) {
    console.error("Error parsing template:", error);
    return template;
  }
}
