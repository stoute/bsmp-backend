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
import { appState, type ChatState } from "@lib/appStore";

export class ChatManager {
  private messages: BaseMessage[] = [];
  private llm: ChatOpenAI;
  private isLoading: boolean = false;
  public template?: IPromptTemplate;
  public chatPromptTemplate?: ChatPromptTemplate;
  private model: string;

  constructor(
    model: string = "openai/gpt-3.5-turbo",
    template?: IPromptTemplate,
    isRestoring: boolean = false,
  ) {
    this.model = model;
    this.llm = new ChatOpenAI({
      temperature: 0.7,
      configuration: {
        dangerouslyAllowBrowser: true,
        fetch: this.proxyFetchHandler,
      },
      model: model,
      apiKey: "none",
    });

    // Initialize with default system message
    this.messages = [new SystemMessage("You are a helpful assistant.")];

    // Call async init
    this.init(template, isRestoring);
  }

  private async init(template?: IPromptTemplate, isRestoring: boolean = false) {
    try {
      if (template && !isRestoring) {
        await this.setTemplate(template);
        await this.llm.invoke(this.messages);
      } else if (isRestoring) {
        const savedChat = appState.get().currentChat;
        if (savedChat?.template) {
          this.template = savedChat.template;
        }
        if (savedChat?.messages && Array.isArray(savedChat.messages)) {
          const restoredMessages = savedChat.messages
            .filter((msg) => msg && msg.role && msg.content) // Ensure valid messages
            .map((msg) => {
              console.log(msg.role);
              switch (msg.role) {
                case "system":
                  return new SystemMessage(msg.content);
                case "assistant":
                  return new AIMessage(msg.content);
                case "human":
                  return new HumanMessage(msg.content);
                default:
                  console.warn(
                    `Unknown message role: ${msg.role}, defaulting to human`,
                  );
                  return new HumanMessage(msg.content);
              }
            });

          if (restoredMessages.length > 0) {
            this.messages = restoredMessages;
          }
        }
      }
    } catch (error) {
      console.error("Error during initialization:", error);
      // Fallback to default system message
      this.messages = [new SystemMessage("You are a helpful assistant.")];
    }
  }

  private saveState() {
    const chatState: ChatState = {
      model: this.model,
      templateId: this.template?.id,
      template: this.template,
      messages: this.messages.map((msg) => ({
        role: msg._getType(),
        content: msg.content,
      })),
    };
    appState.setKey("currentChat", chatState);
  }

  async setTemplate(template: IPromptTemplate) {
    try {
      if (!template) {
        throw new Error("Template is required");
      }

      this.template = template;
      const systemTemplate = SystemMessagePromptTemplate.fromTemplate(
        template.systemPrompt || "You are a helpful assistant.",
      );
      const humanTemplate = HumanMessagePromptTemplate.fromTemplate(
        template.template || "{input}",
      );

      this.chatPromptTemplate = ChatPromptTemplate.fromMessages([
        systemTemplate,
        humanTemplate,
      ]);

      // Get required variables from the template
      const requiredVariables = this.chatPromptTemplate.inputVariables;
      if (requiredVariables.length > 0) {
        console.warn(
          `Template requires variables: ${requiredVariables.join(", ")}`,
        );
      }

      // Reset messages with new system prompt
      this.messages = [
        new SystemMessage(
          template.systemPrompt || "You are a helpful assistant.",
        ),
      ];
      if (template.description) {
        this.messages.push(new AIMessage(template.description));
      }
    } catch (error) {
      console.error("Error setting template:", error);
      // Fallback to default system message
      this.messages = [new SystemMessage("You are a helpful assistant.")];
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

      const validMessages = this.messages.filter(
        (msg) => msg && msg.content && typeof msg.content === "string",
      );

      if (validMessages.length === 0) {
        throw new Error("No valid messages to process");
      }

      const response = await this.llm.invoke(validMessages);
      if (response) {
        this.messages.push(response);
        this.saveState();
      }

      return response;
    } catch (error) {
      console.error("Error in chat:", error);
      this.messages.pop();
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  getMessages(): BaseMessage[] {
    return this.messages;
  }

  setMessages(messages: BaseMessage[]) {
    this.messages = messages;
    this.saveState();
  }

  clearMessages(systemPrompt: string) {
    this.messages = [new SystemMessage(systemPrompt)];
    this.saveState();
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
