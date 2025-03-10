import Chat from "./Chat";
import ChatControls from "./ChatControls";

export default function ChatTemplates() {
  return (
    <div className="fixed top-16 right-0 bottom-0 left-0 flex flex-col gap-4 overflow-hidden p-4">
      <ChatControls />
      <Chat key="chat" />
    </div>
  );
}
