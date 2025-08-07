import { useEffect, useState } from "react";

import SendButton from "./SendButton";
import SelectImageButton from "./SelectImageButton";
import NewMessageInputField from "./NewMessageInputField";
import NewMessageImagePreview from "./NewMessageImagePreview";
import { imageFileToBase64 } from "@/lib/imageFileToBase64";
import { useChatStore } from "@/store/useChatStore";

const NewMessageForm = () => {
  const { sendMessage, selectedChatId, showGhostTypingIndicator } =
    useChatStore();
  const [textLength, setTextLength] = useState(0);
  const [image, setImage] = useState(null);

  useEffect(() => {
    showGhostTypingIndicator(textLength);
  }, [textLength]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    const base64Image = await imageFileToBase64(file);
    setImage(base64Image);
  };

  const handleSendMessage = async (formData) => {
    const text = formData.get("text").trim();
    const imageFile = formData.get("image");
    if (!text && !imageFile) return;
    if (imageFile.name) {
      const base64Image = await imageFileToBase64(imageFile);
      await sendMessage({
        text: text,
        image: base64Image,
        chatId: selectedChatId,
      });
      setTextLength(0);
      setImage(null);
    } else {
      await sendMessage({ text, chatId: selectedChatId });
      setTextLength(0);
      setImage(null);
    }
  };

  return (
    <form
      action={handleSendMessage}
      className="p-4 bg-gray-800 flex flex-col gap-4"
    >
      {image && <NewMessageImagePreview image={image} />}
      <div className="flex flex-row gap-2 items-center">
        <NewMessageInputField setTextLength={setTextLength} />
        <SelectImageButton onChange={handleImageChange} />
        <SendButton />
      </div>
    </form>
  );
};

export default NewMessageForm;
