import MessageCopyButton from "./MessageCopyButton";
import DeleteMessageButton from "./DeleteMessageButton";

function MessageMenu({ isMe, msg, handleCopyMessage, handleDeleteMessage }) {
  return (
    <div
      className="absolute top-5 z-50 mt-2 min-w-[120px] bg-gray-900 border border-gray-700 rounded-lg shadow-lg flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      <MessageCopyButton onClick={handleCopyMessage} messageText={msg.text} />
      {isMe && (
        <DeleteMessageButton
          onClick={handleDeleteMessage}
          messageId={msg._id}
        />
      )}
    </div>
  );
}

export default MessageMenu;
