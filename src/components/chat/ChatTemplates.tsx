import Chat from "./Chat";
import ChatControls from "./ChatControls";

export default function ChatTemplates() {
  return (
    <div className="flex flex-col gap-4">
      <ChatControls />
      <Chat key="chat" />
    </div>
  );
}
