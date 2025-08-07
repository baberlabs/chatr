import { EllipsisVertical, Trash2Icon } from "lucide-react";

import { useChatStore } from "@/store/useChatStore";

import MessageText from "./MessageText";
import MessageTimestamp from "./MessageTimestamp";
import MessageMenu from "./MessageMenu";
import MessageImage from "./MessageImage";

function MessageBubble({ isMe, msg, messageHandlers }) {
  const { isDeletingMessage } = useChatStore();
  const { openMenuId, setOpenMenuId, handleDeleteMessage, handleCopyMessage } =
    messageHandlers;

  return (
    <>
      <div
        className={`flex relative group ${
          isMe ? "justify-end" : "justify-start"
        }`}
      >
        <div className="max-w-[70%] flex flex-col">
          <div
            className={`p-1 relative ${
              isMe
                ? "bg-blue-600 text-white self-end rounded-tl-xl rounded-bl-xl rounded-tr-xl"
                : "bg-gray-700 text-gray-100 self-start rounded-tr-xl rounded-br-xl rounded-tl-xl"
            }`}
          >
            <div
              className={`absolute top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-30 ${
                isMe ? "-left-8" : "-right-8"
              }`}
            >
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-700 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === msg._id ? null : msg._id);
                }}
                aria-label="Message options"
              >
                {isDeletingMessage && openMenuId === msg._id ? (
                  <Trash2Icon className="size-4 animate-spin" />
                ) : (
                  <EllipsisVertical className="size-5 opacity-60" />
                )}
              </button>
              {openMenuId === msg._id && (
                <MessageMenu
                  isMe={isMe}
                  msg={msg}
                  handleCopyMessage={handleCopyMessage}
                  handleDeleteMessage={handleDeleteMessage}
                />
              )}
            </div>
            <div className="flex flex-col gap-2 max-w-100">
              {msg.image && <MessageImage image={msg.image} />}
              <MessageText messageText={msg.text} />
            </div>
          </div>
          <MessageTimestamp isMe={isMe} createdAt={msg.createdAt} />
        </div>
      </div>
    </>
  );
}

export default MessageBubble;
