// src/components/chat/Chat.jsx
import { useState, useEffect, useCallback, memo } from "react";
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

const ChatMessage = memo(({ message }: { message: any }) => (
  <div
    className={`${styles.message} ${
      message._getType() === "human" ? styles.human : styles.ai
    }`}
  >
    <MessageErrorBoundary>
      {message._getType() === "human" ? (
        <div className={styles.userMessage}>{message.content}</div>
      ) : (
        <MessageContent message={message} />
      )}
    </MessageErrorBoundary>
  </div>
));
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
  }) => (
    <form onSubmit={onSubmit} className={styles.inputForm}>
      <input
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
  ),
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

  useEffect(() => {
    console.log(chatManager.chatPromptTemplate);
  }, [template]);

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
      <div className={styles.messages}>
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
