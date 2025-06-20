import { useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";

const PeopleSidebar = () => {
  const { onlineUsers } = useAuthStore();
  const { users, isUsersLoading, getAllUsers, getAllChats } = useChatStore();

  useEffect(() => {
    getAllUsers();
    getAllChats();
  }, [getAllUsers, getAllChats]);

  const UsersLoading = isUsersLoading;
  const NoUsers = !isUsersLoading && users.length === 0;
  const UsersLoad = !isUsersLoading && users.length > 0;

  return (
    <aside className="w-fit flex flex-col min-w-[240px]">
      <Header onlineUsers={onlineUsers} />
      <ul className="overflow-y-auto">
        {UsersLoading && <UsersLoadingPlaceholder />}
        {NoUsers && <NoUsersPlaceholder />}
        {UsersLoad && <UsersList onlineUsers={onlineUsers} users={users} />}
      </ul>
    </aside>
  );
};

const Header = ({ onlineUsers }) => {
  return (
    <header className="p-4 font-semibold shadow-sm bg-gray-900 text-gray-100 border-b border-gray-800">
      People &#40;{onlineUsers.length - 1} online&#41;
    </header>
  );
};

const UsersLoadingPlaceholder = () => {
  return <li className="p-4 text-center text-gray-500">Loading...</li>;
};

const NoUsersPlaceholder = () => {
  return (
    <li className="p-4 text-center text-gray-500">
      No users found. Start a conversation!
    </li>
  );
};

const UsersList = ({ onlineUsers, users }) => {
  const { setSelectedUser, selectedUser } = useChatStore();

  return (
    <ul className="overflow-y-auto flex-1">
      {users.map((user) => (
        <li
          key={user._id}
          className={`relative  flex items-center gap-3 p-3 pr-5 cursor-pointer hover:bg-gray-800 transition ${
            selectedUser?._id === user._id ? "bg-gray-800" : ""
          }`}
          onClick={() => setSelectedUser(user)}
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
  );
};

export default PeopleSidebar;
