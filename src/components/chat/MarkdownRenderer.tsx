import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type LLMOutputComponent } from "@llm-ui/react";
import { useShiki } from "@lib/hooks/useShiki";

export const MarkdownRenderer: LLMOutputComponent = ({ blockMatch }) => {
  const markdown = blockMatch.output;
  const { highlighter, isLoading } = useShiki();

  if (!markdown) return null;

  return (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const lang = match ? match[1] : "text";

            if (inline) {
              return (
                <code
                  className="rounded bg-zinc-100 px-1 dark:bg-zinc-800"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            const code = String(children).replace(/\n$/, "");

            // If Shiki is not ready yet, show a basic pre block
            if (isLoading || !highlighter) {
              return (
                <pre className="overflow-x-auto rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
                  <code {...props}>{code}</code>
                </pre>
              );
            }

            // Use the current theme based on dark mode
            const isDark = document.documentElement.classList.contains("dark");
            const theme = isDark ? "github-dark" : "github-light";

            const html = highlighter.codeToHtml(code, {
              lang,
              theme,
            });

            return (
              <div
                className="not-prose relative overflow-hidden rounded-lg"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};
