"use client";

import { Text } from "@sitecore-content-sdk/nextjs";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { QuoteRequestDrawer } from "@/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestDrawer";
import { DashboardRecentRowMenu } from "@/components/core/dashboard-recent-widgets/DashboardRecentRowMenu";
import { DashboardRecentWidgetListState } from "@/components/core/dashboard-recent-widgets/DashboardRecentWidgetListState";
import { LinkRender } from "@/components/shared/link-render/LinkRender";
import { DocumentRequestPanel } from "@/components/shared/document-request-panel/DocumentRequestPanel";
import { useDashboardRecentData } from "@/contexts/DashboardRecentDataContext";
import { useActiveLocale } from "@/hooks/use-active-locale";
import { useQuoteRequest } from "@/hooks/useQuoteRequest";
import type { DashboardRecentOrderRow } from "@/lib/apis/dashboard-recent-data-api";
import type { ComponentProps } from "@/lib/component-props";
import type { SitecoreDocumentRequestSelectionFieldValue } from "@/lib/document-request-cms.types";
import { mapQuoteSelectionToDocumentRequestPanelFields } from "@/lib/documentRequestCmsMapping";
import { orderListLinesToDocumentRequestUiLines } from "@/lib/documentRequestMappings";
import type { IDocumentRequestPanelFields } from "@/lib/document-request-panel-types";
import {
  formatPlacedLabel,
  formatPoLineForWidget,
  getRecentOrderAsideStatusTone,
  mapDashboardRecentOrderRowToOrderListItem,
  orderBadgeLabel,
  orderBadgeVariant,
  resolveRecentWidgetDateRangeFromCms,
  statusIconField,
  type RecentOrderAsideStatusTone,
} from "@/lib/dashboard-recent-widgets.util";
import { localizeHref } from "@/lib/locale-path";
import { stashOrderDetailEntryPoint } from "@/lib/order-detail-entry-point";
import {
  trackDashboardRecentOrderRequestDocumentFromMenu,
  trackDashboardRecentOrderRequestQuoteFromMenu,
  trackDashboardRecentOrderRowClick,
  trackDashboardRecentOrdersViewAll,
} from "@/lib/dashboardAnalytics";
import {
  formatOrderDetailMoneyForDisplay,
  type OrderDetailHeaderStatusVariant,
} from "@/lib/orderDetailUtils";
import {
  toOrderManagementLinkFieldWithHref,
} from "@/lib/orderManagementUtils";
import { PERMISSION_CODES } from "@/lib/permission-codes";
import { usePermissionContext } from "@/lib/permission-context";
import { useProfileContext } from "@/lib/profile-context";

import type { IRecentOrderWidgetFields } from "../RecentOrderWidget.type";
import { cn } from "@/lib/utils";
import { RenderStatusIcon } from "../components/RenderStatusIcon";

interface Props {
  testId: string;
  fields: IRecentOrderWidgetFields | null;
  params: ComponentProps["params"];
  page: ComponentProps["page"];
}

function asideStatusClassForTone(tone: RecentOrderAsideStatusTone): string {
  if (tone === "shipped") return "text-[var(--color-cyan-dark,#00708d)]";
  if (tone === "cancelled") return "text-[var(--color-red-dark,#b42318)]";
  return "text-[var(--color-gray-700,#646467)]";
}

export function RecentOrderWidgetDefaultVariant({
  testId,
  fields,
  params,
  page,
}: Props): React.ReactElement | null {
  const {
    styles: paramsStyles,
    RenderingIdentifier: id,
    HideWidget,
  } = params as ComponentProps["params"] & {
    HideWidget?: unknown;
  };
  const { isEditing } = page.mode;
  const showSection = isEditing || !Boolean(Number(HideWidget));
  const { loading, error, data, refetch, registerOrderCount, registerOrderDays } =
    useDashboardRecentData();
  const activeLocale = useActiveLocale();
  const { can } = usePermissionContext();
  const { selectedAccount } = useProfileContext();
  const accountId = selectedAccount?.id ?? "";
  const accountNumeric = Number.parseInt(String(accountId), 10) || 0;

  const isPreview = page.mode.isPreview;
  const canRequestDocumentation =
    isEditing || isPreview || can(PERMISSION_CODES.REQUEST_DOCUMENTATION);
  const canInitiateRfq = isEditing || isPreview || can(PERMISSION_CODES.INITIATE_RFQ);

  const recentDateRange = useMemo(() => resolveRecentWidgetDateRangeFromCms(fields), [fields]);
  const recentWindowLabel = recentDateRange.label;

  const maxItems = Number(fields?.MaxItemsDisplayed?.value ?? 5) || 5;

  useEffect(() => {
    if (!fields) return;
    registerOrderCount(maxItems);
    registerOrderDays(recentDateRange.days);
    return () => {
      registerOrderCount(null);
      registerOrderDays(null);
    };
  }, [fields, maxItems, recentDateRange.days, registerOrderCount, registerOrderDays]);

  const orders = useMemo(() => {
    const list = data?.orders?.orders ?? [];
    return list.slice(0, maxItems);
  }, [data?.orders?.orders, maxItems]);

  const viewAllField = useMemo(
    () =>
      fields?.ViewAllURL
        ? (toOrderManagementLinkFieldWithHref(fields.ViewAllURL) ?? fields.ViewAllURL)
        : undefined,
    [fields?.ViewAllURL]
  );

  const viewAllLabelText = String(viewAllField?.value?.text ?? "").trim();
  const hasViewAll = Boolean(viewAllField?.value?.href && (viewAllLabelText || isEditing));

  const ordersTabHref = useMemo(
    () => localizeHref("/orders-management/orders", activeLocale),
    [activeLocale]
  );

  const quoteRequest = useQuoteRequest({
    accountId,
    accountNumeric,
    fields: fields ?? ({} as IRecentOrderWidgetFields),
    hasOrdersHistory: true,
    ordersTabHref,
  });

  const [docOrderRow, setDocOrderRow] = useState<DashboardRecentOrderRow | null>(null);
  const closeDocRequest = useCallback(() => setDocOrderRow(null), []);

  const docListItem = useMemo(
    () => (docOrderRow ? mapDashboardRecentOrderRowToOrderListItem(docOrderRow) : null),
    [docOrderRow]
  );

  const documentRequestPanelFields = useMemo((): IDocumentRequestPanelFields | null => {
    if (!fields) return null;
    const fromCms = mapQuoteSelectionToDocumentRequestPanelFields(
      fields.QuoteSelection as SitecoreDocumentRequestSelectionFieldValue | null | undefined
    );
    return { ...fields, ...fromCms };
  }, [fields]);

  const docRequestPanelLines = useMemo(
    () => (docListItem ? orderListLinesToDocumentRequestUiLines(docListItem.lineItems) : []),
    [docListItem]
  );

  const openDocFromRow = useCallback((row: DashboardRecentOrderRow) => {
    const li = mapDashboardRecentOrderRowToOrderListItem(row);
    if (li.lineItems.length === 0) return;
    trackDashboardRecentOrderRequestDocumentFromMenu();
    setDocOrderRow(row);
  }, []);

  const openQuoteFromRow = useCallback(
    (row: DashboardRecentOrderRow) => {
      trackDashboardRecentOrderRequestQuoteFromMenu();
      if (quoteRequest.isOrderHeaderInOrderQuoteDraft(String(row.orderHeaderId))) {
        quoteRequest.openOrderQuoteDraftForReview(row.orderHeaderId, {
          poNumber: String(row.poNumber ?? ""),
          orderNumber: String(row.orderNumber),
        });
        return;
      }
      const li = mapDashboardRecentOrderRowToOrderListItem(row);
      if (li.lineItems.length === 0) return;
      void quoteRequest.openFromOrderDetailHeader(li, li.lineItems);
    },
    [quoteRequest]
  );

  if (!fields) {
    return (
      <div
        className={`component recent-order-widget ${paramsStyles ?? ""}`.trim()}
        id={id}
        data-testid={testId}
      >
        <div className="component-content">
          <span className="is-empty-hint">Recent orders</span>
        </div>
      </div>
    );
  }

  if (!showSection) {
    return null;
  }

  const hasOrders = orders.length > 0;

  const onViewAllClickCapture = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isEditing || !hasOrders) return;
      const t = e.target as HTMLElement | null;
      if (!t?.closest("a")) return;
      trackDashboardRecentOrdersViewAll();
    },
    [isEditing, hasOrders]
  );

  const docPanelOpen =
    Boolean(docOrderRow) &&
    documentRequestPanelFields != null &&
    docRequestPanelLines.length > 0 &&
    canRequestDocumentation;

  const docMulti = docRequestPanelLines.length > 1;

  return (
    <>
      <section
        className={`component recent-order-widget ${paramsStyles ?? ""}`.trim()}
        id={id}
        data-testid={testId}
        aria-label={String(fields.SectionTitle?.value ?? "Recent orders")}
      >
        <div className="overflow-hidden rounded-lg border border-[var(--color-gray-200,#e8eaeb)] bg-white p-px">
          <div className="flex min-h-[61px] flex-wrap shrink-0 items-center justify-between gap-3 border-b border-[var(--color-gray-200,#e8eaeb)] px-[20px] pb-[16px] pt-[20px]">
            <div className="flex min-h-0 min-w-0 items-center gap-[8px]">
              {fields.SectionTitle?.value ? (
                <h2 className={"shrink-0 text-[16px] font-[500] leading-[1.38] text-black m-[0px]"}>
                  <Text field={fields.SectionTitle} tag="span" />
                </h2>
              ) : null}
              {recentWindowLabel ? (
                <span
                  className={
                    "shrink-0 text-[12px] font-[400] italic leading-[1.38] text-[var(--color-text-secondary)]"
                  }
                >
                  {recentWindowLabel}
                </span>
              ) : null}
            </div>
            {hasViewAll && viewAllField ? (
              <div onClickCapture={onViewAllClickCapture}>
                {isEditing ? (
                  <span
                    className={`${"shrink-0 text-[13px] font-bold leading-tight text-[var(--color-link-text)] no-underline hover:underline"} ${"inline-flex items-center gap-1"}`}
                  >
                    <LinkRender
                      field={viewAllField}
                      className={
                        "shrink-0 text-[13px] font-bold leading-tight text-[var(--color-link-text)] no-underline hover:underline"
                      }
                      editable
                    />
                    <Icon
                      icon={faChevronRight}
                      className={"text-[10px] text-[var(--color-link-text)]"}
                      aria-hidden
                    />
                  </span>
                ) : (
                  <LinkRender
                    field={viewAllField}
                    className={`${"shrink-0 text-[13px] font-bold leading-tight text-[var(--color-link-text)] no-underline hover:underline"} ${"inline-flex items-center gap-1"}`}
                    editable={false}
                    showLinkTextWithChildrenPresent
                  >
                    <Icon
                      icon={faChevronRight}
                      className={"text-[10px] text-[var(--color-link-text)]"}
                      aria-hidden
                    />
                  </LinkRender>
                )}
              </div>
            ) : null}
          </div>

          <div className={"flex flex-col"}>
            {loading ? (
              <div className={"animate-pulse space-y-3 px-4 py-4"} aria-busy="true">
                <div className={"h-4 rounded bg-[var(--color-gray-200,#e8e8e8)]"} />
                <div className={"h-4 rounded bg-[var(--color-gray-200,#e8e8e8)]"} />
                <div className={"h-4 rounded bg-[var(--color-gray-200,#e8e8e8)]"} />
              </div>
            ) : error ? (
              <DashboardRecentWidgetListState
                fields={fields}
                variant="error"
                onRetry={() => void refetch()}
              />
            ) : !hasOrders ? (
              <DashboardRecentWidgetListState fields={fields} variant="empty" />
            ) : (
              orders.map((row) => {
                const href = localizeHref(
                  `/orders-management/orders/${encodeURIComponent(String(row.orderHeaderId))}`,
                  activeLocale
                );
                const badgeV = orderBadgeVariant(row);
                const iconField = statusIconField(row, fields.PlacedIcon, fields.ShippedIcon);
                const totalDisplay = formatOrderDetailMoneyForDisplay(
                  { ...row.totalAmount, displayValue: row.totalAmount.displayValue ?? "" },
                  activeLocale
                );
                const poLine = formatPoLineForWidget(row.poNumber);
                const orderLine = `Order #${row.orderNumber}`;
                const hasActionableOrderLines =
                  mapDashboardRecentOrderRowToOrderListItem(row).lineItems.length > 0;
                const orderInQuoteDraft = quoteRequest.isOrderHeaderInOrderQuoteDraft(
                  String(row.orderHeaderId)
                );

                return (
                  <div
                    key={`${row.orderHeaderId}-${row.orderNumber}`}
                    className={
                      "flex items-center border-b border-[var(--color-gray-200,#e8eaeb)] bg-white py-[10px] pr-[14px] pl-[18px] last:border-b-0 transition-colors hover:bg-[var(--color-gray-50,#fafafa)]"
                    }
                  >
                    <Link
                      href={href}
                      className={
                        "flex min-w-0 flex-1 items-start gap-[10.5px] no-underline text-inherit outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-primary)]"
                      }
                      onClick={() => {
                        stashOrderDetailEntryPoint("Direct_URL");
                        if (!isEditing) {
                          trackDashboardRecentOrderRowClick({
                            orderNumber: String(row.orderNumber),
                            orderStatus: orderBadgeLabel(row),
                          });
                        }
                      }}
                    >
                      <div
                        className={"flex min-w-0 flex-1 flex-col items-start justify-center gap-0"}
                      >
                        <div
                          className={
                            "whitespace-pre-wrap text-left text-[12px] font-[500] leading-[1.38] text-black"
                          }
                        >
                          {poLine}
                          <span className={"font-medium text-black"}>{"  |  "}</span>
                          {orderLine}
                        </div>
                        <div
                          className={
                            "flex flex-wrap items-center gap-[4px] text-[10.5px] font-[400] leading-[14px] text-[var(--color-text-placeholder)]"
                          }
                        >
                          <span>
                            {row.itemsCount} {row.itemsCount === 1 ? "Item" : "Items"}
                          </span>
                          <span
                            className={
                              "inline-flex min-w-[12px] items-center justify-center px-0.5 text-[12px] leading-tight text-[var(--color-gray-600,#7a7b7f)]"
                            }
                            aria-hidden
                          >
                            •
                          </span>
                          <span>{formatPlacedLabel(row.orderDate, activeLocale)}</span>
                        </div>
                      </div>
                      <div className={"flex w-[101px] shrink-0 flex-col items-end"}>
                        <div
                          className={`${"flex items-center gap-[4px] py-[5px]"} ${asideStatusClassForTone(getRecentOrderAsideStatusTone(badgeV))}`}
                        >
                          <RenderStatusIcon variant={badgeV} cmsField={iconField} />
                          <span className={"text-[12px] font-[500] leading-none whitespace-nowrap"}>
                            {orderBadgeLabel(row)}
                          </span>
                        </div>
                        <div
                          className={
                            "w-full max-w-[101px] text-right text-[10.5px] font-normal leading-[14px] text-[var(--color-gray-600,#7a7b7f)]"
                          }
                        >
                          {totalDisplay}
                        </div>
                      </div>
                    </Link>
                    <div className={"flex shrink-0 items-start gap-[10.5px] pl-[21px]"}>
                      <DashboardRecentRowMenu
                        variant="order"
                        quoteSelection={fields}
                        isEditing={isEditing}
                        hasActionableOrderLines={hasActionableOrderLines}
                        quoteRequestIsModifyMode={orderInQuoteDraft}
                        onRequestDocument={() => openDocFromRow(row)}
                        onRequestQuote={() => openQuoteFromRow(row)}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {docPanelOpen && documentRequestPanelFields && docOrderRow ? (
        <DocumentRequestPanel
          key={`recent-order-doc-${docOrderRow.orderHeaderId}-${docRequestPanelLines.length}`}
          isOpen
          onClose={closeDocRequest}
          fields={documentRequestPanelFields}
          entryPoint={docMulti ? "EP2a" : "EP2b"}
          layoutMode={docMulti ? "multi" : "single"}
          poNumber={String(docOrderRow.poNumber ?? "").trim() || "—"}
          orderNumber={String(docOrderRow.orderNumber)}
          initialLines={docRequestPanelLines}
        />
      ) : null}
      {accountId && canInitiateRfq ? <QuoteRequestDrawer qr={quoteRequest} /> : null}
    </>
  );
}
