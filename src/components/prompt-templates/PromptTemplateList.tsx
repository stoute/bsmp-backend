import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState,
} from "react";
import { Plus, RefreshCw, Search, Loader2 } from "lucide-react";
import type { PromptTemplate } from "@lib/ai/types.ts";
import { Button } from "@components/ui/button.tsx";
import { Input } from "@components/ui/input.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@components/ui/card.tsx";
import { ScrollArea } from "@components/ui/scroll-area.tsx";
import { Separator } from "@components/ui/separator.tsx";
import { cn } from "@lib/utils";
import { useAppService } from "@lib/hooks/useAppService";
import {
  template_new,
  loading_templates,
  error_loading_templates,
  template_list_title,
  search_templates_placeholder,
  refresh_templates_title,
  no_templates_match_search,
  no_templates_found,
} from "../../paraglide/messages";
import styles from "./PromptTemplateList.module.css";

interface PromptTemplateListProps {
  onSelect: (promptTemplate: PromptTemplate) => void;
  onNew: () => void;
  selectedId?: string;
  onRefresh?: () => void; // Add new prop for external refresh
  dataUrl: string;
}

const PromptTemplateList = forwardRef<
  { fetchPromptTemplates: () => Promise<void> },
  PromptTemplateListProps
>(({ dataUrl, onSelect, onNew, selectedId }, ref) => {
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { appService } = useAppService();

  // Expose fetchPromptTemplates to parent
  useImperativeHandle(ref, () => ({
    fetchPromptTemplates,
  }));

  const fetchPromptTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(dataUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch prompt templates");
      }
      const data = await response.json();
      // Sort templates by updated_at in descending order (newest first)
      data.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
      setPromptTemplates(data);

      // Handle template selection based on app state
      if (data.length > 0) {
        const storedTemplateId = appService.state.get().selectedTemplateId;
        if (!storedTemplateId) {
          // No template selected, select the first one
          onSelect(data[0]);
        } else {
          // Find and select the stored template
          const storedTemplate = data.find(
            (template) => template.id === storedTemplateId,
          );
          if (storedTemplate) {
            onSelect(storedTemplate);
          } else {
            // Fallback to first template if stored ID not found
            onSelect(data[0]);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching prompt templates:", error);
      setError("Failed to load prompt templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromptTemplates();
  }, []);

  const filteredTemplates = promptTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Card
      className={cn(
        styles.listContainer,
        "h-full rounded-none border-0 pb-0 pl-2 shadow-none",
      )}
    >
      <CardHeader className="px-4 py-4 pr-0">
        <CardTitle>{template_list_title()}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden p-4 pt-0 pb-0 pr-0">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder={search_templates_placeholder()}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            size="icon"
            variant="outline"
            onClick={fetchPromptTemplates}
            disabled={loading}
            title={refresh_templates_title()}
          >
            <RefreshCw
              className={`h-4 w-4 opacity-50 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
        <Button onClick={onNew} className="w-full">
          {template_new()}
          <Plus className="ml-2 h-4 w-4" />
        </Button>

        {loading && (
          <div className="py-4 text-center">{loading_templates()}</div>
        )}
        {error && (
          <div className="py-4 text-center text-red-500">
            {error_loading_templates()}
          </div>
        )}

        <ScrollArea className={cn("flex-1 border", styles.scrollArea)}>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="p-0:">
              {!loading && filteredTemplates.length === 0 ? (
                <div className="text-muted-foreground p-4 text-center">
                  {searchTerm
                    ? no_templates_match_search()
                    : no_templates_found()}
                </div>
              ) : (
                <div className="space-y-0">
                  {filteredTemplates.map((template, index) => (
                    <React.Fragment key={template.id}>
                      <button
                        onClick={() => onSelect(template)}
                        className={cn(
                          "w-full p-2 text-left transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          selectedId === template.id
                            ? "text-accent-foreground bg-gray-200 shadow-sm dark:bg-gray-800"
                            : "text-accent-foreground",
                          index !== filteredTemplates.length - 1 &&
                            "border-b border-gray-200 dark:border-gray-700",
                        )}
                      >
                        <div className="flex flex-col gap-1">
                          <span
                            className={cn(
                              "font-semibold",
                              selectedId === template.id && "font-bold",
                            )}
                          >
                            {template.name}
                          </span>
                          {template.description && (
                            <span
                              className={cn(
                                "line-clamp-2 text-sm",
                                selectedId === template.id
                                  ? "text-accent-foreground/80"
                                  : "text-muted-foreground",
                              )}
                            >
                              {template.description}
                            </span>
                          )}
                        </div>
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

export default PromptTemplateList;
