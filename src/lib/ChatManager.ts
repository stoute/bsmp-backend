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
import type { Message } from "@lib/ai/types";
import { appService } from "@lib/appService.ts";
import { appState, openRouterModels, type ChatState } from "@lib/appStore";
import {
  DEFAULT_MODEL,
  DEFAULT_MODEL_FREE,
  DEFAULT_SYSTEM_MESSAGE,
  DEFAULT_TEMPLATE_ID,
} from "@consts";
import { ChatParser } from "./ChatParser";

class ChatManager {
  private static instance: ChatManager;
  private llm: ChatOpenAI;
  private isLoading: boolean = false;
  private chatPromptTemplate?: ChatPromptTemplate;
  private model: string;
  private unsubscribe: (() => void) | null = null;
  public template?: IPromptTemplate;
  public messages: Message[] = [];
  private parser: ChatParser;

  private constructor() {
    this.parser = new ChatParser();
    // Register any custom processors needed
    this.parser.registerCodeProcessor();
    this.parser.registerDocumentationTemplateProcessor();

    let defaultModel = DEFAULT_MODEL;
    if (appService.state.environment === "production") {
      defaultModel = DEFAULT_MODEL_FREE;
    }

    this.model = appState.get().selectedModel || defaultModel;
    this.llm = new ChatOpenAI({
      temperature: 0.7,
      configuration: {
        fetch: this.proxyFetchHandler,
      },
      model: this.model,
      apiKey: "none",
    });
    this.setupStateSubscription();
    this.restoreState();
    if (appState.get().currentChat) {
      this.init(appState.get().currentChat?.template || undefined);
    } else {
      this.newChat(DEFAULT_TEMPLATE_ID);
    }
  }

  private setupStateSubscription() {
    this.unsubscribe = appState.subscribe((state) => {
      // Only update model if it's different and not already being updated
      if (
        state.selectedModel &&
        state.selectedModel !== this.model &&
        state.selectedModel !== appState.get().currentChat?.metadata.model
      ) {
        this.updateModel(state.selectedModel);
      }
    });
  }

  public async init(template?: IPromptTemplate) {
    try {
      await this.restoreState();
      if (
        template &&
        appState.get().currentChat?.template?.id !== template.id
      ) {
        await this.setTemplate(template);
      }
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
      // todo:Process the template
      const processedTemplate = this.parser.processTemplate(template);
      this.template = processedTemplate;

      // Create chat prompt template
      this.chatPromptTemplate =
        this.parser.createChatPromptTemplate(processedTemplate);

      // Process messages
      this.cleanupSubscriptions();
      this.setupStateSubscription();
      const systemMessage = new SystemMessage(
        processedTemplate.systemPrompt || DEFAULT_SYSTEM_MESSAGE,
      );
      this.replaceSystemMessage(systemMessage);
      let messages: Message[] = [systemMessage];

      // custom description message
      if (processedTemplate.description) {
        const descriptionMessage = new AIMessage({
          content: processedTemplate.description,
          id: "template-description",
          additional_kwargs: {
            template,
          },
        });
        descriptionMessage.getType = () => "template-description";

        messages.push(descriptionMessage);
      }
      // todo:Process and filter messages
      this.messages = this.parser.processMessages(messages, template.id);
      this.saveState();
      return this.messages;
    } catch (error) {
      console.error("Error setting template:", error);
      this.messages = [new SystemMessage(DEFAULT_SYSTEM_MESSAGE)];
      this.saveState();
      throw error;
    }
  }

  async newChat(templateId?: string) {
    await this.clearMessages();
    this.cleanupSubscriptions();
    appState.setKey("currentChat", undefined);
    if (templateId) {
      const response = await fetch(
        `${appState.get().apiBaseUrl}/prompts/${templateId}.json`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch template");
      }
      const template: IPromptTemplate = await response.json();
      appState.setKey("selectedTemplate", template);
      appState.setKey("selectedTemplateId", template.id);
      await this.init(template);
    }
    // Initialize with default system message
    appState.setKey("selectedTemplateId", DEFAULT_TEMPLATE_ID);
    this.messages = [new SystemMessage(DEFAULT_SYSTEM_MESSAGE)];
    await this.init();
  }

  private updateModel(newModel: string) {
    this.model = newModel;
    this.llm = new ChatOpenAI({
      temperature: 0.7,
      configuration: {
        fetch: this.proxyFetchHandler,
      },
      model: newModel,
      apiKey: "none",
    });
    appService.debug("Updated model to: " + newModel);
    this.saveState();
  }

  public cleanupSubscriptions() {
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
      const restoredMessages = savedChat.messages;
      if (restoredMessages.length > 0) {
        restoredMessages.forEach((msg: Message) => {
          // @ts-ignore
          msg.getType = () => msg.role;
        });
        this.messages = restoredMessages;
      }
    }
  }

  private saveState() {
    const serializedMessages = this.messages.map((msg) => {
      return { ...msg, ...{ role: msg.getType() } };
    });
    let topic = "Chat template: " + this.template?.name;
    if (serializedMessages.length > 2)
      topic =
        "Topic: " + serializedMessages[1]?.content.slice(0, 120 - 3) + "...";
    const chatState: ChatState = {
      model: this.model,
      templateId: this.template?.id,
      template: this.template,
      messages: serializedMessages,
      metadata: {
        templateId: this.template?.id,
        template: this.template,
        topic,
        model: this.model,
      },
    };
    appState.setKey("currentChat", chatState);
  }

  async sendMessage(input: string, variables?: Record<string, string>) {
    if (!input.trim()) return null;

    this.isLoading = true;
    try {
      let processedInput = input;
      const userMessage = new HumanMessage(processedInput);

      const processedMessage = this.parser.processMessage(
        userMessage,
        this.template?.id,
      );

      if (!processedMessage) {
        throw new Error("Message was filtered out by parser");
      }

      this.messages.push(processedMessage);

      // Filter out template-description messages before sending to LLM
      const validMessages = this.messages.filter((msg) => {
        const type = msg.getType();
        return type !== "template-description";
      });

      if (validMessages.length === 0) {
        throw new Error("No valid messages to process");
      }

      const response = await this.llm.invoke(validMessages);
      if (response) {
        const processedResponse = this.parser.processMessage(
          response,
          this.template?.id,
        );
        if (processedResponse) {
          this.messages.push(processedResponse);
          this.saveState();
        }
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

  getMessages(): Message[] {
    return this.messages;
  }

  setMessages(messages: Message[]) {
    this.messages = messages;
    this.saveState();
  }

  async clearMessages() {
    this.messages = [];
    await this.saveState();
  }

  /**
   * Replaces all system messages with a new system message
   * @param systemMessage - The new system message to inject
   */
  public replaceSystemMessage(systemMessage?: SystemMessage) {
    // Remove all existing system messages
    this.messages = this.messages.filter((msg) => msg.getType() !== "system");
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

  public static getInstance(): ChatManager {
    if (!ChatManager.instance) {
      ChatManager.instance = new ChatManager();
    }
    return ChatManager.instance;
  }
}

export const chatManager = ChatManager.getInstance();
