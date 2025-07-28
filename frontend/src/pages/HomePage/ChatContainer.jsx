import { useEffect, useState, useRef } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import {
  ChevronLeft,
  EllipsisVertical,
  CrossIcon,
  Trash2Icon,
} from "lucide-react";

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

  if (!selectedUser) {
    return (
      <header className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-center text-gray-400 text-lg font-medium">
        Select a conversation
      </header>
    );
  }

  return (
    <>
      <header className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {chatMode && (
            <button
              className="md:block cursor-pointer p-1 rounded hover:bg-gray-700 transition"
              onClick={() => setChatMode(false)}
              aria-label="Back"
            >
              <ChevronLeft />
            </button>
          )}
          <div className="flex items-center">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover mr-3 cursor-pointer"
              onClick={() => setIsShowProfile(true)}
            />
            <div>
              <p
                onClick={() => setIsShowProfile((prev) => !prev)}
                className="font-bold cursor-pointer hover:underline"
                title="Show profile"
              >
                {selectedUser.fullName}
              </p>
              <p className="text-xs text-gray-400">{selectedUser.email}</p>
            </div>
          </div>
        </div>
      </header>
      {isShowProfile && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setIsShowProfile(false)}
        >
          <img
            src={selectedUser.profilePic || "/avatar.png"}
            alt="Full Profile"
            className="max-w-full max-h-[90vh] rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white cursor-pointer"
            onClick={() => setIsShowProfile(false)}
          >
            <CrossIcon className="size-6 rotate-45" />
          </button>
        </div>
      )}
    </>
  );
};

const ChatWindow = () => {
  const { authUser } = useAuthStore();
  const { currentChatMessages, deleteMessage, isDeletingMessage } =
    useChatStore();
  const messageEndRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState({});

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChatMessages]);

  const handleDeleteMessage = async (messageId) => {
    await deleteMessage(messageId);
    setIsMenuOpen((prev) => ({ ...prev, [messageId]: false }));
  };

  return (
    <section className="flex-1 overflow-y-auto p-4 space-y-4">
      {currentChatMessages.map((msg) => {
        const isMe = msg?.senderId === authUser?._id;
        return (
          <div
            key={msg._id}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            <div className="max-w-[70%] flex flex-col group">
              <div
                className={`px-4 py-2 relative ${
                  isMe
                    ? "bg-blue-600 text-white self-end hover:bg-blue-700 rounded-tl-xl rounded-bl-xl rounded-tr-xl"
                    : "bg-gray-700 text-gray-100 self-start hover:bg-gray-600 rounded-tr-xl rounded-br-xl rounded-tl-xl"
                }`}
              >
                <div
                  className={`absolute h-10 justify-center items-center top-0 group-hover:flex hidden ${
                    isMe ? "-left-5" : "-right-5"
                  } `}
                >
                  {isDeletingMessage ? (
                    <Trash2Icon className="size-4 animate-spin" />
                  ) : (
                    <EllipsisVertical
                      className="size-5 opacity-50 cursor-pointer"
                      onClick={() =>
                        setIsMenuOpen({
                          ...isMenuOpen,
                          [msg._id]: !isMenuOpen[msg._id],
                        })
                      }
                    />
                  )}
                  {isMenuOpen[msg._id] && (
                    <div className="absolute p-4 bg-gray-900 rounded-lg shadow-lg -left-5 top-10 z-10">
                      {isMe && (
                        <button
                          className="flex items-center gap-2 text-sm text-red-300 hover:text-red-500 cursor-pointer"
                          onClick={() => handleDeleteMessage(msg._id)}
                        >
                          <Trash2Icon className="size-5 cursor-pointer" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm">{msg.text}</p>
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
