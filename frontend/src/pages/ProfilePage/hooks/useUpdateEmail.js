import { useState } from "react";

import { useAuthStore } from "../../../store/useAuthStore";

const useUpdateEmail = () => {
  const { authUser, updateProfile } = useAuthStore();
  const [emailEditMode, setEmailEditMode] = useState(false);
  const [email, setEmail] = useState(authUser?.email || "Loading...");

  const handleEmailChange = async (email) => {
    const updatedProfile = await updateProfile(authUser._id, {
      email: email.trim(),
    });
    setEmail(updatedProfile.email);
    setEmailEditMode(false);
  };

  return {
    email,
    emailEditMode,
    setEmail,
    setEmailEditMode,
    handleEmailChange,
  };
};

export { useUpdateEmail };
