// src/components/chat/Chat.jsx
import { useState, useEffect, useCallback, memo, useRef, useMemo } from "react";
import { BaseMessage } from "@langchain/core/messages";
import { useStore } from "@nanostores/react";
import { chatManager } from "@lib/ChatManager";
import { appState } from "@lib/appStore";
import { useAppService } from "@lib/hooks/useAppService";
import { MarkdownRenderer } from "./renderers/MarkdownRenderer.tsx";
import { MessageErrorBoundary } from "./MessageErrorBoundary";
import type { PromptTemplate } from "@lib/ai/types";
import styles from "./Chat.module.css";
import { DescriptionRenderer } from "./renderers/DescriptionRenderer";
// Import Paraglide messages
import {
  chat_thinking,
  chat_ask_something,
  chat_send,
  chat_loading,
  thinking,
} from "@paraglide/messages";

export default function Chat() {
  const { appService, isReady } = useAppService();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isRestoringRef = useRef(false);
  const state = useStore(appState);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<BaseMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Memoize scroll functions to prevent recreation
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, []);
  const scrollLastUserMessageToTop = useCallback(() => {
    if (!messagesContainerRef.current || messages.length === 0) return;
    // Give time for the DOM to update
    setTimeout(() => {
      const container = messagesContainerRef.current;
      if (!container) return;

      const messageElements = container.getElementsByClassName(styles.message);
      const lastAiMessage = messageElements[messageElements.length - 1];
      if (!lastAiMessage) return;

      // Calculate the scroll position to show the AI message at the top
      const containerRect = container.getBoundingClientRect();
      const messageRect = lastAiMessage.getBoundingClientRect();
      const scrollOffset =
        messageRect.top - containerRect.top + container.scrollTop;

      container.scrollTo({
        top: scrollOffset,
        behavior: "smooth",
      });
    }, 100);
  }, [messages.length]); // Include messages.length to ensure we have the latest messages

  // Initialize chat manager only when appService is ready
  useEffect(() => {
    if (!isReady) return;

    const savedChat = state.currentChat;
    isRestoringRef.current = savedChat?.messages?.length > 0;
    setMessages(chatManager.getMessages());
  }, [isReady]);

  useEffect(() => {
    setTimeout(() => {
      setMessages(chatManager.getMessages());
    }, 100);
  }, [state.currentChat?.messages]);

  // Handle scroll behavior when messages change
  useEffect(() => {
    if (!isReady || messages.length === 0) return;

    if (isRestoringRef.current) {
      setTimeout(scrollToBottom, 300);
      isRestoringRef.current = false;
    } else {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.getType() === "ai") {
        setTimeout(scrollLastUserMessageToTop, 100);
      } else {
        scrollToBottom();
      }
    }
  }, [state, isReady, messages, scrollToBottom, scrollLastUserMessageToTop]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;

      setIsLoading(true);
      try {
        await chatManager.handleUserInput(input);
        setMessages(chatManager.getMessages());
        scrollLastUserMessageToTop();
        setInput("");
      } catch (error) {
        console.error("Chat error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [input, scrollLastUserMessageToTop],
  );

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
  }, []);

  if (!isReady) {
    return <div className={styles.loading}>{thinking()}</div>;
  }

  return (
    <div className={styles.chatContainer}>
      <div ref={messagesContainerRef} className={styles.messages}>
        {messages
          .filter((message) => message.getType() !== "system")
          .map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
        {isLoading && (
          <div className={styles.message}>
            <div className={styles.loading}>{thinking()}</div>
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
          placeholder={chat_ask_something()}
          disabled={isLoading}
          className={styles.input}
        />
        <button type="submit" disabled={isLoading} className={styles.button}>
          {chat_send()}
        </button>
      </form>
    );
  },
);
ChatInput.displayName = "ChatInput";

const ChatMessage = ({ message }: { message: any }) => {
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
        message.getType() === "human" ? styles.human : styles.ai
      } group relative`}
    >
      <button
        onClick={() => handleCopy(message.content)}
        className="absolute top-1 right-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        aria-label={isCopied ? "Copied!" : "Copy message"}
      >
        <svg className="h-3.5 w-3.5 text-current opacity-70 hover:opacity-100">
          <use href={isCopied ? "/copy.svg#filled" : "/copy.svg#empty"} />
        </svg>
      </button>
      <MessageErrorBoundary>
        {message.getType() === "human" ? (
          <div className={styles.userMessage}>{message.content}</div>
        ) : (
          <MessageContent message={message} />
        )}
      </MessageErrorBoundary>
    </div>
  );
};
ChatMessage.displayName = "ChatMessage";

const MessageContent = memo(({ message }: { message: any }) => {
  const content =
    typeof message.content === "string"
      ? message.content
      : message.content?.toString() || "";
  if (!content) return null;

  // custom description message
  const template: PromptTemplate = message.additional_kwargs.template;
  if (template?.description) {
    return (
      <div className="prose dark:prose-invert max-w-none">
        <DescriptionRenderer
          blockMatch={{ output: content }}
          template={template}
        />
      </div>
    );
  }

  return (
    <div className="prose dark:prose-invert max-w-none">
      <MarkdownRenderer blockMatch={{ output: content }} />
    </div>
  );
});

MessageContent.displayName = "MessageContent";
