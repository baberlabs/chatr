import { displayDate } from "../../../lib/displayDate";
import { useAuthStore } from "../../../store/useAuthStore";
import { useChatStore } from "../../../store/useChatStore";
import OnlineStatusDisplay from "./OnlineStatusDisplay";
import UserAvatar from "./UserAvatar";

const ChatListItem = ({ chat, otherUser, isOtherUser, onClick }) => {
  const { onlineUsers } = useAuthStore();
  const { selectedUser } = useChatStore();

  const isActive = otherUser?._id === selectedUser?._id;
  const isOnline = onlineUsers.includes(otherUser?._id);
  const formattedDate = displayDate(chat.updatedAt);
  const messageText = chat.latestMessage?.text || "No message";
  const prefix = isOtherUser ? "" : "You: ";

  return (
    <li
      onClick={onClick}
      className={`relative flex flex-row gap-3 items-center py-3 px-4 hover:bg-gray-800 transition-colors ${
        isActive && "bg-gray-800"
      }`}
    >
      {isOnline && <OnlineStatusDisplay />}

      <div onClick={(e) => e.stopPropagation()}>
        <UserAvatar user={otherUser} />
      </div>

      <div className="flex-1">
        <p>{otherUser?.fullName || "Unknown User"}</p>
        <p className="text-gray-400 text-xs">
          {prefix}
          {messageText}
        </p>
      </div>

      <span className="absolute text-gray-500 text-[10px] right-2 top-3">
        {formattedDate}
      </span>
    </li>
  );
};

export default ChatListItem;
