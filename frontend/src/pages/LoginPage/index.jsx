import { useState } from "react";
import { BotMessageSquare } from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";

const LoginPage = () => {
  const { isLoggingIn, login, error, isError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };
  return (
    <div className="flex items-center justify-center h-screen w-full flex-col bg-gray-700 text-gray-100 ">
      <h1 className="text-4xl font-black flex flex-row-reverse justify-between items-center gap-2 text-blue-400/90">
        <BotMessageSquare className="size-10 animate-bounce" /> Chatr
      </h1>

      <form className="mt-10 w-80">
        <h2 className="text-4xl font-bold mb-8 text-center">Welcome</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full p-2 bg-gray-800 rounded"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="w-full p-2 bg-gray-800 rounded"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        {isError && (
          <div className="text-red-500 text-sm mb-2">
            <span className="font-bold">{error || "An error occurred"}</span> .
            Please try again.
          </div>
        )}
        {isLoggingIn ? (
          <button
            type="submit"
            className="mt-2 w-full bg-blue-900 text-white p-2 rounded transition duration-200 cursor-progress italic font-bold"
            disabled={isLoggingIn}
          >
            Logging In...
          </button>
        ) : (
          <button
            type="submit"
            className="mt-2 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 font-bold cursor-pointer transition-colors"
            onClick={handleSubmit}
          >
            Login
          </button>
        )}
      </form>
      <p className="mt-4 text-sm text-gray-300">
        Don't have an account?{" "}
        <a
          href="/register"
          className="text-gray-100 underline hover:text-blue-400 hover:font-bold transition"
        >
          Register here
        </a>
        .
      </p>
    </div>
  );
};

export default LoginPage;
