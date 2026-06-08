"use client";

import { Image as SitecoreImage, RichText } from "@sitecore-content-sdk/nextjs";
import {
  faCalendarDays,
  faChevronDown,
  faChevronUp,
  faCircleQuestion,
  faEllipsisVertical,
} from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import { useOktaAuth } from "@okta/okta-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import type { ImageField } from "@sitecore-content-sdk/nextjs";

import type { ComponentProps } from "@/lib/component-props";
import { DocumentRequestPanel } from "@/components/shared/document-request-panel/DocumentRequestPanel";
import { QuoteRequestDrawer } from "@/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestDrawer";
import { PortalShellMainSkeleton } from "@/components/shared/portal-loading/PortalShellChromeLoading";
import Button from "@/components/ui/Button";
import Link from "@/components/ui/Link";
import { useActiveLocale } from "@/hooks/use-active-locale";
import { useCompactPhoneViewport } from "@/hooks/use-compact-phone-viewport";
import useDeviceType from "@/hooks/use-device-type";
import { useQuoteDetail } from "@/hooks/useQuoteDetail";
import { useQuoteRequest } from "@/hooks/useQuoteRequest";
import type { SitecoreDocumentRequestSelectionFieldValue } from "@/lib/document-request-cms.types";
import { mapQuoteSelectionToDocumentRequestPanelFields } from "@/lib/documentRequestCmsMapping";
import type { IDocumentRequestPanelFields } from "@/lib/document-request-panel-types";
import { quoteDetailLinesToDocumentRequestUiLines } from "@/lib/documentRequestMappings";
import { getPathWithoutLocale } from "@/lib/locale-cookie";
import { localizeHref } from "@/lib/locale-path";
import {
  buildQuoteDetailAnalyticsContext,
  mapQuoteStatus,
} from "@/lib/quote-detail-analytics-utils";
import {
  trackQuoteDetailContactEmailClick,
  trackQuoteDetailExpandAllToggle,
  trackQuoteDetailExpiredPanelRfqClick,
  trackQuoteDetailItemMenuOpen,
  trackQuoteDetailLineItemToggle,
  trackQuoteDetailPageView,
  trackQuoteDetailRequestDocInitiated,
  trackQuoteDetailRequestDocsClick,
  trackQuoteDetailRequestQuoteInitiated,
  trackQuoteDetailRequestUpdatedQuoteClick,
  trackQuoteDetailSupportEmailClick,
} from "@/lib/quoteDetailAnalytics";
import { ORDERS_MANAGEMENT_QUOTES_TAB_HREF } from "@/lib/orderManagementUtils";
import {
  formatOrderDetailMoneyForDisplay,
  formatPartLabelLine,
  filterQuoteDetailActiveColumnsForExpired,
  isOrderDetailExtendedNetPriceColumnKey,
  isOrderDetailNetUnitPriceColumnKey,
  normalizeColumnValueKey,
  quoteDetailColumnAlignKind,
  quoteDetailColumnWidthKind,
} from "@/lib/orderDetailUtils";
import { renderOrderLineItemColumnValue } from "@/components/core/OrderDetail/partial/orderLineItemColumnValue";
import { PERMISSION_CODES } from "@/lib/permission-codes";
import { usePermissionContext } from "@/lib/permission-context";
import { useProfileContext } from "@/lib/profile-context";
import {
  clearQuoteDetailReturnHref,
  resolveQuoteDetailEntryPoint,
  resolveQuoteDetailReturnHref,
  scheduleQuoteDetailEntryPointSessionCleanup,
} from "@/lib/quote-detail-entry-point";
import { normalizeSectionTitleItemCountToken } from "@/lib/quote-detail-cms-fields";
import { quoteViewLinesToOrderLineItems } from "@/lib/quote-detail-mapper";
import useClickOutside from "@/hooks/useClickOutside";

import type {
  OrderDetailActiveColumnItem,
  OrderDetailLineItem,
} from "@/components/core/OrderDetail/OrderDetail.type";
import type { IQuoteDetailFields } from "../QuoteDetail.type";
import { QuoteDetailEmptyState } from "../partial/QuoteDetailEmptyState";
import { QuoteDetailHeader } from "../partial/QuoteDetailHeader";
import { cn } from "@/lib/utils";

const DEFAULT_ACTIVE_COLUMNS: OrderDetailActiveColumnItem[] = [
  { id: "quote-col-qty", fields: { Value: { value: "QUANTITY (EACH)" } } },
  { id: "quote-col-net", fields: { Value: { value: "NET UNIT PRICE" } } },
  { id: "quote-col-ext", fields: { Value: { value: "EXTENDED NET PRICE" } } },
];

function QuoteDetailKebabIcon(): React.ReactElement {
  return (
    <svg
      width="2"
      height="9"
      viewBox="0 0 2 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M1.875 0.9375C1.875 1.46484 1.46484 1.875 0.9375 1.875C0.410156 1.875 0 1.46484 0 0.9375C0 0.410156 0.410156 0 0.9375 0C1.46484 0 1.875 0.410156 1.875 0.9375ZM0 4.375C0 3.86719 0.429688 3.4375 0.9375 3.4375C1.46484 3.4375 1.875 3.86719 1.875 4.375C1.875 4.90234 1.46484 5.3125 0.9375 5.3125C0.429688 5.3125 0 4.90234 0 4.375ZM1.875 7.8125C1.875 8.33984 1.46484 8.75 0.9375 8.75C0.429688 8.75 0 8.33984 0 7.8125C0 7.30469 0.429688 6.875 0.9375 6.875C1.46484 6.875 1.875 7.30469 1.875 7.8125Z"
        fill="currentColor"
      />
    </svg>
  );
}

function QuoteDetailExpandIcon({
  className,
  color = "currentColor",
}: {
  className?: string;
  color?: string;
}): React.ReactElement {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 9 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <path
        d="M4.10156 8.49609L0.195312 4.58984C0 4.41406 0 4.12109 0.195312 3.92578C0.371094 3.75 0.664062 3.75 0.859375 3.92578L4.43359 7.5L8.00781 3.92578C8.18359 3.75 8.47656 3.75 8.65234 3.92578C8.84766 4.10156 8.84766 4.41406 8.65234 4.58984L4.74609 8.49609C4.57031 8.67188 4.27734 8.67188 4.10156 8.49609ZM0.195312 0.839844C0 0.664062 0 0.371094 0.195312 0.175781C0.371094 0 0.664062 0 0.859375 0.175781L4.43359 3.75L8.00781 0.175781C8.18359 0 8.47656 0 8.65234 0.175781C8.84766 0.351562 8.84766 0.664062 8.65234 0.839844L4.74609 4.74609C4.57031 4.92188 4.27734 4.92188 4.10156 4.74609L0.195312 0.839844Z"
        fill={color}
      />
    </svg>
  );
}

function QuoteDetailCollapseIcon(props: {
  className?: string;
  color?: string;
}): React.ReactElement {
  return <QuoteDetailExpandIcon {...props} className={cn("rotate-180", props.className)} />;
}

interface QuoteDetailLineDescriptionProps {
  description: string;
  index: number;
  isExpanded: boolean;
  useMobileTypography?: boolean;
  descriptionId?: string;
  onExpandableChange: (index: number, isExpandable: boolean) => void;
  onToggle: (index: number) => void;
}

function QuoteDetailLineDescription({
  description,
  index,
  isExpanded,
  useMobileTypography = false,
  descriptionId,
  onExpandableChange,
  onToggle,
}: QuoteDetailLineDescriptionProps): React.ReactElement {
  const descRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const el = descRef.current;
    if (!el) {
      onExpandableChange(index, false);
      return;
    }

    const updateOverflow = () => {
      const nextIsOverflowing = el.scrollHeight > el.clientHeight;
      setIsOverflowing(nextIsOverflowing);
      onExpandableChange(index, nextIsOverflowing || isExpanded);
    };

    updateOverflow();

    if (typeof ResizeObserver === "undefined") {
      return () => onExpandableChange(index, false);
    }

    const observer = new ResizeObserver(updateOverflow);
    observer.observe(el);

    return () => {
      observer.disconnect();
      onExpandableChange(index, false);
    };
  }, [description, index, isExpanded, onExpandableChange]);

  const showToggle = isOverflowing || isExpanded;

  return (
    <div
      className={cn(
        "mt-[2px] flex min-w-0 items-end gap-[6px]",
        !useMobileTypography && "md:gap-[2px]",
        isExpanded && "items-start",
        useMobileTypography && "mt-[2px] gap-[6px]"
      )}
    >
      <div
        id={descriptionId}
        ref={descRef}
        className={cn(
          "min-w-0 max-w-[calc(100%-32px)] text-[12px] font-[400] leading-[1.375] text-[#4D4D4F]",
          !useMobileTypography && "md:max-w-[calc(100%-16px)]",
          !isExpanded && "overflow-hidden line-clamp-2"
        )}
      >
        {description}
      </div>
      {showToggle ? (
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
          onPress={() => onToggle(index)}
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
  );
}

interface QuoteDetailDefaultVariantProps {
  testId: string;
  fields: IQuoteDetailFields | null;
  params: ComponentProps["params"];
  page: ComponentProps["page"];
}

type DocState = { mode: "closed" } | { mode: "multi" } | { mode: "single"; lineIndex: number };

function QuoteDetailDefaultVariantContent({
  fields,
  paramsStyles,
  renderingId,
  isEditing,
}: {
  fields: IQuoteDetailFields;
  paramsStyles: string;
  renderingId?: string;
  isEditing: boolean;
}): React.ReactElement {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const lastSegment = pathname.split("/").filter(Boolean).pop() ?? "";
  const quoteId =
    searchParams.get("quoteId") ??
    (lastSegment && lastSegment.toLowerCase() !== "quotes" ? lastSegment : "");

  const {
    can,
    isLoading: permissionLoading,
    hasResolved: permissionsHasResolved,
    sitecoreEditingPermissionBypass,
  } = usePermissionContext();
  const canInitiateRfq = isEditing || can(PERMISSION_CODES.INITIATE_RFQ);
  const canRequestDocumentation = isEditing || can(PERMISSION_CODES.REQUEST_DOCUMENTATION);
  const { selectedAccount } = useProfileContext();
  const oktaAuth = useOktaAuth();
  const loggedInEmail = (oktaAuth?.authState?.idToken?.claims?.email as string | undefined) ?? "";
  const accountId = selectedAccount?.id ?? "";
  const accountNumeric = Number.parseInt(String(accountId), 10) || 0;
  const activeLocale = useActiveLocale();
  const { isMobile } = useDeviceType();
  const isCompactPhoneViewport = useCompactPhoneViewport();
  const useStackedDetailLayout = isMobile || isCompactPhoneViewport;
  const locale =
    typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";

  const { data, loadFailed, notFound, isLoading, refetch } = useQuoteDetail({ quoteId, isEditing });

  const quotesTabHref = useMemo(
    () => localizeHref(ORDERS_MANAGEMENT_QUOTES_TAB_HREF, activeLocale),
    [activeLocale]
  );

  const quoteRequest = useQuoteRequest({
    accountId,
    accountNumeric,
    fields,
    hasOrdersHistory: true,
    ordersTabHref: quotesTabHref,
  });

  const [docState, setDocState] = useState<DocState>({ mode: "closed" });
  const closeDoc = useCallback(() => setDocState({ mode: "closed" }), []);

  const [expandedRows, setExpandedRows] = useState<Set<number>>(() => new Set());
  const [expandableRows, setExpandableRows] = useState<Set<number>>(() => new Set());
  const [openMenuRow, setOpenMenuRow] = useState<number | null>(null);
  const [lineMenuOpensUp, setLineMenuOpensUp] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const quoteDetailA11yId = useId();
  useClickOutside(menuRef, () => setOpenMenuRow(null), openMenuRow !== null);

  const updateLineMenuPlacement = useCallback((anchor: HTMLElement) => {
    const rect = anchor.getBoundingClientRect();
    const boundary = anchor.closest(".overflow-x-auto, .overflow-hidden") as HTMLElement | null;
    const boundaryBottom = boundary?.getBoundingClientRect().bottom ?? window.innerHeight;
    setLineMenuOpensUp(Math.min(boundaryBottom, window.innerHeight) - rect.bottom < 140);
  }, []);

  const initialAccountIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!accountId) return;
    if (initialAccountIdRef.current === null) {
      initialAccountIdRef.current = accountId;
      return;
    }
    if (initialAccountIdRef.current !== accountId) {
      router.replace(quotesTabHref);
    }
  }, [accountId, quotesTabHref, router]);

  useEffect(() => {
    if (isEditing || sitecoreEditingPermissionBypass) return;
    if (permissionLoading && !permissionsHasResolved) return;
    if (!canInitiateRfq) {
      router.replace(quotesTabHref);
    }
  }, [
    canInitiateRfq,
    isEditing,
    permissionLoading,
    permissionsHasResolved,
    quotesTabHref,
    router,
    sitecoreEditingPermissionBypass,
  ]);

  const isExpired = data?.statusKey === "order_expired";

  const quoteAnalytics = useMemo(() => {
    if (!data?.quoteNumber) return null;
    return buildQuoteDetailAnalyticsContext({
      quoteNumber: data.quoteNumber,
      statusKey: data.statusKey,
      itemsCount: data.lineItems?.length ?? 0,
      loggedInEmail,
      accountRepEmail: selectedAccount?.accountRepEmail,
    });
  }, [data, loggedInEmail, selectedAccount?.accountRepEmail]);

  const quoteStatus = quoteAnalytics?.quoteStatus ?? mapQuoteStatus(data?.statusKey ?? "");
  const headerContactName =
    (selectedAccount?.accountRep?.name ?? "").trim() || data?.contactName || "";
  const headerContactEmail =
    (selectedAccount?.accountRep?.email ?? "").trim() ||
    (selectedAccount?.accountRepEmail ?? "").trim() ||
    data?.contactEmail ||
    "";

  const trackedPageViewKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (!data?.quoteNumber || !quoteAnalytics) return;
    const pathForTracking = pathname ? getPathWithoutLocale(pathname) : "";
    if (!pathForTracking) return;
    const key = `${pathForTracking}::${data.quoteNumber}`;
    if (trackedPageViewKeyRef.current === key) return;
    trackedPageViewKeyRef.current = key;
    const entryPoint = resolveQuoteDetailEntryPoint();
    trackQuoteDetailPageView({
      quoteNumber: quoteAnalytics.quoteNumber,
      entryPoint,
      quoteStatus: quoteAnalytics.quoteStatus,
      userType: quoteAnalytics.userType,
      itemsCount: quoteAnalytics.itemsCount,
      pagePath: pathForTracking,
    });
    scheduleQuoteDetailEntryPointSessionCleanup();
  }, [data?.quoteNumber, pathname, quoteAnalytics]);

  const activeColumns = useMemo(() => {
    const cms = fields.ActiveColumnsSelection?.filter((c) => c?.fields) ?? [];
    const base = cms.length > 0 ? cms : isEditing ? DEFAULT_ACTIVE_COLUMNS : [];
    if (isExpired) {
      return filterQuoteDetailActiveColumnsForExpired(base);
    }
    return base;
  }, [fields.ActiveColumnsSelection, isExpired, isEditing]);

  const lineItems = data?.lineItems ?? [];

  const sectionTitle = useMemo(() => {
    let raw = (fields.SectionTitlePattern?.value ?? "").trim();
    raw = normalizeSectionTitleItemCountToken(raw);
    const count = String(lineItems.length);
    return raw.replace(/\{ITEM_COUNT\}/gi, count).replace(/\{count\}/gi, count);
  }, [fields.SectionTitlePattern?.value, lineItems.length]);

  const expandAllLabel = (fields.ExpandAllLabel?.value ?? "").trim();
  const collapseAllLabel = (fields.CollapseAllLabel?.value ?? "").trim();
  const expandableRowIndexes = useMemo(
    () =>
      [...expandableRows]
        .filter((index) => index >= 0 && index < lineItems.length)
        .sort((a, b) => a - b),
    [expandableRows, lineItems.length]
  );
  const hasExpandableRows = expandableRowIndexes.length > 0;
  const allExpanded =
    hasExpandableRows && expandableRowIndexes.every((index) => expandedRows.has(index));
  const expandToggleLabel = allExpanded
    ? collapseAllLabel || "Collapse"
    : expandAllLabel || "Expand";

  useEffect(() => {
    setExpandableRows((prev) => {
      const next = new Set([...prev].filter((index) => index >= 0 && index < lineItems.length));
      return next.size === prev.size ? prev : next;
    });
    setExpandedRows((prev) => {
      const next = new Set([...prev].filter((index) => index >= 0 && index < lineItems.length));
      return next.size === prev.size ? prev : next;
    });
  }, [lineItems.length]);

  useEffect(() => {
    setExpandedRows((prev) => {
      const next = new Set([...prev].filter((index) => expandableRows.has(index)));
      return next.size === prev.size ? prev : next;
    });
  }, [expandableRows]);

  const handleExpandableRowChange = useCallback((index: number, isExpandable: boolean) => {
    setExpandableRows((prev) => {
      const alreadyExpandable = prev.has(index);
      if (alreadyExpandable === isExpandable) return prev;

      const next = new Set(prev);
      if (isExpandable) {
        next.add(index);
      } else {
        next.delete(index);
      }
      return next;
    });
  }, []);

  const toggleExpandAll = useCallback(() => {
    const action = allExpanded ? "collapse_all" : "expand_all";
    trackQuoteDetailExpandAllToggle({ action, itemsCount: expandableRowIndexes.length });
    if (allExpanded) {
      setExpandedRows((prev) => {
        const next = new Set(prev);
        expandableRowIndexes.forEach((index) => next.delete(index));
        return next;
      });
    } else {
      setExpandedRows(new Set(expandableRowIndexes));
    }
  }, [allExpanded, expandableRowIndexes]);

  const toggleRow = useCallback((index: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const handleLineItemToggle = useCallback(
    (index: number, trigger: "chevron" | "row_click") => {
      const expanded = expandedRows.has(index);
      trackQuoteDetailLineItemToggle({
        action: expanded ? "collapse" : "expand",
        trigger,
      });
      toggleRow(index);
    },
    [expandedRows, toggleRow]
  );

  const handleKebabToggle = useCallback(
    (index: number) => {
      setOpenMenuRow((v) => {
        if (v !== index) {
          trackQuoteDetailItemMenuOpen({ quoteStatus });
        }
        return v === index ? null : index;
      });
    },
    [quoteStatus]
  );

  const documentRequestPanelFields = useMemo((): IDocumentRequestPanelFields => {
    const fromCms = mapQuoteSelectionToDocumentRequestPanelFields(
      (fields.DocumentSelection ?? fields.QuoteSelection) as
        | SitecoreDocumentRequestSelectionFieldValue
        | undefined
    );
    return { ...fields, ...fromCms } as IDocumentRequestPanelFields;
  }, [fields]);

  const docLines = useMemo(() => {
    if (!data || docState.mode === "closed") return [];
    if (docState.mode === "multi") {
      return quoteDetailLinesToDocumentRequestUiLines(data.lineItems, data.quoteId);
    }
    const item = data.lineItems[docState.lineIndex];
    if (!item) return [];
    return quoteDetailLinesToDocumentRequestUiLines([item], data.quoteId);
  }, [data, docState]);

  const hasSupportMessage = Boolean((fields.SupportInfoMessage?.value ?? "").trim());
  const supportInfoLinkValue = fields.SupportInfoLink?.value;
  const supportLinkLabelFromLinkField = (supportInfoLinkValue?.text ?? "").trim();
  const supportLinkLabelFallback = (fields.SupportInfoLinkLabel?.value ?? "").trim();
  const supportLinkDisplayText = supportLinkLabelFromLinkField || supportLinkLabelFallback;

  /** Same precedence as View My Profile support banner: CSR / account rep, then account support. */
  const supportContactEmail =
    (selectedAccount?.accountRepEmail ?? "").trim() || (selectedAccount?.supportEmail ?? "").trim();
  const cmsSupportLinkHref = (supportInfoLinkValue?.href ?? "").trim();
  const hasAccountMailto = Boolean(supportContactEmail);
  const accountMailtoHref = hasAccountMailto ? `mailto:${supportContactEmail}` : undefined;
  const supportPanelLinkHref =
    accountMailtoHref ?? (isEditing && cmsSupportLinkHref ? cmsSupportLinkHref : undefined);

  const showSupportPanel =
    Boolean(hasAccountMailto || isEditing) && Boolean(hasSupportMessage || supportLinkDisplayText);

  const handlePricingSupportContactClick = useCallback(() => {
    trackQuoteDetailSupportEmailClick();
  }, []);

  const openRequestAllLines = useCallback(() => {
    if (!data) return;
    const lines = quoteViewLinesToOrderLineItems(data.lineItems, data.quoteId);
    quoteRequest.openFromQuoteDetailAllLines(data.quoteId, data.quoteNumber, lines);
  }, [data, quoteRequest]);

  const handleRequestUpdatedQuote = useCallback(() => {
    if (!data) return;
    trackQuoteDetailRequestUpdatedQuoteClick({ itemsCount: data.lineItems.length });
    openRequestAllLines();
  }, [data, openRequestAllLines]);

  const handleRequestDocuments = useCallback(() => {
    trackQuoteDetailRequestDocsClick({ quoteStatus });
    setDocState({ mode: "multi" });
  }, [quoteStatus]);

  const handleExpiredPanelRfq = useCallback(() => {
    if (!data) return;
    trackQuoteDetailExpiredPanelRfqClick({ itemsCount: data.lineItems.length });
    openRequestAllLines();
  }, [data, openRequestAllLines]);

  const handleContactEmailClick = useCallback(() => {
    trackQuoteDetailContactEmailClick({ quoteStatus });
  }, [quoteStatus]);

  const handleBackToQuotes = useCallback(() => {
    const returnHref = resolveQuoteDetailReturnHref();
    if (returnHref) {
      clearQuoteDetailReturnHref();
      router.push(returnHref);
      return;
    }
    router.back();
  }, [router]);

  const openRequestSingleLine = useCallback(
    (index: number) => {
      if (!data) return;
      const lines = quoteViewLinesToOrderLineItems(data.lineItems, data.quoteId);
      const line = lines[index];
      if (!line) return;
      quoteRequest.openFromQuoteDetailSingleLine(data.quoteId, data.quoteNumber, line);
    },
    [data, quoteRequest]
  );

  type LineMenuAction = { key: string; label: string; icon?: ImageField; onPress: () => void };

  const lineMenuActions = useCallback(
    (rowIndex: number): LineMenuAction[] => {
      const out: LineMenuAction[] = [];
      if (isExpired && canInitiateRfq) {
        out.push({
          key: "rfq",
          label: (fields.KebabRequestQuoteLabel?.value ?? "").trim(),
          icon: fields.KebabRequestQuoteIcon,
          onPress: () => {
            setOpenMenuRow(null);
            trackQuoteDetailRequestQuoteInitiated();
            openRequestSingleLine(rowIndex);
          },
        });
      }
      if (canRequestDocumentation) {
        out.push({
          key: "doc",
          label: (fields.KebabRequestDocumentLabel?.value ?? "").trim(),
          icon: fields.KebabRequestDocumentIcon,
          onPress: () => {
            setOpenMenuRow(null);
            trackQuoteDetailRequestDocInitiated({ quoteStatus });
            setDocState({ mode: "single", lineIndex: rowIndex });
          },
        });
      }
      return out;
    },
    [canInitiateRfq, canRequestDocumentation, fields, isExpired, openRequestSingleLine, quoteStatus]
  );

  const showLineKebab = isExpired
    ? canInitiateRfq || canRequestDocumentation
    : canRequestDocumentation;

  const quoteDetailColWidthClass = (keyNorm: string): string => {
    switch (quoteDetailColumnWidthKind(keyNorm)) {
      case "qty":
        return "w-[56px]";
      case "price":
        return "w-[96px]";
      case "priceWide":
        return "w-[104px]";
      default:
        return "w-[72px]";
    }
  };

  const quoteDetailThAlignClass = (keyNorm: string): string => {
    switch (quoteDetailColumnAlignKind(keyNorm)) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "";
    }
  };

  const quoteDetailTdAlignClass = (keyNorm: string): string => {
    switch (quoteDetailColumnAlignKind(keyNorm)) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "";
    }
  };

  const renderExpandAllIcon = () =>
    allExpanded ? (
      <QuoteDetailCollapseIcon className="h-[9px] w-[9px] shrink-0" color="#00287B" />
    ) : (
      <QuoteDetailExpandIcon className="h-[9px] w-[9px] shrink-0" color="#00287B" />
    );

  const renderLinePrimary = (item: OrderDetailLineItem, useMobileTypography = false) => {
    const cust = formatPartLabelLine(fields.CustomerPartLabel, item.customerPartNumber);
    const intra = formatPartLabelLine(fields.IntraloxPartLabel, item.intraloxPartNumber);
    const primaryLine = [cust, intra].filter(Boolean).join(" | ");

    return (
      <>
        {primaryLine ? (
          <div
            className={cn(
              "text-[12px] font-[500] leading-[1.375] text-black",
              useMobileTypography && "leading-[1.375]"
            )}
          >
            {primaryLine}
          </div>
        ) : null}
      </>
    );
  };

  const renderDescription = (
    item: OrderDetailLineItem,
    index: number,
    isExpanded: boolean,
    useMobileTypography = false,
    descriptionId?: string
  ) => {
    const description = item.partDescription?.value ?? "";
    return (
      <QuoteDetailLineDescription
        description={description}
        index={index}
        isExpanded={isExpanded}
        useMobileTypography={useMobileTypography}
        descriptionId={descriptionId}
        onExpandableChange={handleExpandableRowChange}
        onToggle={(rowIndex) => handleLineItemToggle(rowIndex, "chevron")}
      />
    );
  };

  if (!isLoading && notFound) {
    return (
      <section className={`component quote-detail ${paramsStyles ?? ""}`.trim()} id={renderingId}>
        <div className="component-content">
          <div className="flex flex-col gap-[16px] md:gap-[24px] w-full min-w-0">
            <QuoteDetailEmptyState fields={fields} notFound onRetry={() => void refetch()} />
          </div>
        </div>
      </section>
    );
  }

  if (!isLoading && (loadFailed || !data)) {
    return (
      <section className={`component quote-detail ${paramsStyles ?? ""}`.trim()} id={renderingId}>
        <div className="component-content">
          <div className="flex flex-col gap-[16px] md:gap-[24px] w-full min-w-0">
            <QuoteDetailEmptyState
              fields={fields}
              loadFailed={loadFailed}
              onRetry={() => void refetch()}
            />
          </div>
        </div>
      </section>
    );
  }

  const pricingBlock =
    data && !isExpired ? (
      <div className="box-border flex flex-col gap-[16px] md:gap-[24px] rounded-[8px] border border-[var(--color-border-default)] bg-[var(--color-bg-basic-color)] p-[16px] md:p-[20px] w-full min-w-0 max-w-full">
        <h2 className="text-[16px] font-[500] leading-[1.38] text-[var(--color-text-black)] m-0">
          {(fields.PricingSectionTitle?.value ?? "").trim()}
        </h2>
        <div className="flex flex-col gap-[8px] w-full">
          <div className="flex justify-between items-center gap-[12px] w-full min-w-0">
            <span className="text-[12px] font-[400] leading-[1.38] text-[var(--color-text-placeholder)] shrink-0">
              {(fields.SubTotalLabel?.value ?? "").trim()}
            </span>
            <span className="text-[12px] font-normal leading-[1.375] text-[var(--color-text-black)] text-right">
              {formatOrderDetailMoneyForDisplay(data.orderSummary?.subTotal, locale)}
            </span>
          </div>
          <div className="flex justify-between items-center gap-[12px] w-full min-w-0">
            <span className="text-[12px] font-[400] leading-[1.38] text-[var(--color-text-placeholder)] shrink-0">
              {(fields.TaxLabel?.value ?? "").trim()}
            </span>
            <span className="text-[12px] font-normal leading-[1.375] text-[var(--color-text-black)] text-right">
              {formatOrderDetailMoneyForDisplay(data.orderSummary?.tax, locale)}
            </span>
          </div>
          <div className="flex justify-between items-end gap-[12px] w-full min-w-0">
            <span className="text-[14px] font-[500] leading-[1.38] text-[var(--color-text-heading-color)] shrink-0">
              {(fields.TotalLabel?.value ?? "").trim()}
            </span>
            <span className="flex-1 min-w-0 text-[16px] font-[500] leading-[1.5] text-[var(--color-text-heading-color)] text-right">
              {formatOrderDetailMoneyForDisplay(data.orderSummary?.totalAmount, locale)}
            </span>
          </div>
        </div>
        {showSupportPanel ? (
          <>
            <hr className="w-full h-px bg-[var(--color-border-default)] border-0 m-0 p-0" />
            <div className="m-0 flex w-full flex-row items-start gap-[6px] border-0 p-0">
              <div
                className="flex h-[18px] w-[18px] shrink-0 items-center justify-center"
                aria-hidden
              >
                {fields.SupportInfoIcon?.value?.src ? (
                  <SitecoreImage
                    field={fields.SupportInfoIcon}
                    width={18}
                    height={18}
                    sizes="18px"
                    className="h-[18px] w-[18px] object-contain"
                    alt={(fields.SupportInfoIcon.value.alt ?? "Support icon") as string}
                  />
                ) : (
                  <Icon icon={faCircleQuestion} width={15} className="text-[#479ebc]" />
                )}
              </div>
              <div className="m-0 min-w-0 flex-1 text-[12px] font-[400] leading-[1.375] text-[color:var(--color-text-black)] [&>*]:inline [&_.rich-text]:inline [&_div]:m-0 [&_div]:inline [&_p]:m-0 [&_p]:inline [font-family:var(--font-helvetica-neue-lt-web,'Helvetica_Neue',Arial,sans-serif)]">
                {fields.SupportInfoMessage && (hasSupportMessage || isEditing) ? (
                  <RichText
                    field={fields.SupportInfoMessage}
                    tag="div"
                    className="inline [&_p]:m-0 [&_p]:inline"
                  />
                ) : null}
                {supportLinkDisplayText ? (
                  <>
                    {hasSupportMessage || isEditing ? "\u00a0" : null}
                    {supportPanelLinkHref ? (
                      <Link
                        href={supportPanelLinkHref}
                        className="inline font-normal text-[color:var(--color-link-text)] no-underline hover:underline"
                        onClick={handlePricingSupportContactClick}
                      >
                        {supportLinkDisplayText}
                      </Link>
                    ) : (
                      <span className="inline font-normal text-[color:var(--color-link-text)] no-underline hover:underline">
                        {supportLinkDisplayText}
                      </span>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          </>
        ) : null}
      </div>
    ) : null;

  const expiredBlock =
    data && isExpired ? (
      <div className="box-border flex w-full min-w-0 max-w-full flex-col items-center justify-center gap-[24px] rounded-[8px] border border-[var(--color-border-default)] bg-[var(--color-bg-basic-color)] px-[40px] py-[32px] max-md:px-[24px] max-md:py-[32px]">
        <div className="mx-auto flex w-full max-w-[258px] flex-col items-center justify-center gap-[24px]">
          <div className="flex h-[24px] w-[24px] flex-none flex-row items-center justify-center">
            {fields.CostExpiredPanelIcon?.value?.src ? (
              <SitecoreImage
                field={fields.CostExpiredPanelIcon}
                width={28}
                height={28}
                sizes="28px"
                className="h-[28px] w-[25px] object-contain"
                alt=""
              />
            ) : (
              <Icon
                icon={faCalendarDays}
                width={28}
                height={28}
                className="flex-none text-[#479ebc]"
                aria-hidden
              />
            )}
          </div>
          {(fields.CostExpiredPanelHeading?.value ?? "").trim() ? (
            <h2 className="m-0 text-center text-[16px] font-[500] leading-[125%] text-[color:var(--color-text-heading-color)] [font-family:var(--font-helvetica-neue-lt-web,'Helvetica_Neue',Arial,sans-serif)]">
              {(fields.CostExpiredPanelHeading?.value ?? "").trim()}
            </h2>
          ) : null}
          <div className="flex w-full flex-col items-center gap-[14px] self-stretch">
            {(fields.CostExpiredPanelBody?.value ?? "").trim() ? (
              <RichText
                field={fields.CostExpiredPanelBody}
                tag="div"
                className="m-0 w-full text-center text-[14px] font-[400] leading-[137.5%] text-[color:var(--color-text-black)] [font-family:var(--font-helvetica-neue-lt-web,'Helvetica_Neue',Arial,sans-serif)] [&_p]:m-0"
              />
            ) : null}
            {(fields.CostExpiredPanelLinkLabel?.value ?? "").trim() ||
            (fields.CostExpiredPanelPostLinkText?.value ?? "").trim() ? (
              <div className="mt-[14px] w-full whitespace-normal text-center text-[14px] font-[400] leading-[137.5%] text-[color:var(--color-text-black)] [font-family:var(--font-helvetica-neue-lt-web,'Helvetica_Neue',Arial,sans-serif)] [overflow-wrap:anywhere]">
                {(fields.CostExpiredPanelLinkLabel?.value ?? "").trim() ? (
                  <Button
                    type="button"
                    variant="transparent"
                    className="!inline !min-h-0 !w-auto !min-w-0 !rounded-none !border-0 !bg-transparent !p-0 !shadow-none align-baseline text-[color:var(--color-primary-blue,#00287b)] no-underline hover:!bg-transparent hover:underline active:!bg-transparent [font:inherit] !leading-[inherit]"
                    onPress={() => handleExpiredPanelRfq()}
                  >
                    {(fields.CostExpiredPanelLinkLabel?.value ?? "").trim()}
                  </Button>
                ) : null}
                {(fields.CostExpiredPanelPostLinkText?.value ?? "").trim() ? (
                  <>
                    {(fields.CostExpiredPanelLinkLabel?.value ?? "").trim() ? " " : null}
                    <RichText
                      field={fields.CostExpiredPanelPostLinkText}
                      tag="span"
                      className="inline [&_p]:m-0 [&_p]:inline"
                    />
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    ) : null;

  const quotedDesktop = data ? (
    <div className="flex flex-col w-full min-w-0 max-w-full overflow-hidden border border-neutral-200 rounded-md bg-[var(--color-bg-basic-color)]">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-md">
        <div className="flex min-h-[27.5px] w-full items-center justify-between gap-4">
          <h2 className="m-0 text-[16px] font-[500] leading-[1.375] text-black">{sectionTitle}</h2>
          {hasExpandableRows ? (
            <Button
              type="button"
              variant="transparent"
              className="inline-flex flex-row !border border-neutral-100 rounded-sm items-center leading-[138%] gap-1.5 text-[12px] font-[500] text-[var(--color-action-primary)] bg-transparent border-0 cursor-pointer py-[5.25px] px-1.5 underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              onPress={() => toggleExpandAll()}
            >
              {renderExpandAllIcon()}
              {expandToggleLabel}
            </Button>
          ) : null}
        </div>
      </div>
      <div className="w-full min-w-0 max-w-full overflow-x-auto">
        <table className="w-full table-fixed border-collapse text-[14px]">
          <colgroup>
            <col className="w-auto" />
            {activeColumns.map((col) => {
              const keyNorm = normalizeColumnValueKey(col.fields?.Value?.value ?? col.displayName);
              return <col key={col.id} className={quoteDetailColWidthClass(keyNorm)} />;
            })}
            {showLineKebab ? <col className="w-[45px]" /> : null}
          </colgroup>
          <thead>
            <tr className="h-[40px] border-t border-[#EAEDF3] bg-[#F8FAFD]">
              <th
                className="h-[40px] min-w-0 break-words border-b border-[#EEEEF1] px-[16px] py-[8px] text-left text-[10px] font-[700] uppercase leading-[15px] tracking-[0.5px] text-[#7A7B7F] [overflow-wrap:anywhere]"
                scope="col"
              >
                {(fields.ColumnHeader?.value ?? "").trim()}
              </th>
              {activeColumns.map((col) => {
                const keyNorm = normalizeColumnValueKey(
                  col.fields?.Value?.value ?? col.displayName
                );
                return (
                  <th
                    key={col.id}
                    className={cn(
                      "h-[40px] whitespace-normal border-b border-[#EEEEF1] px-[8px] py-[6px] text-left text-[10px] font-[700] uppercase leading-[13px] tracking-[0.5px] text-[#7A7B7F] [text-wrap:balance]",
                      quoteDetailThAlignClass(keyNorm)
                    )}
                    scope="col"
                  >
                    {(
                      col.fields?.ColumnHeader?.value ??
                      col.displayName ??
                      col.fields?.Value?.value ??
                      ""
                    )
                      .trim()
                      .toString()}
                  </th>
                );
              })}
              {showLineKebab ? (
                <th
                  className="h-[40px] w-[45px] border-b border-[#EEEEF1] px-[12px] py-[8px] text-right align-middle text-[10px] font-[700] uppercase leading-[15px] tracking-[0.5px] text-[#7A7B7F]"
                  scope="col"
                >
                  <span className="sr-only">Actions</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => {
              const expanded = expandedRows.has(index);
              const actions = lineMenuActions(index);
              const descriptionId = `${quoteDetailA11yId}-desktop-line-${index}-description`;
              const menuId = `${quoteDetailA11yId}-desktop-line-${index}-actions`;
              return (
                <tr
                  key={`ql-${index}`}
                  className="h-[77px]"
                  aria-expanded={expanded}
                  aria-controls={descriptionId}
                >
                  <td className="min-w-0 break-words border-b border-[#EEEEF1] px-[16px] py-[12px] align-middle [overflow-wrap:anywhere]">
                    {renderLinePrimary(item)}
                    {renderDescription(item, index, expanded, false, descriptionId)}
                  </td>
                  {activeColumns.map((col) => {
                    const keyNorm = normalizeColumnValueKey(
                      col.fields?.Value?.value ?? col.displayName
                    );
                    return (
                      <td
                        key={col.id}
                        className={cn(
                          "border-b border-[#EEEEF1] px-[12px] py-[12px] align-middle text-[12px] font-[400] leading-[1.375] text-black",
                          quoteDetailTdAlignClass(keyNorm)
                        )}
                      >
                        {renderOrderLineItemColumnValue(keyNorm, item, locale)}
                      </td>
                    );
                  })}
                  {showLineKebab ? (
                    <td
                      className="w-[45px] border-b border-[#EEEEF1] px-[12px] py-[12px] text-right align-middle"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <div
                        className="relative inline-block"
                        ref={index === openMenuRow ? menuRef : undefined}
                        onPointerDownCapture={(e) => updateLineMenuPlacement(e.currentTarget)}
                        onKeyDownCapture={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            updateLineMenuPlacement(e.currentTarget);
                          }
                        }}
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          btnVariant="iconBtn"
                          className="inline-flex h-[24.5px] w-[26px] min-w-[26px] items-center justify-center rounded-[2px] bg-white p-[5.25px_6px] text-[#222222] shadow-[0_0_0_0.875px_rgba(18,43,105,0.08)]"
                          aria-label="Line actions"
                          aria-expanded={openMenuRow === index}
                          aria-controls={openMenuRow === index ? menuId : undefined}
                          onPress={() => handleKebabToggle(index)}
                        >
                          <QuoteDetailKebabIcon />
                        </Button>
                        {openMenuRow === index && actions.length > 0 ? (
                          <div
                            className={cn(
                              "absolute right-0 z-20 min-w-[180px] rounded-[6px] border border-[#ddd] bg-white py-[4px] shadow-[0_4px_12px_rgb(0_0_0_/_12%)]",
                              lineMenuOpensUp ? "bottom-full mb-[4px]" : "top-full mt-[4px]"
                            )}
                            role="menu"
                          >
                            {actions.map((a) => (
                              <Button
                                key={a.key}
                                type="button"
                                variant="transparent"
                                className="w-full px-[12px] py-[8px] text-left text-[13px] max-md:flex max-md:min-h-[44px] max-md:items-center"
                                role="menuitem"
                                onPress={a.onPress}
                              >
                                <span className="inline-flex items-center gap-[8px]">
                                  {a.icon?.value?.src ? (
                                    <SitecoreImage
                                      field={a.icon}
                                      width={16}
                                      height={16}
                                      sizes="16px"
                                      className="shrink-0 object-contain"
                                      alt=""
                                    />
                                  ) : null}
                                  {a.label}
                                </span>
                              </Button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  ) : null;

  const quotedMobile = data ? (
    <div className="box-border rounded-lg pt-[15px] pr-[15px] pb-[21px] pl-[15px] bg-[var(--color-bg-basic-color)] border border-neutral-200 w-full min-w-0 max-w-full">
      <div className="mb-[15px] flex min-h-[27.5px] flex-wrap items-center justify-between gap-[10px]">
        <h2 className="m-0 text-[16px] font-[500] leading-[1.375] text-black">{sectionTitle}</h2>
        {hasExpandableRows ? (
          <Button
            type="button"
            variant="transparent"
            className="inline-flex h-[27.5px] cursor-pointer items-center justify-center gap-[5.25px] rounded-[2px] border-0 bg-white px-[6px] py-[5.25px] text-[12px] font-[500] leading-[1.375] text-[#00287B] shadow-[0_0_0_0.875px_rgba(18,43,105,0.08)]"
            onPress={() => toggleExpandAll()}
          >
            {renderExpandAllIcon()}
            {expandToggleLabel}
          </Button>
        ) : null}
      </div>
      {lineItems.map((item, index) => {
        const expanded = expandedRows.has(index);
        const actions = lineMenuActions(index);
        const descriptionId = `${quoteDetailA11yId}-mobile-line-${index}-description`;
        const menuId = `${quoteDetailA11yId}-mobile-line-${index}-actions`;
        return (
          <div
            key={`qm-${index}`}
            className="mb-[15px] box-border rounded-[8px] border border-[#E8EAEB] bg-white p-[15px] last:mb-0"
            aria-expanded={expanded}
            aria-controls={descriptionId}
          >
            <div className="text-[10px] font-[700] leading-[15px] uppercase tracking-[0.5px] text-[#7A7B7F]">
              {(fields.ColumnHeader?.value ?? "").trim()}
            </div>
            {renderLinePrimary(item, true)}
            {renderDescription(item, index, expanded, true, descriptionId)}
            {activeColumns.map((col) => {
              const keyNorm = normalizeColumnValueKey(col.fields?.Value?.value ?? col.displayName);
              const label = (col.fields?.ColumnHeader?.value ?? col.displayName ?? "")
                .toString()
                .trim();
              const val =
                keyNorm.includes("QUANTITY") || keyNorm === "QTY"
                  ? (item.quantity?.value ?? "—")
                  : isOrderDetailNetUnitPriceColumnKey(keyNorm)
                    ? formatOrderDetailMoneyForDisplay(item.netUnitPrice, locale)
                    : isOrderDetailExtendedNetPriceColumnKey(keyNorm)
                      ? formatOrderDetailMoneyForDisplay(item.extendedNetPrice, locale)
                      : "—";
              return (
                <div
                  key={col.id}
                  className="mt-[12px] flex min-h-[27px] items-center gap-[7px] border-b border-[#E8EAEB] pb-[7px]"
                >
                  <span className="min-w-0 flex-1 text-[10px] font-[700] leading-[11px] uppercase tracking-[0.5px] text-[#7A7B7F]">
                    {label}
                  </span>
                  <span className="shrink-0 text-right text-[14px] font-[400] leading-[1.375] text-black">
                    {val}
                  </span>
                </div>
              );
            })}
            {showLineKebab ? (
              <div
                className="mt-[12px] flex items-start justify-end"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <div
                  className="relative inline-block"
                  ref={index === openMenuRow ? menuRef : undefined}
                  onPointerDownCapture={(e) => updateLineMenuPlacement(e.currentTarget)}
                  onKeyDownCapture={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      updateLineMenuPlacement(e.currentTarget);
                    }
                  }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    btnVariant="iconBtn"
                    className="inline-flex h-[24.5px] w-[26px] min-w-[26px] items-center justify-center rounded-[2px] bg-white p-[5.25px_6px] text-[#222222] shadow-[0_0_0_0.875px_rgba(18,43,105,0.08)]"
                    aria-label="Line actions"
                    aria-expanded={openMenuRow === index}
                    aria-controls={openMenuRow === index ? menuId : undefined}
                    onPress={() => handleKebabToggle(index)}
                  >
                    <QuoteDetailKebabIcon />
                  </Button>
                  {openMenuRow === index && actions.length > 0 ? (
                    <div
                      className={cn(
                        "absolute right-0 z-20 min-w-[180px] rounded-[6px] border border-[#ddd] bg-white py-[4px] shadow-[0_4px_12px_rgb(0_0_0_/_12%)]",
                        lineMenuOpensUp ? "bottom-full mb-[4px]" : "top-full mt-[4px]"
                      )}
                      role="menu"
                    >
                      {actions.map((a) => (
                        <Button
                          key={a.key}
                          type="button"
                          variant="transparent"
                          className="w-full px-[12px] py-[8px] text-left text-[13px] max-md:flex max-md:min-h-[44px] max-md:items-center"
                          role="menuitem"
                          onPress={a.onPress}
                        >
                          <span className="inline-flex items-center gap-[8px]">
                            {a.icon?.value?.src ? (
                              <SitecoreImage
                                field={a.icon}
                                width={16}
                                height={16}
                                sizes="16px"
                                className="shrink-0 object-contain"
                                alt=""
                              />
                            ) : null}
                            {a.label}
                          </span>
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  ) : null;

  return (
    <>
      {isLoading && !data ? (
        <section className={`component quote-detail ${paramsStyles ?? ""}`.trim()} id={renderingId}>
          <div className="component-content">
            <div className="flex flex-col gap-[16px] md:gap-[24px] w-full min-w-0" aria-busy="true">
              <PortalShellMainSkeleton />
            </div>
          </div>
        </section>
      ) : null}

      {data ? (
        <section className={`component quote-detail ${paramsStyles ?? ""}`.trim()} id={renderingId}>
          <div className="component-content">
            <div className="flex flex-col gap-[16px] md:gap-[24px] w-full min-w-0">
              <QuoteDetailHeader
                fields={fields}
                quoteNumber={data.quoteNumber}
                statusKey={data.statusKey}
                createdDateIso={data.createdDateIso}
                expiryDateIso={data.expiryDateIso}
                contactName={headerContactName}
                contactEmail={headerContactEmail}
                locale={locale}
                canRequestDocumentation={canRequestDocumentation}
                isExpired={isExpired}
                onRequestDocuments={handleRequestDocuments}
                onRequestUpdatedQuote={handleRequestUpdatedQuote}
                onContactEmailClick={handleContactEmailClick}
              />

              {useStackedDetailLayout ? (
                <div className="flex flex-col gap-[16px]">
                  {isExpired ? expiredBlock : pricingBlock}
                  {quotedMobile}
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:gap-[20px] gap-[24px] items-start w-full justify-between md:justify-start">
                  <div className="order-2 flex flex-col gap-[24px] w-full md:order-1 md:w-auto md:flex-1 md:min-w-0 lg:min-w-0 lg:flex-1">
                    {quotedDesktop}
                  </div>
                  <div className="order-1 flex flex-col gap-[16px] w-full md:order-2 md:w-[232px] md:max-w-[340px] md:shrink-0 lg:shrink-0">
                    {isExpired ? expiredBlock : pricingBlock}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {data && docState.mode !== "closed" && docLines.length > 0 ? (
        <DocumentRequestPanel
          key={docState.mode === "single" ? `qd-${docState.lineIndex}` : "qd-multi"}
          isOpen
          onClose={closeDoc}
          fields={documentRequestPanelFields}
          entryPoint={docState.mode === "multi" ? "EP2a" : "EP2b"}
          layoutMode={docState.mode === "multi" ? "multi" : "single"}
          poNumber=""
          orderNumber={data.quoteNumber}
          initialLines={docLines}
        />
      ) : null}

      {data && accountId && canInitiateRfq ? <QuoteRequestDrawer qr={quoteRequest} /> : null}
    </>
  );
}

const QuoteDetailDefaultVariantBase = ({
  testId,
  fields,
  params,
  page,
}: QuoteDetailDefaultVariantProps): React.ReactElement => {
  const { styles: ps, RenderingIdentifier: id } = params;
  if (!fields) {
    return (
      <div className={`component quote-detail ${ps ?? ""}`.trim()} id={id} data-testid={testId}>
        <div className="component-content">
          <span className="is-empty-hint">Quote Detail</span>
        </div>
      </div>
    );
  }

  return (
    <div data-testid={testId}>
      <QuoteDetailDefaultVariantContent
        fields={fields}
        paramsStyles={ps ?? ""}
        renderingId={id}
        isEditing={Boolean(page.mode.isEditing || page.mode.isPreview)}
      />
    </div>
  );
};

export const QuoteDetailDefaultVariant = React.memo(QuoteDetailDefaultVariantBase);
