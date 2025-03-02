// src/components/LangChainChat.jsx
import { useState } from "react";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";
import { customFetchHandler } from "@lib/customFetchHandler";
import OpenAI from "openai";
import { ChatOpenAI } from "@langchain/openai";
// import { OpenRouterApi } from "@langchain/core/llms/openrouter";
import type { IPromptTemplate } from "@types";
import type { Agent } from "openai/_shims/auto/types";

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
      fetch: customFetchHandler,
    },
    // model: "openai/gpt-4o-mini",
    // model: "deepseek/deepseek-r1:free",
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
    <div className="chat-container">
      <div className="messages">
        {messages.slice(1).map((message, i) => (
          <div key={i} className={`message ${message._getType()}`}>
            {message.content}
          </div>
        ))}
        {isLoading && <div className="loading">Thinking...</div>}
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
