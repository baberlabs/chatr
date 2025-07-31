import { useProfilePic } from "../hooks/useProfilePic";
import UserProfileModal from "./UserProfileModal";

const UserAvatar = ({ user }) => {
  const { profilePic, fullName } = user;
  const { isProfileOpen, toggleProfile, closeProfile } = useProfilePic();

  return (
    <>
      <img
        src={profilePic || "/avatar.png"}
        alt={`${fullName}'s profile picture`}
        className="size-10 rounded-full object-cover cursor-pointer"
        onClick={toggleProfile}
      />

      {isProfileOpen && <UserProfileModal user={user} onClose={closeProfile} />}
    </>
  );
};

export default UserAvatar;
