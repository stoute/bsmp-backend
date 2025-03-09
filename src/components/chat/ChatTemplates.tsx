import { useState } from "react";
import type { IPromptTemplate } from "@types";
import Chat from "./Chat";
import ChatControls from "./ChatControls";
import { appState } from "@lib/appStore";

const DEFAULT_MODEL = "openai/gpt-3.5-turbo";

export default function ChatTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<
    IPromptTemplate | undefined
  >(() => {
    return undefined;
  });

  const onTemplateChange = (template: IPromptTemplate) => {
    setSelectedTemplate(template);
  };

  return (
    <div className="flex flex-col gap-4">
      <ChatControls
        onTemplateChange={onTemplateChange}
        onModelChange={() => {}}
        selectedTemplateId={selectedTemplate?.id}
      />
      <Chat
        key={`${selectedTemplate?.id || "default"}`}
        template={selectedTemplate}
      />
    </div>
  );
}
