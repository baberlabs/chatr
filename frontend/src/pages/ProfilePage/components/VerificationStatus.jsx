import { BadgeAlert } from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";

const VerificationStatus = () => {
  const { authUser } = useAuthStore();
  return (
    <div className="mt-6">
      {authUser?.isVerified === true ? (
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
  );
};

export default VerificationStatus;
