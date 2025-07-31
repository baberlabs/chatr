import { useState } from "react";

import { useAuthStore } from "../../../store/useAuthStore";

const useUpdatePassword = () => {
  const { authUser, updateProfile } = useAuthStore();
  const [passwordEditMode, setPasswordEditMode] = useState(false);
  const [password, setPassword] = useState("");

  const handlePasswordChange = async (password) => {
    await updateProfile(authUser._id, {
      password: password.trim(),
    });
    setPasswordEditMode(false);
    alert("Password updated successfully!");
  };

  return {
    password,
    passwordEditMode,
    setPassword,
    setPasswordEditMode,
    handlePasswordChange,
  };
};

export { useUpdatePassword };
