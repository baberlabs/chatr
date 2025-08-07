import { useFormStatus } from "react-dom";

const SendButton = () => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={`px-4 py-2 rounded-lg text-white text-sm transition ${
        pending
          ? "bg-blue-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
      }`}
      disabled={pending}
    >
      {pending ? "Sending..." : "Send"}
    </button>
  );
};

export default SendButton;
