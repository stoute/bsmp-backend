import { ChatOpenAI } from "@langchain/openai";
import type { Message } from "@lib/ai/types";
import type { PromptTemplate } from "@lib/ai/types";
import { chatMessageParser } from "./ChatMessageParser";
import { promptTemplateParser } from "./PromptTemplateParser";

/**
 * @deprecated Use ChatMessageParser and PromptTemplateParser instead
 */
export class ChatParser {
  private messageProcessors = chatMessageParser["messageProcessors"];
  private templateProcessors = promptTemplateParser["templateProcessors"];
  private messageFilters = chatMessageParser["messageFilters"];
  public llm: ChatOpenAI;

  constructor() {
    console.warn(
      "ChatParser is deprecated. Use ChatMessageParser and PromptTemplateParser instead.",
    );
  }

  // Register a custom message processor for a specific type or template ID
  public registerMessageProcessor(key: string, processor: any) {
    chatMessageParser.registerMessageProcessor(key, processor);
  }

  // Register a custom template processor
  public registerTemplateProcessor(templateId: string, processor: any) {
    promptTemplateParser.registerTemplateProcessor(templateId, processor);
  }

  // Add a message filter
  public addMessageFilter(filter: any) {
    chatMessageParser.addMessageFilter(filter);
  }

  // Process a single message
  public processMessage(message: Message, templateId?: string): Message | null {
    return chatMessageParser.processMessage(message, templateId);
  }

  // Process an array of messages
  public processMessages(messages: Message[], templateId?: string): Message[] {
    return chatMessageParser.processMessages(messages, templateId);
  }

  // Process a template
  public processTemplate(template: PromptTemplate): PromptTemplate {
    return promptTemplateParser.processTemplate(template);
  }

  // Create a ChatPromptTemplate from PromptTemplate
  public createChatPromptTemplate(template: PromptTemplate): any {
    return promptTemplateParser.createChatPromptTemplate(template);
  }

  private makeTemplateSafe(template: string): string {
    return (promptTemplateParser as any).makeTemplateSafe(template);
  }

  private sanitizeTemplateContent(content?: string): string {
    return (promptTemplateParser as any).sanitizeTemplateContent(content);
  }

  // Example of adding a custom processor for code-related messages
  public registerCodeProcessor() {
    chatMessageParser.registerCodeProcessor();
  }

  // Example of adding a template processor for documentation templates
  public registerDocumentationTemplateProcessor() {
    promptTemplateParser.registerDocumentationTemplateProcessor();
  }
}
