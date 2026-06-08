"use client";
import { Heading as DXPHeading } from "@laitram-l-l-c/intralox-ui-components";
import React from "react";

interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5;
  children: React.ReactNode;
  className?: string;
}

export default function Heading({ level, children, className }: HeadingProps) {
  return (
    <DXPHeading level={level} className={className}>
      {children}
    </DXPHeading>
  );
}
