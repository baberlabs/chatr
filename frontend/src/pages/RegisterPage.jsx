import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { BotMessageSquare } from "lucide-react";

const RegisterPage = () => {
  const { register, isRegistering } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: "",
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
    register(formData);
  };

  return (
    <div className="flex items-center justify-center h-screen w-full flex-col bg-gray-700 text-gray-100">
      <h1 className="text-2xl font-black flex flex-row-reverse justify-between items-center gap-2">
        <BotMessageSquare /> Chatr
      </h1>
      <form className="mt-10 w-80">
        <h2 className="text-4xl font-bold mb-8 text-center">Register</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="fullName">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            className="w-full p-2 bg-gray-800 rounded"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>
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
        {isRegistering ? (
          <button
            type="submit"
            className="mt-2 w-full bg-blue-900 text-white p-2 rounded transition duration-200 cursor-progress italic font-bold"
            disabled={isRegistering}
          >
            Registering...
          </button>
        ) : (
          <button
            type="submit"
            className="mt-2 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200 cursor-pointer font-bold"
            onClick={(e) => handleSubmit(e)}
          >
            Register
          </button>
        )}
      </form>
      <p className="mt-4 text-sm text-gray-300">
        Already have an account?{" "}
        <a href="/login" className="text-gray-100 underline">
          Login here
        </a>
        .
      </p>
    </div>
  );
};

export default RegisterPage;
