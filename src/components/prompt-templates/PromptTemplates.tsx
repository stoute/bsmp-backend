import React, { useState, useEffect, useRef } from "react";
import PromptTemplateList from "@components/prompt-templates/PromptTemplateList.tsx";
import PromptTemplateEditor from "@components/prompt-templates/PromptTemplateEditor.tsx";
import type { IPromptTemplate } from "@types";

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

const apiEndPoint = "https://bsmp.netlify.app/api/prompts/index.json";
// const apiEndPoint = "/api/prompts/index.json";

const PromptTemplates: React.FC<PromptTemplatesProps> = ({
  initialTemplate,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<
    IPromptTemplate | undefined
  >(initialTemplate);
  const [selectedId, setSelectedId] = useState<string | undefined>(() => {
    // Only access localStorage in the browser
    if (typeof window !== "undefined") {
      const savedId = localStorage.getItem("selectedTemplateId");
      return savedId || initialTemplate?.id;
    }
    return initialTemplate?.id;
  });
  const listRef = useRef<{ fetchPromptTemplates: () => Promise<void> }>();

  // Fetch the selected template when component mounts or selectedId changes
  useEffect(() => {
    const fetchSelectedTemplate = async () => {
      if (!selectedId) {
        handleNewTemplate();
        return;
      }
      try {
        const response = await fetch(apiEndPoint.replace("index", selectedId));
        if (!response.ok) {
          throw new Error("Failed to fetch template");
        }
        const template = await response.json();
        setSelectedTemplate(template);
      } catch (error) {
        console.error("Error fetching selected template:", error);
        handleNewTemplate();
      }
    };
    fetchSelectedTemplate();
  }, [selectedId]);

  // Save selectedId to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (selectedId) {
        localStorage.setItem("selectedTemplateId", selectedId);
      } else {
        localStorage.removeItem("selectedTemplateId");
      }
    }
  }, [selectedId]);

  const handleSelectTemplate = (template: IPromptTemplate) => {
    setSelectedTemplate(template);
    setSelectedId(template.id);
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(newTemplate);
    setSelectedId(undefined);
  };

  const handleSaveTemplate = async (template: IPromptTemplate) => {
    try {
      // First update the selected template and ID
      setSelectedTemplate(template);
      setSelectedId(template.id);

      // Then refresh the list to show the updated/new item
      if (listRef.current) {
        await listRef.current.fetchPromptTemplates();
      }

      // After list refresh, ensure the template is still selected
      setSelectedTemplate(template);
      setSelectedId(template.id);
    } catch (error) {
      console.error("Error handling template save:", error);
    }
  };

  const handleDeleteTemplate = async (template: IPromptTemplate) => {
    setSelectedTemplate(undefined);
    setSelectedId(undefined);

    if (listRef.current) {
      await listRef.current.fetchPromptTemplates();
    }
  };

  const handleDuplicateTemplate = async (template: IPromptTemplate) => {
    // Set the newly created template as selected
    setSelectedTemplate(template);
    setSelectedId(template.id);
    // Trigger list refresh
    if (listRef.current) {
      await listRef.current.fetchPromptTemplates();
    }
  };

  return (
    <div className="flex w-full flex-col gap-4 md:flex-row">
      <div className="w-full md:w-1/3">
        <PromptTemplateList
          ref={listRef}
          dataUrl={apiEndPoint.replace("index", "list")}
          onSelect={handleSelectTemplate}
          onNew={handleNewTemplate}
          selectedId={selectedId}
        />
      </div>
      <div className="w-full md:w-2/3">
        {selectedTemplate && (
          <PromptTemplateEditor
            key={selectedTemplate.id || "new"}
            apiEndPoint={apiEndPoint}
            promptTemplate={selectedTemplate}
            onSave={handleSaveTemplate}
            onDelete={handleDeleteTemplate}
            onDuplicate={handleDuplicateTemplate}
            onCancel={() => setSelectedTemplate(undefined)}
          />
        )}
      </div>
    </div>
  );
};

export default PromptTemplates;
