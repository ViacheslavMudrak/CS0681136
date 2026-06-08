
import React from "react";

import { splitHighlightSegments } from "@/lib/orderManagementUtils";
import { cn } from "@/lib/utils";

export function OrderManagementHighlightedText({
  text,
  query,
}: {
  text: string;
  query: string;
}): React.ReactElement {
  const segments = splitHighlightSegments(text, query);
  return (
    <>
      {segments.map((seg, i) =>
        seg.match ? (
          <mark
            key={i}
            className={cn(
              "font-bold text-text-heading",
              "bg-[var(--Search-Highlight,rgba(173,245,188,0.5))]"
            )}
          >
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </>
  );
}
