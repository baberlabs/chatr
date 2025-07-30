const UserAvatar = ({ user }) => {
  const { profilePic, fullName } = user;
  return (
    <img
      src={profilePic || "/avatar.png"}
      alt={`${fullName}'s profile picture`}
      className="size-10 rounded-full object-cover"
    />
  );
};

export default UserAvatar;
