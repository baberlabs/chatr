import { useEffect, useState, useRef } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { ChevronDown, ChevronLeft, InfoIcon } from "lucide-react";

const ChatContainer = ({ mobile }) => {
  const { selectedUser } = useChatStore();

  return (
    <main
      className={`flex flex-col h-screen w-full bg-gray-800 text-gray-100 overflow-hidden ${
        mobile ? "flex sm:hidden" : "hidden sm:flex"
      }`}
    >
      <Header />
      <ChatWindow />
      {selectedUser && <NewMessageForm />}
    </main>
  );
};

const Header = () => {
  const { selectedUser, setChatMode, chatMode } = useChatStore();
  const [isShowProfile, setIsShowProfile] = useState(false);

  return (
    <header className="p-3.5 font-semibold bg-gray-800 text-gray-100 shadow-sm flex flex-row items-start gap-2 border-b border-gray-700">
      {chatMode && (
        <span
          className="md:block cursor-pointer"
          onClick={() => setChatMode(false)}
        >
          <ChevronLeft />
        </span>
      )}
      <span className="flex flex-col gap-1">
        {selectedUser ? (
          <>
            <span
              onClick={() => setIsShowProfile(!isShowProfile)}
              className="underline font-bold cursor-pointer"
            >
              {selectedUser?.fullName}
            </span>
            {isShowProfile && (
              <>
                <span className="text-sm text-gray-400">
                  {selectedUser?.email}
                </span>
                <img
                  src={selectedUser?.profilePic || "/avatar.png"}
                  alt="Profile"
                  className="min-w-[300px] w-[500px] rounded-lg"
                />
              </>
            )}
          </>
        ) : (
          "Select a conversation"
        )}
      </span>
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
    <section className="flex-1 overflow-y-auto p-4 space-y-4">
      {currentChatMessages.map((msg) => {
        const isMe = msg?.senderId === authUser?._id;
        return (
          <div
            key={msg._id}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            <div className="max-w-[70%] flex flex-col">
              <div
                className={`px-4 py-2 ${
                  isMe
                    ? "bg-blue-600 text-white self-end hover:bg-blue-700 rounded-tl-xl rounded-bl-xl rounded-tr-xl"
                    : "bg-gray-700 text-gray-100 self-start hover:bg-gray-600 rounded-tr-xl rounded-br-xl rounded-tl-xl"
                }`}
              >
                {msg.text}
              </div>
              <time
                className={`text-xs text-gray-400 mt-1 ${
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

export default ChatContainer;
