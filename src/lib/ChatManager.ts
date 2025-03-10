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
  private llm: ChatOpenAI;
  private isLoading: boolean = false;
  private chatPromptTemplate?: ChatPromptTemplate;
  private model: string;
  private unsubscribe: (() => void) | null = null;
  public template?: IPromptTemplate;
  public messages: BaseMessage[] = [];

  // Constructor called by Chat component
  constructor() {
    this.model = appState.get().selectedModel || DEFAULT_MODEL;
    this.llm = new ChatOpenAI({
      temperature: 0.7,
      configuration: {
        fetch: this.proxyFetchHandler,
      },
      model: this.model,
      apiKey: "none",
    });

    // Initialize with default system message
    this.messages = [new SystemMessage(DEFAULT_SYSTEM_MESSAGE)];

    // Setup state subscription
    this.setupStateSubscription();

    // Call async init
    this.init(appState.get().selectedTemplate || undefined);
  }

  private setupStateSubscription() {
    this.unsubscribe = appState.subscribe((state) => {
      // Only update model if it's different and not already being updated
      if (
        state.selectedModel &&
        state.selectedModel !== this.model &&
        state.selectedModel !== appState.get().currentChat?.model
      ) {
        this.updateModel(state.selectedModel);
      }
      // Only update template if it's different and not already being updated
      if (
        state.selectedTemplate &&
        state.selectedTemplate.id !== this.template?.id
      ) {
        this.init(state.selectedTemplate);
      }
    });
  }

  public async init(template?: IPromptTemplate) {
    try {
      await this.restoreState();
      let currentChat = appState.get().currentChat;
      const storedTemplateId = currentChat?.template?.id;
      // template has changed
      if (currentChat?.template && !template) {
        await this.setTemplate(currentChat.template);
      } else {
        if (template) {
          await this.setTemplate(template);
        }
      }

      this.messages.map((msg) => {
        const type = msg._getType();
        if (type === "human") {
          // console.log("Human: ", msg.content);
        } else if (type === "ai") {
          // console.log("AI: ", msg.content);
        } else {
          // console.log("System: ", msg.content);
        }
      });

      await this.saveState();
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
        template.template || "",
      );
      this.chatPromptTemplate = ChatPromptTemplate.fromMessages([
        systemTemplate,
        humanTemplate,
      ]);
      // todo: Get required variables from the template
      const requiredVariables = this.chatPromptTemplate.inputVariables;
      if (requiredVariables.length > 0) {
        console.warn(
          `Template requires variables: ${requiredVariables.join(", ")}`,
        );
      }

      // Create new messages array with system message and description
      const systemMessage = new SystemMessage(
        template.systemPrompt || DEFAULT_SYSTEM_MESSAGE,
      );
      this.replaceSystemMessage(systemMessage);
      const messages: BaseMessage[] = [systemMessage];

      if (template.description) {
        const descriptionMessage = new AIMessage(template.description);
        descriptionMessage.name = "description";
        // Check if the description message already exists in this.messages
        const descriptionExists = this.messages.some(
          (msg) =>
            msg._getType() === "ai" && msg.content === template.description,
        );
        if (!descriptionExists) {
          messages.push(descriptionMessage);
        }
      }
      this.messages = [...this.messages, ...messages];
      // this.messages = messages;

      // Update app state
      // appState.setKey("selectedTemplate", template);
      // appState.setKey("selectedTemplateId", template.id);

      this.saveState();

      return this.messages;
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
    if (!savedChat) return;
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
      messages: this.messages.map((msg: BaseMessage) => {
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

  async clearMessages() {
    appState.setKey("currentChat", undefined);
    this.messages = [];
    if (this.template) {
      await this.init(this.template);
      console.info("Clearing template chat", this.messages);
      return;
    }
    this.messages = [new SystemMessage(DEFAULT_SYSTEM_MESSAGE)];
    await this.init();
    return;
  }

  /**
   * Replaces all system messages with a new system message
   * @param systemMessage - The new system message to inject
   */
  public replaceSystemMessage(systemMessage?: SystemMessage) {
    // Remove all existing system messages
    this.messages = this.messages.filter((msg) => msg._getType() !== "system");
    // Insert the new system message at the beginning
    if (systemMessage) {
      this.messages.unshift(systemMessage);
    }
    // Save the state
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
