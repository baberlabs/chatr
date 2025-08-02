import UserProfileModal from "./UserProfileModal";
import { useProfilePic } from "../hooks/useProfilePic";

const UserAvatar = ({ user }) => {
  const { isProfileOpen, toggleProfile, closeProfile } = useProfilePic();

  return (
    <>
      <img
        src={user?.profilePic || "/avatar.png"}
        alt={`${user?.fullName}'s profile picture`}
        className="size-10 rounded-full object-cover cursor-pointer"
        onClick={toggleProfile}
      />

      {isProfileOpen && <UserProfileModal user={user} onClose={closeProfile} />}
    </>
  );
};

export default UserAvatar;
