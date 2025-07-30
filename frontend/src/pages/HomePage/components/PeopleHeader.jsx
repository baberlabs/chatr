import { User } from "lucide-react";

import { useAuthStore } from "../../../store/useAuthStore";

const PeopleHeader = ({ setNewFriendsSearch, newFriendsSearch }) => {
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

export default PeopleHeader;
