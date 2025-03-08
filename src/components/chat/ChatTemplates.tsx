import { useState } from "react";
import type { IPromptTemplate } from "@types";
import Chat from "./Chat";
import ChatControls from "./ChatControls";
import { appState } from "@lib/appStore";

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
  const [selectedModel, setSelectedModel] = useState(() => {
    const storedModel = appState.get().selectedModel;
    return storedModel || model;
  });

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
        template={selectedTemplate}
      />
    </div>
  );
}
