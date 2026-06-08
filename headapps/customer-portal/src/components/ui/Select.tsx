"use client";

import { cn } from "@/lib/utils";
import type {
  SelectButtonProps as DXPSelectButtonProps,
  SelectProps as DXPSelectProps,
} from "@laitram-l-l-c/intralox-ui-components";
import {
  Select as DXPSelect,
  SelectButton as DXPSelectButton,
  ListBox,
  ListBoxItem,
} from "@laitram-l-l-c/intralox-ui-components";
import React from "react";

interface SelectProps<T extends object> extends Omit<DXPSelectProps<T>, "className"> {
  children: React.ReactNode | ((item: T) => React.ReactNode);
  className?:
    | string
    | ((props: { isOpen?: boolean; isFocused?: boolean; isDisabled?: boolean }) => string);
  label?: string;
  state?: "base" | "error" | "warning";
  isRequired?: boolean;
  isDisabled?: boolean;
}

export function Select<T extends object>({ children, className, ...props }: SelectProps<T>) {
  return (
    <DXPSelect className={typeof className === "function" ? className : cn(className)} {...props}>
      {children}
    </DXPSelect>
  );
}

interface SelectButtonProps extends Omit<DXPSelectButtonProps, "className"> {
  children: React.ReactNode;
  state?: "base" | "error" | "warning";
  isDisabled?: boolean;
  className?:
    | string
    | ((props: {
        isPressed?: boolean;
        isHovered?: boolean;
        isFocused?: boolean;
        isFocusVisible?: boolean;
        isDisabled?: boolean;
      }) => string);
}

export function SelectButton({
  children,
  state,
  isDisabled,
  className,
  ...props
}: SelectButtonProps) {
  return (
    <DXPSelectButton
      state={state}
      isDisabled={isDisabled}
      className={typeof className === "function" ? className : cn(className)}
      {...props}
    >
      {children}
    </DXPSelectButton>
  );
}

export { ListBox, ListBoxItem };
