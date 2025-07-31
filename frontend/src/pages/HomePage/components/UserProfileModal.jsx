import { X } from "lucide-react";

const UserProfileModal = ({ user, onClose }) => {
  if (!user) return null;

  const handleBackgroundClick = () => onClose();
  const stopPropagation = (e) => e.stopPropagation();

  return (
    <div
      onClick={handleBackgroundClick}
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
    >
      <img
        src={user.profilePic || "/avatar.png"}
        alt={`${user.fullName}'s profile picture`}
        className="max-w-full max-h-[90vh] rounded-lg shadow-lg"
        onClick={stopPropagation}
      />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white cursor-pointer"
        aria-label="Close profile"
        title="Close profile"
      >
        <X className="size-6" />
      </button>
    </div>
  );
};

export default UserProfileModal;
