import InputField from "@/components/InputField";
import SubmitButton from "./SubmitButton";
import { useAuthStore } from "@/store/useAuthStore";

const RegisterForm = () => {
  const { register, error, isError } = useAuthStore();

  const handleRegister = async (formData) => {
    const fullName = formData.get("fullName");
    const email = formData.get("email");
    const password = formData.get("password");
    await register({ fullName, email, password });
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.requestSubmit();
    }
  };

  return (
    <form
      className="space-y-4"
      action={handleRegister}
      onKeyDown={handleKeyDown}
    >
      <InputField
        label="Full Name"
        type="text"
        name="fullName"
        placeholder="Enter your full name"
        required
      />
      <InputField
        label="Email"
        type="email"
        name="email"
        placeholder="Enter your email"
        required
      />
      <InputField
        label="Password"
        type="password"
        name="password"
        placeholder="Enter your password"
        required
      />

      {isError && (
        <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg text-sm">
          <strong>Error:</strong> {error || "Login failed. Please try again."}
        </div>
      )}

      <SubmitButton />
    </form>
  );
};

export default RegisterForm;
