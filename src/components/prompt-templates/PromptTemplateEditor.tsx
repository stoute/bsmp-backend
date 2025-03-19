import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2, Save, Plus, AlertCircle, Copy } from "lucide-react";
import type { PromptTemplate } from "@lib/ai/types.ts";
import { appState } from "@lib/appStore";
import { toast } from "../../lib/toast";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form.tsx";
import { Input } from "@components/ui/input.tsx";
import { Button } from "@components/ui/button.tsx";
import { Textarea } from "@components/ui/textarea.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/ui/card.tsx";
import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert.tsx";
import { Badge } from "@components/ui/badge.tsx";
import { Separator } from "@components/ui/separator.tsx";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@components/ui/alert-dialog.tsx";
import { useAppService } from "@lib/hooks/useAppService.ts";
import { PromptTemplateFactory } from "@lib/ai/prompt-templates/PromptTemplateFactory";
import {
  template_name,
  template_description,
  template_system_prompt,
  template_variables,
  template_tags,
  template_save,
  template_saved,
  template_delete,
  template_duplicate,
  template_cancel,
  template_confirm_delete,
  template_confirm_delete_description,
  template_confirm_delete_cancel,
  template_confirm_delete_continue,
  template_name_required,
  template_variables_description,
  template_label,
} from "../../paraglide/messages";

// Define the form schema using zod
const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, template_name_required()),
  description: z.string().optional(),
  systemPrompt: z.string().optional(),
  template: z.string().optional(), // Remove min validation
  variables: z.array(z.string()).optional().default([]),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

interface PromptTemplateEditorProps {
  apiEndPoint: string;
  promptTemplate?: PromptTemplate;
  onSave?: (template: PromptTemplate) => void;
  onDelete?: (template: PromptTemplate) => void; // Changed to pass full template
  onDuplicate?: (template: PromptTemplate) => void;
  onCancel?: () => void;
}

const PromptTemplateEditor: React.FC<PromptTemplateEditorProps> = ({
  apiEndPoint = "/api/prompts/index.json",
  promptTemplate,
  onSave,
  onDelete,
  onDuplicate,
  onCancel,
}) => {
  const [isNew, setIsNew] = useState(!promptTemplate?.id);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [variableInput, setVariableInput] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { appService } = useAppService();

  // Initialize form with default values or provided promptTemplate
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: promptTemplate || PromptTemplateFactory.createDefault(),
  });

  // Reset form when promptTemplate changes
  useEffect(() => {
    if (promptTemplate) {
      form.reset(promptTemplate);
      setIsNew(!promptTemplate.id);
    } else {
      form.reset(PromptTemplateFactory.createDefault());
      setIsNew(true);
    }
  }, [promptTemplate, form]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let response;
      let data;

      if (isNew) {
        // Create new prompt template
        response = await fetch(apiEndPoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
      } else {
        // Update existing prompt template
        response = await fetch(apiEndPoint.replace("index", values.id), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save prompt template");
      }

      data = await response.json();

      // Show success toast here
      toast({
        title: template_saved(),
        description: isNew ? "New template created" : "Template updated",
        variant: "success",
      });

      if (onSave) {
        onSave(data);
      }

      if (isNew) {
        form.reset(data);
        setIsNew(false);
      }
    } catch (err) {
      // Show error toast directly
      toast({
        title: template_error_saving(),
        description:
          err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle template deletion
  const handleDelete = () => {
    if (!promptTemplate) return;
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!promptTemplate) return;

    try {
      const response = await fetch(
        apiEndPoint.replace("index", promptTemplate.id),
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete template");
      }

      // Show success toast directly
      toast({
        title: "Template deleted successfully",
        variant: "success",
      });

      if (onDelete) {
        onDelete(promptTemplate);
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      // Show error toast directly
      toast({
        title: "Failed to delete template",
        variant: "destructive",
      });
    }

    setShowDeleteDialog(false);
  };

  const handleDuplicate = async () => {
    if (!promptTemplate) return;
    setLoading(true);

    try {
      const response = await fetch(apiEndPoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...promptTemplate,
          id: undefined, // Remove id to create new entry
          name: `${promptTemplate.name} (Copy)`,
          created_at: undefined,
          updated_at: undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to duplicate prompt template",
        );
      }

      const data = await response.json();

      // Show success toast directly
      toast({
        title: "Prompt template duplicated successfully!",
        variant: "success",
      });

      if (onDuplicate) {
        onDuplicate(data);
      }
    } catch (err) {
      // Show error toast directly
      toast({
        title: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new variable
  const addVariable = () => {
    if (!variableInput.trim()) return;

    const currentVariables = form.getValues("variables") || [];
    if (!currentVariables.includes(variableInput.trim())) {
      form.setValue("variables", [...currentVariables, variableInput.trim()]);
    }
    setVariableInput("");
  };

  // Handle removing a variable
  const removeVariable = (variable: string) => {
    const currentVariables = form.getValues("variables") || [];
    form.setValue(
      "variables",
      currentVariables.filter((v) => v !== variable),
    );
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            {isNew ? "Create New Prompt Template" : "Edit Prompt Template"}
          </CardTitle>
          <CardDescription>
            {isNew
              ? "Create a new prompt template for AI generation"
              : "Edit the selected prompt template"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{template_name()}</FormLabel>
                      <FormControl>
                        <Input placeholder="My Template" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isNew && (
                  <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID</FormLabel>
                        <FormControl>
                          <Input disabled {...field} />
                        </FormControl>
                        <FormDescription>
                          Unique identifier (auto-generated)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{template_description()}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A brief description of what this template does"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="systemPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{template_system_prompt()}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="You are a helpful assistant..."
                        className="min-h-[200px] resize-none font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="template"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{template_label()}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write a short story about {character} in a {setting}."
                        className="min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {template_variables_description()}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>{template_variables()}</FormLabel>
                <div className="mt-2 mb-4 flex flex-wrap gap-2">
                  {form.watch("variables")?.map((variable) => (
                    <Badge key={variable} variant="secondary">
                      {variable}
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground ml-1"
                        onClick={() => removeVariable(variable)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="variable_name"
                    value={variableInput}
                    onChange={(e) => setVariableInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addVariable();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addVariable}
                    disabled={!variableInput.trim()}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>
                {form.formState.errors.variables && (
                  <p className="text-destructive mt-2 text-sm font-medium">
                    {form.formState.errors.variables.message}
                  </p>
                )}
              </div>

              <Separator />

              {appService?.getUser()?.role === "admin" && (
                <div className="crud-buttons flex justify-between">
                  {!isNew && (
                    <div className="flex gap-2">
                      {onDelete && (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={handleDelete}
                          disabled={loading}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {template_delete()}
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleDuplicate}
                        disabled={loading}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        {template_duplicate()}
                      </Button>
                    </div>
                  )}
                  <div className="ml-auto flex gap-2">
                    {onCancel && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={loading}
                      >
                        {template_cancel()}
                      </Button>
                    )}
                    <Button type="submit" disabled={loading}>
                      <Save className="mr-2 h-4 w-4" />
                      {isNew ? template_save() : template_save()}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{template_confirm_delete()}</AlertDialogTitle>
            <AlertDialogDescription>
              {template_confirm_delete_description()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              {template_confirm_delete_cancel()}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              {template_confirm_delete_continue()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PromptTemplateEditor;
