"use client";

import {
  Image as SitecoreImage,
  Text,
  type Field,
  type ImageField,
} from "@sitecore-content-sdk/nextjs";
import {
  faChevronDown,
  faEllipsisVertical,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import { useTranslations } from "next-intl";
import React, { useState, useRef, useEffect, useId } from "react";

import type { QuoteRequestCmsFields } from "@/components/core/OrderManagement/OrderManagementQuoteRequest.type";
import Button from "@/components/ui/Button";
import useClickOutside from "@/hooks/useClickOutside";
import type { OrderLineItem } from "@/lib/apis/orders-api";
import { I18N } from "@/lib/dictionary-keys";
import { cn } from "@/lib/utils";

import { OrderManagementHighlightedText } from "./OrderManagementHighlightedText";

type OrderManagementExpandedMatchingLineProps = {
  line: OrderLineItem;
  query: string;
  canRequestQuote: boolean;
  canRequestDocumentation: boolean;
  onRequestDocument?: (line: OrderLineItem) => void;
  orderHeaderId: string;
  quoteCms: QuoteRequestCmsFields;
  lineInQueue: boolean;
  queueItemCount: number;
  onRequestQuoteLine: () => void;
  requestQuoteButtonIcon?: ImageField;
  requestQuoteButtonLabel?: Field<string>;
  modifyQuoteButtonLabel?: Field<string>;
};

export function OrderManagementExpandedMatchingLine({
  line,
  query,
  canRequestQuote,
  canRequestDocumentation,
  onRequestDocument,
  orderHeaderId: _orderHeaderId,
  quoteCms,
  lineInQueue,
  queueItemCount,
  onRequestQuoteLine,
  requestQuoteButtonIcon,
  requestQuoteButtonLabel,
  modifyQuoteButtonLabel,
}: OrderManagementExpandedMatchingLineProps): React.ReactElement {
  const t = useTranslations();
  const [viewAll, setViewAll] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState<"top" | "bottom">("bottom");
  const [isOverflowing, setIsOverflowing] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  useClickOutside(menuRef, () => setMenuOpen(false), menuOpen);

  useEffect(() => {
    if (!menuOpen) return;

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
      const anchor = menuRef.current;
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
  }, [menuOpen]);

  const requestField = quoteCms.RequestQuoteForOrderLine ?? requestQuoteButtonLabel;
  const modifyField = modifyQuoteButtonLabel;

  useEffect(() => {
    const checkOverflow = () => {
      if (descriptionRef.current) {
        const scrollHeight = descriptionRef.current.scrollHeight;
        const clientHeight = descriptionRef.current.clientHeight;
        setIsOverflowing(scrollHeight > clientHeight);
      }
    };

    checkOverflow();
    const timer = setTimeout(checkOverflow, 0);
    const resizeObserver = new ResizeObserver(checkOverflow);
    if (descriptionRef.current) {
      resizeObserver.observe(descriptionRef.current);
    }

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
    };
  }, [line.description, query]);

  return (
    <div
      className={
        "flex w-full flex-nowrap gap-0 border-b border-[var(--color-bg-lighter-gray)] bg-[var(--color-bg-basic-color)] last:border-b-0 max-md:flex-wrap"
      }
    >
      <div className={"flex min-w-[200px] flex-1 flex-col gap-0 px-[12px] py-[12px]"}>
        <p
          className={
            "w-full overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-medium leading-[1.375] text-[var(--color-text-heading-color)]"
          }
        >
          <span className="font-semibold">Intralox Part #:</span>{" "}
          {query.trim() ? (
            <OrderManagementHighlightedText text={line.intraloxPartNumber || "—"} query={query} />
          ) : (
            line.intraloxPartNumber || "—"
          )}
        </p>
        <div className={"mt-0 flex w-full flex-wrap items-center gap-x-[10px] gap-y-[10px]"}>
          <p
            ref={descriptionRef}
            className={
              viewAll
                ? "max-w-[402px] min-w-0 flex-1 text-[12px] leading-[1.375] text-[var(--color-text-heading-color)]"
                : "max-w-[402px] min-w-0 flex-1 text-[12px] leading-[1.375] text-[var(--color-text-heading-color)] line-clamp-[var(--tw-line-clamp,1)] line-clamp-1"
            }
          >
            {query.trim() ? (
              <OrderManagementHighlightedText text={line.description} query={query} />
            ) : (
              line.description
            )}
          </p>
          {isOverflowing && (
            <button
              type="button"
              className={
                "inline-flex shrink-0 cursor-pointer items-center gap-[2px] border-0 bg-transparent p-0 text-[12px] font-medium text-[var(--color-menu-hover-color)] hover:underline focus:outline-none focus-visible:ring-2"
              }
              onClick={() => setViewAll((v) => !v)}
              aria-expanded={viewAll}
            >
              {t(I18N.FilterView)}
              <Icon
                icon={faChevronDown}
                width={12}
                className={cn("transition-transform", viewAll && "rotate-180")}
                aria-hidden
              />
            </button>
          )}
        </div>
      </div>
      <div className={"flex min-w-[80px] items-center justify-center px-[12px] py-[14px]"}>
        <span className={"text-[14px] leading-[1.375] text-[var(--color-text-heading-color)]"}>
          {line.quantity}
        </span>
      </div>
      <div className={"flex min-w-[200px] items-center justify-end gap-[10px] px-[12px] py-[12px]"}>
        {canRequestQuote ? (
          <Button
            type="button"
            variant="transparent"
            className={
              "inline-flex cursor-pointer items-center gap-[5px] rounded-[2px] border-0 bg-[var(--color-bg-basic-color)] px-[6px] py-[7px] text-[12px] font-medium text-[var(--color-text-heading-color)] no-underline shadow-[0px_0px_0px_0.766px_rgba(18,43,105,0.08)] hover:bg-[var(--color-bg-lighter-gray)] focus:outline-none focus-visible:ring-2"
            }
            onPress={onRequestQuoteLine}
            aria-label={String((lineInQueue ? modifyField?.value : requestField?.value) ?? "")}
          >
            {requestQuoteButtonIcon?.value?.src ? (
              <SitecoreImage
                field={requestQuoteButtonIcon}
                className={"h-[14px] w-[14px] shrink-0 object-contain"}
                width={14}
                height={14}
                sizes="14px"
                alt=""
                aria-hidden
              />
            ) : (
              <Icon icon={faRotateRight} width={14} aria-hidden />
            )}
            {lineInQueue && modifyField ? (
              <span className="inline-flex items-center gap-1">
                <Text field={modifyField} tag="span" />
                {queueItemCount > 0 ? (
                  <span
                    className={
                      "relative top-[-15px] right-[-10px] flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[var(--color-action-primary)] px-1 text-[9px] font-bold leading-none text-[var(--color-text-white)]"
                    }
                    aria-hidden
                  >
                    {queueItemCount > 99 ? "99+" : queueItemCount}
                  </span>
                ) : null}
              </span>
            ) : !lineInQueue && requestField ? (
              <Text field={requestField} tag="span" />
            ) : null}
          </Button>
        ) : null}
        {canRequestDocumentation ? (
          <div className={"relative inline-flex"} ref={menuRef}>
            <Button
              type="button"
              variant="transparent"
              btnVariant="iconBtn"
              className={
                "rounded-[2px] flex justify-center border border-[rgba(18,43,105,0.08)] !min-h-[30px] !min-w-[28px] text-[#000000]"
              }
              aria-label="More actions"
              aria-expanded={menuOpen}
              aria-haspopup="true"
              aria-controls={menuOpen ? menuId : undefined}
              onPress={() => setMenuOpen((open) => !open)}
            >
              <Icon icon={faEllipsisVertical} width={14} aria-hidden />
            </Button>
            {menuOpen ? (
              <div
                id={menuId}
                ref={menuPanelRef}
                className={`${"absolute right-0 z-20 min-w-[170px] rounded-[8px] border border-[var(--color-border-gray)] bg-[var(--color-bg-basic-color)] p-[6px] shadow-[0px_12px_24px_rgba(0,40,123,0.12)]"} ${menuPlacement === "top" ? "bottom-[calc(100%+4px)]" : "top-[calc(100%+4px)]"}`}
                role="menu"
              >
                <Button
                  type="button"
                  variant="transparent"
                  className={
                    "flex w-full cursor-pointer items-center justify-start rounded-[6px] border-0 bg-transparent px-[10px] py-[8px] text-[13px] leading-[1.2] text-[var(--color-text-heading-color)] hover:bg-[var(--color-bg-lighter-gray)] focus:outline-none focus-visible:ring-2"
                  }
                  role="menuitem"
                  onPress={() => {
                    setMenuOpen(false);
                    onRequestDocument?.(line);
                  }}
                >
                  <span>Request Document</span>
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
