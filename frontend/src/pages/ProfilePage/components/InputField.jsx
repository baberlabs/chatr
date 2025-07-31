import { Edit, Save } from "lucide-react";

const InputField = ({
  label,
  type,
  value,
  setValue,
  isEditing,
  toggleEdit,
  handleSave,
}) => {
  return (
    <div
      key={label}
      className="mt-6 flex flex-col gap-2 relative min-w-[300px] max-w-md"
    >
      <label className="text-sm font-semibold">{label}</label>
      <input
        type={type}
        value={value}
        disabled={!isEditing}
        onChange={(e) => isEditing && setValue(e.target.value)}
        className={`bg-gray-800 p-2 rounded text-sm ${
          isEditing ? "text-gray-100" : "text-gray-400"
        }`}
      />
      <button
        onClick={() => {
          toggleEdit(!isEditing);
          if (isEditing) handleSave(value);
        }}
        className="absolute right-2 top-8 text-white p-1 rounded-lg hover:text-blue-400 transition"
      >
        {isEditing ? <Save size={18} /> : <Edit size={18} />}
      </button>
    </div>
  );
};

export default InputField;
