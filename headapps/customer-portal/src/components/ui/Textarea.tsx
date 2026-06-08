"use client";

import { cn } from "@/lib/utils";
import type { TextAreaProps as DXPTextAreaProps } from "@laitram-l-l-c/intralox-ui-components";
import { TextArea as DXPTextArea } from "@laitram-l-l-c/intralox-ui-components";
import React from "react";

export interface TextareaProps extends Omit<DXPTextAreaProps, "className" | "state"> {
  state?: "base" | "error" | "warning";
  className?:
    | string
    | ((props: { isFocused?: boolean; isInvalid?: boolean; isDisabled?: boolean }) => string);
}

export default function Textarea({ state = "base", className, ...props }: TextareaProps) {
  const stateBorder = cn(
    state === "base" && "border-[var(--color-border-gray)]",
    state === "error" && "!border-[var(--color-text-red)]",
    state === "warning" && "border-[var(--color-menu-active-color)]"
  );

  const libraryState: DXPTextAreaProps["state"] = state === "base" ? undefined : state;

  if (typeof className === "function") {
    return <DXPTextArea state={libraryState} className={className} {...props} />;
  }

  return (
    <DXPTextArea
      state={libraryState}
      className={cn("min-h-[96px] w-full resize-y border", className, stateBorder)}
      {...props}
    />
  );
}
