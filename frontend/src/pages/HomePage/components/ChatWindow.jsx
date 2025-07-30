import { useCallback, useEffect, useRef, useState } from "react";

import Alert from "./Alert";
import MessageBubble from "./MessageBubble";
import { useAuthStore } from "../../../store/useAuthStore";
import { useChatStore } from "../../../store/useChatStore";
import useScrollToBottom from "../hooks/useScrollToBottom";

const ChatWindow = () => {
  const { authUser } = useAuthStore();
  const { currentChatMessages, deleteMessage, isDeletingMessage } =
    useChatStore();
  const messageEndRef = useScrollToBottom(currentChatMessages);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (!openMenuId) return;
    const handleClick = () => setOpenMenuId(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [openMenuId]);

  const handleDeleteMessage = useCallback(
    async (messageId) => {
      await deleteMessage(messageId);
      setOpenMenuId(null);
    },
    [deleteMessage]
  );

  const handleCopyMessage = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setAlert({ type: "success", message: "Message copied" });
    } catch {
      setAlert({ type: "error", message: "Copy failed" });
    }
    setTimeout(() => setAlert(null), 1800);
    setOpenMenuId(null);
  }, []);

  if (!currentChatMessages || currentChatMessages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No messages yet. Say hello!
      </div>
    );
  }

  return (
    <section className="flex-1 overflow-y-auto p-4 space-y-4 relative z-20">
      {alert && <Alert type={alert.type} message={alert.message} />}
      {currentChatMessages.map((msg) => {
        const isMe = msg?.senderId === authUser?._id;
        return (
          <MessageBubble
            key={msg._id}
            isMe={isMe}
            setOpenMenuId={setOpenMenuId}
            openMenuId={openMenuId}
            isDeletingMessage={isDeletingMessage}
            handleCopyMessage={handleCopyMessage}
            handleDeleteMessage={handleDeleteMessage}
            msg={msg}
          />
        );
      })}
      <div ref={messageEndRef} />
    </section>
  );
};

export default ChatWindow;
