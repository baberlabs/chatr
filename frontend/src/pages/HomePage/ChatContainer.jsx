import { useEffect, useState, useRef } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";

const ChatContainer = () => {
  return (
    <main className="flex-1 flex flex-col">
      <Header />
      <ChatWindow />
      <NewMessageForm />
    </main>
  );
};

const Header = () => {
  const { selectedUser } = useChatStore();
  return (
    <header className="p-4 border-b bg-white font-semibold text-lg shadow-sm">
      {selectedUser?.fullName || "Select a conversation"}
    </header>
  );
};

const ChatWindow = () => {
  const { authUser } = useAuthStore();
  const { currentChatMessages } = useChatStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChatMessages]);

  return (
    <section className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
      {currentChatMessages.map((msg) => {
        const isMe = msg?.senderId === authUser?._id;
        return (
          <div
            key={msg._id}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            <div className="max-w-[70%] flex flex-col">
              <div
                className={`px-4 py-2 rounded-2xl ${
                  isMe
                    ? "bg-blue-600 text-white self-end"
                    : "bg-gray-300 text-gray-800 self-start"
                }`}
              >
                {msg.text}
              </div>
              <time
                className={`text-xs text-gray-500 mt-1 ${
                  isMe ? "text-right" : "text-left"
                }`}
              >
                {msg.createdAt &&
                  new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </time>
            </div>
          </div>
        );
      })}
      <div ref={messageEndRef} />
    </section>
  );
};

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
    <form
      onSubmit={handleSendMessage}
      className="p-4 border-t bg-white flex gap-2"
    >
      <input
        type="text"
        placeholder="Type a message..."
        value={currentMessage.text || ""}
        onChange={(e) =>
          setCurrentMessage({ ...currentMessage, text: e.target.value })
        }
        className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
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

export default ChatContainer;
