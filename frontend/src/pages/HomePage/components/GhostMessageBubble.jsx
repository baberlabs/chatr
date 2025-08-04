const GhostMessageBubble = ({ length }) => {
  if (length <= 0) return null;

  const ghostMessage = "The".padEnd(length, " lorem ipsum dolar sit amet");

  return (
    <div className="px-4 py-2 relative bg-gray-700 text-gray-100 rounded-tr-xl rounded-br-xl rounded-tl-xl w-fit blur-[3px] animate-pulse">
      {ghostMessage}
    </div>
  );
};

export default GhostMessageBubble;
