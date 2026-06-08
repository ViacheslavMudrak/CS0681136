"use client";

import { cn } from "@/lib/utils";
import type { InputProps as LibraryInputProps } from "@laitram-l-l-c/intralox-ui-components";
import { Input as DXPInput } from "@laitram-l-l-c/intralox-ui-components";
import React from "react";

interface InputProps extends Omit<LibraryInputProps, "className"> {
  state?: "base" | "error" | "warning";
  className?:
    | string
    | ((props: { isFocused?: boolean; isInvalid?: boolean; isDisabled?: boolean }) => string);
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({ state = "base", className, ...props }: InputProps) {
  const stateBorder = cn(
    state === "base" && "border-[var(--color-border-gray)]",
    state === "error" && "!border-[var(--color-text-red)]",
    state === "warning" && "border-[var(--color-menu-active-color)]"
  );

  if (typeof className === "function") {
    return <DXPInput state={state} className={className} {...props} />;
  }

  return <DXPInput state={state} className={cn("border", className, stateBorder)} {...props} />;
}
