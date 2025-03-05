import { useState } from "react";
import type { IPromptTemplate } from "@types";
import Chat from "./Chat";
import ChatControls from "./ChatControls";
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
  const [selectedModel, setSelectedModel] = useState(model);
  const llm = useChatModel(selectedModel);

  return (
    <div className="flex flex-col gap-4">
      <ChatControls
        onTemplateChange={setSelectedTemplate}
        onModelChange={setSelectedModel}
        selectedTemplateId={selectedTemplate?.id}
        selectedModel={selectedModel}
      />
      <Chat
        key={`${selectedTemplate?.id || "default"}-${selectedModel}`}
        model={selectedModel}
        systemPrompt={selectedTemplate?.systemPrompt || systemPrompt}
        llm={llm}
      />
    </div>
  );
}
