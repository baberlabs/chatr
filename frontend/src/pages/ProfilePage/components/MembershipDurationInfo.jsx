import { useAuthStore } from "@/store/useAuthStore";

import { formatTimeAgo } from "../functions/formatTimeAgo";

const MembershipDurationInfo = () => {
  const { authUser } = useAuthStore();
  return (
    <div className="mt-6 text-sm text-gray-400">
      Member since{" "}
      {authUser?.createdAt
        ? formatTimeAgo(new Date(authUser?.createdAt))
        : "Loading..."}
    </div>
  );
};

export default MembershipDurationInfo;
