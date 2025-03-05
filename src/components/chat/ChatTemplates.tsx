import { useEffect, useState } from "react";
import type { IPromptTemplate } from "@types";
import Chat from "./Chat";
import PromptTemplates from "../prompt-templates/PromptTemplates";
import { useChatModel } from "@lib/hooks/useChatModel";

interface ChatTemplatesProps {
  model?: string;
  systemPrompt?: string;
}

export default function ChatTemplates({
  model = "openai/gpt-3.5-turbo",
  systemPrompt = "You are a helpful assistant.",
}: ChatTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<
    IPromptTemplate | undefined
  >();

  const llm = useChatModel(model);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
        <Chat
          key={selectedTemplate?.id || "default"}
          model={model}
          systemPrompt={selectedTemplate?.systemPrompt || systemPrompt}
          llm={llm}
        />
        <PromptTemplates
          initialTemplate={undefined}
          onSelect={(template) => setSelectedTemplate(template)}
        />
      </div>
    </div>
  );
}
