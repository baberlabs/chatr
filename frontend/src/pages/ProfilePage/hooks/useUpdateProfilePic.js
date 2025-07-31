import { useState } from "react";

import { useAuthStore } from "../../../store/useAuthStore";

const useUpdateProfilePic = () => {
  const { authUser, updateProfile } = useAuthStore();
  const [profilePic, setProfilePic] = useState(authUser?.profilePic || "");

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    console.log("Selected file:", file);
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      const updatedProfile = await updateProfile(authUser._id, {
        profilePic: base64Image,
      });
      setProfilePic(updatedProfile.profilePic);
      alert("Profile picture updated successfully!");
    };
  };

  return {
    profilePic,
    handleProfilePicChange,
  };
};

export { useUpdateProfilePic };
