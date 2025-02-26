import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2, Save, Plus, AlertCircle } from "lucide-react";
import type { IPromptTemplate } from "@types.ts";

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

// Define the form schema using zod
const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  systemPrompt: z.string().min(1, "System prompt is required"),
  template: z.string().optional(),
  variables: z.array(z.string()),
  // variables: z.array(z.string()).min(1, "At least one variable is required"),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

interface PromptTemplateEditorProps {
  promptTemplate?: IPromptTemplate;
  onSave?: (template: IPromptTemplate) => void;
  onDelete?: (id: string) => void;
  onCancel?: () => void;
}

const PromptTemplateEditor: React.FC<PromptTemplateEditorProps> = ({
  promptTemplate,
  onSave,
  onDelete,
  onCancel,
}) => {
  const [isNew, setIsNew] = useState(!promptTemplate?.id);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [variableInput, setVariableInput] = useState("");

  // Initialize form with default values or provided promptTemplate
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: promptTemplate || {
      name: "",
      description: "",
      systemPrompt: "",
      template: "",
      variables: [],
    },
  });

  // Reset form when promptTemplate changes
  useEffect(() => {
    if (promptTemplate) {
      form.reset(promptTemplate);
      setIsNew(!promptTemplate.id);
    } else {
      form.reset({
        name: "",
        description: "",
        systemPrompt: "",
        template: "",
        variables: [],
      });
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
        response = await fetch("/api/prompts/index.json", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
      } else {
        // Update existing prompt template
        response = await fetch(`/api/prompts/${values.id}.json`, {
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
      setSuccess(
        isNew
          ? "Prompt template created successfully!"
          : "Prompt template updated successfully!",
      );

      if (onSave) {
        onSave(data);
      }

      if (isNew) {
        form.reset(data);
        setIsNew(false);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle template deletion
  const handleDelete = async () => {
    if (!promptTemplate?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/prompts/${promptTemplate.id}.json`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to delete prompt template",
        );
      }

      setSuccess("Prompt template deleted successfully!");

      if (onDelete) {
        onDelete(promptTemplate.id);
      }

      form.reset({
        name: "",
        description: "",
        systemPrompt: "",
        template: "",
        variables: [],
      });
      setIsNew(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
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
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for this prompt template
                    </FormDescription>
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder=""
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief explanation of what this template does
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder=""
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The system instructions for the AI model
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="template"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write a short story about {{character}} in a {{setting}}."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The template with variables in double curly braces:{" "}
                    {/* {{ variable }} */}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Variables</FormLabel>
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

            <div className="flex justify-between">
              {!isNew && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
              <div className="ml-auto flex gap-2">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isNew ? "Create" : "Update"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PromptTemplateEditor;
