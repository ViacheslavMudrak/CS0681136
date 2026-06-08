"use client";

import { queueScrollExtentSync } from "@/hooks/use-scroll-extent-sync";

export function queueIOSScrollHeightSync(container?: HTMLElement | null): void {
  queueScrollExtentSync(container);
}
