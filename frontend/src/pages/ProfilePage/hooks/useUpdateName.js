import { useState } from "react";

import { useAuthStore } from "@/store/useAuthStore";

const useUpdateName = () => {
  const { authUser, updateProfile } = useAuthStore();
  const [fullNameEditMode, setFullNameEditMode] = useState(false);
  const [fullName, setFullName] = useState(authUser?.fullName || "Loading...");

  const handleFullNameChange = async (fullName) => {
    const updatedProfile = await updateProfile(authUser._id, {
      fullName: fullName?.trim(),
    });
    setFullName(updatedProfile.fullName);
    setFullNameEditMode(false);
  };

  return {
    fullName,
    fullNameEditMode,
    setFullName,
    setFullNameEditMode,
    handleFullNameChange,
  };
};

export { useUpdateName };
