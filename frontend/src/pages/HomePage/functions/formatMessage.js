export const formatMessage = ({ chat, isOtherUser }) => {
  const lastMessage = chat.latestMessage;
  const text = lastMessage?.text || null;
  const image = lastMessage?.image || null;

  if (text) {
    if (isOtherUser) return text;
    return `You: ${text}`;
  }

  if (image) {
    if (isOtherUser) return "You received an image";
    return "You sent an image";
  }
};
