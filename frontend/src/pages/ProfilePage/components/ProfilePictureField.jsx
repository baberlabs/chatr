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
        <div className="group relative">
          <div
            title="Upload profile picture"
            className="bg-blue-600 hover:bg-blue-700 absolute bottom-2 right-2 p-2 rounded-full cursor-pointer shadow-md transition"
          >
            <Camera size={18} />
          </div>
          <div className="absolute p-2 text-xs rounded-lg right-0 bg-black/50 text-gray-300 justify-center items-center font-bold hidden group-hover:flex">
            Max 5 MB
          </div>
        </div>
      </label>
    </div>
  );
};

export default ProfilePictureField;
