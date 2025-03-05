import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
  BaseMessage,
} from "@langchain/core/messages";
import type { IPromptTemplate } from "@types";

export class ChatSessionManager {
  private messages: BaseMessage[];
  private llm: ChatOpenAI;
  private template?: IPromptTemplate;

  constructor(
    llm: ChatOpenAI,
    systemPrompt: string,
    template?: IPromptTemplate,
  ) {
    this.llm = llm;
    this.messages = [new SystemMessage(systemPrompt)];
    this.template = template;
  }

  async sendMessage(input: string): Promise<AIMessage> {
    const userMessage = new HumanMessage(input);
    this.messages.push(userMessage);

    try {
      const response = await this.llm.invoke(this.messages);
      this.messages.push(response);
      return response;
    } catch (error) {
      console.error("Error in chat session:", error);
      const errorMessage = new AIMessage("Sorry, I encountered an error.");
      this.messages.push(errorMessage);
      return errorMessage;
    }
  }

  getMessages(): BaseMessage[] {
    return this.messages;
  }

  clearMessages(systemPrompt: string) {
    this.messages = [new SystemMessage(systemPrompt)];
  }
}

export async function parseTemplate(
  template: IPromptTemplate,
  llm: ChatOpenAI,
): Promise<IPromptTemplate> {
  try {
    const systemTemplate = SystemMessagePromptTemplate.fromTemplate(
      template.systemPrompt || "",
    );
    const humanTemplate = HumanMessagePromptTemplate.fromTemplate(
      template.template,
    );

    const chatPrompt = ChatPromptTemplate.fromMessages([
      systemTemplate,
      humanTemplate,
    ]);

    return {
      ...template,
      chatPrompt,
    };
  } catch (error) {
    console.error("Error parsing template:", error);
    return template;
  }
}
