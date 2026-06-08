"use client";

import { NextImage, Text, RichText } from "@sitecore-content-sdk/nextjs";
import React, { useMemo } from "react";

import type { ComponentProps } from "@/lib/component-props";
import InfoBanner from "@/components/shared/info-banner/InfoBanner";
import { useActiveLocale } from "@/hooks/use-active-locale";
import { useQuoteRequest } from "@/hooks/useQuoteRequest";
import { localizeHref } from "@/lib/locale-path";
import {
  getOrderManagementTabLinkRaw,
  resolveOrderManagementTabKind,
} from "@/lib/orderManagementUtils";

import type { IOrderManagementFields } from "../OrderManagement.type";
import { OrderManagementChipRow } from "../partial/OrderManagementChipRow";
import { OrderManagementDesktopTable } from "../partial/OrderManagementDesktopTable";
import { OrderManagementHeader } from "../partial/OrderManagementHeader";
import { OrderManagementMobileCards } from "../partial/OrderManagementMobileCards";
import { OrderManagementMobileSheets } from "../partial/OrderManagementMobileSheets";
import { OrderManagementPagination } from "../partial/OrderManagementPagination";
import { OrderManagementTabBar } from "../partial/OrderManagementTabBar";
import { QuoteRequestDrawer } from "../partial/QuoteRequest/QuoteRequestDrawer";
import { OrdersManagementToolbar } from "../tabs/orders/OrdersManagementToolbar";
import { InvoicesDesktopTable } from "../tabs/invoices/InvoicesDesktopTable";
import { InvoicesMobileCards } from "../tabs/invoices/InvoicesMobileCards";
import { InvoicesSearchBarFilter } from "../tabs/invoices/InvoicesSearchBarFilter";
import { QuotesDesktopTable } from "../tabs/quotes/QuotesDesktopTable";
import { QuotesMobileCards } from "../tabs/quotes/QuotesMobileCards";
import { QuotesSearchBarFilter } from "../tabs/quotes/QuotesSearchBarFilter";
import { ShipmentsDesktopTable } from "../tabs/shipments/ShipmentsDesktopTable";
import { ShipmentsMobileCards } from "../tabs/shipments/ShipmentsMobileCards";
import { ShipmentsToolbar } from "../tabs/shipments/ShipmentsToolbar";
import { useOrderManagementShell } from "@/hooks/useOrderManagementShell";
import { DocumentRequestPanel } from "@/components/shared/document-request-panel/DocumentRequestPanel";
import { orderListLineToDocumentRequestUiLine } from "@/lib/documentRequestMappings";
import { mergeOrderManagementDocumentRequestCms } from "@/lib/documentRequestCmsMapping";
import type { IDocumentRequestPanelFields } from "@/lib/document-request-panel-types";

interface OrderManagementDefaultVariantProps {
  testId: string;
  fields: IOrderManagementFields | null;
  params: ComponentProps["params"];
  page: ComponentProps["page"];
}

/**
 * Renders the full order-management UI when datasource fields exist.
 * Lives in this file so the variant owns layout; kept as a separate component so the hook runs only when `fields` is defined (Rules of Hooks).
 */
function OrderManagementDefaultVariantContent({
  fields,
  paramsStyles,
  renderingId,
  showRequestQuote,
  page,
}: {
  fields: IOrderManagementFields;
  paramsStyles: string;
  renderingId?: string;
  showRequestQuote: boolean;
  page: OrderManagementDefaultVariantProps["page"];
}): React.ReactElement {
  const orderManagement = useOrderManagementShell({
    fields,
    paramsStyles,
    renderingId,
    page,
  });
  const {
    fields: scFields,
    paramsStyles: ps,
    renderingId: rid,
    tabKind,
    isRenderableDataTab,
    tabFields,
    showBanner,
    visibleTabs,
    activeTab,
    canRequestQuote,
    onHeaderQuoteRequestStart,
    documentRequestListingTarget,
    closeDocumentRequestFromOrdersList,
    accountId,
    totalResults,
    trackQuoteRequested,
  } = orderManagement;

  const documentRequestPanelFields = React.useMemo((): IDocumentRequestPanelFields => {
    const merged = mergeOrderManagementDocumentRequestCms(tabKind, tabFields, {
      DocumentSelection: scFields.DocumentSelection,
      QuoteSelection: scFields.QuoteSelection,
    });
    return { ...scFields, ...merged };
  }, [tabKind, tabFields, scFields]);

  const activeLocale = useActiveLocale();

  const ordersTabHref = useMemo(() => {
    const ordersTab = visibleTabs.find(
      (t) =>
        resolveOrderManagementTabKind(getOrderManagementTabLinkRaw(t.fields?.TabURL)) === "orders"
    );
    const raw =
      getOrderManagementTabLinkRaw(ordersTab?.fields?.TabURL) ?? "/orders-management/orders";
    return localizeHref(raw, activeLocale);
  }, [activeLocale, visibleTabs]);

  const hasOrdersHistory = tabKind === "orders" && totalResults > 0;

  const quoteRequest = useQuoteRequest({
    accountId,
    accountNumeric: Number.parseInt(String(accountId), 10) || 0,
    fields: scFields,
    hasOrdersHistory,
    ordersTabHref,
    onTrackQuoteOpen: trackQuoteRequested,
  });

  const requestQuoteLabelDesktop = quoteRequest.hasPendingDraft
    ? scFields.ModifyPendingQuoteTitle
    : scFields.RequestQuoteLabelDesktop;
  const requestQuoteIcon = quoteRequest.hasPendingDraft
    ? scFields.ModifyPendingQuoteIcon
    : scFields.RequestQuoteIcon;

  return (
    <section
      className={`component order-management ${ps ?? ""}`.trim()}
      id={rid}
      aria-label={String(scFields.Title?.value ?? "Order management")}
    >
      <div className="component-content">
        <div className="flex w-full min-w-0 flex-col gap-[24px]">
          <OrderManagementHeader
            title={scFields.Title}
            subtitle={scFields.SubTitle}
            canRequestQuote={canRequestQuote}
            hideRequestQuote={!showRequestQuote}
            onRequestQuoteOpen={quoteRequest.openFromHeader}
            requestQuoteLabelDesktop={requestQuoteLabelDesktop}
            requestQuoteIcon={requestQuoteIcon}
            quoteBadgeCount={quoteRequest.queueItemCount}
          />
          <OrderManagementTabBar
            visibleTabs={visibleTabs}
            activeTab={activeTab}
            currentPathname={orderManagement.pathname}
            isEditing={Boolean(page?.mode?.isEditing || page?.mode?.isPreview)}
          />

          {isRenderableDataTab && tabFields ? (
            <>
              {showBanner && tabFields.BannerDescription?.value ? (
                <InfoBanner
                  icon={
                    tabFields.BannerIcon?.value?.src ? (
                      <NextImage field={tabFields.BannerIcon} width={28} height={28} sizes="40px" />
                    ) : undefined
                  }
                  title={
                    tabFields.BannerTitle?.value ? (
                      <Text field={tabFields.BannerTitle} tag="span" />
                    ) : undefined
                  }
                  description={<RichText field={tabFields.BannerDescription} tag="div" />}
                />
              ) : null}
              <div
                data-listing-scroll-anchor
                className="box-border flex w-full min-w-0 shrink-0 grow-0 flex-none flex-col items-stretch gap-0 self-stretch overflow-y-visible border-1 border-[#E8EAEB] bg-[var(--color-bg-basic-color)] max-lg:overflow-x-clip"
              >
                <div className="flex w-full min-w-0 flex-col gap-[16px] p-[16px] border-b border-[var(--color-border-default)] md:border-0">
                  {tabKind === "orders" && (
                    <OrdersManagementToolbar orderManagement={orderManagement} />
                  )}
                  {tabKind === "shipments" && (
                    <ShipmentsToolbar orderManagement={orderManagement} />
                  )}
                  {tabKind === "invoices" && (
                    <InvoicesSearchBarFilter orderManagement={orderManagement} />
                  )}
                  {tabKind === "quotes" && (
                    <QuotesSearchBarFilter orderManagement={orderManagement} />
                  )}
                  {/* Generic toolbar if none of the above match */}
                  {tabKind !== "orders" &&
                    tabKind !== "shipments" &&
                    tabKind !== "invoices" &&
                    tabKind !== "quotes" && (
                      <OrdersManagementToolbar orderManagement={orderManagement} />
                    )}
                  <OrderManagementChipRow orderManagement={orderManagement} />
                </div>

                {/* Mobile sheets */}
                <OrderManagementMobileSheets orderManagement={orderManagement} />

                {/* Desktop/Mobile Tables/Cards */}
                {tabKind === "orders" && (
                  <>
                    <OrderManagementDesktopTable
                      orderManagement={orderManagement}
                      quoteRequest={canRequestQuote ? quoteRequest : null}
                    />
                    <OrderManagementMobileCards orderManagement={orderManagement} />
                  </>
                )}
                {tabKind === "shipments" && (
                  <>
                    <ShipmentsDesktopTable orderManagement={orderManagement} />
                    <ShipmentsMobileCards orderManagement={orderManagement} />
                  </>
                )}
                {tabKind === "invoices" && (
                  <>
                    <InvoicesDesktopTable orderManagement={orderManagement} />
                    <InvoicesMobileCards orderManagement={orderManagement} />
                  </>
                )}
                {tabKind === "quotes" && (
                  <>
                    <QuotesDesktopTable orderManagement={orderManagement} />
                    <QuotesMobileCards orderManagement={orderManagement} />
                  </>
                )}
                {/* Unknown tab/feature not implemented message */}
                {tabKind !== "orders" &&
                  tabKind !== "shipments" &&
                  tabKind !== "invoices" &&
                  tabKind !== "quotes" && (
                    <p
                      className="text-[18px] font-semibold text-[var(--color-text-heading-color)]"
                      role="status"
                    >
                      {tabFields?.TabName?.value ? String(tabFields.TabName.value) : "This section"}{" "}
                      is not available yet.
                    </p>
                  )}
                {/* Pagination for known tabs */}
                {(tabKind === "orders" ||
                  tabKind === "shipments" ||
                  tabKind === "invoices" ||
                  tabKind === "quotes") && (
                  <OrderManagementPagination orderManagement={orderManagement} />
                )}
              </div>
            </>
          ) : null}
        </div>
        {canRequestQuote ? <QuoteRequestDrawer qr={quoteRequest} /> : null}
      </div>

      {documentRequestListingTarget && tabKind === "orders" ? (
        <DocumentRequestPanel
          key={`${documentRequestListingTarget.order.orderHeaderId}-${documentRequestListingTarget.line.id}`}
          isOpen
          onClose={closeDocumentRequestFromOrdersList}
          fields={documentRequestPanelFields}
          entryPoint="EP1"
          layoutMode="single"
          poNumber={documentRequestListingTarget.order.poNumber}
          orderNumber={documentRequestListingTarget.order.orderNumber}
          initialLines={[orderListLineToDocumentRequestUiLine(documentRequestListingTarget.line)]}
        />
      ) : null}
    </section>
  );
}

const OrderManagementDefaultVariantBase = ({
  testId,
  fields,
  params,
  page,
}: OrderManagementDefaultVariantProps): React.ReactElement => {
  const { styles, RenderingIdentifier: id, HideRequestQuoteButton } = params;
  const isEditing = page.mode.isEditing;
  const showRequestQuote = isEditing || !Boolean(Number(HideRequestQuoteButton));

  if (!fields) {
    return (
      <div
        className={`component order-management ${styles ?? ""}`.trim()}
        id={id}
        data-testid={testId}
      >
        <div className="component-content">
          <span className="is-empty-hint">Order Management</span>
        </div>
      </div>
    );
  }

  return (
    <div data-testid={testId}>
      <OrderManagementDefaultVariantContent
        fields={fields}
        paramsStyles={styles ?? ""}
        renderingId={id}
        showRequestQuote={showRequestQuote}
        page={page}
      />
    </div>
  );
};

export const OrderManagementDefaultVariant = React.memo(OrderManagementDefaultVariantBase);
