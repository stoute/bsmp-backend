import { useEffect, useState } from "react";
import type { IPromptTemplate } from "@types";
import Chat from "./Chat";
import PromptTemplates from "../prompt-templates/PromptTemplates";
import { useChatModel } from "@lib/hooks/useChatModel";
import { appState } from "@lib/appStore";

interface ChatTemplatesProps {
  model?: string;
  systemPrompt?: string;
}

export default function ChatTemplates({
  model = "openai/gpt-3.5-turbo",
  systemPrompt = "You are a helpful assistant.",
}: ChatTemplatesProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>();
  const [selectedTemplate, setSelectedTemplate] = useState<IPromptTemplate>();
  const llm = useChatModel(model);

  useEffect(() => {
    // Fetch the selected template when component mounts or selectedId changes
    const fetchSelectedTemplate = async () => {
      if (!selectedTemplateId) {
        return;
      }
      try {
        const response = await fetch(
          appState.get().apiBaseUrl + `/prompts/${selectedTemplateId}.json`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch template");
        }
        const template = await response.json();
        setSelectedTemplate(template);
        console.log(selectedTemplate);
      } catch (error) {
        console.error("Error fetching selected template:", error);
      }
    };
    fetchSelectedTemplate();
  }, [selectedTemplateId]);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
        <Chat
          key={selectedTemplate || "default"}
          model={model}
          systemPrompt={selectedTemplate?.systemPrompt || systemPrompt}
          llm={llm}
        />
        <PromptTemplates
          initialTemplate={undefined}
          onSelect={(template) => setSelectedTemplateId(template.id)}
        />
      </div>
    </div>
  );
}
