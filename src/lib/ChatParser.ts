import {
  BaseMessage,
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import { appState } from "./appStore";
import type { IPromptTemplate } from "@types";

type MessageProcessor = (message: BaseMessage) => BaseMessage | null;
type TemplateProcessor = (template: IPromptTemplate) => IPromptTemplate;
type MessageFilter = (message: BaseMessage) => boolean;

export class ChatParser {
  private messageProcessors: Map<string, MessageProcessor> = new Map();
  private templateProcessors: Map<string, TemplateProcessor> = new Map();
  private messageFilters: MessageFilter[] = [];

  constructor() {
    this.registerDefaultProcessors();
  }

  private registerDefaultProcessors() {
    // Default system message processor
    this.registerMessageProcessor("system", (message: BaseMessage) => {
      if (message._getType() !== "system") return message;
      // Ensure system messages don't contain certain patterns
      const content = message.content.toString();
      if (content.includes("```")) {
        return new SystemMessage(content.replace(/```[\s\S]*?```/g, ""));
      }
      return message;
    });

    // Default AI message processor
    this.registerMessageProcessor("ai", (message: BaseMessage) => {
      if (message._getType() !== "ai") return message;
      let content = message.content.toString();
      // remove content between <think> tags
      content = content.replace(/(<think>)[\s\S]*?(<\/think>)/g, "$1$2");
      // Then remove the empty <think> tags
      content = content.replace(/<\/?think>/g, "");
      return new AIMessage(content.trim());
    });

    // Default human message processor
    this.registerMessageProcessor("human", (message: BaseMessage) => {
      if (message._getType() !== "human") return message;
      let content = message.content.toString().trim();
      // content = content.replaceAll("piet", "jan");
      return new HumanMessage(content);
    });

    // Add default message filter
    this.addMessageFilter((message: BaseMessage) => {
      /* Example usage:
        Input messages:
        - new AIMessage("  ") -> filtered out (returns false)
        - new AIMessage("") -> filtered out (returns false)
        - new AIMessage("Hello world") -> kept (returns true)
        - new HumanMessage("  Hi  ") -> kept (returns true)
      */
      let content = message.content.toString();
      return content.length > 0 && content.trim() !== "";
    });
  }

  // Register a custom message processor for a specific type or template ID
  public registerMessageProcessor(key: string, processor: MessageProcessor) {
    this.messageProcessors.set(key, processor);
  }

  // Register a custom template processor
  public registerTemplateProcessor(
    templateId: string,
    processor: TemplateProcessor,
  ) {
    this.templateProcessors.set(templateId, processor);
  }

  // Add a message filter
  public addMessageFilter(filter: MessageFilter) {
    this.messageFilters.push(filter);
  }

  // Process a single message
  public processMessage(
    message: BaseMessage,
    templateId?: string,
  ): BaseMessage | null {
    // Apply template-specific processor if exists
    if (templateId && this.messageProcessors.has(templateId)) {
      const processed = this.messageProcessors.get(templateId)!(message);
      if (!processed) return null;
      message = processed;
    }

    // Apply type-specific processor
    const typeProcessor = this.messageProcessors.get(message._getType());
    if (typeProcessor) {
      const processed = typeProcessor(message);
      if (!processed) return null;
      message = processed;
    }

    // Apply filters
    for (const filter of this.messageFilters) {
      if (!filter(message)) return null;
    }

    return message;
  }

  // Process an array of messages
  public processMessages(
    messages: BaseMessage[],
    templateId?: string,
  ): BaseMessage[] {
    return messages
      .map((msg) => this.processMessage(msg, templateId))
      .filter((msg): msg is BaseMessage => msg !== null);
  }

  // Process a template
  public processTemplate(template: IPromptTemplate): IPromptTemplate {
    // Apply template-specific processor if exists
    if (this.templateProcessors.has(template.id)) {
      // fixme: er
      // console.log(template.id);
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

  // Create a ChatPromptTemplate from IPromptTemplate
  public createChatPromptTemplate(
    template: IPromptTemplate,
  ): ChatPromptTemplate {
    const processedTemplate = this.processTemplate(template);

    // First sanitize the content
    const systemPrompt = this.sanitizeTemplateContent(
      processedTemplate.systemPrompt,
    );
    const humanPromptTemplate = processedTemplate.template || "{input}";

    // Create a safer version of the templates by properly escaping curly braces
    const safeSystemPrompt = this.makeTemplateSafe(systemPrompt);
    const safeHumanPrompt = this.makeTemplateSafe(humanPromptTemplate);

    const systemMessageTemplate =
      SystemMessagePromptTemplate.fromTemplate(safeSystemPrompt);
    const humanMessageTemplate =
      HumanMessagePromptTemplate.fromTemplate(safeHumanPrompt);

    return ChatPromptTemplate.fromMessages([
      systemMessageTemplate,
      humanMessageTemplate,
    ]);
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

  // Example of adding a custom processor for code-related messages
  public registerCodeProcessor() {
    this.registerMessageProcessor("code", (message: BaseMessage) => {
      const content = message.content.toString();

      // Extract code blocks
      const codeBlocks = content.match(/```[\s\S]*?```/g) || [];

      // Process each code block
      const processedContent = codeBlocks.reduce((acc, block) => {
        // Add language hint if missing
        if (block.startsWith("```\n")) {
          return acc.replace(block, block.replace("```\n", "```typescript\n"));
        }
        return acc;
      }, content);

      return new AIMessage(processedContent);
    });
  }

  // Example of adding a template processor for documentation templates
  public registerDocumentationTemplateProcessor() {
    this.registerTemplateProcessor(
      "documentation",
      (template: IPromptTemplate) => {
        return {
          ...template,
          systemPrompt: `${template.systemPrompt}\nPlease provide detailed documentation with examples.`,
          template: `Documentation request: {input}\n\nPlease include:\n- Description\n- Parameters\n- Return values\n- Examples`,
        };
      },
    );
  }
}
