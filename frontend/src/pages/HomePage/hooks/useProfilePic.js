import { useState } from "react";

export const useProfilePic = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleProfile = () => setIsProfileOpen((prev) => !prev);
  const closeProfile = () => setIsProfileOpen(false);

  return {
    isProfileOpen,
    toggleProfile,
    closeProfile,
  };
};
