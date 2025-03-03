import React, { useState, useEffect } from "react";
import PromptTemplateList from "@components/prompt-templates/PromptTemplateList.tsx";
import PromptTemplateEditor from "@components/prompt-templates/PromptTemplateEditor.tsx";
import { reloadPage } from "@lib/utils";
import type { IPromptTemplate } from "@types.ts";

interface PromptTemplatesProps {
  initialTemplate?: IPromptTemplate;
}

const newTemplate: IPromptTemplate = {
  id: "",
  name: "",
  description: "",
  systemPrompt: "",
  template: "",
  variables: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const PromptTemplates: React.FC<PromptTemplatesProps> = ({
  initialTemplate,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<
    IPromptTemplate | undefined
  >(initialTemplate);
  const [selectedId, setSelectedId] = useState<string | undefined>(
    initialTemplate?.id,
  );

  useEffect(() => {
    if (!initialTemplate) {
      handleNewTemplate();
    }
  }, []);

  // Handle template selection from the list
  const handleSelectTemplate = (template: IPromptTemplate) => {
    setSelectedTemplate(template);
    setSelectedId(template.id);
  };

  // Handle creating a new template
  const handleNewTemplate = () => {
    setSelectedTemplate(newTemplate);
    setSelectedId(undefined);
  };

  // Handle saving a template
  const handleSaveTemplate = (template: IPromptTemplate) => {
    console.log("Saving template:", template);
    setSelectedTemplate(template);
    setSelectedId(template.id);
    reloadPage();
    // todo: Refresh the list after saving
  };

  // Handle deleting a template
  const handleDeleteTemplate = (id: string) => {
    setSelectedTemplate(undefined);
    // todo: setSelectedTemplate({});
    setSelectedId(undefined);
    // todo: Refresh the list after deleting
    reloadPage();
  };

  return (
    <div className="flex w-full flex-col gap-4 md:flex-row">
      <div className="w-full md:w-1/3">
        <PromptTemplateList
          onSelect={handleSelectTemplate}
          onNew={handleNewTemplate}
          selectedId={selectedId}
        />
      </div>
      <div className="w-full md:w-2/3">
        {selectedTemplate && (
          <PromptTemplateEditor
            promptTemplate={selectedTemplate}
            onSave={handleSaveTemplate}
            onDelete={handleDeleteTemplate}
            onCancel={() => setSelectedTemplate(undefined)}
          />
        )}
      </div>
    </div>
  );
};

export default PromptTemplates;
