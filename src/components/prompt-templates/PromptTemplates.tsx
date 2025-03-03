import React, { useState, useEffect } from "react";
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
  const [listKey, setListKey] = useState(0); // Add this to force list reload

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

  // Modified to handle list reload and selection
  const handleSaveTemplate = async (template: IPromptTemplate) => {
    console.log("Saving template:", template);
    // Force list to reload by incrementing key
    setListKey((prev) => prev + 1);
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

  const confirmDelete = () => {
    if (templateToDelete) {
      setSelectedTemplate(undefined);
      setSelectedId(undefined);
      // Force list to reload
      setListKey((prev) => prev + 1);
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="flex w-full flex-col gap-4 md:flex-row">
        <div className="w-full md:w-1/3">
          <PromptTemplateList
            key={listKey} // Add this to force remount
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
