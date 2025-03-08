// src/components/chat/Chat.jsx
import { useState, useEffect, useCallback, memo, useRef } from "react";
import { ChatManager } from "@lib/ChatManager.ts";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { MessageErrorBoundary } from "./MessageErrorBoundary";
import type { IPromptTemplate } from "@types";
import styles from "./Chat.module.css";

const MessageContent = memo(({ message }: { message: any }) => {
  const content =
    typeof message.content === "string"
      ? message.content
      : message.content?.toString() || "";

  if (!content) return null;

  return (
    <div className="prose dark:prose-invert max-w-none">
      <MarkdownRenderer blockMatch={{ output: content }} />
    </div>
  );
});
MessageContent.displayName = "MessageContent";

const ChatMessage = memo(({ message }: { message: any }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      // Reset the icon after a short delay
      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    } catch (err) {
      console.error("Failed to copy message:", err);
    }
  };

  return (
    <div
      className={`${styles.message} ${
        message._getType() === "human" ? styles.human : styles.ai
      } group relative`}
    >
      <button
        onClick={() => handleCopy(message.content)}
        className="absolute top-2 right-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        aria-label={isCopied ? "Copied!" : "Copy message"}
      >
        <svg className="h-4 w-4 text-current opacity-70 hover:opacity-100">
          <use href={isCopied ? "/copy.svg#filled" : "/copy.svg#empty"} />
        </svg>
      </button>
      <MessageErrorBoundary>
        {message._getType() === "human" ? (
          <div className={styles.userMessage}>{message.content}</div>
        ) : (
          <MessageContent message={message} />
        )}
      </MessageErrorBoundary>
    </div>
  );
});
ChatMessage.displayName = "ChatMessage";

const ChatInput = memo(
  ({
    input,
    isLoading,
    onInputChange,
    onSubmit,
  }: {
    input: string;
    isLoading: boolean;
    onInputChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
  }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when loading state changes from true to false
    useEffect(() => {
      if (!isLoading) {
        inputRef.current?.focus();
      }
    }, [isLoading]);

    return (
      <form onSubmit={onSubmit} className={styles.inputForm}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Ask something..."
          disabled={isLoading}
          className={styles.input}
        />
        <button type="submit" disabled={isLoading} className={styles.button}>
          Send
        </button>
      </form>
    );
  },
);
ChatInput.displayName = "ChatInput";

type ChatProps = {
  template?: IPromptTemplate;
  model?: string;
};

export default function Chat({ model, template }: ChatProps) {
  const [chatManager] = useState(() => new ChatManager(model, template));
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(chatManager.getMessages());
  const [isLoading, setIsLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const { scrollHeight, clientHeight } = messagesContainerRef.current;
      messagesContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  };

  // Scroll to bottom when messages change or loading state changes
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM has updated
    requestAnimationFrame(() => {
      scrollToBottom();
    });
  }, [messages, isLoading]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;

      setIsLoading(true);
      try {
        await chatManager.sendMessage(input);
        setMessages(chatManager.getMessages());
        setInput("");
      } catch (error) {
        console.error("Chat error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [input, chatManager],
  );

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
  }, []);

  return (
    <div className={styles.chatContainer}>
      <div ref={messagesContainerRef} className={styles.messages}>
        {messages.slice(1).map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
        {isLoading && (
          <div className={styles.message}>
            <div className={styles.loading}>Thinking...</div>
          </div>
        )}
      </div>

      <ChatInput
        input={input}
        isLoading={isLoading}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
