export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidImageFormat = (image) => {
  const imageRegex =
    /^data:image\/(png|jpeg|jpg|webp|gif|bmp|x-icon|ico|avif);base64,/;
  return imageRegex.test(image);
};

export const isValidImageSize = (image) => {
  const base64Size = Buffer.byteLength(image, "base64");
  const maxSize = 5 * 1024 * 1024; // 5 MB
  return base64Size < maxSize;
};

export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};
