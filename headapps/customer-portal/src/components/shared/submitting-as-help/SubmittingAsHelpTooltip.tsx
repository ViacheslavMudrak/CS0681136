"use client";

import { RichText, RichTextField } from "@sitecore-content-sdk/nextjs";
import React, { useCallback, useEffect, useId, useRef, useState } from "react";

import Button from "@/components/ui/Button";
import useClickOutside from "@/hooks/useClickOutside";

export interface SubmittingAsHelpTooltipProps {
  ariaLabel: string;
  trigger: React.ReactNode;
  tooltipField: RichTextField;
}

/**
 * Click-to-open help panel for "Submitting as". Rendered in-place (not portaled) so it works
 * inside drawer/modal shells where React Aria popovers are hidden by the parent dialog.
 */
export function SubmittingAsHelpTooltip({
  ariaLabel,
  trigger,
  tooltipField,
}: SubmittingAsHelpTooltipProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();

  useClickOutside(rootRef, () => setOpen(false), open);

  const toggleOpen = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="relative inline-flex align-middle" ref={rootRef}>
      <Button
        type="button"
        variant="transparent"
        className="inline-flex h-[11px] w-[12px] shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent !p-0 !min-w-0 text-[var(--color-text-secondary)] focus-visible:rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-basic-color)]"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        onPress={toggleOpen}
      >
        {trigger}
      </Button>
      {open ? (
        <div
          id={popoverId}
          role="dialog"
          aria-label={ariaLabel}
          className="absolute bottom-[calc(100%+8px)] left-0 z-30 w-max min-w-[320px] max-w-[min(400px,calc(100vw-2rem))] rounded-[8px] border border-[#dfe1e2] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
        >
          <span
            className="absolute bottom-[-6px] left-[4px] box-border h-[10px] w-[10px] rotate-45 border-r border-b border-[#dfe1e2] bg-white"
            aria-hidden
          />
          <div className="rounded-[8px] px-[14px] py-[12px]">
            <RichText
              field={tooltipField}
              className="text-[12px] leading-[1.45] text-[#222] [&_p]:m-0 [&_p+p]:mt-[0.35rem]"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
