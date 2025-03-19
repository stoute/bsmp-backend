import React, { useState, useEffect, useRef } from "react";
import PromptTemplateList from "@components/prompt-templates/PromptTemplateList.tsx";
import PromptTemplateEditor from "@components/prompt-templates/PromptTemplateEditor.tsx";
import { appState } from "@lib/appStore";
import type { PromptTemplate } from "@lib/ai/types";
import { useAppService } from "@lib/hooks/useAppService";
import { PromptTemplateFactory } from "@lib/ai/prompt-templates/PromptTemplateFactory.ts";
import { showToast } from "@lib/toast";
import {
  template_saved,
  template_deleted,
  template_duplicated,
  template_error_saving,
  template_error_deleting,
  template_error_duplicating,
} from "../../paraglide/messages";

interface PromptTemplatesProps {
  initialTemplate?: PromptTemplate;
}
const apiEndPoint = appState.get().apiBaseUrl + "/prompts/index.json";

const PromptTemplates: React.FC<PromptTemplatesProps> = ({
  initialTemplate,
}) => {
  // Move all useState declarations to the top
  const [selectedTemplate, setSelectedTemplate] = useState<
    PromptTemplate | undefined
  >(initialTemplate);
  const [selectedId, setSelectedId] = useState<string | undefined>(() => {
    return appState.get().selectedTemplateId || initialTemplate?.id;
  });

  // Move useAppService hook here, before any conditional returns
  const { isReady } = useAppService();
  const listRef = useRef<{ fetchPromptTemplates: () => Promise<void> }>();

  // Define all handler functions before useEffect
  const handleNewTemplate = () => {
    setSelectedTemplate(PromptTemplateFactory.createDefault());
    setSelectedId(undefined);
  };

  const handleSelectTemplate = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    setSelectedId(template.id);
  };

  const handleSaveTemplate = async (template: PromptTemplate) => {
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

      // Check if this is a new template by looking at the operation that was performed
      const isNewTemplate =
        !template.created_at || template.created_at === template.updated_at;

      showToast({
        title: template_saved(),
        description: isNewTemplate
          ? "New template created"
          : "Template updated",
        variant: "success",
      });
    } catch (error) {
      console.error("Error saving template:", error);
      showToast({
        title: template_error_saving(),
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (template: PromptTemplate) => {
    setSelectedTemplate(undefined);
    setSelectedId(undefined);

    if (listRef.current) {
      await listRef.current.fetchPromptTemplates();
    }
    showToast({
      title: template_deleted(),
      variant: "success",
    });
  };

  const handleDuplicateTemplate = async (template: PromptTemplate) => {
    // Set the newly created template as selected
    setSelectedTemplate(template);
    setSelectedId(template.id);
    // Trigger list refresh
    if (listRef.current) {
      await listRef.current.fetchPromptTemplates();
    }
    showToast({
      title: template_duplicated(),
      variant: "success",
    });
  };

  // Effects after all hooks and function definitions
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

  useEffect(() => {
    appState.setKey("selectedTemplateId", selectedId);
  }, [selectedId]);

  // Move the conditional return after all hooks are declared
  if (!isReady) return null;

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
