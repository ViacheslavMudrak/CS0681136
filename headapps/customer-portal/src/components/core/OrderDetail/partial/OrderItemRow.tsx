"use client";

import { Image as SitecoreImage } from "@sitecore-content-sdk/nextjs";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import React, { useEffect, useId, useRef, useState } from "react";

import Button from "@/components/ui/Button";
import useClickOutside from "@/hooks/useClickOutside";
import { cn } from "@/lib/utils";
import type {
  IOrderDetailFields,
  OrderDetailActiveColumnItem,
  OrderDetailLineItem,
} from "../OrderDetail.type";
import { formatPartLabelLine, normalizeColumnValueKey, orderDetailColumnTextAlignClass } from "@/lib/orderDetailUtils";

import { renderOrderLineItemColumnValue } from "./orderLineItemColumnValue";

export interface OrderItemRowLineActionItem {
  key: string;
  label: string;
  onPress: () => void;
}

export interface OrderItemRowProps {
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

/**
 * Single order line item row: part lines, expandable description, optional CMS-driven columns, kebab actions.
 */
export function OrderItemRow({
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
}: OrderItemRowProps): React.ReactElement {
  const showLineItemActions = lineActionItems.length > 0;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const descriptionId = useId();
  useClickOutside(menuRef, () => setMenuOpen(false), menuOpen);

  const customerLine = formatPartLabelLine(fields.CustomerPartLabel, item.customerPartNumber);
  const intraloxLine = formatPartLabelLine(fields.IntraloxPartLabel, item.intraloxPartNumber);
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
    <tr
      className="border-b border-[var(--color-border-gray)] bg-[var(--color-bg-basic-color)] focus-within:outline-none"
      aria-expanded={showExpandControl ? isExpanded : undefined}
    >
      <td className="align-middle py-[14px] px-[16px] text-[12px] leading-[138%] font-[400] lg:min-w-[200px] max-w-[480px]">
        {customerLine ? (
          <div className="text-[12px] leading-[138%] font-[500]">{customerLine}</div>
        ) : null}
        {intraloxLine ? <div className="text-[12px] leading-[138%]">{intraloxLine}</div> : null}
        <div className={cn("mt-[6px] flex min-w-0", isExpanded ? "items-start" : "items-end")}>
          <div
            id={descriptionId}
            ref={descRef}
            className={cn(
              "flex-1 min-w-0 text-[12px] leading-[138%] text-[var(--color-text-basic)]",
              !isExpanded && "line-clamp-2 overflow-hidden"
            )}
          >
            {description}
          </div>

          {showExpandControl ? (
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "shrink-0 flex p-0 !px-[0] !min-w-[5px] text-[var(--color-menu-hover-color)] leading-none bg-transparent border-0",
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
      </td>
      {activeColumns.map((col) => {
        const keyNorm = normalizeColumnValueKey(col.fields?.Value?.value ?? col.displayName);
        return (
          <td
            key={col.id}
            className={cn(
              "align-middle py-[14px] px-[16px] text-[12px] leading-[138%] font-[400]",
              orderDetailColumnTextAlignClass(keyNorm)
            )}
          >
            {renderOrderLineItemColumnValue(keyNorm, item, locale)}
          </td>
        );
      })}
      {showLineItemActions ? (
        <td
          className="align-middle py-[14px] px-[16px] text-[12px] leading-[138%] font-[400] w-12 text-right"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <div
            className="relative inline-flex border border-[var(--color-border-gray)] rounded-[2px]"
            ref={menuRef}
          >
            <Button
              type="button"
              variant="ghost"
              btnVariant="iconBtn"
              aria-label="Line item actions"
              aria-expanded={menuOpen}
              aria-haspopup="true"
              aria-controls={menuOpen ? menuId : undefined}
              onPress={() => setMenuOpen((o) => !o)}
            >
              {fields.InvoiceKebabMenuIcon ? (
                <SitecoreImage
                  field={fields.InvoiceKebabMenuIcon}
                  width={14}
                  height={14}
                  sizes="14px"
                  className="block shrink-0 object-contain w-[14px] h-[14px]"
                  alt=""
                />
              ) : null}
            </Button>
            {menuOpen ? (
              <div
                className="absolute right-0 top-[100%] z-30 mt-[4px] w-max max-w-[180px] rounded-[8px] border border-[var(--color-border-gray)] bg-[var(--color-bg-basic-color)] py-[6px] shadow-[var(--color-shadow-card)]"
                role="menu"
              >
                {lineActionItems.map((action) => (
                  <Button
                    key={action.key}
                    type="button"
                    variant="transparent"
                    className="w-full justify-start text-left whitespace-nowrap px-[12px] py-[8px] text-[13px] text-[var(--color-text-heading-color)] bg-transparent border-0 cursor-pointer hover:bg-[var(--color-bg-lighter-gray)]"
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
        </td>
      ) : null}
    </tr>
  );
}
