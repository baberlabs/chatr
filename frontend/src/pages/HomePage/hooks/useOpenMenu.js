import { useEffect, useState } from "react";

const useOpenMenu = () => {
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    if (!openMenuId) return;
    const handleClick = () => setOpenMenuId(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [openMenuId]);

  return { openMenuId, setOpenMenuId };
};

export { useOpenMenu };
