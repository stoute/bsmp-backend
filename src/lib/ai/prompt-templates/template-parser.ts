import { type PromptTemplate } from "@lib/ai/types";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { LLMChain } from "langchain/chains";
import { ChatOpenAI } from "@langchain/openai";
import { defaultLLMConfig } from "../llm";

/**
 * Singleton class for parsing PromptTemplates into LangChain objects
 */
export class TemplateParser {
  private static instance: TemplateParser;
  private constructor() {}

  /**
   * Process a template based on its tags or ID
   */
  public processTemplate(template: PromptTemplate): any {
    // Check for specific template types based on tags
    if (template.tags?.includes("system-prompt")) {
      return this.createLLMChain(template);
    }

    // Default to creating a ChatPromptTemplate
    return this.createChatPromptTemplate(template);
  }

  /**
   * Create a ChatPromptTemplate from a PromptTemplate
   */
  public createChatPromptTemplate(
    template: PromptTemplate,
  ): ChatPromptTemplate {
    const systemPrompt = template.systemPrompt || "";
    const humanPromptTemplate = template.template || "{input}";

    return ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(systemPrompt),
      HumanMessagePromptTemplate.fromTemplate(humanPromptTemplate),
    ]);
  }

  /**
   * Create a SystemMessage from a PromptTemplate
   */
  public createSystemMessage(template: PromptTemplate): SystemMessage {
    return new SystemMessage(template.systemPrompt || "");
  }

  /**
   * Create a HumanMessage from a PromptTemplate and input
   */
  public createHumanMessage(
    template: PromptTemplate,
    input: string,
  ): HumanMessage {
    const content = (template.template || "{input}").replace("{input}", input);
    return new HumanMessage(content);
  }

  /**
   * Create an LLMChain from a PromptTemplate
   */
  public createLLMChain(template: PromptTemplate): LLMChain {
    const promptTemplate = this.createChatPromptTemplate(template);
    const llmConfig = template.llmConfig || defaultLLMConfig;

    return new LLMChain({
      prompt: promptTemplate,
      llm: new ChatOpenAI(llmConfig),
    });
  }

  public static getInstance(): TemplateParser {
    if (!TemplateParser.instance) {
      TemplateParser.instance = new TemplateParser();
    }
    return TemplateParser.instance;
  }
}

// Export a singleton instance
export const templateParser = TemplateParser.getInstance();
