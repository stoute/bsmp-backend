import { useState, useEffect } from "react";
import { type Highlighter } from "shiki";
import * as shiki from "shiki";

export function useShiki() {
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initHighlighter = async () => {
      try {
        const hl = await shiki.createHighlighter({
          themes: ["github-dark", "github-light"],
          langs: [
            "javascript",
            "typescript",
            "jsx",
            "tsx",
            "json",
            "bash",
            "markdown",
            "html",
            "css",
            "python",
            "rust",
          ],
        });
        setHighlighter(hl);
      } catch (error) {
        console.error("Failed to initialize Shiki:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initHighlighter();
  }, []);

  return { highlighter, isLoading };
}
