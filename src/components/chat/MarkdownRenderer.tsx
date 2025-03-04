import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type LLMOutputComponent } from "@llm-ui/react";

export const MarkdownRenderer: LLMOutputComponent = ({ blockMatch }) => {
  const markdown = blockMatch.output;

  // Add error handling and default content
  if (!markdown) {
    return null;
  }

  return (
    <div className="prose dark:prose-invert prose-pre:bg-zinc-100 dark:prose-pre:bg-zinc-800 prose-pre:text-zinc-800 dark:prose-pre:text-zinc-200 max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Add custom components for better rendering
          code: ({ node, inline, className, children, ...props }) => {
            return inline ? (
              <code
                className="rounded bg-zinc-100 px-1 dark:bg-zinc-800"
                {...props}
              >
                {children}
              </code>
            ) : (
              <pre className="overflow-auto rounded-lg p-4">
                <code className="language-text" {...props}>
                  {children}
                </code>
              </pre>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};
