// src/components/chat/Chat.jsx
import { useState, useEffect, useCallback, memo, useRef, useMemo } from "react";
import { BaseMessage } from "@langchain/core/messages";
import { ChatManager } from "@lib/ChatManager";
import { appState } from "@lib/appStore";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { MessageErrorBoundary } from "./MessageErrorBoundary";
import type { IPromptTemplate } from "@types";
import styles from "./Chat.module.css";

type ChatProps = {
  template?: IPromptTemplate;
  model?: string;
};

export default function Chat({ model, template }: ChatProps) {
  const chatManagerRef = useRef<ChatManager | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isRestoringRef = useRef(false);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<BaseMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  // Initialize llm chatManager and messages after hydration
  useEffect(() => {
    if (!chatManagerRef.current) {
      console.log(appState.value?.currentChat?.template?.id);
      const savedChat = appState.get().currentChat;
      const isRestoring = savedChat?.messages != null;
      isRestoringRef.current = isRestoring;

      chatManagerRef.current = new ChatManager(model, template, isRestoring);
      setMessages(chatManagerRef.current.getMessages());
      setIsInitialized(true);
    }
  }, [model, template]);

  // Handle initial scroll for restored chat
  useEffect(() => {
    if (isInitialized && isRestoringRef.current && messages.length > 0) {
      // Use a longer timeout to ensure all content is rendered
      setTimeout(scrollToBottom, 300);
      isRestoringRef.current = false;
    }
  }, [isInitialized, messages, scrollToBottom]);

  // Regular scroll effect for new messages
  useEffect(() => {
    if (!isRestoringRef.current) {
      // Scroll immediately for user messages
      scrollToBottom();
      // For AI responses, also scroll after a brief delay to ensure content is rendered
      if (
        messages.length > 0 &&
        messages[messages.length - 1]._getType() === "ai"
      ) {
        const timeoutId = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [messages, scrollToBottom]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || !chatManagerRef.current) return;

      setIsLoading(true);
      try {
        await chatManagerRef.current.sendMessage(input);
        setMessages(chatManagerRef.current.getMessages());
        setInput("");
        // Scroll after the response is received
        setTimeout(scrollToBottom, 100);
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

    chatManagerRef.current.clearMessages(
      template?.systemPrompt || "You are a helpful assistant.",
    );
    setMessages(chatManagerRef.current.getMessages());
  }, [template]);

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
