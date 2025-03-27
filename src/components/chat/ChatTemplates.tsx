import Chat from "./Chat";
import ChatControls from "./ChatControls";
import { MessageErrorBoundary } from "./MessageErrorBoundary";

export default function ChatTemplates() {
  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden p-4 pt-0">
      <ChatControls />
      <MessageErrorBoundary>
        <Chat key="chat" />
      </MessageErrorBoundary>
    </div>
  );
}
