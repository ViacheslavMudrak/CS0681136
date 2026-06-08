"use client";

import { NextImage, Text, type ImageField } from "@sitecore-content-sdk/nextjs";
import { faCheck, faChevronRight, faClock, faStopwatch } from "@fortawesome/free-solid-svg-icons";
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
import type { DashboardRecentQuoteRow } from "@/lib/apis/dashboard-recent-data-api";
import type { ComponentProps } from "@/lib/component-props";
import {
  trackDashboardRecentQuoteRowClick,
  trackDashboardRecentQuotesViewAll,
} from "@/lib/dashboardAnalytics";
import type { SitecoreDocumentRequestSelectionFieldValue } from "@/lib/document-request-cms.types";
import { mapQuoteSelectionToDocumentRequestPanelFields } from "@/lib/documentRequestCmsMapping";
import { orderListLinesToDocumentRequestUiLines } from "@/lib/documentRequestMappings";
import type { IDocumentRequestPanelFields } from "@/lib/document-request-panel-types";
import {
  expiresSubline,
  fetchOrderLinesForRecentQuoteRow,
  formatCreatedLabel,
  formatQuoteNumberDisplay,
  isQuoteExpiredRow,
  isQuoteReadyStatus,
  quoteWidgetStatusIconField,
  recentQuoteRowCanLoadOrderLines,
  resolveRecentQuoteOrderHeaderId,
  resolveRecentWidgetDateRangeFromCms,
} from "@/lib/dashboard-recent-widgets.util";
import { localizeHref } from "@/lib/locale-path";
import {
  trackOrderDetailDocRequestInitiated,
  trackOrderDetailQuoteRequestInitiated,
} from "@/lib/orderDetailAnalytics";
import { toOrderManagementLinkFieldWithHref } from "@/lib/orderManagementUtils";
import { PERMISSION_CODES } from "@/lib/permission-codes";
import { usePermissionContext } from "@/lib/permission-context";
import { useProfileContext } from "@/lib/profile-context";
import { stashQuoteDetailEntryPoint } from "@/lib/quote-detail-entry-point";
import { quoteSyntheticOrderHeaderId } from "@/lib/quote-detail-synthetic-order";

import { cn } from "@/lib/utils";

import type { IRecentQuoteWidgetFields } from "../RecentQuoteWidget.type";

interface Props {
  testId: string;
  fields: IRecentQuoteWidgetFields | null;
  params: ComponentProps["params"];
  page: ComponentProps["page"];
}

type DocQuoteContext = {
  loading: boolean;
  poNumber: string;
  orderNumber: string;
  lines: ReturnType<typeof orderListLinesToDocumentRequestUiLines>;
};

function QuoteStatusGlyph({
  expired,
  readyLike,
  cmsField,
}: {
  expired: boolean;
  readyLike: boolean;
  cmsField: ImageField | undefined;
}): React.ReactElement {
  if (cmsField?.value?.src) {
    return (
      <NextImage
        field={cmsField}
        width={10}
        height={10}
        className={"size-[10px] shrink-0 object-contain"}
        sizes="12px"
        aria-hidden
      />
    );
  }
  if (expired) {
    return (
      <Icon
        icon={faStopwatch}
        className={"size-[10px] shrink-0 text-[10px] text-[currentcolor]"}
        width={10}
        height={10}
        aria-hidden
      />
    );
  }
  if (readyLike) {
    return (
      <Icon
        icon={faCheck}
        className={"size-[10px] shrink-0 text-[10px] text-[currentcolor]"}
        width={10}
        height={10}
        aria-hidden
      />
    );
  }
  return (
    <Icon
      icon={faClock}
      className={"size-[10px] shrink-0 text-[10px] text-[currentcolor]"}
      width={10}
      height={10}
      aria-hidden
    />
  );
}

export function RecentQuoteWidgetDefaultVariant({
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
  const { loading, error, data, refetch, registerQuoteCount, registerQuoteDays } =
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
    registerQuoteCount(maxItems);
    registerQuoteDays(recentDateRange.days);
    return () => {
      registerQuoteCount(null);
      registerQuoteDays(null);
    };
  }, [fields, maxItems, recentDateRange.days, registerQuoteCount, registerQuoteDays]);

  const quotes = useMemo(() => {
    const list = data?.quotes?.quotes ?? [];
    return list.slice(0, maxItems);
  }, [data?.quotes?.quotes, maxItems]);

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
    fields: fields ?? ({} as IRecentQuoteWidgetFields),
    hasOrdersHistory: true,
    ordersTabHref,
  });

  const [docCtx, setDocCtx] = useState<DocQuoteContext | null>(null);
  const closeDocRequest = useCallback(() => setDocCtx(null), []);

  const documentRequestPanelFields = useMemo((): IDocumentRequestPanelFields | null => {
    if (!fields) return null;
    const fromCms = mapQuoteSelectionToDocumentRequestPanelFields(
      fields.QuoteSelection as SitecoreDocumentRequestSelectionFieldValue | null | undefined
    );
    return { ...fields, ...fromCms };
  }, [fields]);

  const openDocFromQuoteRow = useCallback(
    async (row: DashboardRecentQuoteRow) => {
      if (!accountNumeric) return;
      setDocCtx({
        loading: true,
        poNumber: "—",
        orderNumber: "—",
        lines: [],
      });
      const mapped = await fetchOrderLinesForRecentQuoteRow(row, accountNumeric);
      if (!mapped) {
        setDocCtx(null);
        return;
      }
      trackOrderDetailDocRequestInitiated({
        orderNumber: String(mapped.order.orderNumber),
        initiationPoint: "Order_Header",
      });
      setDocCtx({
        loading: false,
        poNumber: String(mapped.order.poNumber ?? "").trim() || "—",
        orderNumber: String(mapped.order.orderNumber),
        lines: orderListLinesToDocumentRequestUiLines(mapped.lines),
      });
    },
    [accountNumeric]
  );

  const openQuoteFromQuoteRow = useCallback(
    (row: DashboardRecentQuoteRow) => {
      trackOrderDetailQuoteRequestInitiated({
        orderNumber: String(row.quoteId),
        initiationPoint: "Order_Header",
      });
      const syntheticHeaderId = quoteSyntheticOrderHeaderId(row.quoteId);
      const resolvedOrderHeaderId = resolveRecentQuoteOrderHeaderId(row);
      if (quoteRequest.isOrderHeaderInOrderQuoteDraft(syntheticHeaderId)) {
        quoteRequest.openOrderQuoteDraftForReview(syntheticHeaderId, {
          orderNumber: row.quoteId,
        });
        return;
      }
      if (
        resolvedOrderHeaderId != null &&
        quoteRequest.isOrderHeaderInOrderQuoteDraft(resolvedOrderHeaderId)
      ) {
        quoteRequest.openOrderQuoteDraftForReview(resolvedOrderHeaderId, {
          orderNumber: row.quoteId,
        });
        return;
      }
      if (!resolvedOrderHeaderId) return;
      void quoteRequest.openFromQuoteDetailAllLinesWithFetch(
        row.quoteId,
        row.quoteId,
        resolvedOrderHeaderId
      );
    },
    [quoteRequest]
  );

  if (!fields) {
    return (
      <div
        className={`component recent-quote-widget ${paramsStyles ?? ""}`.trim()}
        id={id}
        data-testid={testId}
      >
        <div className="component-content">
          <span className="is-empty-hint">Recent quotes</span>
        </div>
      </div>
    );
  }

  if (!showSection) {
    return null;
  }

  const hasQuotes = quotes.length > 0;

  const onViewAllClickCapture = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isEditing || !hasQuotes) return;
      const t = e.target as HTMLElement | null;
      if (!t?.closest("a")) return;
      trackDashboardRecentQuotesViewAll();
    },
    [isEditing, hasQuotes]
  );

  const docPanelOpen =
    docCtx != null &&
    documentRequestPanelFields != null &&
    canRequestDocumentation &&
    (docCtx.loading || docCtx.lines.length > 0);

  const docMulti = !docCtx?.loading && (docCtx?.lines.length ?? 0) > 1;

  return (
    <>
      <section
        className={`component recent-quote-widget ${paramsStyles ?? ""}`.trim()}
        id={id}
        data-testid={testId}
        aria-label={String(fields.SectionTitle?.value ?? "Recent quotes")}
      >
        <div
          className={
            "overflow-hidden rounded-lg border border-[var(--color-gray-200,#e8eaeb)] bg-white p-px"
          }
        >
          <div
            className={
              "flex min-h-[61px] flex-wrap shrink-0 items-center justify-between gap-3 border-b border-[var(--color-gray-200,#e8eaeb)] px-[20px] pt-[20px] pb-[16px]"
            }
          >
            <div className={"flex min-h-0 min-w-0 items-center gap-[8px]"}>
              {fields.SectionTitle?.value ? (
                <h2 className={"shrink-0 text-[16px] font-[500] leading-[1.38] text-black m-[0px]"}>
                  <Text field={fields.SectionTitle} tag="span" />
                </h2>
              ) : (
                <h2 className={"shrink-0 text-[16px] font-[500] leading-[1.38] text-black m-[0px]"}>
                  Recent quotes
                </h2>
              )}
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
            ) : !hasQuotes ? (
              <DashboardRecentWidgetListState fields={fields} variant="empty" />
            ) : (
              quotes.map((row) => {
                const routeId = (row.quoteHeaderId?.trim() || row.quoteId).trim();
                const href = localizeHref(
                  `/orders-management/quotes/${encodeURIComponent(routeId)}`,
                  activeLocale
                );
                const expired = isQuoteExpiredRow(row);
                const readyLike = isQuoteReadyStatus(row);
                const iconField = quoteWidgetStatusIconField(
                  row,
                  fields.ReadyIcon,
                  fields.ExpiredIcon
                );
                const sub = expiresSubline(row, activeLocale);
                const contact = (row.contactPersonName ?? row.description ?? "").trim();
                const quoteDisplay = formatQuoteNumberDisplay(row.quoteId);
                const statusLabel = expired ? "Expired" : (row.status ?? "").trim() || "—";
                const hasActionableOrderLines = recentQuoteRowCanLoadOrderLines(row);
                const resolvedOrderHeaderId = resolveRecentQuoteOrderHeaderId(row);
                const quoteInDraft =
                  quoteRequest.isOrderHeaderInOrderQuoteDraft(
                    quoteSyntheticOrderHeaderId(row.quoteId)
                  ) ||
                  (resolvedOrderHeaderId != null &&
                    quoteRequest.isOrderHeaderInOrderQuoteDraft(resolvedOrderHeaderId));

                return (
                  <div
                    key={String(row.quoteId)}
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
                        stashQuoteDetailEntryPoint(
                          "Direct_URL",
                          `${window.location.pathname}${window.location.search}`
                        );
                        if (!isEditing) {
                          trackDashboardRecentQuoteRowClick({
                            quoteStatus: expired ? "expired" : "ready",
                          });
                        }
                      }}
                    >
                      <div
                        className={"flex min-w-0 flex-1 flex-col items-start justify-center gap-0"}
                      >
                        <div className="whitespace-pre-wrap text-left text-[12px] font-[500] leading-[1.38] text-black">
                          {quoteDisplay}
                        </div>
                        <div
                          className={
                            "flex flex-wrap items-center gap-[4px] text-[10.5px] font-[400] leading-[14px] text-[var(--color-text-placeholder)]"
                          }
                        >
                          {contact ? (
                            <>
                              <span>{contact}</span>
                              <span
                                className={
                                  "inline-flex min-w-[12px] items-center justify-center px-0.5 text-[12px] leading-tight text-[var(--color-gray-600,#7a7b7f)]"
                                }
                                aria-hidden
                              >
                                •
                              </span>
                            </>
                          ) : null}
                          <span>{formatCreatedLabel(row.quoteDate, activeLocale)}</span>
                        </div>
                      </div>
                      <div className={"flex w-[101px] shrink-0 flex-col items-end"}>
                        <div
                          className={cn(
                            "flex items-center gap-[4px] py-[5px]",
                            expired
                              ? "text-[var(--color-red-dark,#b42318)]"
                              : readyLike
                                ? "text-[var(--color-cyan-dark,#00708d)]"
                                : "text-[var(--color-gray-700,#646467)]"
                          )}
                        >
                          <QuoteStatusGlyph
                            expired={expired}
                            readyLike={readyLike}
                            cmsField={iconField}
                          />
                          <span className={"text-[12px] font-[500] leading-none whitespace-nowrap"}>
                            {statusLabel}
                          </span>
                        </div>
                        {sub ? (
                          <div className="w-full max-w-[101px] text-right text-[10.5px] font-normal leading-[14px] text-[var(--color-gray-600,#7a7b7f)] [font-family:var(--font-helvetica-neue-lt-web),'Helvetica_Neue',sans-serif]">
                            {sub}
                          </div>
                        ) : null}
                      </div>
                    </Link>
                    <div className={"flex shrink-0 items-start gap-[10.5px] pl-[21px]"}>
                      <DashboardRecentRowMenu
                        variant="quote"
                        quoteSelection={fields}
                        isEditing={isEditing}
                        quoteExpired={expired}
                        hasActionableOrderLines={hasActionableOrderLines}
                        quoteRequestIsModifyMode={quoteInDraft}
                        onRequestDocument={() => {
                          void openDocFromQuoteRow(row);
                        }}
                        onRequestQuote={() => openQuoteFromQuoteRow(row)}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {docPanelOpen && documentRequestPanelFields && docCtx ? (
        <DocumentRequestPanel
          key={`recent-quote-doc-${docCtx.orderNumber}-${docCtx.loading ? "loading" : docCtx.lines.length}`}
          isOpen
          onClose={closeDocRequest}
          fields={documentRequestPanelFields}
          entryPoint={docMulti ? "EP2a" : "EP2b"}
          layoutMode={docMulti ? "multi" : "single"}
          poNumber={docCtx.poNumber}
          orderNumber={docCtx.orderNumber}
          initialLines={docCtx.lines}
          isLoading={docCtx.loading}
        />
      ) : null}
      {accountId && canInitiateRfq ? <QuoteRequestDrawer qr={quoteRequest} /> : null}
    </>
  );
}
