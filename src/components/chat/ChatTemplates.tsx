import Chat from "./Chat";
import ChatControls from "./ChatControls";

export default function ChatTemplates() {
  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden p-4">
      <ChatControls />
      <Chat key="chat" />
    </div>
  );
}
