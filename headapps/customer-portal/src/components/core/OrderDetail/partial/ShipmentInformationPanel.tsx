"use client";

import { Image as SitecoreImage, Text } from "@sitecore-content-sdk/nextjs";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import Link from "next/link";
import React, { useEffect, useId, useRef, useState } from "react";

import Button from "@/components/ui/Button";
import useClickOutside from "@/hooks/useClickOutside";
import {
  trackOrderDetailPackingSlipDownload,
  trackOrderDetailPackingSlipLanguageSelected,
  trackOrderDetailShipmentInformationPanelView,
  trackOrderDetailShipmentTrackingLinkClick,
  trackOrderDetailShipmentViewAllClick,
} from "@/lib/orderDetailAnalytics";
import { useActiveLocale } from "@/hooks/use-active-locale";
import { localizeHref } from "@/lib/locale-path";
import { useProfileContext } from "@/lib/profile-context";
import {
  formatOrderDateDisplay,
  ORDERS_MANAGEMENT_SHIPMENTS_TAB_HREF,
  resolveTrackingUrl,
} from "@/lib/orderManagementUtils";
import {
  applyPackingSlipLabelPattern,
  resolveOrderDetailDocumentOpenUrl,
} from "@/lib/orderDetailUtils";
import { openBinaryPdfInNewTab } from "@/lib/documentBinaryPdf";

import type {
  IOrderDetailFields,
  OrderDetailApiData,
  OrderDetailDocument,
  OrderDetailShipment,
} from "../OrderDetail.type";

export interface ShipmentInformationPanelProps {
  fields: IOrderDetailFields;
  data: OrderDetailApiData;
  locale: string;
  orderNumberForFilter: string;
  orderHeaderIdForViewAll: string;
  shipmentDataError?: string | null;
  onShipmentRetry?: () => void;
}

function packingSlipMenuLabel(fields: IOrderDetailFields, lang: string): string {
  const raw = applyPackingSlipLabelPattern(fields.PackingSlipDownloadLabelPattern, lang).trim();
  if (raw) return raw;
  return `Download ${lang.toUpperCase()}`;
}

function resolvePackingSlipLanguageCode(
  doc: OrderDetailDocument,
  preferredLanguage: string
): string {
  return (
    (doc.languageCode ?? doc.language ?? preferredLanguage).trim() || preferredLanguage
  ).toUpperCase();
}

function ShipmentPackingSlipMenu({
  fields,
  shipment,
  preferredLanguage,
  orderNumber,
  onDownloadError,
}: {
  fields: IOrderDetailFields;
  shipment: OrderDetailShipment;
  preferredLanguage: string;
  orderNumber: string;
  onDownloadError: (message: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();
  useClickOutside(ref, () => setOpen(false), open);

  const packingSlipDocs = shipment.packingSlip ?? [];

  const fallbackDownloadMessage =
    (fields.PackingSlipDownloadErrorMessage?.value ?? "").trim() ||
    "Unable to download packing slip.";

  const handleDownloadPackingSlip = async (doc: OrderDetailDocument) => {
    const url = resolveOrderDetailDocumentOpenUrl(doc);
    const languageCode = resolvePackingSlipLanguageCode(doc, preferredLanguage);
    const fileName =
      (doc.documentName ?? "").trim() || `packing-slip-${shipment.shipmentId}-${languageCode}.pdf`;
    try {
      setOpen(false);
      onDownloadError(null);
      if (packingSlipDocs.length > 2) {
        trackOrderDetailPackingSlipLanguageSelected({
          orderNumber,
          languageCode,
        });
      }
      trackOrderDetailPackingSlipDownload({
        orderNumber,
        fileName,
        languageCode,
      });
      await openBinaryPdfInNewTab({
        documentUrl: url,
        language: languageCode,
        suppressErrorToast: true,
      });
    } catch {
      onDownloadError(fallbackDownloadMessage);
    }
  };

  const emptyMenu = (
    <div
      className="px-[12px] py-[8px] text-[12px] text-[var(--color-text-basic)] max-w-[220px]"
      role="presentation"
    >
      No packing slip available for this shipment.
    </div>
  );

  return (
    <div className="relative shrink-0" ref={ref} onClick={(e) => e.stopPropagation()}>
      <Button
        type="button"
        variant="ghost"
        btnVariant="iconBtn"
        className="text-[var(--color-action-primary)]"
        aria-label="Packing slip download options"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={open ? menuId : undefined}
        onPress={() => setOpen((o) => !o)}
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
      {open ? (
        <div
          className="absolute right-0 top-[100%] z-30 mt-[4px] w-max max-w-[min(240px,calc(100vw-48px))] rounded-[8px] border border-[var(--color-border-gray)] bg-[var(--color-bg-basic-color)] py-[6px] shadow-[var(--color-shadow-card)]"
          role="menu"
        >
          {packingSlipDocs.length === 0
            ? emptyMenu
            : packingSlipDocs.map((doc, index) => {
                const lang = resolvePackingSlipLanguageCode(doc, preferredLanguage);
                return (
                  <Button
                    key={`${String(doc.documentId ?? "doc")}-${index}`}
                    type="button"
                    variant="transparent"
                    className="w-full justify-start text-left whitespace-nowrap px-[12px] py-[8px] text-[13px] text-[var(--color-text-heading-color)] bg-transparent border-0 cursor-pointer hover:bg-[var(--color-bg-lighter-gray)]"
                    role="menuitem"
                    onPress={() => void handleDownloadPackingSlip(doc)}
                  >
                    {packingSlipMenuLabel(fields, lang)}
                  </Button>
                );
              })}
        </div>
      ) : null}
    </div>
  );
}

function ShipmentRow({
  fields,
  shipment,
  carrierSelection,
  locale,
  preferredLanguage,
  orderNumber,
  onPackingSlipError,
}: {
  fields: IOrderDetailFields;
  shipment: OrderDetailShipment;
  carrierSelection: IOrderDetailFields["CarrierSelection"];
  locale: string;
  preferredLanguage: string;
  orderNumber: string;
  onPackingSlipError: (message: string | null) => void;
}) {
  const trackingUrl = resolveTrackingUrl(
    shipment.carrierName,
    shipment.trackingNumber,
    carrierSelection,
    shipment.trackingUrl
  );
  const dateFormatted = formatOrderDateDisplay(shipment.shipmentDate, locale);
  const datePrefixField = fields.ShippedDateLabel;

  return (
    <div className="flex flex-col flex-wrap md:flex-row items-start justify-between gap-[12px] w-full min-w-0 py-[14px] border-b border-[var(--color-border-gray)] last:border-b-0 last:pb-0 first:pt-0 max-md:!flex-row max-md:items-stretch">
      <div className="flex flex-col gap-[6px] min-w-0 md:flex-1">
        <div className="flex items-center gap-[4px] min-w-0">
          {trackingUrl ? (
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-[4px] text-[12px] font-medium leading-[1.375] text-[var(--color-text-heading-color)] no-underline hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                trackOrderDetailShipmentTrackingLinkClick({
                  orderNumber,
                  carrierName: shipment.carrierName,
                });
              }}
            >
              <span className="text-[12px] font-[500] leading-[1.38] text-[var(--color-text-heading-color)]">
                {shipment.trackingNumber}
              </span>
              <Icon
                icon={faArrowUpRightFromSquare}
                width={10}
                className="shrink-0 text-[var(--color-menu-hover-color)]"
                aria-hidden
              />
            </a>
          ) : (
            <span className="text-[12px] font-[500] leading-[1.38] text-[var(--color-text-heading-color)]">
              {shipment.trackingNumber}
            </span>
          )}
        </div>
        <p className="m-0 text-[12px] font-[400] leading-[1.25] text-[var(--color-text-secondary)] flex flex-wrap items-center gap-x-[4px] gap-y-0">
          <span>{shipment.carrierName}</span>
          <span aria-hidden> • </span>
          {datePrefixField ? <Text field={datePrefixField} tag="span" /> : null}
          {datePrefixField ? " " : null}
          <span>{dateFormatted}</span>
        </p>
      </div>
      <div className="flex shrink-0 items-start justify-end pt-[2px] max-md:justify-end">
        <ShipmentPackingSlipMenu
          fields={fields}
          shipment={shipment}
          preferredLanguage={preferredLanguage}
          orderNumber={orderNumber}
          onDownloadError={onPackingSlipError}
        />
      </div>
    </div>
  );
}

export function ShipmentInformationPanel({
  fields,
  data,
  locale,
  orderNumberForFilter,
  orderHeaderIdForViewAll,
  shipmentDataError,
  onShipmentRetry,
}: ShipmentInformationPanelProps): React.ReactElement {
  const activeLocale = useActiveLocale();
  const shipmentsTabHref = localizeHref(ORDERS_MANAGEMENT_SHIPMENTS_TAB_HREF, activeLocale);
  const viewAllHref =
    orderHeaderIdForViewAll.trim() !== ""
      ? `${shipmentsTabHref}?orderHeaderId=${encodeURIComponent(orderHeaderIdForViewAll.trim())}`
      : shipmentsTabHref;

  const { currentLanguage } = useProfileContext();
  const preferredLanguage = (
    currentLanguage?.trim().split("-")[0] ||
    locale.slice(0, 2) ||
    "en"
  ).toUpperCase();

  const limit = parseInt(String(fields.ShipmentDisplayLimit?.value ?? "8"), 10);
  const displayLimit = Number.isFinite(limit) && limit > 0 ? limit : 8;
  const shipments = data.shipments ?? [];
  const visible = shipments.slice(0, displayLimit);
  const showViewAll = shipments.length > displayLimit;

  const [packingSlipError, setPackingSlipError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumberForFilter) return;
    trackOrderDetailShipmentInformationPanelView({ orderNumber: orderNumberForFilter });
  }, [orderNumberForFilter]);

  return (
    <aside
      className="flex flex-col gap-[16px] md:gap-[20px] rounded-[8px] border border-[var(--color-border-default)] bg-[var(--color-bg-basic-color)] p-[16px] w-full min-w-0"
      aria-labelledby="order-detail-shipment-title"
    >
      <h3
        id="order-detail-shipment-title"
        className="text-[16px] font-[500] leading-[1.38] m-0 text-[var(--color-text-heading-color)]"
      >
        {fields.ShippingPanelTitle ? <Text field={fields.ShippingPanelTitle} tag="span" /> : null}
      </h3>

      {packingSlipError ? (
        <div
          className="text-[13px] text-[var(--color-text-basic)] leading-[1.375] rounded-[6px] border border-[var(--color-border-gray)] bg-[var(--color-bg-lighter-gray)] px-[12px] py-[8px]"
          role="alert"
        >
          <p>{packingSlipError}</p>
        </div>
      ) : null}

      {shipmentDataError ? (
        <div
          className="flex flex-col gap-[8px] text-[13px] text-[var(--color-text-basic)] leading-[1.375]"
          role="alert"
        >
          {fields.ShipmentPanelLoadErrorMessage ? (
            <Text field={fields.ShipmentPanelLoadErrorMessage} tag="p" />
          ) : (
            <p>{shipmentDataError}</p>
          )}
          {onShipmentRetry ? (
            <Button
              type="button"
              variant="transparent"
              className="self-start text-[13px] font-medium text-[var(--color-menu-hover-color)] underline-offset-2 hover:underline p-0 border-0 bg-transparent cursor-pointer"
              onPress={() => onShipmentRetry()}
            >
              {fields.ShipmentRetryLabel ? (
                <Text field={fields.ShipmentRetryLabel} tag="span" />
              ) : (
                "Retry"
              )}
            </Button>
          ) : null}
        </div>
      ) : !shipments.length ? (
        <div className="text-[13px] text-[var(--color-text-basic)] leading-[1.375]">
          {fields.NoShipmentMessage ? (
            <Text field={fields.NoShipmentMessage} tag="p" />
          ) : (
            <p>No shipment information is available for this order yet.</p>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-0 w-full min-w-0">
            {visible.map((sh) => (
              <ShipmentRow
                key={sh.shipmentId}
                fields={fields}
                shipment={sh}
                carrierSelection={fields.CarrierSelection}
                locale={locale}
                preferredLanguage={preferredLanguage}
                orderNumber={orderNumberForFilter}
                onPackingSlipError={setPackingSlipError}
              />
            ))}
          </div>
          {showViewAll && fields.ViewAllShipmentLabel ? (
            <Link
              href={viewAllHref}
              className="text-[13px] font-medium text-[var(--color-menu-hover-color)] underline-offset-2 hover:underline mt-[4px] self-start"
              onClick={() =>
                trackOrderDetailShipmentViewAllClick({
                  orderNumber: orderNumberForFilter,
                  shipmentCount: shipments.length,
                })
              }
            >
              <Text field={fields.ViewAllShipmentLabel} tag="span" />
            </Link>
          ) : null}
        </>
      )}
    </aside>
  );
}
