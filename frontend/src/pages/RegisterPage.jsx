import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

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
    <div className="bg-gray-200 h-screen">
      <div className="flex items-center justify-center h-full">
        <div className="bg-white p-8 rounded shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
          <form>
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-2"
                htmlFor="fullName"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                className="w-full p-2 border border-gray-300 rounded"
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
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-2"
                htmlFor="password"
              >
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
            {isRegistering ? (
              <button
                type="submit"
                className="w-full bg-blue-900 text-white p-2 rounded transition duration-200 cursor-progress italic font-bold"
                disabled={isRegistering}
              >
                Registering...
              </button>
            ) : (
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200 cursor-pointer font-bold"
                onClick={(e) => handleSubmit(e)}
              >
                Register
              </button>
            )}
          </form>
        </div>
      </div>
      );
    </div>
  );
};

export default RegisterPage;
