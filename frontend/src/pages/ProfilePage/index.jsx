import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { Link } from "react-router-dom";
import {
  BadgeAlert,
  Camera,
  Delete,
  Edit,
  LogOut,
  LucideDelete,
  Save,
  Trash2,
} from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, logout, deleteAccount } =
    useAuthStore();
  const [profileData, setProfileData] = useState({
    fullName: authUser?.fullName || "Loading...",
    email: authUser?.email || "Loading...",
    profilePic: authUser?.profilePic || "",
    isVerified: authUser?.isVerified || "Loading...",
  });
  const [fullNameEditMode, setFullNameEditMode] = useState(false);
  const [emailEditMode, setEmailEditMode] = useState(false);
  const [passwordEditMode, setPasswordEditMode] = useState(false);

  const [fullName, setFullName] = useState(profileData.fullName);
  const [email, setEmail] = useState(profileData.email);
  const [password, setPassword] = useState("");

  useEffect(() => {
    setProfileData({
      fullName: authUser?.fullName || "Loading...",
      email: authUser?.email || "Loading...",
      profilePic: authUser?.profilePic || "",
      isVerified: authUser?.isVerified || "Loading...",
    });
  }, [authUser]);

  const handleFullNameChange = async (e) => {
    const updatedProfile = await updateProfile(authUser._id, {
      fullName: fullName,
    });
    setProfileData((prev) => ({
      ...prev,
      fullName: updatedProfile.fullName,
    }));
    setFullNameEditMode(false);
  };
  const handleEmailChange = async (e) => {
    const updatedProfile = await updateProfile(authUser._id, {
      email: email,
    });
    setProfileData((prev) => ({
      ...prev,
      email: updatedProfile.email,
    }));
    setEmailEditMode(false);
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      const updatedProfile = await updateProfile(authUser._id, {
        profilePic: base64Image,
      });
      setProfileData((prev) => ({
        ...prev,
        profilePic: updatedProfile.profilePic,
      }));
    };
  };

  const handlePasswordChange = async () => {
    await updateProfile(authUser._id, {
      password: password,
    });
    setPasswordEditMode(false);
    alert("Password updated successfully!");
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (confirmDelete) {
      await deleteAccount(authUser._id);
      alert("Account deleted successfully.");
    }
  };

  return (
    <div className="flex p-8 md:p-20 justify-center h-screen w-full flex-col bg-gray-900 text-gray-100">
      <h2 className="text-2xl font-bold mb-8">Account Information</h2>

      {/* Profile Picture */}
      <div className="relative w-fit">
        <img
          src={profileData?.profilePic || "/avatar.png"}
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

      {/* Editable Fields */}
      {[
        {
          label: "Full Name",
          value: fullName,
          setValue: setFullName,
          isEditing: fullNameEditMode,
          toggleEdit: setFullNameEditMode,
          handleSave: handleFullNameChange,
          type: "text",
        },
        {
          label: "Email",
          value: email,
          setValue: setEmail,
          isEditing: emailEditMode,
          toggleEdit: setEmailEditMode,
          handleSave: handleEmailChange,
          type: "email",
        },
        {
          label: "Password",
          value: passwordEditMode ? password : "*********",
          setValue: setPassword,
          isEditing: passwordEditMode,
          toggleEdit: setPasswordEditMode,
          handleSave: handlePasswordChange,
          type: "password",
        },
      ].map(
        ({
          label,
          value,
          setValue,
          isEditing,
          toggleEdit,
          handleSave,
          type,
        }) => (
          <div
            key={label}
            className="mt-6 flex flex-col gap-2 relative min-w-[300px] max-w-md"
          >
            <label className="text-sm font-semibold">{label}</label>
            <input
              type={type}
              value={value}
              disabled={!isEditing}
              onChange={(e) => isEditing && setValue(e.target.value)}
              className={`bg-gray-800 p-2 rounded text-sm ${
                isEditing ? "text-gray-100" : "text-gray-400"
              }`}
            />
            <button
              onClick={() => {
                toggleEdit(!isEditing);
                if (isEditing) handleSave();
              }}
              className="absolute right-2 top-8 text-white p-1 rounded-lg hover:text-blue-400 transition"
            >
              {isEditing ? <Save size={18} /> : <Edit size={18} />}
            </button>
          </div>
        )
      )}

      {/* Metadata */}
      <div className="mt-6 text-sm text-gray-400">
        Member since{" "}
        {authUser?.createdAt
          ? timeAgo(new Date(authUser.createdAt))
          : "Loading..."}
      </div>

      {/* Verification */}
      <div className="mt-6">
        {profileData.isVerified === true ? (
          <span className="text-green-400 font-semibold">Verified</span>
        ) : (
          <button
            onClick={() => alert("Verification process not implemented yet.")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-xl text-sm font-medium shadow-md transition"
          >
            <BadgeAlert size={18} />
            Verify your email
          </button>
        )}
      </div>

      {/* Logout */}
      <div className="mt-6">
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 py-2 px-4 rounded-xl text-sm font-medium shadow-md transition"
        >
          <LogOut size={18} />
          Log out from your account now
        </button>
      </div>

      {/* Delete Account */}
      <div className="mt-6">
        <button
          onClick={handleDeleteAccount}
          className="flex items-center gap-2 bg-red-700 hover:bg-red-800 py-2 px-4 rounded-xl text-sm font-medium shadow-md transition"
        >
          <Trash2 size={18} />
          Permanently delete your account
        </button>
      </div>
    </div>
  );
};

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return `${interval} years ago`;
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `${interval} months ago`;
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `${interval} days ago`;
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `${interval} hours ago`;
  interval = Math.floor(seconds / 60);
  if (interval > 1) return `${interval} minutes ago`;
  return `${seconds} seconds ago`;
};

export default ProfilePage;
