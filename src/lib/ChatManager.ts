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
import { proxyFetchHandler } from "@lib/ai/utils";

class ChatManager {
  private static instance: ChatManager;
  private llm: ChatOpenAI;
  private isLoading: boolean = false;
  public currentChatSession?: ChatSessionModel;
  private isInitializing: boolean = true; // Initialize to true
  public chatPromptTemplate?: ChatPromptTemplate;
  private model: string;
  private unsubscribe: (() => void) | null = null;
  public template?: PromptTemplateModel;
  public messages: Message[] = [];
  public llmConfig: ChatOpenAI = defaultLLMConfig;
  private _saveStateDebounceTimer: NodeJS.Timeout | null = null;

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

    // Ensure we're using the proxy for all LLM calls
    const proxyConfig = {
      ...defaultLLMConfig,
      model: this.model,
      configuration: {
        fetch: proxyFetchHandler,
      },
      baseURL: "/api/ai-proxy", // Ensure baseURL is set to our proxy
      apiKey: "NONE", // Use a placeholder API key since our proxy handles auth
    };

    // initialize llm with proxy configuration
    this.setLLM(proxyConfig);
    this.setupStateSubscription();
    this.restoreState();
  }

  public async init(template?: PromptTemplateModel) {
    this.isInitializing = true;
    try {
      if (template) {
        await this.setTemplate(template);
      } else {
        // appState.setKey("selectedTemplateId", DEFAULT_TEMPLATE_ID);
        const template = await this.getTemplate(DEFAULT_TEMPLATE_ID);
        await this.setTemplate(template);
      }
    } finally {
      this.isInitializing = false;
    }
  }

  async setTemplate(template: PromptTemplateModel) {
    try {
      if (!template) {
        throw new Error("Template is required");
      }
      // Apply template llmConfig
      if (template.llmConfig) {
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
      // Process and set the template
      this.template = promptTemplateParser.processTemplate(template);
      // Render the template
      await promptTemplateParser.renderTemplate(this.template);

      // Update the state
      this.cleanupSubscriptions();
      this.setupStateSubscription();
      await this.saveState();
    } catch (error) {
      console.error("Error setting template:", error);
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
          // Save state only after we've received and processed the LLM response
          await this.saveState(true); // Force update here
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

  async newChat(templateId?: string) {
    // Early return if running on server
    if (typeof window === "undefined") return;

    await this.clearMessages();
    appState.setKey("currentChatSession", undefined);
    appState.setKey("currentChatSessionId", undefined);

    if (!templateId) {
      templateId = DEFAULT_TEMPLATE_ID;
    }
    // this.cleanupSubscriptions();

    // define template
    let template: PromptTemplateModel;
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
            llmConfig: this.llmConfig,
          },
        };
        appState.setKey("currentChatSession", chatState);
        appState.setKey("selectedTemplate", template);
        //appState.setKey("selectedTemplateId", template.id);
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
    const serializedMessages = chatMessageParser.processMessages(this.messages);
    const currentChat = appState.get().currentChatSession;

    // Don't save empty or nearly empty chats unless forced
    if (this.messages?.length < 3 && !forceUpdate) {
      return;
    }

    // Add debouncing to prevent rapid successive saves
    if (this._saveStateDebounceTimer) {
      clearTimeout(this._saveStateDebounceTimer);
    }

    this._saveStateDebounceTimer = setTimeout(async () => {
      try {
        let topic = "Chat: " + this.template?.name;
        if (serializedMessages.length > 2)
          topic =
            "Topic: " + serializedMessages[2]?.content.slice(0, 60 - 3) + "...";

        // Convert messages to JSON format for storage
        const jsonMessages = deserializeMessagesToJSON(serializedMessages);
        // POST or PUT session to database
        const method = currentChat?.id ? "PUT" : "POST";
        let url = `${appState.get().apiBaseUrl}/sessions/index.json`;
        if (method === "PUT") url = url.replace("index", currentChat.id);
        const requestBody = {
          messages: jsonMessages,
          metadata: {
            topic,
            model: this.model,
            template: this.template,
            templateId: this.template?.id,
            llmConfig: this.llmConfig,
          },
        };
        const response = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
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
      } catch (error) {
        console.error("Error saving chat state:", error);
      }
    }, 1000); // 1 second debounce
  }

  public async restoreState() {
    console.log("restoreState");
    const currentTemplateId = appState.get().selectedTemplateId;
    const savedChatSessionId = appState.get().currentChatSessionId;
    if (!savedChatSessionId) {
      await this.newChat(currentTemplateId);
      return;
    }
    await this.getSession(savedChatSessionId);
    // Fixme:Check and rest if the template id was changed by prompts
    console.log("template id", this.template?.id, currentTemplateId);
    console.log("currentTemplateId", currentTemplateId);
    if (this.template?.id !== currentTemplateId) {
      console.log("Template id changed, starting new chat");
      await this.newChat(currentTemplateId);
    }
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

      // Start a new chat when selectedTemplateId changes, but only if we have messages
      // to avoid creating empty chats during initialization
      if (
        state.selectedTemplateId &&
        this.template?.id !== state.selectedTemplateId &&
        this.isInitializing === false // Only respond to template changes after initialization
      ) {
        console.log(
          "Template ID changed in appState, starting new chat with:",
          state.selectedTemplateId,
        );
        this.newChat(state.selectedTemplateId);
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

  private async getSession(sessionId: string) {
    const cacheBuster = new Date().getTime();
    const response = await fetch(
      `/api/sessions/${sessionId}.json?t=${cacheBuster}`,
    );
    if (!response.ok) {
      console.log("Session not found, starting new chat");
      await this.newChat(appState.get().selectedTemplateId);
      return null;
    }
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
    const template = session.metadata.template;
    this.llmConfig = session.metadata.llmConfig;
    this.updateModel(session.metadata.model);
    this.currentChatSession = session;
    appState.setKey("currentChatSession", session);
    // appState.setKey("selectedTemplateId", template.id);
    await this.init(template);
  }

  private updateModel(newModel: string) {
    this.model = newModel;
    this.setLLM({ ...this.llmConfig, model: newModel });
    appState.setKey("selectedModel", newModel);
    // Remove automatic saveState call here
    // this.saveState();
  }

  public async setLLM(config: ChatOpenAI) {
    // Ensure proxy configuration is always applied
    this.llmConfig = {
      ...config,
      configuration: {
        fetch: proxyFetchHandler,
      },
      baseURL: "/api/ai-proxy",
      apiKey: "NONE",
    };

    this.llm = new ChatOpenAI(this.llmConfig);
    promptTemplateParser.llm = this.llm;
  }

  public getLLM(): ChatOpenAI {
    return this.llm;
  }

  getMessages(): Message[] {
    return this.messages;
  }

  async setMessages(messages: Message[]) {
    this.messages = messages;
    await this.saveState();
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
