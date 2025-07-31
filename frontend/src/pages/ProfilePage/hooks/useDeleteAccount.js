import { useAuthStore } from "../../../store/useAuthStore";

const useDeleteAccount = () => {
  const { authUser, deleteAccount } = useAuthStore();
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (confirmDelete) {
      await deleteAccount(authUser._id);
      alert("Account deleted successfully.");
    }
  };
  return {
    handleDeleteAccount,
  };
};

export { useDeleteAccount };
