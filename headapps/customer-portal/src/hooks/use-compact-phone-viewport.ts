"use client";

import { useEffect, useState } from "react";

const COMPACT_PHONE_MAX_WIDTH = 480;

/**
 * Detects common iPhone portrait widths without changing global tablet/mobile breakpoints.
 */
export function useCompactPhoneViewport(): boolean {
  const [isCompactPhoneViewport, setIsCompactPhoneViewport] = useState(false);

  useEffect(() => {
    const updateViewport = () => {
      setIsCompactPhoneViewport(window.innerWidth <= COMPACT_PHONE_MAX_WIDTH);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  return isCompactPhoneViewport;
}
