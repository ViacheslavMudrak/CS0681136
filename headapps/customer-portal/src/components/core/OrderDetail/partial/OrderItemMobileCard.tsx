"use client";

import { Image as SitecoreImage, Text } from "@sitecore-content-sdk/nextjs";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import React, { useEffect, useId, useRef, useState } from "react";

import Button from "@/components/ui/Button";
import useClickOutside from "@/hooks/useClickOutside";
import { formatPartLabelLine, normalizeColumnValueKey } from "@/lib/orderDetailUtils";

import type {
  IOrderDetailFields,
  OrderDetailActiveColumnItem,
  OrderDetailLineItem,
} from "../OrderDetail.type";
import { renderOrderLineItemColumnValue } from "./orderLineItemColumnValue";
import type { OrderItemRowLineActionItem } from "./OrderItemRow";

import { cn } from "@/lib/utils";

export interface OrderItemMobileCardProps {
  fields: IOrderDetailFields;
  item: OrderDetailLineItem;
  rowKey: string;
  isExpanded: boolean;
  onExpandInteraction: (source: "chevron" | "row") => void;
  orderNumber: string;
  activeColumns: OrderDetailActiveColumnItem[];
  locale: string;
  canRequestDocumentation: boolean;
  canInitiateRfq: boolean;
  lineActionItems: OrderItemRowLineActionItem[];
  onDescriptionExpandableChange?: (canExpand: boolean) => void;
  /** Bumped when the parent resets overflow registration so ResizeObserver re-measures. */
  descriptionOverflowMeasureKey?: number;
}

function renderColumnHeaderLabel(col: OrderDetailActiveColumnItem): React.ReactNode {
  if (col.fields?.Value) return <Text field={col.fields.Value} tag="span" />;
  if (col.fields?.ColumnHeader) return <Text field={col.fields.ColumnHeader} tag="span" />;
  return col.displayName ?? "";
}

/**
 * Mobile card layout for a single order line item: part summary (customer medium + intralox regular, single-line ellipsis),
 * expandable description with chevron, CMS columns, kebab actions. Visual spec: Figma OrderItems mobile card (3390:93405).
 */
export function OrderItemMobileCard({
  fields,
  item,
  isExpanded,
  onExpandInteraction,
  orderNumber: _orderNumber,
  activeColumns,
  locale,
  canRequestDocumentation: _canRequestDocumentation,
  canInitiateRfq: _canInitiateRfq,
  lineActionItems,
  onDescriptionExpandableChange,
  descriptionOverflowMeasureKey = 0,
}: OrderItemMobileCardProps): React.ReactElement {
  const showLineItemActions = lineActionItems.length > 0;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const descriptionId = useId();
  useClickOutside(menuRef, () => setMenuOpen(false), menuOpen);

  const customerLine = formatPartLabelLine(fields.CustomerPartLabel, item.customerPartNumber);
  const intraloxLine = formatPartLabelLine(fields.IntraloxPartLabel, item.intraloxPartNumber);
  const hasPartLine = Boolean(customerLine || intraloxLine);
  const description = item.partDescription?.value ?? "";

  const descRef = useRef<HTMLDivElement>(null);
  const onExpandableChangeRef = useRef(onDescriptionExpandableChange);
  onExpandableChangeRef.current = onDescriptionExpandableChange;
  const [showExpandControl, setShowExpandControl] = useState(false);

  useEffect(() => {
    setShowExpandControl(false);
  }, [description]);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;

    const measure = () => {
      const overflowing = el.scrollHeight > el.clientHeight;
      if (overflowing) {
        setShowExpandControl(true);
        onExpandableChangeRef.current?.(true);
      } else if (!isExpanded) {
        setShowExpandControl(false);
      }
    };

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    measure();
    return () => observer.disconnect();
  }, [description, isExpanded, descriptionOverflowMeasureKey]);

  return (
    <article
      className={cn(
        "box-border flex flex-col items-end gap-[7px] w-full min-w-0 p-[15px] rounded-[8px] bg-[var(--color-bg-basic-color)] border border-solid border-[color:var(--color-role-permissions-shell-border)] [font-family:var(--font-helvetica-neue-lt-web)]",
        menuOpen && "relative z-50"
      )}
      aria-expanded={showExpandControl ? isExpanded : undefined}
      aria-controls={descriptionId}
    >
      <div className="relative flex flex-col gap-[7px] w-full min-w-0 max-w-full items-stretch self-stretch">
        <div className="box-border flex flex-col items-start gap-1 w-full min-w-0 pb-[8px] border-b border-solid border-[color:var(--color-border-default)]">
          {fields.ColumnHeader ? (
            <p className="m-0 w-full text-left text-[10px] font-[700] leading-[15px] uppercase tracking-[0.5px] text-[color:var(--color-text-placeholder)]">
              <Text field={fields.ColumnHeader} tag="span" />
            </p>
          ) : null}

          <div className="flex flex-col gap-[2px] w-full min-w-0 items-stretch">
            {hasPartLine ? (
              <div className="w-full min-w-0 text-left text-[12px] leading-[1.38] overflow-hidden text-ellipsis whitespace-nowrap text-[color:var(--color-text-black)]">
                {customerLine ? <span className="font-[500]">{customerLine}</span> : null}
                {customerLine && intraloxLine ? <span className="font-normal"> | </span> : null}
                {intraloxLine ? (
                  <span className="font-normal text-[color:var(--color-text-black)]">
                    {intraloxLine}
                  </span>
                ) : null}
              </div>
            ) : null}

            <div className={cn("flex min-w-0 gap-[7px]", isExpanded ? "items-start" : "items-end")}>
              <div
                id={descriptionId}
                ref={descRef}
                className={cn(
                  "flex-1 min-w-0 text-[12px] font-[400] leading-[1.38] text-[var(--color-text-secondary)]",
                  !isExpanded && "line-clamp-3 overflow-hidden"
                )}
              >
                {description}
              </div>

              {showExpandControl ? (
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(
                    "shrink-0 flex p-0 !px-[0] !min-w-[5px] leading-[1.375] bg-transparent border-0 cursor-pointer text-[color:var(--color-link-text)]",
                    isExpanded ? "self-start" : "!py-[3px]"
                  )}
                  aria-label={isExpanded ? "Collapse description" : "Expand description"}
                  aria-expanded={isExpanded}
                  aria-controls={descriptionId}
                  onPress={() => onExpandInteraction("chevron")}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <Icon
                    icon={isExpanded ? faChevronUp : faChevronDown}
                    width={12}
                    height={12}
                    aria-hidden
                  />
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        {activeColumns.length > 0 ? (
          <div className="flex flex-col w-full min-w-0 gap-[7px] md:gap-0">
            {activeColumns.map((col) => {
              const keyNorm = normalizeColumnValueKey(col.fields?.Value?.value ?? col.displayName);
              return (
                <div
                  key={col.id}
                  className="box-border flex flex-row justify-between items-center gap-[7px] w-full min-w-0 pb-[7px] border-b border-solid border-[color:var(--color-border-default)]"
                >
                  <span className="flex-1 min-w-0 text-left text-[10px] font-[700] leading-[11px] uppercase tracking-[0.5px] text-[color:var(--color-text-placeholder)]">
                    {renderColumnHeaderLabel(col)}
                  </span>
                  <span className="shrink-0 text-right text-[14px] font-[400] leading-[1.38] whitespace-nowrap text-[color:var(--color-text-black)]">
                    {renderOrderLineItemColumnValue(keyNorm, item, locale)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}

        {showLineItemActions ? (
          <div
            className="flex flex-row justify-end items-start gap-[10.5px] w-full min-w-0 pt-0"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="relative inline-flex flex-row items-start" ref={menuRef}>
              <Button
                type="button"
                variant="ghost"
                className="box-border flex flex-row justify-center items-center gap-[5.25px] !min-w-[26px] !w-auto !h-[24.5px] !min-h-[24.5px] !rounded-[2px] !p-[5.25px] !px-[6px] !py-[5.25px] !bg-[var(--color-bg-basic-color)] shadow-[0px_0px_0px_0.875px_rgba(18,43,105,0.08)] border-0 hover:!bg-[var(--color-bg-light-gray)] active:!bg-[var(--color-bg-light-gray-active)]"
                aria-label="Line item actions"
                aria-expanded={menuOpen}
                aria-haspopup="true"
                aria-controls={menuOpen ? menuId : undefined}
                onPress={() => setMenuOpen((o) => !o)}
              >
                {fields.InvoiceKebabMenuIcon ? (
                  <SitecoreImage
                    field={fields.InvoiceKebabMenuIcon}
                    width={11}
                    height={11}
                    sizes="10.5px"
                    className="block shrink-0 object-contain w-[10.5px] h-[10.5px]"
                    alt=""
                  />
                ) : null}
              </Button>
              {menuOpen ? (
                <div
                  className="absolute right-0 top-[100%] z-[60] mt-1 w-max max-w-[180px] rounded-lg border border-[color:var(--color-border-default)] bg-[var(--color-bg-basic-color)] py-1.5 shadow-md"
                  role="menu"
                >
                  {lineActionItems.map((action) => (
                    <Button
                      key={action.key}
                      type="button"
                      variant="transparent"
                      className="w-full justify-start text-left whitespace-nowrap px-3 py-2 text-[13px] bg-transparent border-0 cursor-pointer hover:bg-[var(--color-bg-light-gray)] text-[color:var(--color-text-heading-color)]"
                      role="menuitem"
                      onPress={() => {
                        setMenuOpen(false);
                        action.onPress();
                      }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
