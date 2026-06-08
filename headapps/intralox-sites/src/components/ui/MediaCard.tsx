"use client";

import React from "react";
import type { MediaCardProps as LibraryMediaCardProps } from "@laitram-l-l-c/intralox-ui-components";
import {
  MediaCard as LibraryMediaCard,
  mediaCardClasses,
} from "@laitram-l-l-c/intralox-ui-components";

export interface MediaCardProps extends Omit<LibraryMediaCardProps, "className"> {
  children: React.ReactNode;
  className?: string;
  mediaElement?: React.ReactNode;
}

export default function MediaCard({
  children,
  className,
  mediaElement,
  ...props
}: MediaCardProps) {
  return (
    <LibraryMediaCard
      {...props}
      mediaElement={mediaElement}
      className={mediaCardClasses({ className })}
    >
      {children}
    </LibraryMediaCard>
  );
}
