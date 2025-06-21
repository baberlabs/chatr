export const displayDate = (date) => {
  let displayDate = "";
  const updatedAt = new Date(date);
  const now = new Date();
  const isToday =
    updatedAt.getDate() === now.getDate() &&
    updatedAt.getMonth() === now.getMonth() &&
    updatedAt.getFullYear() === now.getFullYear();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    updatedAt.getDate() === yesterday.getDate() &&
    updatedAt.getMonth() === yesterday.getMonth() &&
    updatedAt.getFullYear() === yesterday.getFullYear();

  if (isToday) {
    displayDate = updatedAt.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (isYesterday) {
    displayDate = "yesterday";
  } else {
    displayDate = updatedAt.toLocaleDateString();
  }
  return displayDate;
};
