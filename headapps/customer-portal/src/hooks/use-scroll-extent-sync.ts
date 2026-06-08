"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import { DEVICE_VIEWPORT } from "@/lib/viewport-breakpoints";

const COMPACT_VIEWPORT_QUERY = `(max-width: ${DEVICE_VIEWPORT.DESKTOP_MIN - 1}px)`;

let queuedContainer: HTMLElement | null = null;
let syncFrameId = 0;

function isCompactDocumentScrollViewport(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(COMPACT_VIEWPORT_QUERY).matches;
}

function invalidateDocumentScrollLayout(container?: HTMLElement | null): void {
  if (container) {
    const previousHeight = container.style.height;
    const previousMinHeight = container.style.minHeight;
    container.style.height = "auto";
    container.style.minHeight = "0";
    void container.offsetHeight;
    if (previousHeight) {
      container.style.height = previousHeight;
    } else {
      container.style.removeProperty("height");
    }
    if (previousMinHeight) {
      container.style.minHeight = previousMinHeight;
    } else {
      container.style.removeProperty("min-height");
    }
  }

  const { style: htmlStyle } = document.documentElement;
  const { style: bodyStyle } = document.body;
  const previousHtmlOverflow = htmlStyle.overflow;
  const previousBodyOverflow = bodyStyle.overflow;

  htmlStyle.overflow = "hidden";
  bodyStyle.overflow = "hidden";

  let node: HTMLElement | null = container ?? document.body;
  while (node) {
    void node.offsetHeight;
    node = node.parentElement;
  }

  if (previousHtmlOverflow) {
    htmlStyle.overflow = previousHtmlOverflow;
  } else {
    htmlStyle.removeProperty("overflow");
  }

  if (previousBodyOverflow) {
    bodyStyle.overflow = previousBodyOverflow;
  } else {
    bodyStyle.removeProperty("overflow");
  }
}

export function syncScrollExtent(container?: HTMLElement | null): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!isCompactDocumentScrollViewport()) {
    return;
  }

  const previousScrollY = window.scrollY;
  invalidateDocumentScrollLayout(container);

  const scrollingElement = document.scrollingElement ?? document.documentElement;
  const scrollExtent = Math.max(scrollingElement.scrollHeight, document.body.scrollHeight);
  const maxScroll = Math.max(0, scrollExtent - window.innerHeight);
  const targetScrollY = Math.min(previousScrollY, maxScroll);

  if (targetScrollY !== previousScrollY) {
    window.scrollTo(0, targetScrollY);
  }
}

function scheduleScrollExtentSync(container?: HTMLElement | null): void {
  syncScrollExtent(container);

  requestAnimationFrame(() => {
    syncScrollExtent(container);
    requestAnimationFrame(() => {
      syncScrollExtent(container);
    });
  });
}

export function queueScrollExtentSync(container?: HTMLElement | null): void {
  if (typeof window === "undefined") {
    return;
  }

  if (container) {
    queuedContainer = container;
  }

  cancelAnimationFrame(syncFrameId);
  syncFrameId = requestAnimationFrame(() => {
    const target = queuedContainer;
    queuedContainer = null;
    scheduleScrollExtentSync(target ?? undefined);
  });
}

export function scrollListingPanelIntoView(): void {
  if (typeof window === "undefined") {
    return;
  }

  const anchor = document.querySelector("[data-listing-scroll-anchor]");
  if (anchor instanceof HTMLElement) {
    anchor.scrollIntoView({ block: "start", behavior: "instant" });
  } else {
    const main = document.querySelector("main");
    if (main instanceof HTMLElement) {
      const top = main.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
    }
  }

  queueScrollExtentSync(anchor instanceof HTMLElement ? anchor : null);
}

export function useScrollExtentSync(mainRef: RefObject<HTMLElement | null>): void {
  const previousHeightRef = useRef(0);

  useLayoutEffect(() => {
    const main = mainRef.current;
    if (!main || typeof ResizeObserver === "undefined") {
      return;
    }

    previousHeightRef.current = main.getBoundingClientRect().height;

    let resizeFrameId = 0;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const newHeight = entry.contentRect.height;
      const previousHeight = previousHeightRef.current;
      previousHeightRef.current = newHeight;

      if (previousHeight > 0 && newHeight < previousHeight - 1) {
        cancelAnimationFrame(resizeFrameId);
        resizeFrameId = requestAnimationFrame(() => {
          syncScrollExtent(main);
        });
      }
    });

    observer.observe(main);

    return () => {
      cancelAnimationFrame(resizeFrameId);
      observer.disconnect();
    };
  }, [mainRef]);
}
