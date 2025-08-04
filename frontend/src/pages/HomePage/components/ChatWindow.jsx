import { useMemo } from "react";

import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";

import Alert from "./Alert";
import MessageBubble from "./MessageBubble";
import { useMenu } from "../hooks/useMenu";
import { useScrollToBottom } from "../hooks/useScrollToBottom";
import GhostMessageBubble from "./GhostMessageBubble";

const ChatWindow = () => {
  const { authUser } = useAuthStore();
  const { currentChatMessages, ghostTypingIndicatorLength } = useChatStore();
  const {
    alert,
    openMenuId,
    setOpenMenuId,
    handleDeleteMessage,
    handleCopyMessage,
  } = useMenu();
  const messageEndRef = useScrollToBottom(currentChatMessages);
  const messageHandlers = useMemo(
    () => ({
      openMenuId,
      setOpenMenuId,
      handleDeleteMessage,
      handleCopyMessage,
    }),
    [openMenuId, setOpenMenuId, handleDeleteMessage, handleCopyMessage]
  );

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
            msg={msg}
            messageHandlers={messageHandlers}
          />
        );
      })}
      <GhostMessageBubble length={ghostTypingIndicatorLength} />
      <div ref={messageEndRef} />
    </section>
  );
};

export default ChatWindow;
