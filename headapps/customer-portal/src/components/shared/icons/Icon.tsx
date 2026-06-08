import React from "react";

export interface IconProps {
  width?: number | string;

  height?: number | string;
  className?: string;

  "aria-label"?: string;

  decorative?: boolean;

  viewBox?: string;
  children: React.ReactNode;
}

export default function Icon({
  width = "auto",
  height = "auto",
  className = "",
  "aria-label": ariaLabel,
  decorative = false,
  viewBox = "0 0 24 24",
  children,
}: IconProps) {
  const widthValue = typeof width === "number" ? `${width}px` : width;
  const heightValue = typeof height === "number" ? `${height}px` : height;

  return (
    <svg
      className={`inline-block flex-shrink-0 ${className}`}
      width={widthValue}
      height={heightValue}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      role={decorative ? "presentation" : "img"}
    >
      {children}
    </svg>
  );
}
