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
import { DEFAULT_MODEL, DEFAULT_SYSTEM_MESSAGE } from "@consts";

export class ChatManager {
  private messages: BaseMessage[] = [];
  private llm: ChatOpenAI;
  private isLoading: boolean = false;
  public template?: IPromptTemplate;
  public chatPromptTemplate?: ChatPromptTemplate;
  private model: string;
  private unsubscribe: (() => void) | null = null;

  // Constructor called by Chat component
  constructor(model: string = DEFAULT_MODEL, template?: IPromptTemplate) {
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
    this.messages = [new SystemMessage(DEFAULT_SYSTEM_MESSAGE)];

    // Subscribe to appState model changes
    this.unsubscribe = appState.subscribe((state) => {
      if (state.selectedModel && state.selectedModel !== this.model) {
        this.updateModel(state.selectedModel);
      }
      if (state.selectedTemplate && state.selectedTemplate !== this.template) {
        this.init(state.selectedTemplate);
      }
    });

    // Call async init
    this.init(template);
  }

  public async init(template?: IPromptTemplate) {
    try {
      await this.restoreState();
      const currentChat = appState.get().currentChat;
      const storedTemplateId = currentChat?.template?.id;
      if (template && template.id !== storedTemplateId) {
        // Set template and invoke LLM
        appState.setKey("currentChat", { ...currentChat, template });
        appState.setKey("selectedTemplateId", template.id);
        await this.setTemplate(template);
      }
      this.messages.map((msg) => {
        const type = msg._getType();
        if (type === "human") {
          // console.log("Human: ", msg.content);
        } else if (type === "ai") {
          // console.log("AI: ", msg.content);
        } else {
          console.log("System: ", msg.content);
        }
      });
      // todo: is this needed?
      // await this.llm.invoke(this.messages);
    } catch (error) {
      console.error("Error during initialization:", error);
      // Fallback to default system message
      this.messages = [new SystemMessage(DEFAULT_SYSTEM_MESSAGE)];
    }
  }

  async setTemplate(template: IPromptTemplate) {
    try {
      if (!template) {
        throw new Error("Template is required");
      }
      this.template = template;
      const systemTemplate = SystemMessagePromptTemplate.fromTemplate(
        template.systemPrompt || DEFAULT_SYSTEM_MESSAGE,
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
        new SystemMessage(template.systemPrompt || DEFAULT_SYSTEM_MESSAGE),
      ];
      if (template.description) {
        this.messages.push(new AIMessage(template.description));
      }

      // Save state after setting messages
      this.saveState();

      // Invoke LLM with new messages
      // await this.llm.invoke(this.messages);

      // Save state again after LLM response
      // this.saveState();
    } catch (error) {
      console.error("Error setting template:", error);
      // Fallback to default system message
      this.messages = [new SystemMessage(DEFAULT_SYSTEM_MESSAGE)];
      this.saveState();
      throw error;
    }
  }

  private updateModel(newModel: string) {
    this.model = newModel;
    this.llm = new ChatOpenAI({
      temperature: 0.7,
      configuration: {
        dangerouslyAllowBrowser: true,
        fetch: this.proxyFetchHandler,
      },
      model: newModel,
      apiKey: "none",
    });
    this.saveState();
  }
  // Add cleanup method
  public cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  private async restoreState() {
    const savedChat = appState.get().currentChat;
    appState.setKey("selectedModel", savedChat.model);
    if (savedChat?.template) {
      appState.setKey("selectedTemplateId", savedChat.template.id);
      this.template = savedChat.template;
    }
    if (savedChat?.messages && Array.isArray(savedChat.messages)) {
      const restoredMessages = savedChat.messages
        .filter((msg) => msg && msg.role && msg.content) // Ensure valid messages
        .map((msg) => {
          switch (msg.role.toLowerCase()) {
            case "system":
              return new SystemMessage(msg.content);
            case "assistant":
            case "ai":
              return new AIMessage(msg.content);
            case "human":
            case "user":
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

  private saveState() {
    const chatState: ChatState = {
      model: this.model,
      templateId: this.template?.id,
      template: this.template,
      messages: this.messages.map((msg) => {
        // Map _getType() values to consistent role names
        let role: string;
        switch (msg._getType()) {
          case "ai":
            role = "assistant";
            break;
          case "human":
            role = "human";
            break;
          case "system":
            role = "system";
            break;
          default:
            role = "human";
        }
        return {
          role,
          content: msg.content,
        };
      }),
    };
    appState.setKey("currentChat", chatState);
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
