import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useStore } from "@nanostores/react";
import type { PromptTemplate } from "@lib/ai/types";
import type { OpenRouterModel } from "@lib/ai/open-router.ts";
import { appState, templateList } from "@lib/appStore";
import { chatManager } from "@lib/ChatManager";
import { useAppService } from "@lib/hooks/useAppService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Label } from "@components/ui/label";
import { DEFAULT_MODEL } from "@/consts";
import {
  DEFAULT_TEMPLATE_ID,
  DEFAULT_TEMPLATE,
  TEMPLATES,
} from "@lib/ai/prompt-templates/constants.ts";
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
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
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
  const { isReady, appService } = useAppService();

  useEffect(() => {
    const storedTemplateId = appState.get().selectedTemplateId;
    const storedModel = appState.get().selectedModel;
    if (storedTemplateId) {
      setSelectedTemplateId(storedTemplateId);
    } else {
      setSelectedTemplateId(DEFAULT_TEMPLATE_ID);
    }
    if (storedModel) {
      setSelectedModel(storedModel);
    } else {
      setSelectedModel(DEFAULT_MODEL);
    }
  }, []);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/prompts/list.json`);
        if (!response.ok) {
          throw new Error("Failed to fetch templates");
        }
        const templates = await response.json();
        // Add default templates in the correct order
        const defaultTemplates = [...TEMPLATES].reverse();
        defaultTemplates.forEach((template) => {
          templates.unshift(template);
        });
        setTemplates(templates);
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

    const fetchModels = () => {
      try {
        const matchingModels = appService.getAllowedOpenRouterModels();
        // Ensure we always have an array, even if empty
        setModels(Array.isArray(matchingModels) ? matchingModels : []);
      } catch (error) {
        console.error("Error loading models:", error);
        setModels([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchModels();

    // Subscribe to login state changes
    const unsubscribe = appState.listen((state) => {
      if (state.currentUser !== appState.get().currentUser) {
        fetchModels();
      }
    });

    return () => unsubscribe();
  }, [isReady, appService]);

  // Add subscription to appState changes
  useEffect(() => {
    const unsubscribe = appState.subscribe((state) => {
      setSelectedTemplateId(state.selectedTemplateId || DEFAULT_TEMPLATE_ID);
      if (state.selectedModel) {
        setSelectedModel(state.selectedModel);
      }
    });
    return () => unsubscribe();
  }, []); // Empty dependency array since we want to set up the subscription once

  // Callbacks
  const handleNewChat = useCallback(() => {
    chatManager.newChat(appState.get().selectedTemplateId);
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
      setSelectedTemplateId(templateId); // Update local state immediately
      appState.setKey("selectedTemplateId", templateId);
      await chatManager.newChat(templateId);
    } catch (err) {
      console.error("Error fetching template:", err);
      // Revert to previous template ID on error
      setSelectedTemplateId(
        appState.get().selectedTemplateId || DEFAULT_TEMPLATE_ID,
      );
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
            className="w-full justify-between border-zinc-200 bg-white sm:w-[250px] dark:border-zinc-700 dark:bg-zinc-900"
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
        <PopoverContent className="w-full border-zinc-200 bg-white p-0 sm:w-[250px] dark:border-zinc-700 dark:bg-zinc-900">
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
        <Label htmlFor="template-select">Template</Label>
        <Select
          value={selectedTemplateId}
          onValueChange={handleTemplateChange}
          disabled={loading}
        >
          <SelectTrigger id="template-select" className="w-full sm:w-[250px]">
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
          onClick={handleNewChat}
          aria-label="Start new chat"
          className={cn(
            "flex",
            "size-9 items-center justify-center rounded-full p-2",
            "bg-transparent hover:bg-black/5 dark:hover:bg-white/20",
            "stroke-current hover:stroke-black dark:hover:stroke-white",
            "border border-black/10 dark:border-white/25",
            "transition-colors duration-300 ease-in-out",
          )}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
              d="m24.06 10l-.036 28M10 24h28"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
