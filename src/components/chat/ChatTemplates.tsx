import { useState, useEffect } from "react";
import type { IPromptTemplate } from "@types";
import Chat from "./Chat";
import ChatControls from "./ChatControls";
import { appState } from "@lib/appStore";

export default function ChatTemplates() {
  // Initialize with undefined to match server-side render
  const [selectedTemplate, setSelectedTemplate] = useState<
    IPromptTemplate | undefined
  >(undefined);
  const [selectedModel, setSelectedModel] = useState<string>(
    "openai/gpt-3.5-turbo",
  );

  // Use useEffect to set initial state from appState after hydration
  useEffect(() => {
    const savedModel = appState.get().selectedModel;
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);

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
