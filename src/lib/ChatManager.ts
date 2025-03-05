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

export class ChatManager {
  private messages: BaseMessage[] = [];
  private llm: ChatOpenAI;
  private isLoading: boolean = false;
  public template?: IPromptTemplate;
  public chatPromptTemplate?: ChatPromptTemplate;

  constructor(
    model: string = "openai/gpt-3.5-turbo",
    template: IPromptTemplate,
  ) {
    this.llm = new ChatOpenAI({
      temperature: 0.7,
      configuration: {
        dangerouslyAllowBrowser: true,
        fetch: this.proxyFetchHandler,
      },
      model: model,
      apiKey: "none",
    });
    if (template) {
      // todo: remove?
      this.messages = [new SystemMessage(template.systemPrompt)];
      this.setTemplate(template);
    }
  }

  async setTemplate(template: IPromptTemplate) {
    try {
      const systemTemplate = SystemMessagePromptTemplate.fromTemplate(
        template.systemPrompt || "",
      );
      const humanTemplate = HumanMessagePromptTemplate.fromTemplate(
        template.template,
      );

      this.chatPromptTemplate = ChatPromptTemplate.fromMessages([
        systemTemplate,
        humanTemplate,
      ]);

      // Get required variables from the template
      const requiredVariables = this.chatPromptTemplate.inputVariables;
      if (requiredVariables.length > 0) {
        throw new Error(
          `Template requires variables: ${requiredVariables.join(", ")}`,
        );
      }

      // Reset messages with new system prompt
      this.messages = [new SystemMessage(template.systemPrompt || "")];

      return { ...template, chatPrompt: this.chatPromptTemplate };
    } catch (error) {
      console.error("Error setting template:", error);
      throw error;
    }
  }

  async sendMessage(input: string, variables?: Record<string, string>) {
    if (!input.trim()) return null;

    this.isLoading = true;
    try {
      let processedInput = input;

      if (this.chatPromptTemplate && variables) {
        const formatted = await this.chatPromptTemplate.formatMessages({
          input,
          ...variables,
        });
        processedInput = formatted[formatted.length - 1].content;
      }

      const userMessage = new HumanMessage(processedInput);
      this.messages.push(userMessage);

      const response = await this.llm.invoke(this.messages);
      this.messages.push(response);

      return response;
    } catch (error) {
      console.error("Error in chat:", error);
      this.messages.pop(); // Remove failed message
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  getMessages(): BaseMessage[] {
    return this.messages;
  }

  clearMessages(systemPrompt: string) {
    this.messages = [new SystemMessage(systemPrompt)];
  }

  getLLM(): ChatOpenAI {
    return this.llm;
  }

  isProcessing(): boolean {
    return this.isLoading;
  }

  private proxyFetchHandler = async (url: string, options: any) => {
    const urlObj = new URL(url);
    const endpoint = urlObj.pathname.split("/v1/")[1];

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
}

// Keep parseTemplate for backward compatibility
// export async function parseTemplate(
//   template: IPromptTemplate,
//   llm: ChatOpenAI,
// ): Promise<IPromptTemplate> {
//   const chatManager = new ChatManager();
//   return chatManager.setTemplate(template);
// }
