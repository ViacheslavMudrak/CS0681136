"use client";

import React from "react";

export interface RequestDocumentsActionIconProps {
  /** Matches OrderDetailHeader `.secondaryOutlineBtnIcon` (18×16). */
  width?: number;
  height?: number;
  className?: string;
}

/** Figma document-with-question glyph for outline “Request documents” actions. */
export function RequestDocumentsActionIcon({
  width = 18,
  height = 16,
  className,
}: RequestDocumentsActionIconProps): React.ReactElement {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 42 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M18.5 13.5H15C14.7188 13.5 14.5 13.7188 14.5 14V26C14.5 26.2812 14.7188 26.5 15 26.5H19.8438C20.0312 27.0312 20.3125 27.5312 20.625 28H15C13.9062 28 13 27.0938 13 26V14C13 12.9062 13.9062 12 15 12H19.1875C19.7188 12 20.2188 12.2188 20.5938 12.5938L24.4062 16.4062C24.7812 16.7812 25 17.3125 25 17.8438V18.5312C24.4688 18.5625 23.9688 18.6875 23.5 18.8438V18.5H20.75C19.5 18.5 18.5 17.5 18.5 16.25V13.5ZM22.875 17L20 14.125V16.25C20 16.6562 20.3438 17 20.75 17H22.875ZM25.5 20C28 20 30 22 30 24.5C30 27 28 29 25.5 29C23 29 21 27 21 24.5C21 22 23 20 25.5 20ZM25.5 27.125C25.8438 27.125 26.125 26.8438 26.125 26.5C26.125 26.1562 25.8438 25.875 25.5 25.875C25.1562 25.875 24.875 26.1562 24.875 26.5C24.875 26.8438 25.1562 27.125 25.5 27.125ZM25.5 22.75C25.9062 22.75 26.25 23.0938 26.25 23.5C26.25 23.7188 26.125 23.9375 25.9062 24.0312L25.5312 24.1875C25.2188 24.3438 25 24.6562 25 25C25 25.2812 25.2188 25.5 25.5 25.5C25.75 25.5 25.9688 25.3125 26 25.0938L26.3125 24.9375C26.875 24.6875 27.25 24.125 27.25 23.5C27.25 22.5312 26.4688 21.75 25.5 21.75C24.6562 21.75 23.9375 22.3438 23.7812 23.1562C23.7188 23.4375 23.9062 23.6875 24.1875 23.75C24.4375 23.8125 24.7188 23.625 24.7812 23.3438C24.8438 23 25.125 22.75 25.5 22.75Z"
        fill="currentColor"
      />
    </svg>
  );
}
