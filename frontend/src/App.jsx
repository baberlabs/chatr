import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { Navbar } from "@/components";
import {
  HomePage,
  LoginPage,
  ProfilePage,
  RegisterPage,
  SettingsPage,
} from "@/pages";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { chatMode } = useChatStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  const dontShowNavBar = chatMode || !authUser;
  return (
    <div className="min-h-screen bg-gray-100 flex flex-row">
      {!dontShowNavBar && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={authUser ? <Navigate to="/" /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={authUser ? <Navigate to="/" /> : <RegisterPage />}
        />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/settings"
          element={authUser ? <SettingsPage /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
};

export default App;
