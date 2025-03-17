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
} from "@langchain/core/messages";
import type { Message } from "@lib/ai/types";
import { appService } from "@lib/appService.ts";
import { type ChatState, type IPromptTemplate } from "@lib/ai/types";
import { appState, openRouterModels } from "@lib/appStore";
import {
  DEFAULT_MODEL,
  DEFAULT_MODEL_FREE,
  DEFAULT_SYSTEM_MESSAGE,
} from "@consts";
import { DEFAULT_TEMPLATE, DEFAULT_TEMPLATE_ID } from "@lib/ai/prompt-template";
import { ChatParser } from "./ChatParser";
import { proxyFetchHandler } from "@lib/ai/utils";
import { defaultLLMConfig } from "@lib/ai/llm";

class ChatManager {
  private static instance: ChatManager;
  private llm: ChatOpenAI;
  private parser: ChatParser;
  private isLoading: boolean = false;
  private chatPromptTemplate?: ChatPromptTemplate;
  private model: string;
  private unsubscribe: (() => void) | null = null;
  public template?: IPromptTemplate;
  public messages: Message[] = [];
  public llmConfig: ChatOpenAI = defaultLLMConfig;

  private constructor() {
    this.parser = new ChatParser();
    // Register any custom processors needed
    this.parser.registerCodeProcessor();
    this.parser.registerDocumentationTemplateProcessor();

    let defaultModel = DEFAULT_MODEL;
    if (appState.get().environment === "production") {
      defaultModel = DEFAULT_MODEL_FREE;
    }

    this.model = appState.get().selectedModel || defaultModel;
    // initialize llm
    // this.llm = new ChatOpenAI(defaultLLMConstructorParams);
    const config = { ...defaultLLMConfig, model: this.model };
    console.log("config", config);
    this.llm = new ChatOpenAI(config);
    // this.llm = new ChatOpenAI({
    //   temperature: 0.7,
    //   configuration: {
    //     fetch: proxyFetchHandler,
    //   },
    //   model: this.model,
    //   apiKey: "NONE",
    // });
    this.setupStateSubscription();
    this.restoreState();
    console.log("ChatManager initialized");
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
    // console.log("init", template);
    await this.restoreState();
    if (template) {
      await this.setTemplate(template);
    } else {
      console.log("No templateId provided, using default template");
      appState.setKey("selectedTemplateId", DEFAULT_TEMPLATE_ID);
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
    // Early return if running on server
    if (typeof window === "undefined") return;

    if (!templateId) {
      templateId = DEFAULT_TEMPLATE_ID;
    }
    await this.clearMessages();
    this.cleanupSubscriptions();
    appState.setKey("currentChat", undefined);
    // define template
    let template: IPromptTemplate = undefined;
    if (templateId) {
      try {
        if (templateId === DEFAULT_TEMPLATE_ID) {
          template = DEFAULT_TEMPLATE;
        } else {
          const baseUrl = appState.get().apiBaseUrl;
          // Fix URL construction
          let fetchUrl = new URL(
            appState.get().apiBaseUrl + `/prompts/${templateId}.json`,
            baseUrl,
          ).toString();
          console.log(fetchUrl);
          const response = await fetch(fetchUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch template: ${response.statusText}`);
          }
          template = await response.json();
        }
        const chatState: Partial<ChatState> = {
          messages: this.messages,
          metadata: {
            templateId: template.id,
            template: template,
            topic: template.name || "",
            model: this.model,
          },
        };
        appState.setKey("currentChat", chatState);
        appState.setKey("selectedTemplate", template);
        appState.setKey("selectedTemplateId", template.id);
        await this.init(template);
        return;
      } catch (error) {
        console.error("Error in newChat:", error);
        // Fall through to default initialization
        await this.init();
      }
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

  private async saveState() {
    const serializedMessages = this.messages.map((msg) => {
      return { ...msg, ...{ role: msg.getType() } };
    });
    let topic = "Chat template: " + this.template?.name;
    if (serializedMessages.length > 2)
      topic =
        "Topic: " + serializedMessages[1]?.content.slice(0, 120 - 3) + "...";
    const chatState: Partial<ChatState> = {
      messages: serializedMessages,
      metadata: {
        topic,
        model: this.model,
        templateId: this.template?.id,
        template: this.template,
      },
    };
    // POST or PUT to db
    const currentChat = appState.get().currentChat;
    const method = currentChat?.id ? "PUT" : "POST";
    let url = `${appState.get().apiBaseUrl}/sessions/index.json`;
    if (method === "PUT") url = url.replace("index", currentChat.id);
    if (this.messages.length > 2) {
      // console.log("method", method);
      try {
        const response = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(chatState),
        });

        if (!response.ok) {
          throw new Error("Failed to update chat session");
        }

        const updatedSession = await response.json();
        appState.setKey("currentChat", updatedSession);
      } catch (error) {
        console.error("Error saving chat state:", error);
        // Still update local state even if server update fails
        appState.setKey("currentChat", chatState);
      }
    } else {
      // No existing session ID, just update local state
      appState.setKey("currentChat", chatState);
    }
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
          // this.saveState();
        }
      }
      return response;
    } catch (error) {
      console.error("Error in chat:", error);
      this.messages.pop();
      throw error;
    } finally {
      this.saveState();
      this.isLoading = false;
    }
  }

  private updateModel(newModel: string) {
    this.model = newModel;
    this.llmConfig = { ...this.llmConfig, model: newModel };

    this.llm = new ChatOpenAI(this.llmConfig);
    console.log("Updated model to: " + newModel);
    this.saveState();
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

  public cleanupSubscriptions() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
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

  public static getInstance(): ChatManager {
    if (!ChatManager.instance) {
      ChatManager.instance = new ChatManager();
    }
    return ChatManager.instance;
  }
}

export const chatManager = ChatManager.getInstance();
