import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import type { Message, PromptTemplate } from "@lib/ai/types.ts";
import { chatMessageParser } from "../ChatMessageParser.ts";
import { type chatManager } from "../ChatManager.ts";
import { AIMessage, SystemMessage } from "@langchain/core/messages";
import { DEFAULT_SYSTEM_MESSAGE } from "@consts.ts";
import { appState } from "../appStore.ts";

type TemplateProcessor = (template: PromptTemplate) => PromptTemplate;

export class PromptTemplateParser {
  private templateProcessors: Map<string, TemplateProcessor> = new Map();
  public chatManager: typeof chatManager;
  public llm: ChatOpenAI;

  constructor() {
    // No default template processors
  }

  // Register a custom template processor
  public registerTemplateProcessor(
    templateId: string,
    processor: TemplateProcessor,
  ) {
    this.templateProcessors.set(templateId, processor);
  }

  // Process a template
  public processTemplate(template: PromptTemplate): PromptTemplate {
    // Apply template-specific processor if exists
    if (this.templateProcessors.has(template.id)) {
      template = this.templateProcessors.get(template.id)!(template);
    }
    // Apply default template processing
    return {
      ...template,
      systemPrompt: this.sanitizeTemplateContent(template.systemPrompt),
      template: this.sanitizeTemplateContent(template.template),
      description: template.description
        ? this.sanitizeTemplateContent(template.description)
        : undefined,
    };
  }

  // Render a template
  public async renderTemplate(template: PromptTemplate) {
    // todo: implement chatPromptTemplate
    this.chatManager.chatPromptTemplate =
      promptTemplateParser.createChatPromptTemplate(template);

    let sessionMessages: Message[] = [];
    if (appState.get().currentChatSession)
      sessionMessages = appState.get().currentChatSession.messages;

    const sanitizedSystemPrompt = this.sanitizeTemplateContent(
      template.systemPrompt || DEFAULT_SYSTEM_MESSAGE,
    );
    //
    const systemMessage = new SystemMessage(sanitizedSystemPrompt);
    // Create description message
    let descriptionMessage: AIMessage | undefined;
    if (template.description) {
      descriptionMessage = new AIMessage({
        content: template.description,
        additional_kwargs: {
          type: "ai-template-description",
          template,
        },
      });
    }
    sessionMessages[0] = systemMessage;
    sessionMessages[1] = descriptionMessage;

    this.chatManager.setMessages(sessionMessages);
  }

  // Create a ChatPromptTemplate from PromptTemplate
  public createChatPromptTemplate(
    template: PromptTemplate,
  ): ChatPromptTemplate {
    // First sanitize the content
    const systemPrompt = this.sanitizeTemplateContent(template.systemPrompt);
    const humanPromptTemplate = template.template || "{input}";
    // Create a safer version of the templates by properly escaping curly braces
    const safeSystemPrompt = this.makeTemplateSafe(systemPrompt);
    const safeHumanPrompt = this.makeTemplateSafe(humanPromptTemplate);

    const systemMessageTemplate =
      SystemMessagePromptTemplate.fromTemplate(safeSystemPrompt);
    const humanMessageTemplate =
      HumanMessagePromptTemplate.fromTemplate(safeHumanPrompt);

    // Create chat prompt template
    const chatPromptTemplate = ChatPromptTemplate.fromMessages([
      systemMessageTemplate,
      humanMessageTemplate,
      // descriptionMessage,
    ]);
    return chatPromptTemplate;
  }

  private makeTemplateSafe(template: string): string {
    if (!template) return "";

    // Step 1: Temporarily replace valid placeholders
    const placeholders: string[] = [];
    const tempTemplate = template.replace(
      /{([a-zA-Z_][a-zA-Z0-9_]*)}/g,
      (match) => {
        placeholders.push(match);
        return `__PLACEHOLDER${placeholders.length - 1}__`;
      },
    );

    // Step 2: Escape remaining curly braces
    const escapedTemplate = tempTemplate
      .replace(/{/g, "{{")
      .replace(/}/g, "}}");

    // Step 3: Restore valid placeholders
    return placeholders.reduce((result, placeholder, index) => {
      return result.replace(`__PLACEHOLDER${index}__`, placeholder);
    }, escapedTemplate);
  }

  // Update sanitizeTemplateContent to be more thorough
  private sanitizeTemplateContent(content?: string): string {
    if (!content) return "";

    // Remove multiple consecutive newlines
    let sanitized = content.replace(/\n{3,}/g, "\n\n");

    // Remove zero-width spaces and other invisible characters
    sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF]/g, "");

    // Normalize quotes and apostrophes
    sanitized = sanitized.replace(/['']/g, "'").replace(/[""]/g, '"');

    // Remove BOM if present
    sanitized = sanitized.replace(/^\uFEFF/, "");

    // Trim whitespace
    return sanitized.trim();
  }

  // Example of adding a template processor for documentation templates
  public registerDocumentationTemplateProcessor() {
    this.registerTemplateProcessor(
      "documentation",
      (template: PromptTemplate) => {
        return {
          ...template,
          systemPrompt: `${template.systemPrompt}\nPlease provide detailed documentation with examples.`,
          template: `Documentation request: {input}\n\nPlease include:\n- Description\n- Parameters\n- Return values\n- Examples`,
        };
      },
    );
  }

  // Access to message parser
  public getMessageParser() {
    return chatMessageParser;
  }
}

// Export a singleton instance
export const promptTemplateParser = new PromptTemplateParser();
