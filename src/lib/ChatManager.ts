import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { ChatOpenRouterAI, Message } from "@lib/ai/types";
import { appService } from "@lib/appService.ts";
import { appState } from "@lib/appStore";
import { DEFAULT_MODEL, DEFAULT_MODEL_FREE } from "@consts";
import {
  DEFAULT_TEMPLATE_ID,
  PRESET_TEMPLATES,
} from "@lib/prompt-template/constants.ts";
import { chatMessageParser } from "@lib/ChatMessageParser";
import { promptTemplateParser } from "@lib/prompt-template/PromptTemplateParser.ts";
import { defaultLLMConfig } from "@lib/ai/llm";
import {
  deserializeMessagesToJSON,
  serializeMessagesFromJSON,
} from "@lib/ai/langchain/utils";
import { proxyFetchHandler } from "@lib/ai/utils";
import type { ChatSessionModel, PromptTemplateModel } from "@db/models";

class ChatManager {
  private static instance: ChatManager;
  private isLoading: boolean = false;
  private isInitializing: boolean = true;
  private model: string;
  private unsubscribe: (() => void) | null = null;
  private _saveStateDebounceTimer: NodeJS.Timeout | null = null;
  private _templateChangeDebounceTimer: NodeJS.Timeout | null = null;
  private _lastProcessedTemplateId: string | undefined = undefined;

  public currentChatSession?: ChatSessionModel;
  public chatPromptTemplate?: ChatPromptTemplate;
  public template?: PromptTemplateModel;
  public messages: Message[] = [];
  public llm: ChatOpenAI;
  public llmConfig: ChatOpenRouterAI = defaultLLMConfig;

  private constructor() {
    promptTemplateParser.chatManager = this;
    chatMessageParser.registerCodeProcessor();
    promptTemplateParser.registerDocumentationTemplateProcessor();

    const defaultModel =
      appState.get().environment === "production"
        ? DEFAULT_MODEL_FREE
        : DEFAULT_MODEL;

    this.model = appState.get().selectedModel || defaultModel;

    // Initialize LLM with proxy configuration
    this.setLLM({
      ...defaultLLMConfig,
      model: this.model,
      configuration: { fetch: proxyFetchHandler },
      baseURL: "/api/ai-proxy",
      apiKey: "NONE",
    });

    this.setupStateSubscription();
    this.restoreSession();
  }

  public async init(template?: PromptTemplateModel) {
    this.isInitializing = true;
    try {
      if (!template) {
        template = await this.loadTemplate(DEFAULT_TEMPLATE_ID);
      }
      await this.setTemplate(template);
    } finally {
      this.isInitializing = false;
    }
  }

  async setTemplate(template: PromptTemplateModel) {
    if (!template) {
      throw new Error("Template is required");
    }
    try {
      // Apply template llmConfig
      if (template.llmConfig) {
        if (typeof template.llmConfig === "string") {
          template.llmConfig = JSON.parse(template.llmConfig);
        }
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
      // Process and define the template
      this.template = promptTemplateParser.processTemplate(template);
      // Render the template
      await promptTemplateParser.renderTemplate(this.template);

      // Update the state
      this.cleanupSubscriptions();
      this.setupStateSubscription();
    } catch (error) {
      console.error("Error setting template:", error);
      throw error;
    }
  }

  async handleUserInput(input: string) {
    if (!input || this.isLoading) return;

    this.isLoading = true;
    try {
      // Create and process user message
      const userMessage = new HumanMessage(input);
      const processedMessage = chatMessageParser.processMessage(
        userMessage,
        this.template?.id,
      );
      if (!processedMessage) {
        throw new Error("Message was filtered out by parser");
      }
      this.messages.push(processedMessage);

      // Process all messages for LLM
      let validMessages = chatMessageParser.processMessages(
        this.messages,
        this.template?.id,
      );

      if (!validMessages.length) {
        throw new Error("No valid messages to process");
      }

      // Sanitize messages before sending to LLM
      try {
        validMessages =
          serializeMessagesFromJSON(validMessages).filter(Boolean);

        if (!validMessages.length) {
          throw new Error("No valid messages after sanitization");
        }
      } catch (error) {
        console.error("Error sanitizing messages:", error);
        throw new Error("Failed to process messages: " + error.message);
      }

      console.log("validMessages", validMessages);

      // Invoke the LLM with sanitized messages
      const response = await this.llm.invoke(validMessages);
      console.log("response", response);

      if (response) {
        const processedResponse = chatMessageParser.processMessage(
          response,
          this.template?.id,
        );
        if (processedResponse) {
          this.messages.push(processedResponse);
          await this.saveSession(true); // Force update
        }
      }

      return response;
    } catch (error) {
      console.error("Error in chat:", error);
      this.messages.pop(); // Remove the failed message
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async newChat(templateId?: string, forceNew: boolean = false) {
    // Early return if running on server
    if (typeof window === "undefined") return;

    console.log("newChat", templateId);

    // If forceNew is true (plus button click), ignore duplicate processing check
    // Otherwise, check for duplicate processing
    if (
      !forceNew &&
      templateId &&
      templateId === this._lastProcessedTemplateId
    ) {
      console.log("Skipping duplicate template change request:", templateId);
      return;
    }

    this._lastProcessedTemplateId = templateId;

    await this.clearMessages();

    // Reset session state
    appState.setKey("currentChatSession", undefined);
    appState.setKey("currentChatSessionId", undefined);

    templateId = templateId || DEFAULT_TEMPLATE_ID;

    try {
      // Fetch the template
      const template = await this.loadTemplate(templateId);
      const llmConfig = { defaultLLMConfig, ...template.llmConfig };
      // Prepare session state
      const jsonMessages = deserializeMessagesToJSON(this.messages);
      const chatState: Partial<ChatSessionModel> = {
        messages: jsonMessages,
        metadata: {
          templateId: template.id,
          template: template,
          topic: template.name || "",
          model: llmConfig.model,
          llmConfig,
        },
      };
      // Update state
      appState.setKey("currentChatSession", chatState);
      appState.setKey("selectedTemplate", template);
      // Initialize with the template
      await this.init(template);
    } catch (error) {
      console.error("Error in newChat:", error);
      await this.init();
    }
  }

  private async loadSession(sessionId: string) {
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
    // Convert plain message objects back to BaseMessage instances
    const restoredMessages = serializeMessagesFromJSON(session.messages);
    if (restoredMessages.length) {
      session.messages = chatMessageParser.processMessages(restoredMessages);
    }
    const template = session.metadata.template;
    this.llmConfig = session.metadata.llmConfig;
    this.currentChatSession = session;
    appState.setKey("currentChatSession", session);
    appState.setKey("currentChatSessionId", session.id);
    if (session.metadata.templateId !== appState.get().selectedTemplateId) {
      appState.setKey("selectedTemplateId", session.metadata.templateId);
    }
    await this.setMessages(session.messages);
    await this.init(template);
  }

  private saveSession() {
    // Debounce saves
    if (this._saveStateDebounceTimer) {
      clearTimeout(this._saveStateDebounceTimer);
    }
    return new Promise<void>((resolve) => {
      this._saveStateDebounceTimer = setTimeout(async () => {
        try {
          const serializedMessages = chatMessageParser.processMessages(
            this.messages,
          );
          const currentChat = appState.get().currentChatSession;

          // Generate topic from template name or message content
          let topic = "Chat: " + this.template?.name;
          if (serializedMessages.length > 2) {
            topic =
              "Topic: " + serializedMessages[2]?.content.slice(0, 57) + "...";
          }
          // Convert messages to JSON format for storage
          const jsonMessages = deserializeMessagesToJSON(serializedMessages);

          // Prepare session request
          const method = currentChat?.id ? "PUT" : "POST";
          let url = `api/sessions/index.json`;
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
          console.log(url);
          console.log("Saving session", requestBody);

          const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });
          if (!response.ok) {
            throw new Error(
              `Failed to update chat session: ${response.status} ${response.statusText}`,
            );
          }
          const responseText = await response.text();
          if (!responseText) {
            console.warn("Empty response received from server");
            resolve();
            return;
          }
          // Update state with llm response
          const updatedSession = JSON.parse(responseText);
          this.currentChatSession = updatedSession;
          appState.setKey("currentChatSession", updatedSession);
          appState.setKey("currentChatSessionId", updatedSession.id);
          //console.log("Chat state saved successfully", updatedSession);
          resolve();
        } catch (error) {
          console.error("Error saving chat state:", error);
          resolve();
        }
      }, 1000);
    });
  }

  public async restoreSession(sessionId: string) {
    if(sessionId){
      appState.setKey("currentChatSessionId", sessionId);
    }
    const currentTemplateId = appState.get().selectedTemplateId;
    const savedChatSession = appState.get().currentChatSession;
    const savedChatSessionId = appState.get().currentChatSessionId;
    console.log('');
    console.log("restoring state");
    console.log("savedChatSession", savedChatSession);
    console.log("savedChatSessionId", savedChatSessionId);
    if (!savedChatSession || !savedChatSessionId) {
      await this.newChat(currentTemplateId);
      // return;
    }

    try {
      await this.loadSession(savedChatSessionId || sessionId);
      // Check if template ID changed
      // if (this.template?.id !== currentTemplateId) {
      //   console.log("Template ID changed, starting new chat");
      //   await this.newChat(currentTemplateId);
      // }
    } catch (error) {
      console.error("Error restoring state:", error);
      // await this.newChat(currentTemplateId);
    }
  }

  private setupStateSubscription() {
    this.unsubscribe = appState.subscribe((state) => {
      // Update model if changed
      if (
        state.selectedModel &&
        state.selectedModel !== this.model &&
        state.selectedModel !==
          appState.get().currentChatSession?.metadata.model
      ) {
        this.updateModel(state.selectedModel);
      }

      // Handle template changes with debouncing
      // if (
      //   state.selectedTemplateId &&
      //   this.template?.id !== state.selectedTemplateId &&
      //   !this.isInitializing
      // ) {
      //   if (this._templateChangeDebounceTimer) {
      //     clearTimeout(this._templateChangeDebounceTimer);
      //   }
      //
      //   this._templateChangeDebounceTimer = setTimeout(() => {
      //     console.log(
      //       "Template ID changed in appState, starting new chat with:",
      //       state.selectedTemplateId,
      //     );
      //     if(state.selectedTemplateId === "new"){
      //       // this.newChat();
      //       return;
      //     }
      //    // this.newChat(state.selectedTemplateId);
      //     this._templateChangeDebounceTimer = null;
      //   }, 300);
      // }
    });
  }

  private async loadTemplate(templateId: string): Promise<PromptTemplateModel> {
    let template: PromptTemplateModel;
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

  private updateModel(newModel: string) {
    this.model = newModel;
    this.llmConfig.model = newModel;
    this.setLLM(this.llmConfig);
    appState.setKey("selectedModel", newModel);
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
  }

  async clearMessages() {
    this.messages = [];
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
  }

  public static getInstance(): ChatManager {
    if (!ChatManager.instance) {
      ChatManager.instance = new ChatManager();
    }
    return ChatManager.instance;
  }
}

export const chatManager = ChatManager.getInstance();
