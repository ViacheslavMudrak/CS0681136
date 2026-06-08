"use client";

import { alertBoxClasses, cva } from "@laitram-l-l-c/intralox-ui-components";

const layoutAlertStripOverrideClasses = cva({
  base: [
    "box-border !m-0 w-full max-w-none !rounded-none !border-0 !bg-accent-warning !p-0 !text-center",
    "max-md:grid max-md:min-h-[46.6667px] max-md:h-auto max-md:place-items-center",
    "md:flex md:h-[34.1667px] md:min-h-[34.1667px] md:items-center md:justify-center",
    "[&>div:first-child]:hidden [&>div:last-child]:w-full [&>div:last-child]:!pl-0 [&>div:last-child>div]:!text-sm",
  ],
});

/**
 * Design-system warning AlertBox classes plus layout-strip Tailwind overrides.
 */
export function layoutAlertStripClasses(className?: string): string {
  return alertBoxClasses({
    variant: "warning",
    className: layoutAlertStripOverrideClasses({ className }),
  });
}
