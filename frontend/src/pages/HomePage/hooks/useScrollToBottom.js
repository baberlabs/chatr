import { useEffect, useRef } from "react";

function useScrollToBottom(dependency) {
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [dependency]);

  return ref;
}

export default useScrollToBottom;
