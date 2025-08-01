import { useCallback, useEffect, useState } from "react";

import { useChatStore } from "@/store/useChatStore";

const useMenu = () => {
  const { deleteMessage } = useChatStore();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (!openMenuId) return;
    const handleClick = () => setOpenMenuId(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [openMenuId]);

  const handleDeleteMessage = useCallback(
    async (messageId) => {
      await deleteMessage(messageId);
      setOpenMenuId(null);
    },
    [deleteMessage]
  );

  const handleCopyMessage = useCallback(async (text) => {
    setAlert(null);
    try {
      await navigator.clipboard.writeText(text);
      setAlert({ type: "success", message: "Message copied" });
    } catch {
      setAlert({ type: "error", message: "Copy failed" });
    }
    setTimeout(() => setAlert(null), 1800);
    setOpenMenuId(null);
  }, []);

  return {
    alert,
    openMenuId,
    setOpenMenuId,
    handleDeleteMessage,
    handleCopyMessage,
  };
};

export { useMenu };
