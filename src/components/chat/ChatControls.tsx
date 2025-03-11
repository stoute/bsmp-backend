import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useStore } from "@nanostores/react";
import type { IPromptTemplate } from "@types";
import type { OpenRouterModel } from "@lib/ai/types";
import { appState, chatManager, templateList } from "@lib/appStore";
import { useAppService } from "@lib/hooks/useAppService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Label } from "@components/ui/label";
import { DEFAULT_TEMPLATE_ID, DEFAULT_MODEL } from "@/consts";
import { getMatchingOpenRouterModels } from "@lib/utils/modelUtils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { Button } from "@components/ui/button";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@lib/utils";

export default function ChatControls() {
  // Group all useState hooks together at the top
  const [templates, setTemplates] = useState<IPromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState(() => {
    const storedTemplateId = appState.get().selectedTemplateId;
    return storedTemplateId || DEFAULT_TEMPLATE_ID;
  });
  const [selectedModel, setSelectedModel] = useState(() => {
    const storedModel = appState.get().selectedModel;
    return storedModel || DEFAULT_MODEL;
  });

  // Filter models based on search query
  const filteredModels = useMemo(() => {
    if (!searchQuery) return models;
    const query = searchQuery.toLowerCase();
    return models.filter((model) =>
      (model.name?.toLowerCase() || model.id.toLowerCase()).includes(query),
    );
  }, [models, searchQuery]);

  // Refs
  const initialLoadRef = useRef(true);
  const templateListStore = useStore(templateList);

  // App service hook
  const { isReady } = useAppService();

  // Group all useEffect hooks together
  useEffect(() => {
    const storedModel = appState.get().selectedModel;
    const storedTemplateId = appState.get().selectedTemplateId;
    if (storedModel) {
      setSelectedModel(storedModel);
    }
    if (storedTemplateId) {
      setSelectedTemplateId(storedTemplateId);
    }
  }, []);

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
      if (initialLoadRef.current) {
        const currentChat = appState.get().currentChat;
        const storedTemplateId = appState.get().selectedTemplateId;

        if (!currentChat?.messages?.length && storedTemplateId) {
          handleTemplateChange(storedTemplateId);
        }
        initialLoadRef.current = false;
      }
    });
  }, []);

  useEffect(() => {
    if (!isReady) return;

    try {
      const matchingModels = getMatchingOpenRouterModels();
      // Ensure we always have an array, even if empty
      setModels(Array.isArray(matchingModels) ? matchingModels : []);
    } catch (error) {
      console.error("Error loading models:", error);
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  }, [isReady]);

  // Callbacks
  const handleClearChat = useCallback(() => {
    const manager = chatManager.get();
    if (!manager) return;
    manager.clearMessages();
  }, []);

  const handleModelChange = useCallback(async (model: string) => {
    try {
      setSelectedModel(model);
      appState.setKey("selectedModel", model);
      setOpen(false);
    } catch (err) {
      console.error("Error changing model:", err);
    }
  }, []);

  const handleTemplateChange = useCallback(async (templateId: string) => {
    try {
      setSelectedTemplateId(templateId);
      const response = await fetch(
        `${appState.get().apiBaseUrl}/prompts/${templateId}.json`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch template");
      }
      const template: IPromptTemplate = await response.json();
      appState.setKey("selectedTemplate", template);
      appState.setKey("selectedTemplateId", template.id);
    } catch (err) {
      console.error("Error fetching template:", err);
    }
  }, []);

  if (!isReady) return null;

  const modelSection = (
    <div className="flex w-full items-center gap-2 sm:w-auto">
      <Label htmlFor="model-select">Model</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between border-zinc-200 bg-white sm:w-[200px] dark:border-zinc-700 dark:bg-zinc-900"
            disabled={isLoading}
          >
            {isLoading ? (
              "Loading models..."
            ) : (
              <>
                {selectedModel
                  ? models.find((model) => model.id === selectedModel)?.name ||
                    selectedModel.split("/")[1]
                  : "Select model..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full border-zinc-200 bg-white p-0 sm:w-[200px] dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex flex-col">
            <div className="flex items-center border-b border-zinc-200 px-3 dark:border-zinc-700">
              <Search className="h-4 w-4 shrink-0 opacity-50" />
              <input
                className="placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-white py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-900"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {filteredModels.length === 0 ? (
                <div className="text-muted-foreground relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm select-none">
                  No models found.
                </div>
              ) : (
                filteredModels.map((model) => (
                  <div
                    key={model.id}
                    className={cn(
                      "hover:bg-accent hover:text-accent-foreground relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none",
                      selectedModel === model.id &&
                        "bg-accent text-accent-foreground",
                    )}
                    onClick={() => handleModelChange(model.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedModel === model.id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {model.name || model.id.split("/")[1]}
                  </div>
                ))
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );

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

      {modelSection}

      <div className="ml-auto">
        <button
          onClick={handleClearChat}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Clear Chat
        </button>
      </div>
    </div>
  );
}
