import { type LLMOutputComponent } from "@llm-ui/react";
import { useEffect, useState } from "react";
import { useShiki } from "@lib/hooks/useShiki";

export const CodeBlockRenderer: LLMOutputComponent = ({ blockMatch }) => {
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const { highlighter, isLoading: isShikiLoading } = useShiki();

  useEffect(() => {
    const highlightCode = async () => {
      if (!highlighter) return;

      try {
        // Extract language and code from the markdown code block
        const codeBlock = blockMatch.output;
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/;
        const match = codeBlock.match(codeBlockRegex);

        if (match) {
          const [, lang = "text", code] = match;
          // Ensure the language is supported, fallback to 'text' if not
          const supportedLang = highlighter.getLoadedLanguages().includes(lang)
            ? lang
            : "text";

          const html = await highlighter.codeToHtml(code.trim(), {
            lang: supportedLang,
            theme: "github-dark",
          });
          setHighlightedCode(html);
        } else {
          // If no language specified, treat as plain text
          const html = await highlighter.codeToHtml(codeBlock, {
            lang: "text",
            theme: "github-dark",
          });
          setHighlightedCode(html);
        }
      } catch (error) {
        console.error("Error highlighting code:", error);
        // Fallback to plain text
        setHighlightedCode(
          `<pre class="shiki"><code>${blockMatch.output}</code></pre>`,
        );
      }
    };

    highlightCode();
  }, [blockMatch.output, highlighter]);

  if (isShikiLoading) {
    return <div>Loading syntax highlighter...</div>;
  }

  if (!highlightedCode) {
    return <div>Processing code...</div>;
  }

  return (
    <div
      className="code-block not-prose"
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
  );
};
