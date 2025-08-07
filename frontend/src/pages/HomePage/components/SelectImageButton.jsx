import { Camera } from "lucide-react";

const SelectImageButton = ({ onChange }) => {
  return (
    <div className="relative w-fit">
      <label>
        <input
          type="file"
          accept="image/*"
          name="image"
          id="image-upload"
          className="hidden"
          onChange={onChange}
        />
        <div className="group relative">
          <div
            title="Upload profile picture"
            className="bg-blue-600 hover:bg-blue-700 p-2 rounded-full cursor-pointer shadow-md transition-all"
          >
            <Camera size={18} />
          </div>
        </div>
      </label>
    </div>
  );
};

export default SelectImageButton;
