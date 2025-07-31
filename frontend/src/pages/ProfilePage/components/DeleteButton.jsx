import { Trash2 } from "lucide-react";
import { useDeleteAccount } from "../hooks/useDeleteAccount";

const DeleteButton = () => {
  const { handleDeleteAccount } = useDeleteAccount();
  return (
    <div className="mt-6">
      <button
        onClick={handleDeleteAccount}
        className="flex items-center gap-2 bg-red-700 hover:bg-red-800 py-2 px-4 rounded-xl text-sm font-medium shadow-md transition"
      >
        <Trash2 size={18} />
        Permanently delete your account
      </button>
    </div>
  );
};

export default DeleteButton;
