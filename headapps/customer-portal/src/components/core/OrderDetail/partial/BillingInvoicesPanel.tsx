"use client";

import { Image as SitecoreImage, Text } from "@sitecore-content-sdk/nextjs";
import { faCreditCard } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import Link from "next/link";
import React, { useId, useRef, useState } from "react";

import Button from "@/components/ui/Button";
import useClickOutside from "@/hooks/useClickOutside";
import { trackOrderDetailInvoiceViewAllClick } from "@/lib/orderDetailAnalytics";
import { useProfileContext } from "@/lib/profile-context";
import {
  formatCurrencyAmount,
  formatOrderDateDisplay,
  ORDERS_MANAGEMENT_INVOICES_TAB_HREF,
} from "@/lib/orderManagementUtils";
import {
  applyInvoiceDownloadLabelPattern,
  formatBillingAddressLines,
  sortInvoiceLanguageCodes,
} from "@/lib/orderDetailUtils";
import { openBinaryPdfInNewTab } from "@/lib/documentBinaryPdf";

import type {
  IOrderDetailFields,
  OrderDetailApiData,
  OrderDetailInvoice,
} from "../OrderDetail.type";

import { useActiveLocale } from "@/hooks/use-active-locale";
import { localizeHref } from "@/lib/locale-path";

function invoiceDownloadMenuLabel(fields: IOrderDetailFields, lang: string): string {
  const raw = applyInvoiceDownloadLabelPattern(fields.InvoiceDownloadLabelPattern, lang).trim();
  if (raw) return raw;
  return `Download ${lang.toUpperCase()}`;
}

export interface BillingInvoicesPanelProps {
  fields: IOrderDetailFields;
  data: OrderDetailApiData;
  locale: string;
  orderNumberForFilter: string;
  orderHeaderIdForViewAll: string;
}

/**
 * Billing address, order summary totals, and invoice list (Figma Billing & Invoices card).
 */
export function BillingInvoicesPanel({
  fields,
  data,
  locale,
  orderNumberForFilter,
  orderHeaderIdForViewAll,
}: BillingInvoicesPanelProps): React.ReactElement {
  const activeLocale = useActiveLocale();
  const invoicesTabHref = localizeHref(ORDERS_MANAGEMENT_INVOICES_TAB_HREF, activeLocale);
  const viewAllInvoicesHref =
    orderHeaderIdForViewAll.trim() !== ""
      ? `${invoicesTabHref}?orderHeaderId=${encodeURIComponent(orderHeaderIdForViewAll.trim())}`
      : invoicesTabHref;

  const { currentLanguage } = useProfileContext();
  const preferred = (
    currentLanguage?.trim().split("-")[0] ||
    locale.slice(0, 2) ||
    "en"
  ).toUpperCase();
  const limit = parseInt(String(fields.InvoiceDisplayLimit?.value ?? "8"), 10);
  const displayLimit = Number.isFinite(limit) && limit > 0 ? limit : 8;

  const invoices = data.invoices ?? [];
  const visible = invoices.slice(0, displayLimit);
  const showViewAll = invoices.length > displayLimit;

  const addressLines = formatBillingAddressLines(data.billingAddress);
  const addressSingleLine = addressLines.join(", ");
  const { subTotal, tax, totalAmount } = data.orderSummary;
  const hideBillingAndInvoice = fields.HideBillingandInvoiceAmount?.value === true;

  return (
    <aside
      className="flex flex-col gap-[16px] md:gap-[24px] rounded-[8px] border border-[var(--color-border-default)] bg-[var(--color-bg-basic-color)] p-[16px] md:p-[20px] w-full min-w-0"
      aria-labelledby="order-detail-billing-title"
    >
      <h3
        id="order-detail-billing-title"
        className="text-[16px] font-[500] leading-[1.38] text-[var(--color-text-black)] m-0"
      >
        {fields.PanelTitle ? <Text field={fields.PanelTitle} tag="span" /> : null}
      </h3>

      {!hideBillingAndInvoice ? (
        <>
          <div className="flex flex-col gap-[8px] w-full">
            <div className="flex justify-between items-center gap-[12px] w-full min-w-0">
              <span className="text-[12px] font-[400] leading-[1.38] text-[var(--color-text-placeholder)] shrink-0">
                {fields.SubTotalLabel ? <Text field={fields.SubTotalLabel} tag="span" /> : null}
              </span>
              <span className="text-[12px] font-normal leading-[1.375] text-[var(--color-text-black)] text-right">
                {formatCurrencyAmount(subTotal?.value, subTotal?.currency, locale)}
              </span>
            </div>
            <div className="flex justify-between items-center gap-[12px] w-full min-w-0">
              <span className="text-[12px] font-[400] leading-[1.38] text-[var(--color-text-placeholder)] shrink-0">
                {fields.TaxLabel ? <Text field={fields.TaxLabel} tag="span" /> : null}
              </span>
              <span className="text-[12px] font-normal leading-[1.375] text-[var(--color-text-black)] text-right">
                {formatCurrencyAmount(tax?.value, tax?.currency, locale)}
              </span>
            </div>
            <div className="flex justify-between items-end gap-[12px] w-full min-w-0">
              <span className="text-[14px] font-[500] leading-[1.38] text-[var(--color-text-heading-color)] shrink-0">
                {fields.TotalLabel ? <Text field={fields.TotalLabel} tag="span" /> : null}
              </span>
              <span className="flex-1 min-w-0 text-[16px] font-[500] leading-[1.5] text-[var(--color-text-heading-color)] text-right">
                {formatCurrencyAmount(totalAmount?.value, totalAmount?.currency, locale)}
              </span>
            </div>
          </div>

          <hr className="w-full h-px bg-[var(--color-border-default)] border-0 m-0 p-0" />
        </>
      ) : null}

      <div className="flex gap-[10.5px] items-start w-full min-w-0">
        <div
          className="shrink-0 flex items-center justify-center w-[35px] h-[35px] rounded-full bg-[#e3f0f5]"
          aria-hidden
        >
          {fields.BillingAddressIcon?.value?.src ? (
            <SitecoreImage
              field={fields.BillingAddressIcon}
              width={22}
              height={22}
              sizes="22px"
              className="w-[16px] h-[14px] object-contain"
            />
          ) : (
            <span className="text-[14px] text-[var(--color-icon-cyan)]">
              <Icon icon={faCreditCard} width={14} height={14} aria-hidden />
            </span>
          )}
        </div>
        <div className="flex flex-col gap-[3.5px] min-w-0 flex-1 pt-[1px]">
          {fields.BillingAddressLabel ? (
            <div className="text-[10px] font-bold leading-[15px] tracking-[0.5px] uppercase text-[var(--color-text-placeholder)]">
              <Text field={fields.BillingAddressLabel} tag="span" />
            </div>
          ) : null}
          {addressSingleLine ? (
            <p className="text-[12px] font-normal leading-[1.375] text-[var(--color-text-black)] m-0">
              {addressSingleLine}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-0 w-full min-w-0">
        {visible.map((inv) => (
          <InvoiceRow
            key={String(inv.invoiceId)}
            invoice={inv}
            fields={fields}
            locale={locale}
            preferredLanguage={preferred}
            hideAmountMeta={hideBillingAndInvoice}
          />
        ))}
      </div>

      {showViewAll && fields.ViewAllInvoicesLabel ? (
        <Link
          href={viewAllInvoicesHref}
          className="text-[13px] font-medium text-[var(--color-menu-hover-color)] mt-0 bg-transparent border-0 cursor-pointer p-0 underline-offset-2 hover:underline text-left self-start"
          onClick={() =>
            trackOrderDetailInvoiceViewAllClick({
              orderNumber: orderNumberForFilter,
            })
          }
        >
          <Text field={fields.ViewAllInvoicesLabel} tag="span" />
        </Link>
      ) : null}
    </aside>
  );
}

function InvoiceRow({
  invoice,
  fields,
  locale,
  preferredLanguage,
  hideAmountMeta,
}: {
  invoice: OrderDetailInvoice;
  fields: IOrderDetailFields;
  locale: string;
  preferredLanguage: string;
  hideAmountMeta: boolean;
}): React.ReactElement {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  useClickOutside(menuRef, () => setMenuOpen(false), menuOpen);

  const urls: Record<string, string> =
    invoice.invoiceUrlsByLanguage && Object.keys(invoice.invoiceUrlsByLanguage).length > 0
      ? invoice.invoiceUrlsByLanguage
      : { EN: invoice.invoiceUrl };

  const languages = sortInvoiceLanguageCodes(urls, preferredLanguage).filter((lang) =>
    Boolean(urls[lang]?.trim())
  );

  const statusLower = invoice.invoiceStatus.trim().toLowerCase();
  const isPaid = statusLower === "paid";
  const statusDateIso = invoice.dueDate;

  const amountStr = formatCurrencyAmount(invoice.amount.value, invoice.amount.currency, locale);
  const dateStr = formatOrderDateDisplay(statusDateIso, locale);

  const handleDownload = async (lang: string) => {
    const url = urls[lang];
    if (!url?.trim()) return;
    try {
      setMenuOpen(false);
      await openBinaryPdfInNewTab({ documentUrl: url, suppressErrorToast: true });
    } catch {
      // Keep existing silent failure behavior in the invoice menu.
    }
  };

  return (
    <div className="flex flex-wrap items-start justify-between gap-x-[12px] gap-y-[8px] min-h-[35px] w-full min-w-0 py-[12px] border-b border-[var(--color-border-default)] last:border-b-0 last:pb-0 first:pt-0">
      <div className="flex flex-col gap-[4px] min-w-0 flex-1">
        <span className="text-[12px] font-[500] leading-[1.38] text-[var(--color-text-heading-color)]">
          Invoice #{invoice.invoiceNumber}
        </span>
        <p className="text-[12px] font-[400] leading-[1.25] text-[var(--color-text-secondary)] m-0">
          {!hideAmountMeta ? (
            <>
              <span>{amountStr}</span>
              <span aria-hidden> • </span>
            </>
          ) : null}
          {isPaid ? (
            <>
              {fields.PaidLabel ? <Text field={fields.PaidLabel} tag="span" /> : "Paid"} {dateStr}
            </>
          ) : (
            <>
              {fields.DueLabel ? <Text field={fields.DueLabel} tag="span" /> : "Due"} {dateStr}
            </>
          )}
        </p>
      </div>
      <div
        className="flex shrink-0 items-start justify-end pt-[2px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative shrink-0 border border-[var(--color-border-gray)] rounded-[2px]"
          ref={menuRef}
        >
          <Button
            type="button"
            variant="ghost"
            btnVariant="iconBtn"
            className="text-[var(--color-action-primary)]"
            aria-label="Invoice download options"
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
              className="absolute right-0 top-[100%] z-30 mt-[4px] w-max max-w-[min(240px,calc(100vw-48px))] rounded-[8px] border border-[var(--color-border-gray)] bg-[var(--color-bg-basic-color)] py-[6px] shadow-[var(--color-shadow-card)]"
              role="menu"
            >
              {languages.length === 0 ? (
                <div
                  className="px-[12px] py-[8px] text-[12px] text-[var(--color-text-basic)] max-w-[220px]"
                  role="presentation"
                >
                  No invoice download available for this invoice.
                </div>
              ) : (
                languages.map((lang) => {
                  const label = invoiceDownloadMenuLabel(fields, lang);
                  return (
                    <Button
                      key={lang}
                      type="button"
                      variant="transparent"
                      className="w-full justify-start text-left whitespace-nowrap px-[12px] py-[8px] text-[13px] text-[var(--color-text-heading-color)] bg-transparent border-0 cursor-pointer hover:bg-[var(--color-bg-lighter-gray)]"
                      role="menuitem"
                      onPress={() => void handleDownload(lang)}
                    >
                      {label}
                    </Button>
                  );
                })
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
