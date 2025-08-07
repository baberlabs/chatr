const NewMessageInputField = ({ setTextLength }) => {
  return (
    <input
      type="text"
      name="text"
      autoComplete="off"
      autoFocus
      placeholder="Type a message..."
      onChange={(e) => setTextLength(e.target.value.trim().length)}
      className="flex-1 rounded-lg px-3 py-2 text-sm outline-none bg-gray-700 text-gray-100 placeholder-gray-400"
    />
  );
};

export default NewMessageInputField;
