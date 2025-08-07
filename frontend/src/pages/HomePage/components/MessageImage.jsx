const MessageImage = ({ image }) => {
  return (
    <img
      src={image}
      alt="Attached image"
      className="rounded-lg object-cover w-full h-full cursor-pointer"
    />
  );
};

export default MessageImage;
