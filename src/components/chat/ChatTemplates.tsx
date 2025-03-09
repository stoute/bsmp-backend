import { useState } from "react";
import type { IPromptTemplate } from "@types";
import Chat from "./Chat";
import ChatControls from "./ChatControls";
import { appState } from "@lib/appStore";

const DEFAULT_MODEL = "openai/gpt-3.5-turbo";

export default function ChatTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<
    IPromptTemplate | undefined
  >(undefined);

  // Initialize with the stored model from appState
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return appState.get().selectedModel || DEFAULT_MODEL;
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
