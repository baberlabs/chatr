import { useId } from "react";

const InputField = ({ label, type, name, placeholder, required }) => {
  const inputId = useId();
  return (
    <div>
      <label
        className="block text-sm font-medium mb-2 text-gray-200"
        htmlFor={inputId}
      >
        {label}
      </label>
      <input
        type={type}
        id={inputId}
        name={name}
        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

export default InputField;
