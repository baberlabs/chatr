import { Camera } from "lucide-react";

import { useUpdateProfilePic } from "../hooks/useUpdateProfilePic";

const ProfilePictureField = () => {
  const { profilePic, handleProfilePicChange } = useUpdateProfilePic();
  return (
    <div className="relative w-fit">
      <img
        src={profilePic || "/avatar.png"}
        alt="Profile"
        className="size-40 md:size-48 rounded-full object-cover"
      />
      <label>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleProfilePicChange}
        />
        <div className="bg-blue-600 hover:bg-blue-700 absolute bottom-2 right-2 p-2 rounded-full cursor-pointer shadow-md transition">
          <Camera size={18} />
        </div>
      </label>
    </div>
  );
};

export default ProfilePictureField;
