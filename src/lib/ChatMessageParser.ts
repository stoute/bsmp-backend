import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages";
import type { Message } from "@lib/ai/types";

type MessageProcessor = (message: Message) => Message | null;
type MessageFilter = (message: Message) => boolean;

export class ChatMessageParser {
  private messageProcessors: Map<string, MessageProcessor> = new Map();
  private messageFilters: MessageFilter[] = [];

  constructor() {
    this.registerDefaultProcessors();
  }

  private registerDefaultProcessors() {
    // Default system message processor
    this.registerMessageProcessor("system", (message: Message) => {
      if (message.getType() !== "system") return message;
      // Prevent code injection or unintended execution instructions in the system prompt
      const content = message.content.toString();
      if (content.includes("```")) {
        return new SystemMessage(content.replace(/```[\s\S]*?```/g, ""));
      }
      return message;
    });

    // Default AI message processor
    this.registerMessageProcessor("ai", (message: Message) => {
      if (message.getType() !== "ai") return message;
      let content = message.content.toString();
      // remove content between <think> tags
      content = content.replace(/(<think>)[\s\S]*?(<\/think>)/g, "$1$2");
      content = content.replace(/<\/?think>/g, "");
      return new AIMessage(content.trim());
    });

    // Default human message processor
    this.registerMessageProcessor("human", (message: Message) => {
      if (message.getType() !== "human") return message;
      let content = message.content.toString().trim();
      return new HumanMessage(content);
    });

    // Add default message filter
    this.addMessageFilter((message: Message) => {
      /*
      Returns false for empty messages or messages containing only whitespace
      to prevent sending empty messages to the LLM.
      */
      let content = message.content.toString();
      return content.length > 0 && content.trim() !== "";
    });
  }

  // Register a custom message processor for a specific type or template ID
  public registerMessageProcessor(key: string, processor: MessageProcessor) {
    this.messageProcessors.set(key, processor);
  }

  // Add a message filter
  public addMessageFilter(filter: MessageFilter) {
    this.messageFilters.push(filter);
  }

  // Process a single message
  public processMessage(message: Message, templateId?: string): Message | null {
    // Apply template-specific processor if exists
    if (templateId && this.messageProcessors.has(templateId)) {
      const processed = this.messageProcessors.get(templateId)!(message);
      if (!processed) return null;
      message = processed;
    }

    // Apply type-specific processor
    const typeProcessor = this.messageProcessors.get(message.getType());
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
  public processMessages(messages: Message[], templateId?: string): Message[] {
    return messages.filter((msg) => true);
  }

  // Example of adding a custom processor for code-related messages
  public registerCodeProcessor() {
    this.registerMessageProcessor("code", (message: Message) => {
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
}

// Export a singleton instance
export const chatMessageParser = new ChatMessageParser();