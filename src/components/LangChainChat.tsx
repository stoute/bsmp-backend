// src/components/LangChainChat.jsx
import { useState } from "react";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";
import { proxyFetchHandler } from "@lib/proxyFetchHandler.ts";
import { ChatOpenAI } from "@langchain/openai";
import { useLLMOutput } from "@llm-ui/react";
import {
  codeBlockLookBack,
  findCompleteCodeBlock,
  findPartialCodeBlock,
} from "@llm-ui/code";
import { markdownLookBack } from "@llm-ui/markdown";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { CodeBlockRenderer } from "./CodeBlockRenderer";

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
    model: "google/gemini-2.0-flash-001",
    apiKey: "none",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = new HumanMessage(input);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const newMessages = [...messages, userMessage];
      const response = await chatModel.invoke(newMessages);
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

  const MessageContent = ({ content }) => {
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
