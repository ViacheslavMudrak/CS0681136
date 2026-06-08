import { useState, useEffect, startTransition } from "react";

export const useWindowSize = () => {
  const [hydrated, setHydrated] = useState(false);
  const [windowSize, setWindowSize] = useState(getSize);
  function getSize() {
    return {
      width: hydrated ? window.innerWidth : undefined,
      height: hydrated ? window.innerHeight : undefined,
    };
  }
  function handleResize() {
    setWindowSize(getSize());
  }
  useEffect(() => {
    startTransition(() => {
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    // handles setting initial window size on an ssr environment,
    // then adds a resize handler
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [hydrated]); // Empty array ensures that effect is only run on mount and unmount

  return windowSize;
};
