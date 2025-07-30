import { EllipsisVertical, Trash2Icon } from "lucide-react";

import MessageText from "./MessageText";
import MessageTimestamp from "./MessageTimestamp";
import MessageCopyButton from "./MessageCopyButton";
import DeleteMessageButton from "./DeleteMessageButton";

function MessageBubble({
  isMe,
  setOpenMenuId,
  openMenuId,
  isDeletingMessage,
  handleCopyMessage,
  handleDeleteMessage,
  msg,
}) {
  return (
    <div
      key={msg._id}
      className={`flex ${
        isMe ? "justify-end" : "justify-start"
      } relative group`}
    >
      <div className="max-w-[70%] flex flex-col">
        <div
          className={`px-4 py-2 relative ${
            isMe
              ? "bg-blue-600 text-white self-end rounded-tl-xl rounded-bl-xl rounded-tr-xl"
              : "bg-gray-700 text-gray-100 self-start rounded-tr-xl rounded-br-xl rounded-tl-xl"
          }`}
        >
          <div
            className={`absolute top-1/2 -translate-y-1/2 ${
              isMe ? "-left-8" : "-right-8"
            } hidden group-hover:flex items-center z-30`}
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
              <div
                className="absolute top-5 z-50 mt-2 min-w-[120px] bg-gray-900 border border-gray-700 rounded-lg shadow-lg flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <MessageCopyButton
                  onClick={handleCopyMessage}
                  messageText={msg.text}
                />
                {isMe && (
                  <DeleteMessageButton
                    onClick={handleDeleteMessage}
                    messageId={msg._id}
                  />
                )}
              </div>
            )}
          </div>
          <MessageText messageText={msg.text} />
        </div>
        <MessageTimestamp isMe={isMe} createdAt={msg.createdAt} />
      </div>
    </div>
  );
}

export default MessageBubble;
