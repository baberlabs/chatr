import { ChevronLeft } from "lucide-react";

import UserAvatar from "./UserAvatar";
import UserProfileModal from "./UserProfileModal";
import { useChatStore } from "../../../store/useChatStore";
import { useProfilePic } from "../hooks/useProfilePic";

const ChatHeader = () => {
  const { selectedUser, setChatMode, chatMode } = useChatStore();
  const { toggleProfile } = useProfilePic();

  if (!selectedUser) {
    return (
      <header className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-center text-gray-400 text-lg font-medium">
        Select a conversation
      </header>
    );
  }

  const handleBack = () => setChatMode(false);

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
        <div className="flex items-center gap-2">
          <UserAvatar user={selectedUser} />
          <div>
            <p className="font-bold hover:underline">{selectedUser.fullName}</p>
            <p className="text-xs text-gray-400">{selectedUser.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
