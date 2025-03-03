import React, { useState, useEffect, useRef } from "react";
import PromptTemplateList from "@components/prompt-templates/PromptTemplateList.tsx";
import PromptTemplateEditor from "@components/prompt-templates/PromptTemplateEditor.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@components/ui/alert-dialog";
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

const PromptTemplates: React.FC<PromptTemplatesProps> = ({
  initialTemplate,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<
    IPromptTemplate | undefined
  >(initialTemplate);
  const [selectedId, setSelectedId] = useState<string | undefined>(
    initialTemplate?.id,
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<
    string | undefined
  >();
  const listRef = useRef<{ fetchPromptTemplates: () => Promise<void> }>();

  useEffect(() => {
    if (!initialTemplate) {
      handleNewTemplate();
    }
  }, []);

  const handleSelectTemplate = (template: IPromptTemplate) => {
    setSelectedTemplate(template);
    setSelectedId(template.id);
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(newTemplate);
    setSelectedId(undefined);
  };

  const handleSaveTemplate = async (template: IPromptTemplate) => {
    console.log("Saving template:", template);
    // Wait for next tick to ensure list has reloaded
    setTimeout(() => {
      setSelectedTemplate(template);
      setSelectedId(template.id);
    }, 0);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplateToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (templateToDelete) {
      setSelectedTemplate(undefined);
      setSelectedId(undefined);
      // Refresh the list after successful deletion
      if (listRef.current) {
        await listRef.current.fetchPromptTemplates();
      }
    }
    setShowDeleteDialog(false);
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
    <>
      <div className="flex w-full flex-col gap-4 md:flex-row">
        <div className="w-full md:w-1/3">
          <PromptTemplateList
            ref={listRef}
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
              onDuplicate={handleDuplicateTemplate}
              onCancel={() => setSelectedTemplate(undefined)}
            />
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              prompt template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PromptTemplates;
