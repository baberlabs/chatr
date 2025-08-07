const NewMessageImagePreview = ({ image }) => {
  return (
    <img
      src={image}
      alt="image preview"
      className="size-40 md:size-48 rounded-lg object-cover"
    />
  );
};

export default NewMessageImagePreview;
