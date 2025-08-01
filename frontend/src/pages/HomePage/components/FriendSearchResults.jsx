import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";

const FriendSearchResults = ({ newFriendsSearch, setNewFriendsSearch }) => {
  const { onlineUsers } = useAuthStore();
  const { users, getAllChats, setSelectedUser, createChat, setChatMode } =
    useChatStore();

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
                setChatMode(true);
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

export default FriendSearchResults;
