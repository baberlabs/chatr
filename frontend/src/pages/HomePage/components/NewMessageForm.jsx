import { useState } from "react";

import { useChatStore } from "@/store/useChatStore";

const NewMessageForm = () => {
  const { sendMessage, isSendingMessage, selectedUser, selectedChatId } =
    useChatStore();
  const [currentMessage, setCurrentMessage] = useState({});
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.text || !selectedUser) return;
    await sendMessage({ text: currentMessage.text, chatId: selectedChatId });
    setCurrentMessage({});
  };

  return (
    <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 flex gap-2">
      <input
        type="text"
        placeholder="Type a message..."
        value={currentMessage.text || ""}
        onChange={(e) =>
          setCurrentMessage({ ...currentMessage, text: e.target.value })
        }
        className="flex-1 rounded-lg px-3 py-2 text-sm outline-none bg-gray-700 text-gray-100 placeholder-gray-400"
      />
      <button
        type="submit"
        disabled={isSendingMessage || !currentMessage.text}
        className={`px-4 py-2 rounded-lg text-white text-sm transition ${
          isSendingMessage || !currentMessage.text
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isSendingMessage ? "Sending..." : "Send"}
      </button>
    </form>
  );
};

export default NewMessageForm;
