const MessageText = ({ messageText }) => {
  if (!messageText) return null;
  return <p className="py-1 px-2 text-sm break-words">{messageText}</p>;
};

export default MessageText;
