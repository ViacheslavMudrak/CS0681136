
import React from "react";

export interface QuoteDetailBackIconProps {
  width?: number;
  height?: number;
  className?: string;
}

/** Figma back chevron for Quote Detail header navigation. */
export function QuoteDetailBackIcon({
  width = 9,
  height = 16,
  className,
}: QuoteDetailBackIconProps): React.ReactElement {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 9 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M0.431641 6.80664C7.26432e-07 7.20508 7.26432e-07 7.90234 0.431641 8.30078L6.80664 14.6758C7.20508 15.1074 7.90234 15.1074 8.30078 14.6758C8.73242 14.2773 8.73242 13.5801 8.30078 13.1816L2.68945 7.53711L8.30078 1.92578C8.73242 1.52735 8.73242 0.83008 8.30078 0.431642C7.90234 1.5609e-06 7.20508 1.5609e-06 6.80664 0.431642L0.431641 6.80664Z"
        fill="currentColor"
      />
    </svg>
  );
}
