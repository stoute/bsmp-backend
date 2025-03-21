import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { Message } from "@lib/ai/types";
import { appService } from "@lib/appService.ts";
import { appState, openRouterModels } from "@lib/appStore";
import {
  DEFAULT_MODEL,
  DEFAULT_MODEL_FREE,
  DEFAULT_SYSTEM_MESSAGE,
} from "@consts";
import {
  DEFAULT_TEMPLATE_ID,
  PRESET_TEMPLATES,
} from "@lib/ai/prompt-templates/constants.ts";
import { chatMessageParser } from "@lib/ChatMessageParser";
import { promptTemplateParser } from "@lib/PromptTemplateParser";
import { defaultLLMConfig } from "@lib/ai/llm";
import type { ChatSessionModel, PromptTemplateModel } from "@db/models";

class ChatManager {
  private static instance: ChatManager;
  private llm: ChatOpenAI;
  private isLoading: boolean = false;
  private chatPromptTemplate?: ChatPromptTemplate;
  private model: string;
  private unsubscribe: (() => void) | null = null;
  public template?: PromptTemplateModel;
  public messages: Message[] = [];
  public llmConfig: ChatOpenAI = defaultLLMConfig;

  private constructor() {
    promptTemplateParser.chatManager = this;
    // Register any custom processors needed
    chatMessageParser.registerCodeProcessor();
    promptTemplateParser.registerDocumentationTemplateProcessor();

    let defaultModel = DEFAULT_MODEL;
    if (appState.get().environment === "production") {
      defaultModel = DEFAULT_MODEL_FREE;
    }

    this.model = appState.get().selectedModel || defaultModel;
    // initialize llm
    this.setLLM({ ...defaultLLMConfig, model: this.model });
    this.setupStateSubscription();
    this.restoreState();
    if (!appState.get().currentUser) {
      this.newChat(DEFAULT_TEMPLATE_ID);
    }
    console.log("ChatManager initialized");
  }

  public async init(template?: PromptTemplateModel) {
    await this.restoreState();
    if (template) {
      await this.setTemplate(template);
    } else {
      appState.setKey("selectedTemplateId", DEFAULT_TEMPLATE_ID);
      this.messages = [new SystemMessage(DEFAULT_SYSTEM_MESSAGE)];
    }
  }

  public async setLLM(config: ChatOpenAI) {
    this.llmConfig = config;
    this.llm = new ChatOpenAI(this.llmConfig);
    promptTemplateParser.llm = this.llm;
  }

  public getLLM(): ChatOpenAI {
    return this.llm;
  }

  async setTemplate(template: PromptTemplateModel) {
    try {
      if (!template) {
        throw new Error("Template is required");
      }
      // Process the template
      const processedTemplate = promptTemplateParser.processTemplate(template);
      this.template = processedTemplate;
      this.chatPromptTemplate =
        promptTemplateParser.createChatPromptTemplate(processedTemplate);
      // Process the messages
      this.messages = chatMessageParser.processMessages(
        this.messages,
        template.id,
      );
      // Update the state
      this.cleanupSubscriptions();
      this.setupStateSubscription();
      this.saveState();
      return this.messages;
    } catch (error) {
      console.error("Error setting template:", error);
      this.messages = [new SystemMessage(DEFAULT_SYSTEM_MESSAGE)];
      this.saveState();
      throw error;
    }
  }

  async handleUserInput(input: string) {
    if (!input || this.isLoading) return;

    this.isLoading = true;
    try {
      // Process the input
      let processedInput = input;
      const userMessage = new HumanMessage(processedInput);
      const processedMessage = chatMessageParser.processMessage(
        userMessage,
        this.template?.id,
      );
      if (!processedMessage) {
        throw new Error("Message was filtered out by parser");
      }
      this.messages.push(processedMessage);

      // Filter out custom template messages before sending to LLM
      const validMessages = this.messages.filter((msg) => {
        const type = msg.getType();
        return type !== "template-description";
      });

      if (validMessages.length === 0) {
        throw new Error("No valid messages to process");
      }
      // Invoke the LLM
      const response = await this.llm.invoke(validMessages);
      if (response) {
        const processedResponse = chatMessageParser.processMessage(
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
    let template: PromptTemplateModel = undefined;
    if (templateId) {
      try {
        Object.values(PRESET_TEMPLATES).forEach((presetTemplate) => {
          if (presetTemplate.id === templateId) {
            template = { ...presetTemplate, llmConfig: this.llmConfig };
          }
        });
        if (!template) {
          const baseUrl = appState.get().apiBaseUrl;
          let fetchUrl = new URL(
            `api/prompts/${templateId}.json`,
            baseUrl,
          ).toString();
          console.log(fetchUrl);
          const response = await fetch(fetchUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch template: ${response.statusText}`);
          }
          template = await response.json();
        }
        const chatState: Partial<ChatSessionModel> = {
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

    // Check if we have a model in the saved chat metadata
    if (savedChat.metadata && savedChat.metadata.model) {
      this.model = savedChat.metadata.model;
      appState.setKey("selectedModel", savedChat.metadata.model);
    } else if (appState.get().selectedModel) {
      // If no model in saved chat but we have one in appState, use that
      this.model = appState.get().selectedModel;
    }

    if (savedChat?.metadata?.template) {
      appState.setKey("selectedTemplateId", savedChat.metadata.template.id);
      this.template = savedChat.metadata.template;
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
    const chatState: Partial<ChatSessionModel> = {
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
      try {
        const response = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(chatState),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to update chat session: ${response.status} ${response.statusText}`,
          );
        }

        // Check if response has content before parsing
        const text = await response.text();
        if (!text) {
          console.warn("Empty response received from server");
          appState.setKey("currentChat", chatState);
          return;
        }

        try {
          const updatedSession = JSON.parse(text);
          appState.setKey("currentChat", updatedSession);
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          console.warn("Response text:", text);
          // Still update local state even if parsing fails
          appState.setKey("currentChat", chatState);
        }
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

  private updateModel(newModel: string) {
    this.model = newModel;
    this.setLLM({ ...this.llmConfig, model: newModel });
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
