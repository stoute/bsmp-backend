import { useState } from "react";
import { List, Trash, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { ScrollArea } from "@components/ui/scroll-area";
import { Separator } from "@components/ui/separator";
import { appState } from "@lib/appStore";
import { useAppService } from "@lib/hooks/useAppService.ts";
import { cn } from "@lib/utils";
import { deserializeMessageToJSON } from "@lib/ai/langchain/utils";

interface ChatSession {
  id: string;
  metadata: {
    topic: string;
    model?: string;
    templateId?: string;
  };
  created: string;
  updated: string;
}

export default function SessionsList() {
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        appState.get().apiBaseUrl + "/sessions/list.json",
      );
      if (!response.ok) throw new Error("Failed to fetch sessions");
      const data = await response.json();
      setSessions(data);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    fetchSessions();
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(
        appState.get().apiBaseUrl + `/sessions/${id}.json`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) throw new Error("Failed to delete session");
      await fetchSessions(); // Refresh the list
    } catch (err) {
      console.error("Error deleting session:", err);
      setError("Failed to delete session");
    }
  };

  const handleLoad = async (id: string) => {
    try {
      const response = await fetch(`/api/sessions/${id}.json`);
      if (!response.ok) throw new Error("Failed to load session");
      const session = await response.json();

      console.log(session);

      // Convert plain message objects back to BaseMessage instances
      if (session.messages && Array.isArray(session.messages)) {
        session.messages = session.messages
          .map((msg) => (msg ? deserializeMessageToJSON(msg) : null))
          .filter(Boolean);
      }

      // Update app state with properly formatted messages
      appState.setKey("currentChat", session);
      appState.setKey("selectedModel", session.metadata?.model);
      appState.setKey("selectedTemplateId", session.metadata?.templateId);
      window.location.href = "/chat";
      setOpen(false);
    } catch (err) {
      console.error("Error loading session:", err);
      setError("Failed to load session");
    }
  };

  return (
    <>
      <Button
        size="icon"
        variant="outline"
        onClick={handleOpen}
        className={cn(
          "hidden md:flex",
          "size-9 items-center justify-center rounded-full p-2",
          "bg-transparent hover:bg-black/5 dark:hover:bg-white/20",
          "stroke-current hover:stroke-black dark:hover:stroke-white",
          "border border-black/10 dark:border-white/25",
          "transition-colors duration-300 ease-in-out",
        )}
        title="Chat sessions"
      >
        <List className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border bg-white sm:max-w-[600px] dark:border-white/20 dark:bg-black">
          <DialogHeader>
            <DialogTitle className="text-black dark:text-white">
              Chat Sessions
            </DialogTitle>
            <DialogDescription>
              View and manage your saved chat sessions.
            </DialogDescription>
          </DialogHeader>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <ScrollArea className="h-[70vh] rounded-md border">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                Loading sessions...
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-muted-foreground p-4 text-center">
                No saved sessions found
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-lg border p-2"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{session.metadata.topic}</h4>
                      <p className="text-muted-foreground text-sm">
                        {new Date(session.updated).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleLoad(session.id)}
                        title="Load session"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(session.id)}
                        title="Delete session"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
