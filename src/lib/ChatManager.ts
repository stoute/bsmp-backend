import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
  BaseMessage,
} from "@langchain/core/messages";
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
} from "@lib/prompt-template/constants.ts";
import { chatMessageParser } from "@lib/ChatMessageParser";
import { promptTemplateParser } from "@lib/prompt-template/PromptTemplateParser.ts";
import { defaultLLMConfig } from "@lib/ai/llm";
import type { ChatSessionModel, PromptTemplateModel } from "@db/models";
import {
  deserializeMessagesToJSON,
  serializeMessagesFromJSON,
} from "@lib/ai/langchain/utils";

class ChatManager {
  private static instance: ChatManager;
  private llm: ChatOpenAI;
  private isLoading: boolean = false;
  public currentChatSession?: ChatSessionModel;
  private isInitializing: boolean = true; // Initialize to true
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
  }

  public async init(template?: PromptTemplateModel) {
    if (template) {
      await this.setTemplate(template);
    } else {
      appState.setKey("selectedTemplateId", DEFAULT_TEMPLATE_ID);
      const template = await this.getTemplate(DEFAULT_TEMPLATE_ID);
      await this.setTemplate(template);
    }
  }

  async setTemplate(template: PromptTemplateModel) {
    try {
      if (!template) {
        throw new Error("Template is required");
      }
      // Apply template llmConfig
      if (template.llmConfig) {
        console.log("");
        const llmConfig = { ...defaultLLMConfig, ...template.llmConfig };
        if (
          template.llmConfig.model &&
          template.llmConfig.model !== "" &&
          template.llmConfig.model !== this.model
        ) {
          this.updateModel(template.llmConfig.model);
        } else {
          this.setLLM(llmConfig);
        }
      }

      // Process the template
      this.template = promptTemplateParser.processTemplate(template);
      // todo: implement chatPromptTemplate
      this.chatPromptTemplate = promptTemplateParser.createChatPromptTemplate(
        this.template,
      );
      // Render the template
      await promptTemplateParser.renderTemplate(this.template);

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

      // Use chatMessageParser to filter and process messages
      let validMessages = chatMessageParser.processMessages(
        this.messages,
        this.template?.id,
      );
      // console.log("validMessages", validMessages);

      if (validMessages.length === 0) {
        throw new Error("No valid messages to process");
      }

      // Sanitize messages before sending to LLM
      try {
        // Use the existing utility function to handle message serialization
        validMessages = serializeMessagesFromJSON(validMessages);

        // Filter out any null or invalid messages
        validMessages = validMessages.filter(Boolean);

        if (validMessages.length === 0) {
          throw new Error("No valid messages after sanitization");
        }
      } catch (error) {
        console.error("Error sanitizing messages:", error);
        throw new Error("Failed to process messages: " + error.message);
      }

      // Invoke the LLM with sanitized messages
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
    console.log("newChat", templateId);
    if (!templateId) {
      templateId = DEFAULT_TEMPLATE_ID;
    }
    await this.clearMessages();
    this.cleanupSubscriptions();
    appState.setKey("currentChatSession", undefined);
    appState.setKey("currentChatSessionId", undefined);
    // define template
    let template: PromptTemplateModel = undefined;
    if (templateId) {
      try {
        template = await this.getTemplate(templateId);

        // Convert messages to JSON format for storage
        const jsonMessages = deserializeMessagesToJSON(this.messages);
        const chatState: Partial<ChatSessionModel> = {
          messages: jsonMessages,
          metadata: {
            templateId: template.id,
            template: template,
            topic: template.name || "",
            model: this.model,
          },
        };
        appState.setKey("currentChatSession", chatState);
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

  private async saveState(forceUpdate = false) {
    // Skip API calls during initialization unless forced
    // if (this.isInitializing && !forceUpdate) {
    //   return;
    // }

    const serializedMessages = chatMessageParser.processMessages(this.messages);
    const currentChat = appState.get().currentChatSession;

    let topic = "Chat: " + this.template?.name;
    if (serializedMessages.length > 2)
      topic =
        "Topic: " + serializedMessages[2]?.content.slice(0, 60 - 3) + "...";
    const metadata = {
      topic,
      model: this.model,
      template: this.template,
      templateId: this.template?.id,
    };

    // Only make API calls if we have meaningful content
    if (this.messages.length > 2) {
      console.log("saveState");
      // Convert messages to JSON format for storage
      const jsonMessages = deserializeMessagesToJSON(serializedMessages);
      // POST or PUT session to database
      const method = currentChat?.id ? "PUT" : "POST";
      let url = `${appState.get().apiBaseUrl}/sessions/index.json`;
      if (method === "PUT") url = url.replace("index", currentChat.id);

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: jsonMessages, // Already in JSON format
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to update chat session: ${response.status} ${response.statusText}`,
        );
      }
      // Read the response body ONCE and store it
      const responseText = await response.text();
      if (!responseText) {
        console.warn("Empty response received from server");
        return;
      }
      // Parse the response body and update the state
      const updatedSession = JSON.parse(responseText);
      this.currentChatSession = updatedSession;
      appState.setKey("currentChatSession", updatedSession);
      appState.setKey("currentChatSessionId", updatedSession.id);
    }
  }

  public async restoreState() {
    const savedChatSessionId = appState.get().currentChatSessionId;
    if (!savedChatSessionId) {
      await this.init();
      return;
    }

    let template: PromptTemplateModel;
    let session: ChatSessionModel;

    // Fetch the session from the database
    session = await this.getSession(savedChatSessionId);
    template = session?.metadata?.template;
    if (template.id !== appState.get().selectedTemplateId) {
      console.log("Force new chat");
      await this.newChat(appState.get().selectedTemplateId);
      return;
    }
    appState.setKey("selectedTemplateId", template.id);
    appState.setKey("currentChatSession", session);

    // Check if we have a template in the saved chat session metadata
    if (session?.metadata?.template) {
      template = session?.metadata?.template;
    }
    // Check if we have a model in the saved chat metadata
    if (session?.metadata && session?.metadata.model) {
      this.updateModel(session.metadata.model);
    } else if (appState.get().selectedModel) {
      this.updateModel(appState.get().selectedModel);
    }

    if (template) {
      // Force new chat if template is different after prompt template editor

      await this.init(template);
      return;
    }
    // await this.init();
  }

  private setupStateSubscription() {
    this.unsubscribe = appState.subscribe((state) => {
      // Only update model if it's different and not already being updated
      if (
        state.selectedModel &&
        state.selectedModel !== this.model &&
        state.selectedModel !==
          appState.get().currentChatSession?.metadata.model
      ) {
        this.updateModel(state.selectedModel);
      }
    });
  }

  private async getTemplate(templateId: string): Promise<PromptTemplateModel> {
    let template: PromptTemplateModel = undefined;
    // Check if the template is a preset template
    Object.values(PRESET_TEMPLATES).forEach((presetTemplate) => {
      if (presetTemplate.id === templateId) {
        template = { ...presetTemplate, llmConfig: this.llmConfig };
      }
    });
    if (!template) {
      // Fetch the template from the database with cache busting
      const cacheBuster = new Date().getTime();
      const response = await fetch(
        `/api/prompts/${templateId}.json?t=${cacheBuster}`,
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.statusText}`);
      }
      template = await response.json();
    }
    return template;
  }

  private async getSession(sessionId: string): Promise<ChatSessionModel> {
    console.log("getSession", sessionId);
    const cacheBuster = new Date().getTime();
    const response = await fetch(
      `/api/sessions/${sessionId}.json?t=${cacheBuster}`,
    );
    if (!response.ok) throw new Error("Failed to load session");
    const session = await response.json();
    console.log("session", session);
    // Convert plain message objects back to BaseMessage instances
    const restoredMessages = serializeMessagesFromJSON(session.messages);
    if (restoredMessages.length > 0) {
      restoredMessages.forEach((msg) => {
        chatMessageParser.processMessage(msg, this.template?.id);
      });
      session.messages = restoredMessages;
    }
    this.currentChatSession = session;
    return session;
  }

  private updateModel(newModel: string) {
    this.model = newModel;
    this.setLLM({ ...this.llmConfig, model: newModel });
    appState.setKey("selectedModel", newModel);
    console.log("Updated model to: " + newModel);
    this.saveState();
  }

  public async setLLM(config: ChatOpenAI) {
    this.llmConfig = config;
    this.llm = new ChatOpenAI(this.llmConfig);
    promptTemplateParser.llm = this.llm;
  }

  public getLLM(): ChatOpenAI {
    return this.llm;
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
