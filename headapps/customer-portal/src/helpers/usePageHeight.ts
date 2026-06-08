"use client";

import { useEffect, useState } from "react";

export default function useDomMutationRender(targetSelector: string) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const target = document.querySelector(targetSelector);
    if (!target) {
      return;
    }

    const observer = new MutationObserver(() => {
      setTick((value) => value + 1);
    });

    observer.observe(target, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [targetSelector]);

  return tick;
}
