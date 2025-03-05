// src/components/chat/Chat.jsx
import { useState, useEffect } from "react";
import { AIMessage } from "@langchain/core/messages";
import { useLLMOutput } from "@llm-ui/react";
import {
  codeBlockLookBack,
  findCompleteCodeBlock,
  findPartialCodeBlock,
} from "@llm-ui/code";
import { markdownLookBack } from "@llm-ui/markdown";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { CodeBlockRenderer } from "./CodeBlockRenderer";
import { ChatSessionManager } from "@lib/templateParser";
import type { ChatOpenAI } from "@langchain/openai";
import styles from "./Chat.module.css";

interface ChatProps {
  model?: string;
  systemPrompt?: string;
  llm: ChatOpenAI;
}

export default function Chat({
  model = "openai/gpt-3.5-turbo",
  systemPrompt = "You are a helpful assistant.",
  llm,
}: ChatProps) {
  const [chatManager, setChatManager] = useState<ChatSessionManager | null>(
    null,
  );
  const [messages, setMessages] = useState<BaseMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const manager = new ChatSessionManager(llm, systemPrompt);
    setChatManager(manager);
    setMessages(manager.getMessages());
  }, [llm, systemPrompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatManager) return;

    setInput("");
    setIsLoading(true);

    try {
      const response = await chatManager.sendMessage(input);
      setMessages(chatManager.getMessages());
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const MessageContent = ({ content }: { content: string }) => {
    const { blockMatches } = useLLMOutput({
      llmOutput: content,
      fallbackBlock: {
        component: MarkdownRenderer,
        lookBack: markdownLookBack(),
      },
      blocks: [
        {
          component: CodeBlockRenderer,
          findCompleteMatch: findCompleteCodeBlock(),
          findPartialMatch: findPartialCodeBlock(),
          lookBack: codeBlockLookBack(),
        },
      ],
      isStreamFinished: true,
    });

    return (
      <div>
        {blockMatches.map((blockMatch, index) => {
          const Component = blockMatch.block.component;
          return <Component key={index} blockMatch={blockMatch} />;
        })}
      </div>
    );
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messages}>
        {messages.slice(1).map((message, index) => (
          <div
            key={index}
            className={`${styles.message} ${styles[message._getType()]}`}
          >
            <MessageContent content={message.content} />
          </div>
        ))}
        {isLoading && (
          <div className={styles.message}>
            <div className={styles.loading}>Thinking...</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
}
