import { use, useEffect, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { User } from "lucide-react";
import { displayDate } from "../../lib/displayDate";

const PeopleSidebar = () => {
  const { users, isChatsLoading, getAllUsers, getAllChats, chats } =
    useChatStore();
  const [newFriendsSearch, setNewFriendsSearch] = useState("");

  useEffect(() => {
    getAllUsers();
    getAllChats();
  }, [getAllUsers, getAllChats]);

  const ChatsLoading = isChatsLoading;
  const NoChats = !isChatsLoading && users.length === 0;
  const ChatsLoaded = !isChatsLoading && users.length > 0;

  return (
    <aside className="flex flex-col w-full sm:w-fit sm:min-w-[240px] ">
      <Header
        setNewFriendsSearch={setNewFriendsSearch}
        newFriendsSearch={newFriendsSearch}
      />
      {newFriendsSearch && (
        <NewFriends
          newFriendsSearch={newFriendsSearch}
          setNewFriendsSearch={setNewFriendsSearch}
        />
      )}
      <ul className="overflow-y-auto">
        {ChatsLoading && <ChatsLoadingPlaceholder />}
        {NoChats && <NoChatsPlaceholder />}
        {ChatsLoaded && <ChatsList />}
      </ul>
    </aside>
  );
};

const Header = ({ setNewFriendsSearch, newFriendsSearch }) => {
  const { onlineUsers } = useAuthStore();
  return (
    <header className="p-4 font-semibold shadow-sm bg-gray-900 text-gray-100 border-b border-gray-800 flex flex-col gap-5">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <User />
          People
        </div>
        <div className="bg-green-900/80 w-fit py-1 px-2 text-xs rounded-xl flex flex-row items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <div>{onlineUsers.length - 1} online</div>
        </div>
      </div>
      <form className="flex flex-row items-center gap-2 relative">
        <input
          type="text"
          placeholder="Find friends..."
          className="flex-1 bg-gray-800 text-gray-200 px-3 py-2 rounded-md focus:outline-none"
          onChange={(e) => setNewFriendsSearch(e.target.value)}
          value={newFriendsSearch}
          autoComplete="off"
        />
      </form>
    </header>
  );
};

const NewFriends = ({ newFriendsSearch, setNewFriendsSearch }) => {
  const { onlineUsers } = useAuthStore();
  const { users, getAllChats, setSelectedUser, createChat } = useChatStore();

  return (
    <div className="border-b border-gray-800 bg-gray-900 text-gray-100 pt-4">
      <h2 className="font-semibold px-4">Matching '{newFriendsSearch}' </h2>
      <ul className="mt-2">
        {users
          .filter(
            (user) =>
              user.fullName
                .toLowerCase()
                .includes(newFriendsSearch.toLowerCase()) ||
              user.email.toLowerCase().includes(newFriendsSearch.toLowerCase())
          )
          .map((user) => (
            <li
              key={user._id}
              className="relative flex items-center gap-3 p-3 px-5 cursor-pointer hover:bg-gray-800 transition"
              onClick={async () => {
                await createChat(user._id);
                await getAllChats();
                setSelectedUser(user);
                setNewFriendsSearch("");
              }}
            >
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.fullName}
                className="w-10 h-10 rounded-full object-cover"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className={`size-3 rounded-full absolute top-3 left-11 bg-green-400`}
                ></span>
              )}
              <div>
                <p className="font-medium">{user.fullName}</p>
                <p className="text-gray-400 text-xs">{user.email}</p>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

const ChatsLoadingPlaceholder = () => {
  return <li className="p-4 text-center text-gray-500">Loading...</li>;
};

const NoChatsPlaceholder = () => {
  return (
    <li className="p-4 text-center text-gray-500">
      No users found. Start a conversation!
    </li>
  );
};

const ChatsList = () => {
  const { authUser, onlineUsers } = useAuthStore();
  const {
    chats,
    isChatsLoading,
    users,
    setSelectedUser,
    selectedUser,
    setChatMode,
  } = useChatStore();

  if (isChatsLoading) {
    return <li className="p-4 text-center text-gray-500">Loading...</li>;
  }

  if (!chats || chats.length === 0) {
    return (
      <li className="p-4 text-center text-gray-500">
        No chats found. Start a conversation!
      </li>
    );
  }

  return (
    <ul className="overflow-y-auto flex-1">
      {chats
        .filter((chat) => chat.latestMessage !== null)
        .map((chat) => {
          const otherUserId = chat.participants.find(
            (id) => id !== authUser._id
          );
          const otherUser = users.filter((user) => user._id === otherUserId)[0];
          const date = displayDate(chat.updatedAt);
          const isOtherUser = chat?.latestMessage?.senderId !== authUser._id;

          return (
            <li
              key={`${chat.id}-${otherUserId}`}
              className={`relative flex flex-row gap-3 items-center py-3 px-4 hover:bg-gray-800 transition-colors ${
                otherUser?._id === selectedUser?._id ? "bg-gray-800" : ""
              }`}
              onClick={() => {
                setSelectedUser(otherUser);
                setChatMode(true);
              }}
            >
              {onlineUsers.includes(otherUser._id) && (
                <span
                  className={`size-3 rounded-full absolute top-3 left-11 bg-green-400`}
                ></span>
              )}
              <img
                src={otherUser?.profilePic || "/avatar.png"}
                alt={otherUser?.fullName}
                className="size-10 rounded-full object-cover"
              />
              <div className="">
                <p>{otherUser?.fullName || "Unknown User"}</p>
                <p className="text-gray-400 text-xs">
                  {`${isOtherUser ? "" : "You: "} ${
                    chat.latestMessage?.text || "No message"
                  }`}
                </p>
              </div>
              <span className="absolute text-gray-500 text-[10px] right-2 top-3">
                {date}
              </span>
            </li>
          );
        })}
    </ul>
  );
};

export default PeopleSidebar;
