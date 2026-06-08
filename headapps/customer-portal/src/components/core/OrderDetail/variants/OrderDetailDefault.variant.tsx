"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";

import { QuoteRequestDrawer } from "@/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestDrawer";
import { PortalShellMainSkeleton } from "@/components/shared/portal-loading/PortalShellChromeLoading";
import type { ComponentProps } from "@/lib/component-props";
import { mapOrderStatusToKey } from "@/lib/apis/orders-api";
import { useActiveLocale } from "@/hooks/use-active-locale";
import { useCompactPhoneViewport } from "@/hooks/use-compact-phone-viewport";
import { useOrderDetail } from "@/hooks/useOrderDetail";
import { useQuoteRequest } from "@/hooks/useQuoteRequest";
import { localizeHref } from "@/lib/locale-path";
import {
  formatOrderDateDisplay,
  resolveStatusDisplayForOrderKey,
} from "@/lib/orderManagementUtils";
import { useProfileContext } from "@/lib/profile-context";
import useDeviceType from "@/hooks/use-device-type";

import type { IOrderDetailFields } from "../OrderDetail.type";
import {
  firstCustomerContact,
  mapOrderDetailApiToOrderListItemAndLines,
  parseMobileSectionOrder,
} from "@/lib/orderDetailUtils";
import { PERMISSION_CODES } from "@/lib/permission-codes";
import { usePermissionContext } from "@/lib/permission-context";
import { BillingInvoicesPanel } from "../partial/BillingInvoicesPanel";
import { OrderDetailEmptyState } from "../partial/OrderDetailEmptyState";
import { OrderDetailHeader } from "../partial/OrderDetailHeader";
import { OrderItems } from "../partial/OrderItems";
import { RelatedDocumentsPanel } from "../partial/RelatedDocumentsPanel";
import { ShipmentInformationPanel } from "../partial/ShipmentInformationPanel";
import LoadingSkeleton from "@/components/shared/loading-skeleton/LoadingSkeleton";
import { DocumentRequestPanel } from "@/components/shared/document-request-panel/DocumentRequestPanel";
import {
  orderDetailLineToDocumentRequestUiLine,
  orderDetailLinesToDocumentRequestUiLines,
} from "@/lib/documentRequestMappings";
import { mapQuoteSelectionToDocumentRequestPanelFields } from "@/lib/documentRequestCmsMapping";
import type { IDocumentRequestPanelFields } from "@/lib/document-request-panel-types";
import { cn } from "@/lib/utils";
import { sendOrderDetailPageViewEvent } from "@/lib/CDPEvents";
import { logGTMOrderDetailPageView } from "@/lib/gtm";
import { getPathWithoutLocale } from "@/lib/locale-cookie";
import {
  resolveOrderDetailEntryPoint,
  scheduleOrderDetailEntryPointSessionCleanup,
} from "@/lib/order-detail-entry-point";

interface OrderDetailDefaultVariantProps {
  testId: string;
  fields: IOrderDetailFields;
  params: ComponentProps["params"];
  page: ComponentProps["page"];
}

type DocumentRequestOpenState =
  | { mode: "closed" }
  | { mode: "multi" }
  | { mode: "single"; lineIndex: number };

/**
 * Default order detail: header, line items grid, billing/invoices and shipment side panels (desktop); mobile stack order from CMS.
 */
function OrderDetailDefaultVariantContent({
  fields,
  paramsStyles,
  renderingId,
  isEditing,
  showCreateQuote,
  showRequestDocument,
}: {
  fields: IOrderDetailFields;
  paramsStyles: string;
  renderingId?: string;
  isEditing: boolean;
  showCreateQuote: boolean;
  showRequestDocument: boolean;
}): React.ReactElement {
  const { isMobile } = useDeviceType();
  const isCompactPhoneViewport = useCompactPhoneViewport();
  const useStackedDetailLayout = isMobile || isCompactPhoneViewport;
  const { can } = usePermissionContext();
  const canRequestDocumentation = isEditing || can(PERMISSION_CODES.REQUEST_DOCUMENTATION);
  const canInitiateRfq = isEditing || can(PERMISSION_CODES.INITIATE_RFQ);
  const canViewInvoices = isEditing || can(PERMISSION_CODES.VIEW_INVOICES);
  const canViewTechnicalDocs = isEditing || can(PERMISSION_CODES.VIEW_TECHNICAL_DOCS);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const lastSegment = pathname.split("/").filter(Boolean).pop() ?? "";
  const orderHeaderId =
    searchParams.get("orderHeaderId") ??
    (/^\d+$/.test(lastSegment) ? lastSegment : isEditing ? "" : "20902891");

  const locale = isEditing
    ? "en-US"
    : typeof navigator !== "undefined" && navigator.language
      ? navigator.language
      : "en-US";

  const { data, loadError, isLoading, refetch } = useOrderDetail({ orderHeaderId, isEditing });

  const { selectedAccount } = useProfileContext();
  const accountId = selectedAccount?.id ?? "";
  const accountNumeric = Number.parseInt(String(accountId), 10) || 0;
  const activeLocale = useActiveLocale();
  const ordersTabHref = useMemo(
    () => localizeHref("/orders-management/orders", activeLocale),
    [activeLocale]
  );
  const quoteRequest = useQuoteRequest({
    accountId,
    accountNumeric,
    fields,
    hasOrdersHistory: true,
    ordersTabHref,
  });

  const orderInFullQuoteDraft = useMemo(() => {
    if (!data?.order) return false;
    return quoteRequest.isOrderHeaderInOrderQuoteDraft(String(data?.order?.orderHeaderId));
  }, [data?.order, quoteRequest.isOrderHeaderInOrderQuoteDraft, quoteRequest.draft.orderQuote]);

  const [docRequest, setDocRequest] = useState<DocumentRequestOpenState>({ mode: "closed" });
  const closeDocRequest = useCallback(() => setDocRequest({ mode: "closed" }), []);
  const trackedOrderDetailPageViewKeyRef = useRef<string | null>(null);

  const orderHeaderIdStr = data?.order ? String(data?.order?.orderHeaderId) : "";

  const docRequestPanelLines = useMemo(() => {
    if (!data || docRequest.mode === "closed") return [];
    if (docRequest.mode === "multi") {
      return orderDetailLinesToDocumentRequestUiLines(data.lineItems, orderHeaderIdStr);
    }
    const item = data.lineItems[docRequest.lineIndex];
    if (!item) return [];
    return [orderDetailLineToDocumentRequestUiLine(item, docRequest.lineIndex, orderHeaderIdStr)];
  }, [data, docRequest, orderHeaderIdStr]);

  const documentRequestPanelFields = useMemo((): IDocumentRequestPanelFields => {
    const fromCms = mapQuoteSelectionToDocumentRequestPanelFields(
      fields.DocumentSelection ?? fields.QuoteSelection
    );
    return { ...fields, ...fromCms };
  }, [fields]);

  useEffect(() => {
    if (!data?.order) return;
    const previous = document.title;
    document.title = `Order ${String(data?.order?.orderId)}`;
    return () => {
      document.title = previous;
    };
  }, [data?.order?.orderId]);

  useEffect(() => {
    if (!data?.order) return;
    const resolvedOrderId = String(data?.order?.orderId ?? null).trim();

    const pathForTracking = pathname ? getPathWithoutLocale(pathname) : "";
    if (!pathForTracking) return;

    const trackingKey = `${pathForTracking}::${resolvedOrderId}`;
    if (trackedOrderDetailPageViewKeyRef.current === trackingKey) {
      return;
    }
    trackedOrderDetailPageViewKeyRef.current = trackingKey;

    const entryPoint = resolveOrderDetailEntryPoint();
    logGTMOrderDetailPageView({
      order_number: resolvedOrderId,
      entry_point: entryPoint,
      page_path: pathForTracking,
    });
    void sendOrderDetailPageViewEvent({
      orderNumber: resolvedOrderId,
      entryPoint,
    }).catch((e) => console.debug(e));
    scheduleOrderDetailEntryPointSessionCleanup();
  }, [data?.order, pathname]);

  const mobileOrder = parseMobileSectionOrder(fields.MobileSectionOrderSelection);

  const orderStatusKey = useMemo(() => {
    if (!data?.order) return "";
    return mapOrderStatusToKey(data?.order?.orderStatus);
  }, [data?.order]);

  const statusLabel = useMemo(() => {
    if (!orderStatusKey) return "";
    return resolveStatusDisplayForOrderKey(orderStatusKey, undefined).label;
  }, [orderStatusKey]);

  const contact = data ? firstCustomerContact(data.contacts) : undefined;
  const orderDateFormatted = data?.order?.orderDate
    ? formatOrderDateDisplay(data?.order?.orderDate, locale)
    : "";

  const referenceLabel = (fields.ReferenceIDLabel?.value ?? "").trim();
  const referenceValue = (data?.order?.referenceId ?? "").trim();

  if (!isLoading && (loadError || !data || !data?.order?.orderId)) {
    return (
      <section
        className={`component order-detail ${paramsStyles ?? ""}`.trim()}
        id={renderingId}
        aria-label="Order detail"
      >
        <div className="component-content">
          <div className="flex flex-col gap-[16px] md:gap-[24px] w-full min-w-0">
            <OrderDetailEmptyState fields={fields} onRetry={refetch} />
          </div>
        </div>
      </section>
    );
  }

  const lineItems = data?.lineItems ?? [];

  const headerIdFromOrder = data?.order?.orderHeaderId;
  const orderHeaderIdForViewAll =
    orderHeaderId.trim() !== ""
      ? orderHeaderId.trim()
      : headerIdFromOrder != null && headerIdFromOrder > 0
        ? String(headerIdFromOrder)
        : "";

  const billingPanel =
    data && canViewInvoices ? (
      <BillingInvoicesPanel
        fields={fields}
        data={data}
        locale={locale}
        orderNumberForFilter={String(data?.order?.orderId)}
        orderHeaderIdForViewAll={orderHeaderIdForViewAll}
      />
    ) : null;
  const shipmentPanel = data && (
    <ShipmentInformationPanel
      fields={fields}
      data={data}
      locale={locale}
      orderNumberForFilter={String(data?.order?.orderId)}
      orderHeaderIdForViewAll={orderHeaderIdForViewAll}
    />
  );

  const documentsPanel =
    data && canViewTechnicalDocs ? (
      <RelatedDocumentsPanel
        fields={fields}
        orderNumber={String(data?.order?.orderId)}
        documents={data.documents}
      />
    ) : null;
  const orderNumber = data && String(data?.order?.orderId);
  const orderItemsSection = orderNumber && data && (
    <OrderItems
      fields={fields}
      lineItems={lineItems}
      orderNumber={orderNumber}
      orderHeader={data?.order}
      canRequestDocumentation={canRequestDocumentation}
      canInitiateRfq={canInitiateRfq}
      onRequestDocumentLine={(globalLineIndex) =>
        setDocRequest({ mode: "single", lineIndex: globalLineIndex })
      }
      quoteRequest={accountId && canInitiateRfq ? quoteRequest : null}
    />
  );

  const mobileSectionNodes: Record<string, React.ReactNode> = {
    billing: billingPanel,
    shipment: shipmentPanel,
    documents: documentsPanel,
    items: orderItemsSection,
  };

  return (
    <>
      {isLoading && !data && (
        <section
          className={`component order-detail ${paramsStyles ?? ""}`.trim()}
          id={renderingId}
          aria-label="Order detail"
        >
          <div className="component-content">
            <div className="flex flex-col gap-[16px] md:gap-[24px] w-full min-w-0" aria-busy="true">
              <PortalShellMainSkeleton />
            </div>
          </div>
        </section>
      )}

      {data && orderNumber ? (
        <section
          className={`component order-detail ${paramsStyles ?? ""}`.trim()}
          id={renderingId}
          aria-label="Order detail"
        >
          <div className="component-content">
            <div className="flex flex-col gap-[16px] md:gap-[24px] w-full min-w-0">
              <OrderDetailHeader
                fields={fields}
                orderNumber={orderNumber}
                orderIdDisplay={String(data?.order?.orderId)}
                orderStatusKey={orderStatusKey}
                orderStatusLabel={statusLabel}
                poNumber={data?.order?.poNumber ?? "—"}
                orderDateFormatted={orderDateFormatted}
                contactName={contact?.name ?? ""}
                contactEmail={contact?.email ?? ""}
                referenceLabel={referenceLabel}
                referenceValue={referenceValue}
                canRequestDocumentation={canRequestDocumentation}
                canInitiateRfq={canInitiateRfq}
                onRequestDocuments={() => setDocRequest({ mode: "multi" })}
                orderCreateQuoteIsModifyMode={orderInFullQuoteDraft}
                modifyQuoteOrderButtonLabel={
                  fields.ModifyQuoteOrderButtonLabel ??
                  quoteRequest.quoteCms?.ModifyQuoteForOrderLine
                }
                onCreateQuoteFromOrder={() => {
                  const { order, lines } = mapOrderDetailApiToOrderListItemAndLines(data);
                  void quoteRequest.openFromOrderDetailHeader(order, lines);
                }}
                showCreateQuote={showCreateQuote}
                showRequestDocument={showRequestDocument}
              />

              {useStackedDetailLayout ? (
                <div className="flex flex-col gap-[16px] w-full">
                  {mobileOrder.map((key) => {
                    const node = mobileSectionNodes[key];
                    return node != null ? <React.Fragment key={key}>{node}</React.Fragment> : null;
                  })}
                </div>
              ) : (
                <div className="flex flex-col md:flex-row lg:flex-row md:gap-[20px] gap-[24px] items-start w-full justify-between md:justify-start">
                  <div className="flex flex-col gap-[24px] w-full md:w-auto md:flex-1 md:min-w-0 lg:min-w-0 lg:flex-1">
                    {orderItemsSection}
                  </div>
                  <div className="flex flex-col gap-[16px] w-full md:w-[232px] md:max-w-[340px] md:shrink-0 lg:w-[340px] lg:shrink-0">
                    {billingPanel}
                    {shipmentPanel}
                    {documentsPanel}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {data && docRequest.mode !== "closed" && docRequestPanelLines.length > 0 ? (
        <DocumentRequestPanel
          key={docRequest.mode === "single" ? `single-${docRequest.lineIndex}` : "multi"}
          isOpen
          onClose={closeDocRequest}
          fields={documentRequestPanelFields}
          entryPoint={docRequest.mode === "multi" ? "EP2a" : "EP2b"}
          layoutMode={docRequest.mode === "multi" ? "multi" : "single"}
          poNumber={String(data?.order?.poNumber ?? "").trim() || "—"}
          orderNumber={String(data?.order?.orderId)}
          initialLines={docRequestPanelLines}
        />
      ) : null}
      {data && orderNumber && accountId && canInitiateRfq ? (
        <QuoteRequestDrawer qr={quoteRequest} />
      ) : null}
    </>
  );
}

const OrderDetailDefaultVariantBase = ({
  testId,
  fields,
  params,
  page,
}: OrderDetailDefaultVariantProps): React.ReactElement => {
  const {
    styles,
    RenderingIdentifier: id,
    HideCreateQuoteButton,
    HideRequestDocumentButton,
  } = params;
  const isEditing = page.mode.isEditing;
  const showCreateQuote = isEditing || !Boolean(Number(HideCreateQuoteButton));
  const showRequestDocument = isEditing || !Boolean(Number(HideRequestDocumentButton));
  if (!fields) {
    return (
      <div className={`component order-detail ${styles ?? ""}`.trim()} id={id} data-testid={testId}>
        <div className="component-content">
          <span className="is-empty-hint">Order Detail</span>
        </div>
      </div>
    );
  }

  return (
    <div data-testid={testId}>
      <OrderDetailDefaultVariantContent
        fields={fields}
        paramsStyles={styles ?? ""}
        renderingId={id}
        isEditing={isEditing}
        showCreateQuote={showCreateQuote}
        showRequestDocument={showRequestDocument}
      />
    </div>
  );
};

export const OrderDetailDefaultVariant = React.memo(OrderDetailDefaultVariantBase);
