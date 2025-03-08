import { useEffect, useState } from "react";
import { LLM_MODELS } from "@/consts";
import type { IPromptTemplate } from "@types";
import { appState } from "@lib/appStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Label } from "@components/ui/label";
import { DEFAULT_TEMPLATE_ID, DEFAULT_MODEL } from "@/consts";

interface ChatControlsProps {
  onTemplateChange: (template: IPromptTemplate) => void;
  onModelChange: (model: string) => void;
  selectedTemplateId?: string;
  selectedModel: string;
}

export default function ChatControls({
  onTemplateChange,
  onModelChange,
  selectedTemplateId: propSelectedTemplateId,
  selectedModel: propSelectedModel,
}: ChatControlsProps) {
  const [templates, setTemplates] = useState<IPromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize from appState or props
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    () => DEFAULT_TEMPLATE_ID || propSelectedTemplateId,
  );
  const [selectedModel, setSelectedModel] = useState(
    () => DEFAULT_MODEL || propSelectedModel,
  );

  // Sync with appState
  useEffect(() => {
    appState.setKey("selectedTemplateId", selectedTemplateId);
    appState.setKey("selectedModel", selectedModel);
  }, [selectedTemplateId, selectedModel]);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${appState.get().apiBaseUrl}/prompts/list.json`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch templates");
        }
        const data = await response.json();
        setTemplates(data);
      } catch (err) {
        console.error("Error fetching templates:", err);
        setError("Failed to load templates");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates().then(() => {
      if (appState.get().selectedTemplateId)
        handleTemplateChange(appState.get().selectedTemplateId);
    });
  }, []);

  const handleTemplateChange = async (templateId: string) => {
    try {
      setSelectedTemplateId(templateId);
      const response = await fetch(
        `${appState.get().apiBaseUrl}/prompts/${templateId}.json`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch template");
      }
      const template = await response.json();
      onTemplateChange(template);
    } catch (err) {
      console.error("Error fetching template:", err);
    }
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    onModelChange(model);
  };

  return (
    <div className="bg-card flex flex-col items-start gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <Label htmlFor="template-select">Templates</Label>
        <Select
          value={selectedTemplateId}
          onValueChange={handleTemplateChange}
          disabled={loading}
        >
          <SelectTrigger id="template-select" className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select template" />
          </SelectTrigger>
          <SelectContent>
            {error ? (
              <SelectItem value="error" disabled>
                Error loading templates
              </SelectItem>
            ) : loading ? (
              <SelectItem value="loading" disabled>
                Loading...
              </SelectItem>
            ) : (
              templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex w-full items-center gap-2 sm:w-auto">
        <Label htmlFor="model-select">Model</Label>
        <Select value={selectedModel} onValueChange={handleModelChange}>
          <SelectTrigger id="model-select" className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {LLM_MODELS.map((model) => (
              <SelectItem key={model} value={model}>
                {model.split("/")[1]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
