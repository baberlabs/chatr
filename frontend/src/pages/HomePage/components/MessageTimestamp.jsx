const MessageTimestamp = ({ isMe, createdAt }) => {
  return (
    <time
      className={`text-xs text-gray-400 mt-1 ${
        isMe ? "text-right" : "text-left"
      }`}
      title={createdAt && new Date(createdAt).toLocaleString()}
    >
      {createdAt &&
        new Date(createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
    </time>
  );
};

export default MessageTimestamp;
