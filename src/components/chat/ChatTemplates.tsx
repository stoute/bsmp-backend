import { useState } from "react";
import type { IPromptTemplate } from "@types";
import Chat from "./Chat";
import ChatControls from "./ChatControls";
import { appState } from "@lib/appStore";

export default function ChatTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<
    IPromptTemplate | undefined
  >();
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    appState.get().selectedModel;
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
