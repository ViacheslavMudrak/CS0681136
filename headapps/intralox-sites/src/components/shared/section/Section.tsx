"use client";
import React from "react";
import { cn } from "lib/utils";
import { SectionProps } from "./Section.type";

const SectionBase = ({
  analyticsRegion = "Section Content",
  backgroundColor = "white",
  children,
  className,
  id,
  removeBottomPadding,
  removeTopPadding,
  textAlign = "left",
}: SectionProps) => {
  const _backgroundColor = {
    gray: "bg-surface-subtle",
    white: "bg-surface",
  }[backgroundColor];

  const _textAlign = {
    center: "text-center",
    left: "text-left",
  }[textAlign];

  return (
    <section
      className={cn(
        "relative w-full",
        _backgroundColor,
        _textAlign,
        {
          "pt-12 md:pt-20": !removeTopPadding,
          "pb-12 md:pb-20": !removeBottomPadding,
        },
        className,
      )}
      id={id}
      data-analytics-region={analyticsRegion}
      style={{
        scrollMarginTop: `calc(var(--headerTop))`,
      }}
    >
      {children}
    </section>
  );
};

export const Section = SectionBase;
