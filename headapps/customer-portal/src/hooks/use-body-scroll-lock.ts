"use client";

import { useEffect } from "react";

let lockCount = 0;
let savedScrollY = 0;

export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked || typeof document === "undefined") {
      return;
    }

    const html = document.documentElement;
    const body = document.body;
    const hasVerticalScrollbar = document.documentElement.scrollHeight > window.innerHeight;

    lockCount += 1;
    if (lockCount === 1) {
      savedScrollY = window.scrollY;
      if (hasVerticalScrollbar) {
        html.style.scrollbarGutter = "stable";
      }

      body.style.position = "fixed";
      body.style.top = `-${savedScrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow = "hidden";
    }

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        html.style.scrollbarGutter = "";
        body.style.position = "";
        body.style.top = "";
        body.style.left = "";
        body.style.right = "";
        body.style.width = "";
        body.style.overflow = "";
        window.scrollTo(0, savedScrollY);
      }
    };
  }, [locked]);
}
