import { useState } from "react";
import { ChevronLeft } from "lucide-react";

import UserAvatar from "./UserAvatar";
import UserProfileModal from "./UserProfileModal";
import { useChatStore } from "../../../store/useChatStore";

const ChatHeader = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { selectedUser, setChatMode, chatMode } = useChatStore();

  if (!selectedUser) {
    return (
      <header className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-center text-gray-400 text-lg font-medium">
        Select a conversation
      </header>
    );
  }

  const handleBack = () => setChatMode(false);
  const toggleProfile = () => setIsProfileOpen((prev) => !prev);
  const closeProfile = () => setIsProfileOpen(false);

  return (
    <header className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {chatMode && (
          <button
            className="md:block cursor-pointer p-1 rounded hover:bg-gray-700 transition"
            onClick={handleBack}
            aria-label="Back to chats"
            title="Back to chats"
          >
            <ChevronLeft />
          </button>
        )}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={toggleProfile}
          title="View full profile"
        >
          <UserAvatar user={selectedUser} />
          <div>
            <p className="font-bold hover:underline">{selectedUser.fullName}</p>
            <p className="text-xs text-gray-400">{selectedUser.email}</p>
          </div>
        </div>
      </div>
      {isProfileOpen && (
        <UserProfileModal user={selectedUser} onClose={closeProfile} />
      )}
    </header>
  );
};

export default ChatHeader;
