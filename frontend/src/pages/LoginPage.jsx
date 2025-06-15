import { use, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

const LoginPage = () => {
  const { isLoggingIn, login } = useAuthStore();

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
    <div className="flex items-center justify-center h-screen flex-col">
      <h1 className="text-4xl font-bold">Login Page</h1>

      <form className="mt-8 w-80">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full p-2 border border-gray-300 rounded"
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
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        {isLoggingIn ? (
          <button
            type="submit"
            className="w-full bg-blue-900 text-white p-2 rounded transition duration-200 cursor-progress italic font-bold"
            disabled={isLoggingIn}
          >
            Logging In...
          </button>
        ) : (
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
            onClick={handleSubmit}
          >
            Login
          </button>
        )}
      </form>
      <p className="mt-4 text-sm text-gray-600">
        Don't have an account?{" "}
        <a href="/register" className="text-blue-500 hover:underline">
          Register here
        </a>
        .
      </p>
    </div>
  );
};

export default LoginPage;
