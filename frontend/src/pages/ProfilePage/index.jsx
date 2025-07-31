import { BadgeAlert, Camera, LogOut, Trash2 } from "lucide-react";

import ProfilePictureField from "./components/ProfilePictureField";
import FullNameField from "./components/FullNameField";
import EmailField from "./components/EmailField";
import PasswordField from "./components/PasswordField";

import { useAuthStore } from "../../store/useAuthStore";
import { useDeleteAccount } from "./hooks/useDeleteAccount";
import MembershipDurationInfo from "./components/MembershipDurationInfo";
import VerificationStatus from "./components/VerificationStatus";
import LogoutButton from "./components/LogoutButton";
import DeleteButton from "./components/DeleteButton";

const ProfilePage = () => {
  return (
    <div className="flex p-8 md:p-20 justify-center h-screen w-full flex-col bg-gray-900 text-gray-100">
      <h2 className="text-2xl font-bold mb-8">Account Information</h2>
      <ProfilePictureField />
      <FullNameField />
      <EmailField />
      <PasswordField />
      <MembershipDurationInfo />
      <VerificationStatus />
      <LogoutButton />
      <DeleteButton />
    </div>
  );
};

export default ProfilePage;
