import { MenuSquare } from "lucide-react";

const MessageCopyButton = ({ onClick, messageText }) => {
  return (
    <button
      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
      onClick={() => onClick(messageText)}
    >
      <MenuSquare className="size-4" />
      Copy
    </button>
  );
};

export default MessageCopyButton;
