import { OctagonAlert } from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";

const ProfileUpdateStatus = () => {
  const { error, isUpdatingProfile } = useAuthStore();
  // if (!isError && !isUpdatingProfile) return null;

  if (error) {
    return (
      <div className="top-10 absolute text-white text-sm font-bold flex flex-row items-center gap-2 animate-pulse">
        <OctagonAlert className="size-4 text-red-500" />
        <p className="text-red-500">
          Error: {error || "Upload failed. Try again"}
        </p>
      </div>
    );
  }

  if (isUpdatingProfile) {
    return (
      <div className="top-10 absolute text-white flex flex-row items-center gap-2 text-sm font-bold animate-pulse">
        <div className="size-4 rounded-full border-2 border-green-500 animate-spin border-t-transparent"></div>
        <p>Updating profile...</p>
      </div>
    );
  }
};

export default ProfileUpdateStatus;
