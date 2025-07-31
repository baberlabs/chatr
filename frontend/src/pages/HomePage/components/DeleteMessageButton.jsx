import { Trash2Icon } from "lucide-react";

const DeleteMessageButton = ({ onClick, messageId }) => {
  return (
    <button
      className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-800"
      onClick={() => onClick(messageId)}
    >
      <Trash2Icon className="size-4" />
      Delete
    </button>
  );
};

export default DeleteMessageButton;
