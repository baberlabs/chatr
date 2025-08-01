import { LogOut } from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";

const LogoutButton = () => {
  const { logout } = useAuthStore();
  return (
    <div className="mt-6">
      <button
        onClick={() => logout()}
        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 py-2 px-4 rounded-xl text-sm font-medium shadow-md transition"
      >
        <LogOut size={18} />
        Log out from your account now
      </button>
    </div>
  );
};

export default LogoutButton;
