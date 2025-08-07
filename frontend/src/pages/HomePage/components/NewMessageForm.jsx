import { useChatStore } from "@/store/useChatStore";
import { useEffect, useState } from "react";
import SendButton from "./SendButton";

const NewMessageForm = () => {
  const { sendMessage, selectedChatId, showGhostTypingIndicator } =
    useChatStore();
  const [textLength, setTextLength] = useState(0);

  useEffect(() => {
    showGhostTypingIndicator(textLength);
  }, [textLength]);

  const handleSendMessage = async (formData) => {
    const text = formData.get("text");
    if (!text) return;
    await sendMessage({ text, chatId: selectedChatId });
    setTextLength(0);
  };

  return (
    <form action={handleSendMessage} className="p-4 bg-gray-800 flex gap-2">
      <input
        type="text"
        name="text"
        autoComplete="off"
        autoFocus
        placeholder="Type a message..."
        onChange={(e) => setTextLength(e.target.value.trim().length)}
        className="flex-1 rounded-lg px-3 py-2 text-sm outline-none bg-gray-700 text-gray-100 placeholder-gray-400"
      />
      <SendButton />
    </form>
  );
};

export default NewMessageForm;
