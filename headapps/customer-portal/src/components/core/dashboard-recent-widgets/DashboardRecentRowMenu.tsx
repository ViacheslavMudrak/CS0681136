"use client";

import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import React, { useEffect, useId, useRef, useState } from "react";

import type { QuoteSelectionFieldSource } from "@/components/core/OrderManagement/OrderManagement.type";
import Button from "@/components/ui/Button";
import useClickOutside from "@/hooks/useClickOutside";
import { PERMISSION_CODES } from "@/lib/permission-codes";
import { usePermissionContext } from "@/lib/permission-context";
import {
  getQuoteRequestCmsFields,
  isDocumentRequestSelectionItem,
  listQuoteSelectionItems,
} from "@/lib/quote-request/quote-request-utils";
function resolveDocumentMenuLabel(source: QuoteSelectionFieldSource | undefined): string {
  const item = listQuoteSelectionItems(source ?? {}).find(isDocumentRequestSelectionItem);
  const rawFields = item?.fields as { PanelTitle?: { value?: string } } | undefined;
  const title = rawFields?.PanelTitle?.value;
  if (title && String(title).trim()) return String(title).trim();
  return item?.displayName?.trim() || item?.name?.trim() || "Request Document";
}

function resolveQuoteMenuLabel(
  source: QuoteSelectionFieldSource | undefined,
  isModifyMode = false
): string {
  const f = getQuoteRequestCmsFields(source ?? {});
  if (isModifyMode) {
    const modify = f.ModifyQuoteForOrderLine?.value;
    if (modify && String(modify).trim()) return String(modify).trim();
    return "Modify Quote";
  }
  const t = f.DrawerTitle?.value;
  if (t && String(t).trim()) return String(t).trim();
  return "Request Quote";
}

export type DashboardRecentRowMenuVariant = "order" | "quote";

export interface DashboardRecentRowMenuProps {
  variant: DashboardRecentRowMenuVariant;
  quoteSelection?: QuoteSelectionFieldSource;
  isEditing?: boolean;
  /** For `quote` variant: Request Quote entry only when the quote is expired. */
  quoteExpired?: boolean;
  hasActionableOrderLines?: boolean;
  /** When true, menu shows modify-quote label (order/quote already in RFQ draft). */
  quoteRequestIsModifyMode?: boolean;
  onRequestDocument?: () => void;
  onRequestQuote?: () => void;
}

/**
 * Three-dot overflow for recent order / quote rows (document request + quote request when wired).
 */
export function DashboardRecentRowMenu({
  variant,
  quoteSelection,
  isEditing = false,
  quoteExpired,
  hasActionableOrderLines = true,
  quoteRequestIsModifyMode = false,
  onRequestDocument,
  onRequestQuote,
}: DashboardRecentRowMenuProps): React.ReactElement | null {
  const { can } = usePermissionContext();
  const canDoc = isEditing || can(PERMISSION_CODES.REQUEST_DOCUMENTATION);
  const canRfq = isEditing || can(PERMISSION_CODES.INITIATE_RFQ);
  const showDoc = canDoc && hasActionableOrderLines && Boolean(onRequestDocument);
  const showQuoteOption =
    variant === "order"
      ? canRfq && hasActionableOrderLines && Boolean(onRequestQuote)
      : canRfq && Boolean(quoteExpired) && Boolean(onRequestQuote);
  const itemCount = (showDoc ? 1 : 0) + (showQuoteOption ? 1 : 0);
  if (itemCount === 0) {
    return null;
  }

  const [open, setOpen] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState<"top" | "bottom">("bottom");
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  useClickOutside(wrapRef, () => setOpen(false), open);

  useEffect(() => {
    if (!open) return;

    const findOverflowContainer = (start: HTMLElement | null): HTMLElement | null => {
      let current = start?.parentElement ?? null;
      while (current) {
        const style = window.getComputedStyle(current);
        const overflowY = style.overflowY;
        const overflowX = style.overflowX;
        const clipsY =
          overflowY === "hidden" ||
          overflowY === "auto" ||
          overflowY === "scroll" ||
          overflowY === "clip";
        const clipsX =
          overflowX === "hidden" ||
          overflowX === "auto" ||
          overflowX === "scroll" ||
          overflowX === "clip";
        if (clipsY || clipsX) return current;
        current = current.parentElement;
      }
      return null;
    };

    const updatePlacement = () => {
      const anchor = wrapRef.current;
      const panel = menuPanelRef.current;
      if (!anchor || !panel) return;

      const anchorRect = anchor.getBoundingClientRect();
      const container = findOverflowContainer(anchor);
      const containerRect = container
        ? container.getBoundingClientRect()
        : { top: 0, bottom: window.innerHeight };

      const spaceBelow = containerRect.bottom - anchorRect.bottom;
      const spaceAbove = anchorRect.top - containerRect.top;
      const panelHeight = panel.offsetHeight;

      if (spaceBelow >= panelHeight || spaceBelow >= spaceAbove) {
        setMenuPlacement("bottom");
      } else {
        setMenuPlacement("top");
      }
    };

    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    window.addEventListener("scroll", updatePlacement, true);
    return () => {
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement, true);
    };
  }, [open]);

  const docLabel = resolveDocumentMenuLabel(quoteSelection);
  const quoteLabel = resolveQuoteMenuLabel(quoteSelection, quoteRequestIsModifyMode);

  return (
    <div className="relative shrink-0" ref={wrapRef}>
      <Button
        type="button"
        variant="ghost"
        className="!min-h-0 !min-w-0 h-[24.5px] w-[26px] rounded-[2px] border border-[#E8EAEB] !p-[5.25px_6px]"
        aria-label="Row actions"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={open ? menuId : undefined}
        onPress={() => setOpen((v) => !v)}
        onClick={(e) => e.stopPropagation()}
      >
        <Icon
          icon={faEllipsisVertical}
          className="text-[10.5px] text-[var(--color-text-heading-color)]"
          aria-hidden
        />
      </Button>
      {open ? (
        <div
          id={menuId}
          ref={menuPanelRef}
          className={`absolute right-0 z-20 min-w-[180px] rounded-md border border-[var(--color-border-default)] bg-white py-1 shadow-md ${menuPlacement === "top" ? "bottom-[calc(100%+4px)]" : "top-[calc(100%+4px)]"}`}
          role="menu"
        >
          {showDoc ? (
            <Button
              type="button"
              variant="ghost"
              role="menuitem"
              className="block w-full cursor-pointer px-3 py-2 text-left text-[14px] text-[var(--color-text-heading-color)] hover:bg-[var(--color-gray-100,#f8f8f8)]"
              onPress={() => {
                setOpen(false);
                onRequestDocument?.();
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {docLabel}
            </Button>
          ) : null}
          {showQuoteOption ? (
            <Button
              type="button"
              variant="ghost"
              role="menuitem"
              className="block w-full cursor-pointer px-3 py-2 text-left text-[14px] text-[var(--color-text-heading-color)] hover:bg-[var(--color-gray-100,#f8f8f8)]"
              onPress={() => {
                setOpen(false);
                onRequestQuote?.();
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {quoteLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
