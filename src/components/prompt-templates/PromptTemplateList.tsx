import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState,
} from "react";
import { Plus, RefreshCw, Search } from "lucide-react";
import type { IPromptTemplate } from "@types.ts";

import { Button } from "@components/ui/button.tsx";
import { Input } from "@components/ui/input.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/ui/card.tsx";
import { ScrollArea } from "@components/ui/scroll-area.tsx";
import { Separator } from "@components/ui/separator.tsx";
import { cn } from "@lib/utils";

interface PromptTemplateListProps {
  onSelect: (promptTemplate: IPromptTemplate) => void;
  onNew: () => void;
  selectedId?: string;
  onRefresh?: () => void; // Add new prop for external refresh
}

const PromptTemplateList = forwardRef<
  { fetchPromptTemplates: () => Promise<void> },
  PromptTemplateListProps
>(({ onSelect, onNew, selectedId }, ref) => {
  const [promptTemplates, setPromptTemplates] = useState<IPromptTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Expose fetchPromptTemplates to parent
  useImperativeHandle(ref, () => ({
    fetchPromptTemplates,
  }));

  const fetchPromptTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/prompts/index.json");
      if (!response.ok) {
        throw new Error("Failed to fetch prompt templates");
      }
      const data = await response.json();
      setPromptTemplates(data);
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
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Prompt Templates</CardTitle>
        <CardDescription>
          Select a template to edit or create a new one
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder="Search templates..."
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
            title="Refresh templates"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <Button onClick={onNew} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Create New Template
        </Button>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <ScrollArea className="flex-1 rounded-md border">
          <div className="p-1">
            {filteredTemplates.length === 0 ? (
              <div className="text-muted-foreground p-4 text-center">
                {searchTerm
                  ? "No templates match your search"
                  : "No templates found"}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredTemplates.map((template) => (
                  <React.Fragment key={template.id}>
                    <button
                      onClick={() => onSelect(template)}
                      className={cn(
                        "w-full rounded-md p-2 text-left transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        selectedId === template.id
                          ? [
                              "bg-accent text-accent-foreground",
                              "ring-accent ring-2",
                              "shadow-sm",
                            ]
                          : "text-accent-foreground",
                      )}
                    >
                      <div className="flex flex-col gap-1">
                        <span
                          className={cn(
                            "font-medium",
                            selectedId === template.id && "font-semibold",
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
                    <Separator className="my-1" />
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

export default PromptTemplateList;
