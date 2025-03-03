// src/components/LangChainChat.jsx
import { useState } from "react";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";
import { proxyFetchHandler } from "@lib/proxyFetchHandler.ts";
import { ChatOpenAI } from "@langchain/openai";
import type { IPromptTemplate } from "@types";

import styles from "./LangChainChat.module.css";

export default function LangChainChat() {
  const [messages, setMessages] = useState([
    new SystemMessage("You are a helpful assistant."),
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const chatModel = new ChatOpenAI({
    temperature: 0.7,
    configuration: {
      dangerouslyAllowBrowser: true,
      fetch: proxyFetchHandler,
    },
    // model: "openai/gpt-4o-mini",
    model: "google/gemini-2.0-flash-001",
    apiKey: "none",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add the user message
    const userMessage = new HumanMessage(input);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Get AI response through the proxy
      const newMessages = [...messages, userMessage];
      const response = await chatModel.invoke(newMessages);

      // Add the AI response
      setMessages((prev) => [...prev, response]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        new AIMessage("Sorry, I encountered an error."),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messages}>
        {messages.slice(1).map((message, i) => (
          <div
            key={i}
            className={`${styles.message} ${styles[message._getType()]}`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && <div className={styles.loading}>Thinking...</div>}
      </div>

      <form onSubmit={handleSubmit}>
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
