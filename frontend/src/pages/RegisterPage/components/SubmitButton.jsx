import { useFormStatus } from "react-dom";

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-75 text-white p-3 rounded-lg font-medium transition-all duration-200 mt-2"
      disabled={pending}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Registering...
        </span>
      ) : (
        "Register"
      )}
    </button>
  );
};

export default SubmitButton;
