import { v4 as uuid } from "uuid";
import { type PromptTemplate } from "@lib/ai/types";
import { defaultLLMConfig } from "../llm";
// import { TEMPLATE_TAGS } from "./constants";

// usage:
// const defaultTemplate = PromptTemplateFactory.createDefault()
// const customTemplate = PromptTemplateFactory.create({ name: "Custom", systemPrompt: "You are a coding assistant." })
// const duplicatedTemplate = PromptTemplateFactory.duplicate(existingTemplate)

export class PromptTemplateFactory {
  /**
   * Creates a new PromptTemplate with default values
   */
  static createDefault(): PromptTemplate {
    const now = new Date().toISOString();

    return {
      // id: uuid(),
      name: "New Template",
      description: "A custom prompt template",
      systemPrompt: "You are a helpful assistant.",
      template: "",
      variables: [],
      tags: ["prompt-enhancer"],
      llmConfig: defaultLLMConfig,
      // created_at: now,
      // updated_at: now,
    };
  }

  /**
   * Creates a PromptTemplate with custom values
   */
  static create(params: Partial<PromptTemplate>): PromptTemplate {
    const now = new Date().toISOString();
    const template = this.createDefault();

    return {
      ...template,
      ...params,
      id: params.id || uuid(),
      created_at: params.created_at || now,
      updated_at: params.updated_at || now,
    };
  }

  /**
   * Creates a duplicate of an existing template with a new ID
   */
  static duplicate(template: PromptTemplate): PromptTemplate {
    const now = new Date().toISOString();

    return {
      ...template,
      id: uuid(),
      name: `${template.name} (Copy)`,
      created_at: now,
      updated_at: now,
    };
  }
}
