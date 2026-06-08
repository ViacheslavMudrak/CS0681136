"use client";

import { cva } from "@laitram-l-l-c/intralox-ui-components";

export const buttonClasses = cva({
  base: ["cursor-pointer"],
  variants: {
    variant: {
      primary: [],
      inverse: [],
      muted: [],
      ghost: [
        "border-transparent bg-transparent shadow-none",
        "hover:bg-bg-lighter-gray active:bg-bg-light-gray-active",
        "disabled:text-text-basic-active",
      ],
      destroyPrimary: [],
      destroySecondary: [],
      transparent: [
        "border-transparent bg-transparent shadow-none",
        "hover:bg-transparent active:bg-transparent",
        "focus:outline-hidden focus-visible:ring",
        "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
      ],
    },
    size: {
      default: ["px-[20px] py-[12px]", "text-[13px] font-[400] leading-[1.25]"],
      icon: ["min-w-0 shrink-0 px-0 py-0 h-8 w-8 [&>svg]:m-auto"],
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "default",
  },
});

export type PortalButtonVariant = NonNullable<
  Parameters<typeof buttonClasses>[0]
>["variant"];
export type PortalButtonSize = NonNullable<Parameters<typeof buttonClasses>[0]>["size"];
