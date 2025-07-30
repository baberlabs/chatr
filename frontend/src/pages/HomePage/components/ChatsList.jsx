import ChatsListItem from "./ChatsListItem";
import { useAuthStore } from "../../../store/useAuthStore";
import { useChatStore } from "../../../store/useChatStore";

const ChatsList = () => {
  const { authUser } = useAuthStore();
  const { chats, isChatsLoading, users, setSelectedUser, setChatMode } =
    useChatStore();

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setChatMode(true);
  };

  const getOtherUser = (chat) => {
    const otherUserId = chat.participants.find((id) => id !== authUser._id);
    return users.find((user) => user._id === otherUserId);
  };

  if (isChatsLoading) {
    return <p className="p-4 text-center text-gray-500">Loading chats...</p>;
  }

  if (!chats || chats.length === 0) {
    return (
      <p className="p-4 text-center text-gray-500">
        No chats found. Start a conversation!
      </p>
    );
  }

  return (
    <ul className="overflow-y-auto flex-1">
      {chats
        .filter((chat) => chat.latestMessage !== null)
        .map((chat) => {
          const otherUser = getOtherUser(chat);
          const isOtherUser = chat.latestMessage?.senderId !== authUser._id;

          return (
            <ChatsListItem
              key={chat._id}
              chat={chat}
              otherUser={otherUser}
              isOtherUser={isOtherUser}
              onClick={() => handleSelectUser(otherUser)}
            />
          );
        })}
    </ul>
  );
};

export default ChatsList;
