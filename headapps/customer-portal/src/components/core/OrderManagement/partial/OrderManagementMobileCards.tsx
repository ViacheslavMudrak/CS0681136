"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import React, { useMemo, useRef } from "react";
import { Image as SitecoreImage, Text as SitecoreText } from "@sitecore-content-sdk/nextjs";
import ChevronRightIcon from "src/components/shared/icons/ChevronRightIcon";

import { I18N } from "@/lib/dictionary-keys";
import {
  type OrderDetailHeaderStatusVariant,
  resolveOrderDetailHeaderStatusVariant,
} from "@/lib/orderDetailUtils";
import {
  formatCurrencyAmount,
  formatOrderDateDisplay,
  getOrderRowKey,
  getOrderManagementGridColumnLabel,
  resolveOrderManagementMobileCardFieldKey,
  type OrderManagementMobileCardFieldKey,
  type OrderRecord,
} from "@/lib/orderManagementUtils";
import LoadingSkeleton from "@/components/shared/loading-skeleton/LoadingSkeleton";
import { OrderManagementEmptyState } from "./OrderManagementEmptyState";
import { OrderManagementHighlightedText } from "./OrderManagementHighlightedText";
import { OrderManagementMobileCountRow } from "./OrderManagementTableShared";
import type { OrderManagementShell } from "@/hooks/useOrderManagementShell";
import { useActiveLocale } from "@/hooks/use-active-locale";
import { stashOrderDetailEntryPoint } from "@/lib/order-detail-entry-point";
import { localizeHref } from "@/lib/locale-path";

const MOBILE_ORDER_STATUS_BADGE_CLASS: Record<OrderDetailHeaderStatusVariant, string> = {
  placed:
    "border-[var(--color-border-gray)] bg-[var(--color-bg-submenu)] text-[var(--color-text-heading-color)]",
  shipped:
    "border-[var(--color-cyan-dark)] bg-[var(--color-cyan-light)] text-[var(--color-cyan-dark)]",
  cancelled:
    "border-[var(--color-red-dark)] bg-[var(--color-red-light)] text-[var(--color-red-dark)]",
  default:
    "border-[var(--color-border-gray)] bg-[var(--color-bg-submenu)] text-[var(--color-text-heading-color)]",
};

interface MobileOrderCardField {
  key: OrderManagementMobileCardFieldKey;
  label: string;
}

export function OrderManagementMobileCards({
  orderManagement,
}: {
  orderManagement: OrderManagementShell;
}): React.ReactElement {
  const t = useTranslations();
  const {
    pageSlice,
    appliedSearch,
    orderDetailHref,
    statusDisplay,
    locale,
    isOrdersListLoading,
    gridColumns,
  } = orderManagement;

  const cardsRootRef = useRef<HTMLDivElement>(null);

  const activeLocale = useActiveLocale();

  const mobileCardFields = useMemo(() => {
    const seen = new Set<OrderManagementMobileCardFieldKey>();
    const out: MobileOrderCardField[] = [];
    for (const col of gridColumns) {
      const key = resolveOrderManagementMobileCardFieldKey(col);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push({ key, label: getOrderManagementGridColumnLabel(col) });
    }
    return out;
  }, [gridColumns]);

  const orderField = mobileCardFields.find((f) => f.key === "order");
  const statusField = mobileCardFields.find((f) => f.key === "status");
  const detailFields = mobileCardFields.filter((f) => f.key !== "order" && f.key !== "status");
  const q = appliedSearch.trim();

  if (!isOrdersListLoading && pageSlice.length === 0) {
    return (
      <div
        ref={cardsRootRef}
        className="relative overflow-x-clip overscroll-x-none pt-[15px] pr-[15px] pb-[21px] pl-[15px] gap-[15px] lg:hidden [overflow-anchor:none]"
      >
        <div className="flex flex-col gap-[12px] lg:hidden" role="status">
          <OrderManagementEmptyState orderManagement={orderManagement} />
        </div>
      </div>
    );
  }

  if (isOrdersListLoading && pageSlice.length === 0) {
    return (
      <div
        ref={cardsRootRef}
        className="relative overflow-x-clip overscroll-x-none pt-[15px] pr-[15px] pb-[21px] pl-[15px] gap-[15px] lg:hidden [overflow-anchor:none]"
      >
        <div
          className="flex flex-col gap-[12px] lg:hidden"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <span className="sr-only">Loading</span>
          <div className="flex w-full max-w-lg flex-col items-center justify-center gap-5 py-16 px-4 mx-auto">
            <LoadingSkeleton variant="skeleton" size="medium" className="!p-0 w-full" />
            <LoadingSkeleton variant="skeleton" size="medium" className="!p-0 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardsRootRef}
      className="relative overflow-x-clip overscroll-x-none pt-[15px] pr-[15px] pb-[21px] pl-[15px] gap-[15px] md:hidden [overflow-anchor:none]"
    >
      {pageSlice.length > 0 ? <OrderManagementMobileCountRow count={pageSlice.length} /> : null}

      <div className="flex flex-col gap-[12px] lg:hidden" role="list">
        {pageSlice.map((order: OrderRecord, index: number) => {
          const sd = statusDisplay(order.statusKey);
          const statusVariant = resolveOrderDetailHeaderStatusVariant(order.statusKey);
          const detailHref = localizeHref(orderDetailHref(order), activeLocale);
          return (
            <article
              key={getOrderRowKey(order, index)}
              className="flex flex-col gap-[7px] overflow-hidden rounded-[8px] border border-[var(--color-border-gray)] bg-[var(--color-bg-basic-color)] p-[15px]"
              role="listitem"
            >
              {orderField || statusField ? (
                <header className="w-full shrink-0 border-b border-[var(--color-border-gray)] pb-[8px]">
                  <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-0">
                    {orderField ? (
                      <p className="w-full text-[11px] font-bold uppercase leading-[1.375] text-[var(--color-text-heading-color)]">
                        {orderField.label}
                      </p>
                    ) : null}
                    <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-[7px]">
                      {orderField ? (
                        <Link
                          href={detailHref}
                          className="min-h-0 min-w-0 flex-1 break-words text-[20px] font-bold leading-normal text-[var(--color-menu-hover-color)] underline-offset-2 hover:underline [overflow-wrap:anywhere] line-clamp-2 overflow-hidden"
                          onClick={() => stashOrderDetailEntryPoint("Orders_Listing")}
                        >
                          {q ? (
                            <OrderManagementHighlightedText text={order.orderNumber} query={q} />
                          ) : (
                            order.orderNumber
                          )}
                        </Link>
                      ) : null}
                      {statusField ? (
                        <span
                          className={`${"inline-flex max-w-full min-w-0 shrink-0 items-center justify-self-end gap-[6px] overflow-hidden rounded-[4px] border py-[4px] px-[10px] text-[12px] font-medium"} ${MOBILE_ORDER_STATUS_BADGE_CLASS[statusVariant]}`}
                        >
                          {sd.iconField?.value?.src ? (
                            <SitecoreImage
                              field={sd.iconField}
                              className={"shrink-0 object-contain"}
                              width={16}
                              height={16}
                              sizes="16px"
                            />
                          ) : null}
                          {sd.labelField ? (
                            <SitecoreText field={sd.labelField} tag="span" />
                          ) : (
                            sd.label
                          )}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </header>
              ) : null}

              {detailFields.map((field) => (
                <div
                  className="flex w-full items-start justify-between gap-[12px] border-b border-[var(--color-border-gray)] pb-[8px]"
                  key={field.key}
                >
                  <span className="min-w-0 basis-[42%] break-words text-[11px] font-bold uppercase leading-[1.375] text-[var(--color-text-heading-color)] [overflow-wrap:anywhere] line-clamp-2 overflow-hidden">
                    {field.label}
                  </span>
                  {field.key === "po" ? (
                    <Link
                      href={detailHref}
                      className="min-w-0 flex-1 break-words text-right text-[14px] font-medium leading-tight text-[var(--color-menu-hover-color)] underline-offset-2 hover:underline [overflow-wrap:anywhere] line-clamp-2 overflow-hidden"
                      onClick={() => stashOrderDetailEntryPoint("Orders_Listing")}
                    >
                      {q ? (
                        <OrderManagementHighlightedText text={order.poNumber} query={q} />
                      ) : (
                        order.poNumber
                      )}
                    </Link>
                  ) : field.key === "items" ? (
                    <span className="min-w-0 flex-1 break-words text-right text-[14px] font-normal leading-[1.375] text-[var(--color-text-heading-color)] [overflow-wrap:anywhere] line-clamp-2 overflow-hidden">
                      {order.itemCount}
                    </span>
                  ) : field.key === "orderDate" ? (
                    <span className="min-w-0 flex-1 break-words text-right text-[14px] font-normal leading-[1.375] text-[var(--color-text-heading-color)] [overflow-wrap:anywhere] line-clamp-2 overflow-hidden">
                      {formatOrderDateDisplay(order.orderDate, locale)}
                    </span>
                  ) : field.key === "total" ? (
                    <span className="min-w-0 flex-1 break-words text-right text-[14px] font-normal leading-[1.375] text-[var(--color-text-heading-color)] [overflow-wrap:anywhere] line-clamp-2 overflow-hidden">
                      {formatCurrencyAmount(order.totalAmount, order.currency, locale)}
                    </span>
                  ) : null}
                </div>
              ))}

              <div className="flex h-[25px] shrink-0 items-start justify-end self-stretch pt-0">
                <Link
                  href={detailHref}
                  className="inline-flex items-center gap-[5px] rounded-[2px] bg-[var(--color-bg-basic-color)] px-[6px] py-[4px] text-[12px] font-medium leading-[1.375] text-[var(--color-menu-hover-color)] shadow-[0px_0px_0px_0.875px_rgba(18,43,105,0.08)] underline-offset-2 hover:underline"
                  aria-label={`${t(I18N.FilterDetail)} ${order.orderNumber}`}
                  onClick={() => stashOrderDetailEntryPoint("Orders_Listing")}
                >
                  {t(I18N.FilterDetail)}
                  <ChevronRightIcon width={14} decorative />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
