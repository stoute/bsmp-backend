// src/components/chat/Chat.jsx
import { useState, useEffect, useCallback, memo, useRef, useMemo } from "react";
import { BaseMessage } from "@langchain/core/messages";
import { ChatManager } from "@lib/ChatManager";
import { appState } from "@lib/appStore";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { MessageErrorBoundary } from "./MessageErrorBoundary";
import type { IPromptTemplate } from "@types";
import styles from "./Chat.module.css";

export default function Chat({ template }: ChatProps) {
  const chatManagerRef = useRef<ChatManager | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isRestoringRef = useRef(false);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<BaseMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoize scroll functions to prevent recreation
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  const scrollLastMessageToTop = useCallback(() => {
    if (messagesContainerRef.current && messages.length > 0) {
      const container = messagesContainerRef.current;
      const messageElements = container.getElementsByClassName(styles.message);
      if (messageElements.length >= 2) {
        const lastUserMessage = messageElements[messageElements.length - 2];
        const containerTop = container.getBoundingClientRect().top;
        const messageTop = lastUserMessage.getBoundingClientRect().top;
        container.scrollTop += messageTop - containerTop;
      }
    }
  }, []); // Remove messages.length dependency

  // Initialize chat manager only once
  useEffect(() => {
    if (chatManagerRef.current) return;
    const savedChat = appState.get().currentChat;
    isRestoringRef.current = savedChat?.messages?.length > 0;

    chatManagerRef.current = new ChatManager();
    setMessages(chatManagerRef.current.getMessages());
    setIsInitialized(true);
  }, []); // Empty dependency array since this should only run once

  // Handle scroll behavior when messages change
  useEffect(() => {
    if (!isInitialized || messages.length === 0) return;

    if (isRestoringRef.current) {
      setTimeout(scrollToBottom, 300);
      isRestoringRef.current = false;
    } else {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?._getType() === "ai") {
        setTimeout(scrollLastMessageToTop, 100);
      } else {
        scrollToBottom();
      }
    }
  }, [isInitialized, messages, scrollToBottom, scrollLastMessageToTop]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || !chatManagerRef.current) return;

      setIsLoading(true);
      try {
        scrollToBottom();
        await chatManagerRef.current.sendMessage(input);
        setMessages(chatManagerRef.current.getMessages());
        setInput("");
      } catch (error) {
        console.error("Chat error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [input, scrollToBottom],
  );

  const handleClearChat = useCallback(() => {
    if (!chatManagerRef.current) return;
    chatManagerRef.current.clearMessages();
    setMessages(chatManagerRef.current.getMessages());
    setTimeout(scrollToBottom, 100);
  }, [scrollToBottom]);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
  }, []);

  if (!isInitialized) {
    return null;
  }

  return (
    <div className={styles.chatContainer}>
      <div className="mb-2 flex justify-end">
        <button
          onClick={handleClearChat}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Clear Chat
        </button>
      </div>
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
