import { type LLMOutputComponent } from "@llm-ui/react";
import * as shiki from "shiki";
import { useEffect, useState } from "react";

export const CodeBlockRenderer: LLMOutputComponent = ({ blockMatch }) => {
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const highlightCode = async () => {
      try {
        const highlighter = await shiki.createHighlighter({
          themes: ["github-dark"],
          langs: [
            "javascript",
            "typescript",
            "jsx",
            "tsx",
            "html",
            "css",
            "json",
            "markdown",
            "yaml",
            "bash",
            "text",
            "python",
            "rust",
          ],
        });

        // Extract language and code from the markdown code block
        const codeBlock = blockMatch.output;
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/;
        const match = codeBlock.match(codeBlockRegex);

        console.log(highlighter.getBundledThemes());

        if (match) {
          const [, lang = "text", code] = match;
          // Ensure the language is supported, fallback to 'text' if not
          const supportedLang = highlighter.getLoadedLanguages().includes(lang)
            ? lang
            : "text";

          const html = await highlighter.codeToHtml(code.trim(), {
            lang: supportedLang,
            themes: {
              light: "github-dark",
              dark: "github-dark",
            },
          });
          setHighlightedCode(html);
        } else {
          // If no language specified, treat as plain text
          const html = await highlighter.codeToHtml(codeBlock, {
            lang: "text",
            themes: {
              light: "github-dark",
              dark: "github-dark",
            },
          });
          setHighlightedCode(html);
        }
      } catch (error) {
        console.error("Error highlighting code:", error);
        // Fallback to plain text
        setHighlightedCode(
          `<pre class="shiki"><code>${blockMatch.output}</code></pre>`,
        );
      } finally {
        setIsLoading(false);
      }
    };

    highlightCode();
  }, [blockMatch.output]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className="code-block not-prose"
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
  );
};
