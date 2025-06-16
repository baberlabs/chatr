import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, deleteAccount } =
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
    <div className="bg-gray-300">
      <h2 className="text-2xl font-bold mb-4">Profile Page</h2>

      {/* ProfilePic */}
      <div>
        <img
          src={profileData?.profilePic || "/avatar.png"}
          alt="Profile"
          className="size-50 rounded-full mr-4"
        />
        <label>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfilePicChange}
          />
          <span className="text-blue-500 cursor-pointer">
            Change Profile Picture
          </span>
        </label>
      </div>

      {/* Full Name */}
      <div className="mt-4 flex flex-row gap-2">
        <label className="block mb-2">Full Name:</label>
        {fullNameEditMode ? (
          <input
            type="text"
            value={fullName}
            className="border p-2 rounded"
            onChange={(e) => setFullName(e.target.value)}
          />
        ) : (
          <span>{fullName}</span>
        )}
        <button
          onClick={() => {
            setFullNameEditMode(!fullNameEditMode);
            if (fullNameEditMode) {
              handleFullNameChange();
            }
          }}
          className="ml-2 text-blue-500"
        >
          {fullNameEditMode ? "Save" : "Change Full Name"}
        </button>
      </div>

      {/* Email */}
      <div className="mt-4 flex flex-row gap-2">
        <label className="block mb-2">Email:</label>
        {emailEditMode ? (
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded"
          />
        ) : (
          <span>{email}</span>
        )}
        <button
          onClick={() => {
            setEmailEditMode(!emailEditMode);
            if (emailEditMode) {
              handleEmailChange();
            }
          }}
          className="ml-2 text-blue-500"
        >
          {emailEditMode ? "Save" : "Change Email"}
        </button>
      </div>

      {/* Password */}
      <div className="mt-4 flex flex-row gap-2">
        <label className="block mb-2">Password:</label>
        {passwordEditMode ? (
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded"
          />
        ) : (
          <span>********</span>
        )}
        <button
          onClick={() => {
            setPasswordEditMode(!passwordEditMode);
            if (passwordEditMode) {
              handlePasswordChange();
            }
          }}
          className="ml-2 text-blue-500"
        >
          {passwordEditMode ? "Save" : "Change Password"}
        </button>
      </div>

      {/* Verification Status */}
      <div className="mt-4 flex flex-row gap-2">
        <label className="block mb-2">Verification Status:</label>
        <span>
          {profileData.isVerified === true ? "Verified" : "Not Verified"}
        </span>
        <button
          onClick={() => alert("Verification process is not implemented yet.")}
          className="ml-2 text-blue-500"
        >
          Verify Account
        </button>
      </div>

      {/* Additional Information: createdAt and updatedAt */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Account Information</h3>
        <p>Created At: {new Date(authUser?.createdAt).toLocaleString()}</p>
        <p>Updated At: {new Date(authUser?.updatedAt).toLocaleString()}</p>{" "}
      </div>

      {/* Delete */}
      <div className="mt-4">
        <button
          onClick={handleDeleteAccount}
          className="bg-red-700 font-bold text-white py-2 px-4 rounded-xl hover:underline"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
