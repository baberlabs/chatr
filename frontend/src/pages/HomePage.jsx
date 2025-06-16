import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

const HomePage = () => {
  const {
    users,
    chats,
    currentChatMessages,
    getChatMessagesById,
    createChat,
    getAllUsers,
    getAllChats,
    sendMessage,
    isSendingMessage,
    isUsersLoading,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentMessage, setCurrentMessage] = useState({});
  const messageEndRef = useRef(null);

  useEffect(() => {
    getAllUsers();
    getAllChats();
  }, [getAllUsers, getAllChats]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChatMessages]);

  const handleGetChat = async (userId) => {
    const user = users.find((u) => u._id === userId);
    setSelectedUser(user);
    const chat = await createChat(userId);
    if (chat) await getChatMessagesById(chat._id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.text || !selectedUser) return;

    const chat = chats.find((c) => c.participants.includes(selectedUser._id));
    if (!chat) return;

    await sendMessage({
      text: currentMessage.text,
      senderId: authUser._id,
      chatId: chat._id,
    });
    setCurrentMessage({});
  };

  return (
    <div className="flex h-screen text-sm bg-gray-100 text-gray-800 overflow-hidden">
      {/* People Sidebar */}
      <aside className="w-64 border-r bg-white flex flex-col">
        <header className="p-4 font-semibold border-b">People</header>
        <ul className="overflow-y-auto flex-1">
          {isUsersLoading ? (
            <li className="p-4 text-center text-gray-400">Loading...</li>
          ) : users.length === 0 ? (
            <li className="p-4 text-center text-gray-400">No users found.</li>
          ) : (
            users.map((user) => (
              <li
                key={user._id}
                className={`flex items-center gap-3 p-3 cursor-pointer border-b hover:bg-gray-50 ${
                  selectedUser?._id === user._id ? "bg-blue-50" : ""
                }`}
                onClick={() => handleGetChat(user._id)}
              >
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{user.fullName}</p>
                  <p className="text-gray-500 text-xs">{user.email}</p>
                </div>
              </li>
            ))
          )}
        </ul>
      </aside>

      {/* Chat Window */}
      <main className="flex-1 flex flex-col">
        <header className="p-4 border-b bg-white font-semibold text-lg shadow-sm">
          {selectedUser?.fullName || "Select a conversation"}
        </header>

        {/* Messages */}
        <section className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
          {currentChatMessages.map((msg) => {
            const isMe = msg.senderId === authUser._id;
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

        {/* Input */}
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
      </main>
    </div>
  );
};

export default HomePage;
