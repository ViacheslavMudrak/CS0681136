"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import useDomMutationRender from "src/helpers/usePageHeight";

interface FullHeightBackgroundProps {
  imageUrl: string;
  children: React.ReactNode;
}

export default function FullHeightBackground({ imageUrl, children }: FullHeightBackgroundProps) {
  const oktaChanges = useDomMutationRender(".siw-main-body");
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const height = containerRef.current.offsetHeight;
        const parent = containerRef.current.closest(
          ".column-splitter-left, .column-splitter-right"
        );
        if (parent) {
          const parentHeight = (parent as HTMLElement).offsetHeight;
          setContainerHeight(Math.max(height, parentHeight || window.innerHeight));
        } else {
          setContainerHeight(Math.max(height, window.innerHeight));
        }
      }
    };

    updateHeight();

    window.addEventListener("resize", updateHeight);

    const containerObserver = new MutationObserver(() => {
      requestAnimationFrame(() => {
        setTimeout(updateHeight, 0);
      });
    });

    if (containerRef.current) {
      containerObserver.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"],
      });
    }

    const bodyObserver = new MutationObserver(() => {
      requestAnimationFrame(() => {
        setTimeout(updateHeight, 100);
      });
    });

    if (typeof document !== "undefined") {
      bodyObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    const intervalId = setInterval(updateHeight, 500);

    return () => {
      window.removeEventListener("resize", updateHeight);
      containerObserver.disconnect();
      bodyObserver.disconnect();
      clearInterval(intervalId);
    };
  }, [oktaChanges]);

  const height = containerHeight > 0 ? `${containerHeight}px` : "100vh";
  const minHeight = "100vh";

  return (
    <div
      ref={containerRef}
      className={`w-full h-full lg:min-h-[${minHeight}]`}
      role="region"
      aria-label="Featured content with background"
    >
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat bg-[#0d233a] min-h-[100%] lg:min-h-[${height}]`}
        style={{
          backgroundImage: `url(${imageUrl})`,
        }}
        aria-hidden="true"
        role="presentation"
      />

      <div
        className={cn(
          "relative z-10",
          "[@media(min-width:1025px)]:min-h-screen",
          "flex",
          "lg:items-start items-center",
          "justify-center",
          "pt-[103px] md:pt-[120px] lg:pt-[220px]"
        )}
        role="region"
        aria-label="Content"
      >
        <div className="">{children}</div>
      </div>
    </div>
  );
}
