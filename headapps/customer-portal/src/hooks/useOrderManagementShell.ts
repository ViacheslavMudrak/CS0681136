"use client";

import type {
  BeltSubgroupMetaRow,
  IOrderManagementFields,
  OrderManagementGridColumnItem,
} from "@/components/core/OrderManagement/OrderManagement.type";
import type { ComponentProps } from "@/lib/component-props";
import {
  DEFAULT_PAGE_SIZE,
  PRESET_NONE_ID,
} from "@/components/core/OrderManagement/orderManagementLabels";
import { getLocalTimeZone, today } from "@internationalized/date";
import { fetchInvoicesTabRemote } from "@/hooks/order-management/remote/fetchInvoicesTabRemote";
import { fetchOrdersTabRemote } from "@/hooks/order-management/remote/fetchOrdersTabRemote";
import { fetchQuotesTabRemote } from "@/hooks/order-management/remote/fetchQuotesTabRemote";
import { fetchShipmentsTabRemote } from "@/hooks/order-management/remote/fetchShipmentsTabRemote";
import {
  useOrderManagementDatePanel,
  type DraftDateRangeStrings,
} from "@/hooks/order-management/useOrderManagementDatePanel";
import { PERMISSION_CODES } from "@/lib/permission-codes";
import { extractPermissionCodesFromSelection } from "@/lib/permissions";
import useClickOutside from "@/hooks/useClickOutside";
import useDeviceType from "@/hooks/use-device-type";
import { useActiveLocale } from "@/hooks/use-active-locale";
import {
  ORDER_MANAGEMENT_SEARCH_PARAMS_SYNC_EVENT,
  useOrderManagementLocationSearch,
  useOrderManagementPathname,
} from "@/hooks/useOrderManagementPathname";
import { queueScrollExtentSync } from "@/hooks/use-scroll-extent-sync";
import { localizeHref } from "@/lib/locale-path";
import {
  buildBeltOptionsFromSsmc,
  postOrderFacets,
  type OrderFacetSsmcRow,
  type OrderLineItem,
} from "@/lib/apis/orders-api";
import {
  buildCascadingBeltOptions,
  copyBeltSelections,
  pruneBeltDraft,
  pruneBeltDraftExceptDimension,
} from "@/lib/beltFacetCascade";
import { parseCmsPageSizeMultilist } from "@/lib/orderDetailUtils";
import {
  createEmptyBeltSelections,
  filterLabelToStatusKey,
  resolveStatusDisplayForOrderKey,
  hrefMatchesPath,
  gridColumnToSortColumnId,
  getOrderManagementTabLinkRaw,
  invoiceGridColumnToSortColumnId,
  resolveOrderManagementActiveTabPath,
  resolveOrderManagementTabKindFromPathname,
  resolveOrderManagementTabKindFromSitecoreLayout,
  isGridColumnSortable,
  quoteGridColumnToSortColumnId,
  shipmentGridColumnToSortColumnId,
  tabHasRenderableGrid,
  toOrderManagementLinkFieldWithHref,
  flattenOrdersToShipmentRows,
  getOrderManagementDateTriggerLabel,
  resolveDefaultPresetFromCms,
  resolveDefaultStatusFilterKeysFromCms,
  resolveOrderManagementTabCanonicalPath,
  resolveOrderManagementTabKind,
  parseRollingDurationDaysFromTab,
  resolveCarrierSelectionForTracking,
  clampOrderManagementPageIndex,
  computeOrderManagementTotalPages,
  normalizeListTotalRecords,
  orderStatusFilterKeysToApiValues,
  resolveApiSearchInFromCmsSearchAttributes,
  toApiDateRangeEnd,
  toApiDateRangeStart,
  toLocalYmd,
  toYmd,
  type BeltSelections,
  type DateRangeValue,
  type InvoiceRecord,
  type OrderManagementTabKind,
  type OrderRecord,
  type QuoteRecord,
  quoteDetailRouteId,
  type ShipmentGridRow,
  type ShipmentSortColumnId,
  type SortColumnId,
} from "@/lib/orderManagementUtils";
import {
  beltSelectionsFromPersisted,
  dateRangeFromPersistedYmd,
  readOrderManagementFilters,
  resolveOrderManagementStatusKeysForHydration,
  writeOrderManagementFilters,
  type OrderManagementFiltersPersistedV1,
} from "@/lib/order-management-session-storage";
import {
  readOrderManagementInvoicesFilters,
  writeOrderManagementInvoicesFilters,
} from "@/lib/order-management-invoices-session-storage";
import {
  readOrderManagementQuotesFilters,
  writeOrderManagementQuotesFilters,
} from "@/lib/order-management-quotes-session-storage";
import { usePermissionContext } from "@/lib/permission-context";
import { useProfileContext } from "@/lib/profile-context";
import { useLocale } from "next-intl";
import type { KeyboardEvent, SetStateAction } from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  mergeInvoiceFilterOptionsWithListStatuses,
  normalizeInvoiceTabFilterFields,
} from "@/components/core/OrderManagement/tabs/invoices/invoiceTabFilterFields";
import {
  mergeQuoteFilterOptionsWithListStatuses,
  normalizeQuoteTabFilterFields,
} from "@/components/core/OrderManagement/tabs/quotes/quoteTabFilterFields";
import {
  sendOrderManagementDocumentDownloadEvent,
  sendOrderManagementQuoteRequestedEvent,
  sendOrderManagementSearchFilterEvent,
  sendSearchEvent,
} from "@/lib/CDPEvents";
import {
  logGTMOrderManagementDocumentDownload,
  logGTMOrderManagementQuoteRequested,
  logGTMSearch,
  logGTMSearchFilter,
} from "@/lib/gtm";

export interface OrderManagementShellInput {
  fields: IOrderManagementFields;
  paramsStyles: string;
  renderingId?: string;
  /** Sitecore page (used to resolve active tab in Experience Editor / Preview). */
  page?: ComponentProps["page"];
}

function readOrderManagementUrlSearchQuery(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("search")?.trim() ?? "";
}

function readOrderManagementUrlOrderHeaderIdQuery(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("orderHeaderId")?.trim() ?? "";
}

function readOrderManagementUrlSignatureFragment(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.pathname}${window.location.search}`;
}

function stripOrderManagementSearchQueryFromUrl(): void {
  if (typeof window === "undefined") return;
  const next = new URLSearchParams(window.location.search);
  if (!next.has("search") && !next.has("orderHeaderId")) return;
  next.delete("search");
  next.delete("orderHeaderId");
  const qs = next.toString();
  const url = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
  window.history.replaceState(window.history.state, "", url);
  window.dispatchEvent(new Event(ORDER_MANAGEMENT_SEARCH_PARAMS_SYNC_EVENT));
}

function capGridRowsToPageSize<T>(rows: T[], page: number, pageSize: number): T[] {
  if (pageSize <= 0) return rows;
  if (rows.length <= pageSize) return rows;
  const start = (Math.max(1, page) - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

export function useOrderManagementShell({
  fields,
  paramsStyles,
  renderingId,
  page,
}: OrderManagementShellInput) {
  const pathname = useOrderManagementPathname();
  const locationSearch = useOrderManagementLocationSearch();
  const { isMobile, isTablet } = useDeviceType();
  const isListingCompactViewport = isMobile || isTablet;
  const {
    can,
    canAll,
    isLoading: permissionsLoading,
    hasResolved: permissionsHasResolved,
    sitecoreEditingPermissionBypass,
  } = usePermissionContext();
  const { selectedAccount } = useProfileContext();
  const accountId = selectedAccount?.id ?? "";

  const canRequestQuote = can(PERMISSION_CODES.INITIATE_RFQ);
  const canRequestDocumentation = can(PERMISSION_CODES.REQUEST_DOCUMENTATION);
  const activeLocale = useActiveLocale();

  const allTabsWithHref = useMemo(() => {
    const tabsRaw = fields.Tabs?.filter((t) => t?.fields) ?? [];
    return tabsRaw.map((tab) => {
      const tabUrl = tab.fields?.TabURL;
      const normalized = toOrderManagementLinkFieldWithHref(tabUrl);
      if (!normalized?.value?.href) {
        return tab;
      }
      const rawHref = normalized.value.href.trim();
      if (!rawHref) {
        return tab;
      }
      const canonicalHref = resolveOrderManagementTabCanonicalPath(rawHref) ?? rawHref;
      const localizedHref = localizeHref(canonicalHref, activeLocale);
      return {
        ...tab,
        fields: {
          ...tab.fields!,
          TabURL: {
            ...normalized,
            value: normalized.value
              ? { ...normalized.value, href: localizedHref }
              : normalized.value,
          },
        },
      };
    });
  }, [fields.Tabs, activeLocale]);

  const visibleTabs = useMemo(() => {
    return allTabsWithHref.filter((tab) => {
      const tabKind = resolveOrderManagementTabKind(
        getOrderManagementTabLinkRaw(tab.fields?.TabURL)
      );
      if (tabKind === "quotes" && !canRequestQuote) {
        return false;
      }
      const requiredCodes = extractPermissionCodesFromSelection(tab.fields?.PermissionSelection);
      return canAll(requiredCodes);
    });
  }, [allTabsWithHref, canAll, canRequestQuote]);

  const permissionsStillLoading =
    permissionsLoading && !permissionsHasResolved && !sitecoreEditingPermissionBypass;

  const isSitecoreExperience = Boolean(page?.mode?.isEditing || page?.mode?.isPreview);
  const sitecoreLayout = page?.layout?.sitecore;

  const activeTabPath = useMemo(
    () => resolveOrderManagementActiveTabPath(pathname, sitecoreLayout, isSitecoreExperience),
    [pathname, sitecoreLayout, isSitecoreExperience]
  );

  const pathKind = useMemo(() => {
    const fromBrowserPath = resolveOrderManagementTabKindFromPathname(pathname);
    if (!isSitecoreExperience) {
      return fromBrowserPath;
    }

    const fromSitecore = resolveOrderManagementTabKindFromSitecoreLayout(sitecoreLayout);
    if (fromSitecore !== "unknown") {
      return fromSitecore;
    }

    return resolveOrderManagementTabKindFromPathname(activeTabPath);
  }, [activeTabPath, isSitecoreExperience, pathname, sitecoreLayout]);

  const pickActiveTabFromPool = useCallback(
    (pool: typeof allTabsWithHref) => {
      if (pathKind !== "unknown") {
        const byKind = pool.find(
          (t) =>
            resolveOrderManagementTabKind(getOrderManagementTabLinkRaw(t.fields?.TabURL)) ===
            pathKind
        );
        if (byKind) return byKind;
      }
      const byHref = pool.find((t) =>
        hrefMatchesPath(activeTabPath, getOrderManagementTabLinkRaw(t.fields?.TabURL))
      );
      if (byHref) return byHref;
      return undefined;
    },
    [activeTabPath, pathKind]
  );
  const activeTab =
    pickActiveTabFromPool(visibleTabs) ??
    (permissionsStillLoading ? pickActiveTabFromPool(allTabsWithHref) : undefined) ??
    visibleTabs[0] ??
    allTabsWithHref[0];
  const tabKind: OrderManagementTabKind = resolveOrderManagementTabKind(
    getOrderManagementTabLinkRaw(activeTab?.fields?.TabURL)
  );

  const rawTabFields =
    tabHasRenderableGrid(activeTab) ||
    ((tabKind === "invoices" || tabKind === "quotes" || tabKind === "shipments") &&
      activeTab?.fields)
      ? activeTab?.fields
      : undefined;

  const tabFieldsCore = useMemo(() => {
    if (tabKind === "invoices") {
      return normalizeInvoiceTabFilterFields(rawTabFields) ?? undefined;
    }
    if (tabKind === "quotes") {
      return normalizeQuoteTabFilterFields(rawTabFields) ?? undefined;
    }
    return rawTabFields;
  }, [tabKind, rawTabFields]);

  const isRenderableDataTab = Boolean(tabFieldsCore);

  const rollingDurationDays = useMemo(
    () => parseRollingDurationDaysFromTab(tabFieldsCore),
    [tabFieldsCore?.RollingDuration?.value]
  );

  const rangeCalendarBounds = useMemo(() => {
    if (rollingDurationDays == null) return null;
    const tz = getLocalTimeZone();
    const max = today(tz);
    const min = max.subtract({ days: rollingDurationDays });
    return { min, max };
  }, [rollingDurationDays]);

  const dateInputBounds = useMemo((): { min?: string; max?: string } => {
    if (!rangeCalendarBounds) return {};
    const fmt = (c: { year: number; month: number; day: number }) =>
      `${c.year}-${String(c.month).padStart(2, "0")}-${String(c.day).padStart(2, "0")}`;
    return { min: fmt(rangeCalendarBounds.min), max: fmt(rangeCalendarBounds.max) };
  }, [rangeCalendarBounds]);

  const pageSizeOptions = useMemo(() => {
    const tabList = parseCmsPageSizeMultilist(tabFieldsCore?.PageSizeOptionList);
    const rootList = parseCmsPageSizeMultilist(fields?.PageSizeOptionList);
    const parsed = tabList.length > 0 ? tabList : rootList;
    return parsed.length > 0 ? parsed : [DEFAULT_PAGE_SIZE];
  }, [tabFieldsCore?.PageSizeOptionList, fields?.PageSizeOptionList]);

  const resultSummaryPatternField =
    tabFieldsCore?.ResultSummaryPattern ?? fields?.ResultSummaryPattern;

  const resolvedDefaultPageSize = useMemo(() => {
    const opts = parseCmsPageSizeMultilist(fields?.PageSizeOptionList);
    const raw = fields?.DefaultPageSize?.value;
    const n = parseInt(String(raw ?? "").trim(), 10);
    if (Number.isFinite(n) && n > 0) return n;
    return opts[0] ?? DEFAULT_PAGE_SIZE;
  }, [fields?.DefaultPageSize?.value, fields?.PageSizeOptionList]);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusSelections, setStatusSelections] = useState<Set<string>>(new Set());
  const [statusDraft, setStatusDraft] = useState<Set<string>>(new Set());
  const [beltApplied, setBeltApplied] = useState<BeltSelections>(createEmptyBeltSelections());
  const [beltDraft, setBeltDraft] = useState<BeltSelections>(createEmptyBeltSelections());
  const [dateRange, setDateRange] = useState<DateRangeValue | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_NONE_ID);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(resolvedDefaultPageSize);
  const [sortColumn, setSortColumn] = useState<SortColumnId>("orderDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loadError, setLoadError] = useState<string | null>(null);
  /** True while the orders API request is in flight (initial load, pagination, sort, etc.). */
  const [isOrdersListLoading, setIsOrdersListLoading] = useState(false);
  const [pendingCompactRelayout, setPendingCompactRelayout] = useState(false);
  const [remoteOrders, setRemoteOrders] = useState<OrderRecord[] | null>(null);
  const [remoteInvoices, setRemoteInvoices] = useState<InvoiceRecord[] | null>(null);
  const [remoteQuotes, setRemoteQuotes] = useState<QuoteRecord[] | null>(null);
  const [apiLive, setApiLive] = useState(false);
  const [apiTotalRecords, setApiTotalRecords] = useState(0);

  const tabFields = useMemo(() => {
    if (tabKind === "quotes") {
      return mergeQuoteFilterOptionsWithListStatuses(tabFieldsCore, remoteQuotes) ?? undefined;
    }
    if (tabKind === "invoices") {
      return mergeInvoiceFilterOptionsWithListStatuses(tabFieldsCore, remoteInvoices) ?? undefined;
    }
    return tabFieldsCore;
  }, [tabKind, tabFieldsCore, remoteQuotes, remoteInvoices]);

  const trackingCarrierSelection = useMemo(
    () => resolveCarrierSelectionForTracking(tabFieldsCore, allTabsWithHref),
    [tabFieldsCore, allTabsWithHref]
  );

  const [openStatus, setOpenStatus] = useState(false);
  const [openBelt, setOpenBelt] = useState(false);
  const [openDate, setOpenDate] = useState(false);
  const [mobileSheet, setMobileSheet] = useState<"filters" | "date" | null>(null);

  const [documentRequestListingTarget, setDocumentRequestListingTarget] = useState<{
    order: OrderRecord;
    line: OrderLineItem;
  } | null>(null);
  const allowCustomDateRange = tabFields?.CustomDateRange?.value !== false;

  const datePanel = useOrderManagementDatePanel({
    tabFields,
    rollingDurationDays,
    dateRange,
    setDateRange,
    selectedPresetId,
    setSelectedPresetId,
    setOpenDate,
    setMobileSheet,
    setCurrentPage,
    allowCustomDateRange,
    locale: activeLocale,
  });

  const {
    setDraftRange: setDatePanelDraftRange,
    setDraftPresetId: setDatePanelDraftPresetId,
    setDraftStartStr: setDatePanelDraftStartStr,
    setDraftEndStr: setDatePanelDraftEndStr,
  } = datePanel;

  const [beltSearch, setBeltSearch] = useState<Record<string, string>>({});
  const [beltFacetOptions, setBeltFacetOptions] = useState<{
    series: string[];
    style: string[];
    material: string[];
    color: string[];
  }>({ series: [], style: [], material: [], color: [] });
  const [beltSsmcRows, setBeltSsmcRows] = useState<OrderFacetSsmcRow[]>([]);

  const activeTabIdRef = useRef<string | undefined>(undefined);
  const filtersHydratedRef = useRef(false);
  const [filtersHydrated, setFiltersHydrated] = useState(false);
  const ordersFiltersUserModifiedRef = useRef(false);
  const lastAppliedUrlSearchSignatureRef = useRef<string>("");
  const lastHydratedAccountIdRef = useRef<string>("");
  const pendingSearchAnalyticsRef = useRef<{ tabName: string; searchTerm: string } | null>(null);
  const pendingFilterAnalyticsRef = useRef<{ tabName: string; filterParameters: string[] } | null>(
    null
  );
  const remoteRequestIdRef = useRef(0);
  const compactRelayoutWaitingForFetchRef = useRef(false);

  const requestCompactRelayout = useCallback(() => {
    compactRelayoutWaitingForFetchRef.current = true;
    setPendingCompactRelayout(true);
  }, []);

  const markOrdersFiltersUserModified = useCallback(() => {
    if (tabKind === "orders") {
      ordersFiltersUserModifiedRef.current = true;
    }
  }, [tabKind]);

  const setCurrentPageFromUser = useCallback(
    (value: SetStateAction<number>) => {
      markOrdersFiltersUserModified();
      setCurrentPage(value);
      requestCompactRelayout();
    },
    [markOrdersFiltersUserModified, requestCompactRelayout]
  );

  const setPageSizeFromUser = useCallback(
    (value: SetStateAction<number>) => {
      markOrdersFiltersUserModified();
      setPageSize(value);
      requestCompactRelayout();
    },
    [markOrdersFiltersUserModified, requestCompactRelayout]
  );

  const onPageSizeChange = useCallback(
    (nextPageSize: number) => {
      markOrdersFiltersUserModified();
      setCurrentPage(1);
      setPageSize(nextPageSize);
      requestCompactRelayout();
    },
    [markOrdersFiltersUserModified, requestCompactRelayout]
  );

  const resolveActiveTabName = useCallback((): string => {
    const fromField = String(tabFields?.TabName?.value ?? "").trim();
    if (fromField) return fromField;
    const fromDisplayName = String(activeTab?.displayName ?? "").trim();
    if (fromDisplayName) return fromDisplayName;
    if (tabKind === "orders") return "Orders";
    if (tabKind === "invoices") return "Invoices";
    if (tabKind === "shipments") return "Shipments";
    if (tabKind === "quotes") return "Quotes";
    return "Order Management";
  }, [activeTab?.displayName, tabFields?.TabName?.value, tabKind]);

  const queueSearchAnalytics = useCallback(
    (searchTerm: string) => {
      const trimmed = searchTerm.trim();
      if (!trimmed) return;
      pendingSearchAnalyticsRef.current = {
        tabName: resolveActiveTabName(),
        searchTerm: trimmed,
      };
    },
    [resolveActiveTabName]
  );

  const queueFilterAnalytics = useCallback(
    (filterParameters: string[]) => {
      if (filterParameters.length === 0) return;
      pendingFilterAnalyticsRef.current = {
        tabName: resolveActiveTabName(),
        filterParameters,
      };
    },
    [resolveActiveTabName]
  );

  useEffect(() => {
    const id = activeTab?.id;
    if (id === undefined) return;
    if (activeTabIdRef.current === id) return;

    const previousTabId = activeTabIdRef.current;
    activeTabIdRef.current = id;

    if (previousTabId === undefined) {
      return;
    }

    pendingSearchAnalyticsRef.current = null;
    pendingFilterAnalyticsRef.current = null;

    const urlQ = typeof window !== "undefined" ? readOrderManagementUrlSearchQuery() : "";
    setSearchInput(urlQ);
    setAppliedSearch(urlQ);
    if (urlQ) {
      lastAppliedUrlSearchSignatureRef.current = `${accountId}|${readOrderManagementUrlSignatureFragment()}|${id}`;
      queueSearchAnalytics(urlQ);
    } else {
      lastAppliedUrlSearchSignatureRef.current = "";
    }

    requestCompactRelayout();
    setBeltApplied(createEmptyBeltSelections());
    setBeltDraft(createEmptyBeltSelections());
    setCurrentPage(1);
    setExpandedIds(new Set());
    const tk = resolveOrderManagementTabKind(
      getOrderManagementTabLinkRaw(activeTab?.fields?.TabURL)
    );
    setSortColumn(
      tk === "shipments"
        ? "shipDate"
        : tk === "invoices"
          ? "invoiceDate"
          : tk === "quotes"
            ? "quoteDate"
            : "orderDate"
    );
    setSortDir("desc");
    const tf = activeTab?.fields;
    const tabOpts = parseCmsPageSizeMultilist(tf?.PageSizeOptionList);
    const rootOpts = parseCmsPageSizeMultilist(fields?.PageSizeOptionList);
    const mergedOpts =
      tabOpts.length > 0 ? tabOpts : rootOpts.length > 0 ? rootOpts : [DEFAULT_PAGE_SIZE];
    const rawSize = tf?.DefaultPageSize?.value ?? fields?.DefaultPageSize?.value;
    const nSize = parseInt(String(rawSize ?? "").trim(), 10);
    setPageSize(Number.isFinite(nSize) && nSize > 0 ? nSize : (mergedOpts[0] ?? DEFAULT_PAGE_SIZE));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when switching tabs (id); fields come from latest render
  }, [activeTab?.id]);

  const statusRef = useRef<HTMLDivElement>(null);
  const beltRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  useClickOutside(statusRef, () => setOpenStatus(false), openStatus);
  useClickOutside(beltRef, () => setOpenBelt(false), openBelt);
  useClickOutside(dateRef, () => setOpenDate(false), openDate);

  const locale = useLocale();

  useEffect(() => {
    setExpandedIds(new Set());
    setLoadError(null);
    setRemoteOrders(null);
    setRemoteInvoices(null);
    setRemoteQuotes(null);
    setApiLive(false);
    setApiTotalRecords(0);
  }, [accountId]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (!tabFieldsCore) {
      setFiltersHydrated(false);
      return;
    }

    filtersHydratedRef.current = false;
    setFiltersHydrated(false);

    if (!accountId) {
      lastHydratedAccountIdRef.current = "";
      return;
    }

    const prevHydratedAccountId = lastHydratedAccountIdRef.current;
    if (prevHydratedAccountId && prevHydratedAccountId !== accountId) {
      stripOrderManagementSearchQueryFromUrl();
    }

    const opts = pageSizeOptions.length > 0 ? pageSizeOptions : [DEFAULT_PAGE_SIZE];
    const persisted =
      tabKind === "orders"
        ? readOrderManagementFilters(accountId, opts, resolvedDefaultPageSize)
        : tabKind === "invoices"
          ? readOrderManagementInvoicesFilters(accountId, opts, resolvedDefaultPageSize)
          : tabKind === "quotes"
            ? readOrderManagementQuotesFilters(accountId, opts, resolvedDefaultPageSize)
            : null;

    const finishHydration = (snapshot: OrderManagementFiltersPersistedV1) => {
      if (tabKind === "orders") {
        writeOrderManagementFilters(accountId, snapshot, opts, resolvedDefaultPageSize);
      } else if (tabKind === "invoices") {
        writeOrderManagementInvoicesFilters(accountId, snapshot, opts, resolvedDefaultPageSize);
      } else if (tabKind === "quotes") {
        writeOrderManagementQuotesFilters(accountId, snapshot, opts, resolvedDefaultPageSize);
      }
      filtersHydratedRef.current = true;
      setFiltersHydrated(true);
    };

    const cmsDefaultStatusKeys = [...resolveDefaultStatusFilterKeysFromCms(tabFieldsCore)];

    if (persisted) {
      const range = dateRangeFromPersistedYmd(persisted.dateStartYmd, persisted.dateEndYmd);
      if (range) {
        const belt = beltSelectionsFromPersisted(persisted.belt);
        const urlQ = readOrderManagementUrlSearchQuery();
        const useUrlSearch = Boolean(urlQ);
        const nextSearchInput = useUrlSearch ? urlQ : persisted.searchInput;
        const nextAppliedSearch = useUrlSearch ? urlQ : persisted.appliedSearch;
        const nextPage = useUrlSearch ? 1 : persisted.currentPage;
        const statusKeys = resolveOrderManagementStatusKeysForHydration(
          persisted,
          cmsDefaultStatusKeys
        );
        ordersFiltersUserModifiedRef.current =
          tabKind === "orders" && (persisted.hasUserModifiedFilters === true || useUrlSearch);

        setSearchInput(nextSearchInput);
        setAppliedSearch(nextAppliedSearch);
        setStatusSelections(new Set(statusKeys));
        setStatusDraft(new Set(statusKeys));
        setBeltApplied(belt);
        setBeltDraft({
          series: new Set(belt.series),
          style: new Set(belt.style),
          material: new Set(belt.material),
          color: new Set(belt.color),
        });
        setDateRange(range);
        setSelectedPresetId(persisted.selectedPresetId);
        setCurrentPage(nextPage);
        setPageSize(persisted.pageSize);
        setSortColumn(persisted.sortColumn);
        setSortDir(persisted.sortDir);
        setDatePanelDraftRange(range);
        setDatePanelDraftPresetId(persisted.selectedPresetId);
        setDatePanelDraftStartStr(toLocalYmd(range.start));
        setDatePanelDraftEndStr(toLocalYmd(range.end));
        const snapshot: OrderManagementFiltersPersistedV1 = useUrlSearch
          ? {
              ...persisted,
              searchInput: nextSearchInput,
              appliedSearch: nextAppliedSearch,
              currentPage: nextPage,
              statusKeys,
              hasUserModifiedFilters:
                tabKind === "orders" ? true : persisted.hasUserModifiedFilters,
            }
          : { ...persisted, statusKeys };
        finishHydration(snapshot);
        if (useUrlSearch) {
          lastAppliedUrlSearchSignatureRef.current = `${accountId}|${readOrderManagementUrlSignatureFragment()}|${activeTab?.id ?? ""}`;
          queueSearchAnalytics(urlQ);
        }
        lastHydratedAccountIdRef.current = accountId;
        return;
      }
    }

    const { presetId, range } = resolveDefaultPresetFromCms(tabFieldsCore, {
      locale: activeLocale,
    });
    const urlQDefault = readOrderManagementUrlSearchQuery();
    const initialSearch = urlQDefault || "";
    ordersFiltersUserModifiedRef.current = tabKind === "orders" && Boolean(initialSearch);
    const defaultSortColumn: SortColumnId =
      tabKind === "invoices" ? "invoiceDate" : tabKind === "quotes" ? "quoteDate" : "orderDate";
    const initialStatusKeys = cmsDefaultStatusKeys;
    setSearchInput(initialSearch);
    setAppliedSearch(initialSearch);
    setStatusSelections(new Set(initialStatusKeys));
    setStatusDraft(new Set(initialStatusKeys));
    setBeltApplied(createEmptyBeltSelections());
    setBeltDraft(createEmptyBeltSelections());
    setDateRange(range);
    setSelectedPresetId(presetId);
    setCurrentPage(1);
    setPageSize(resolvedDefaultPageSize);
    setSortColumn(defaultSortColumn);
    setSortDir("desc");
    setDatePanelDraftRange(range);
    setDatePanelDraftStartStr(toLocalYmd(range.start));
    setDatePanelDraftEndStr(toLocalYmd(range.end));
    setDatePanelDraftPresetId(presetId);
    finishHydration({
      version: 1,
      hasUserModifiedFilters: tabKind === "orders" && Boolean(initialSearch),
      searchInput: initialSearch,
      appliedSearch: initialSearch,
      statusKeys: initialStatusKeys,
      belt: { series: [], style: [], material: [], color: [] },
      dateStartYmd: toYmd(range.start),
      dateEndYmd: toYmd(range.end),
      selectedPresetId: presetId,
      currentPage: 1,
      pageSize: resolvedDefaultPageSize,
      sortColumn: defaultSortColumn,
      sortDir: "desc",
    });
    if (urlQDefault) {
      lastAppliedUrlSearchSignatureRef.current = `${accountId}|${readOrderManagementUrlSignatureFragment()}|${activeTab?.id ?? ""}`;
      queueSearchAnalytics(urlQDefault);
    }
    lastHydratedAccountIdRef.current = accountId;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- URL merge reads `window.location`; signature uses current pathname/search from render
  }, [
    accountId,
    tabFieldsCore,
    pageSizeOptions,
    resolvedDefaultPageSize,
    tabKind,
    queueSearchAnalytics,
  ]);

  /**
   * Apply `?search=` from the URL when it changes **without** a hydration rerun (in-app navigation,
   * global search on the same Order Management page). Hydration above does not depend on `pathname` /
   * `locationSearch`, so this effect subscribes to those and mirrors `window.location` into state.
   */
  useEffect(() => {
    if (!filtersHydrated || !filtersHydratedRef.current) return;
    if (!accountId || !tabFieldsCore || !dateRange) return;
    if (tabKind === "unknown") return;
    if (typeof window === "undefined") return;

    const q = new URLSearchParams(window.location.search).get("search")?.trim() ?? "";

    const signature = `${accountId}|${readOrderManagementUrlSignatureFragment()}|${activeTab?.id ?? ""}`;

    if (!q) {
      lastAppliedUrlSearchSignatureRef.current = "";
      return;
    }

    if (lastAppliedUrlSearchSignatureRef.current === signature) {
      return;
    }

    lastAppliedUrlSearchSignatureRef.current = signature;
    markOrdersFiltersUserModified();
    requestCompactRelayout();

    setSearchInput(q);
    setAppliedSearch(q);
    setCurrentPage(1);
    queueSearchAnalytics(q);
  }, [
    filtersHydrated,
    accountId,
    tabFieldsCore,
    tabKind,
    dateRange,
    pathname,
    activeTab?.id,
    locationSearch,
    markOrdersFiltersUserModified,
    requestCompactRelayout,
    queueSearchAnalytics,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!filtersHydrated || !filtersHydratedRef.current || !accountId || !tabFieldsCore) return;
    if (!dateRange) return;
    if (tabKind !== "orders" && tabKind !== "invoices" && tabKind !== "quotes") return;

    const opts = pageSizeOptions.length > 0 ? pageSizeOptions : [DEFAULT_PAGE_SIZE];
    const snapshot: OrderManagementFiltersPersistedV1 = {
      version: 1,
      hasUserModifiedFilters:
        tabKind === "orders" ? ordersFiltersUserModifiedRef.current : undefined,
      searchInput,
      appliedSearch,
      statusKeys: [...statusSelections],
      belt: {
        series: [...beltApplied.series],
        style: [...beltApplied.style],
        material: [...beltApplied.material],
        color: [...beltApplied.color],
      },
      dateStartYmd: toYmd(dateRange.start),
      dateEndYmd: toYmd(dateRange.end),
      selectedPresetId,
      currentPage,
      pageSize,
      sortColumn,
      sortDir,
    };
    if (tabKind === "orders") {
      writeOrderManagementFilters(accountId, snapshot, opts, resolvedDefaultPageSize);
    } else if (tabKind === "invoices") {
      writeOrderManagementInvoicesFilters(accountId, snapshot, opts, resolvedDefaultPageSize);
    } else {
      writeOrderManagementQuotesFilters(accountId, snapshot, opts, resolvedDefaultPageSize);
    }
  }, [
    accountId,
    tabKind,
    tabFieldsCore,
    filtersHydrated,
    searchInput,
    appliedSearch,
    statusSelections,
    beltApplied,
    selectedPresetId,
    currentPage,
    pageSize,
    sortColumn,
    sortDir,
    pageSizeOptions,
    resolvedDefaultPageSize,
    dateRange,
  ]);

  const fetchRemote = useCallback(async () => {
    const requestId = ++remoteRequestIdRef.current;
    const isLatestRequest = () => requestId === remoteRequestIdRef.current;
    compactRelayoutWaitingForFetchRef.current = false;

    if (!filtersHydratedRef.current) {
      setIsOrdersListLoading(false);
      return;
    }

    if (!accountId || !tabFieldsCore) {
      setIsOrdersListLoading(false);
      return;
    }
    if (tabKind === "unknown") {
      setRemoteOrders([]);
      setRemoteInvoices(null);
      setRemoteQuotes(null);
      setApiTotalRecords(0);
      setApiLive(false);
      setLoadError(null);
      return;
    }

    if (!dateRange) {
      setIsOrdersListLoading(false);
      setRemoteOrders(null);
      setRemoteInvoices(null);
      setRemoteQuotes(null);
      setApiTotalRecords(0);
      setApiLive(false);
      setLoadError(null);
      return;
    }

    const applyPatch = (p: {
      remoteOrders: OrderRecord[] | null;
      remoteInvoices: InvoiceRecord[] | null;
      remoteQuotes: QuoteRecord[] | null;
      apiLive: boolean;
      apiTotalRecords: number;
      loadError: string | null;
    }) => {
      const rowCountFallback =
        p.remoteInvoices?.length ?? p.remoteOrders?.length ?? p.remoteQuotes?.length ?? 0;
      setRemoteOrders(p.remoteOrders);
      setRemoteInvoices(p.remoteInvoices);
      setRemoteQuotes(p.remoteQuotes);
      setApiLive(p.apiLive);
      setApiTotalRecords(normalizeListTotalRecords(p.apiTotalRecords, rowCountFallback));
      setLoadError(p.loadError);
    };

    /**
     * Prefer live `?search=` from the URL over React state so the first request after global search
     * (same route, query-only navigation) includes the term. State can lag one frame behind `locationSearch`.
     */
    const urlSearchLive =
      typeof window !== "undefined" && appliedSearch.trim() === ""
        ? readOrderManagementUrlSearchQuery()
        : "";
    const appliedSearchForRequest = urlSearchLive !== "" ? urlSearchLive : appliedSearch.trim();

    const urlOrderHeaderIdRaw =
      typeof window !== "undefined" ? readOrderManagementUrlOrderHeaderIdQuery() : "";
    const urlOrderHeaderIdParsed = Number.parseInt(urlOrderHeaderIdRaw, 10);
    const orderHeaderIdForListRequest =
      (tabKind === "invoices" || tabKind === "shipments") &&
      urlOrderHeaderIdRaw !== "" &&
      Number.isFinite(urlOrderHeaderIdParsed) &&
      urlOrderHeaderIdParsed > 0
        ? urlOrderHeaderIdParsed
        : undefined;

    const listParams = {
      accountId,
      dateRange,
      /** Quotes status → API mapping must use full CMS {@link OrderManagementTabFields.FilterOptions}, not list-derived UI options. */
      tabFields: tabFieldsCore,
      currentPage,
      pageSize,
      sortColumn,
      sortDir,
      appliedSearch: appliedSearchForRequest,
      ...(orderHeaderIdForListRequest !== undefined
        ? { orderHeaderId: orderHeaderIdForListRequest }
        : {}),
    };

    setIsOrdersListLoading(true);
    setLoadError(null);

    try {
      if (tabKind === "quotes") {
        const patch = await fetchQuotesTabRemote({ ...listParams, statusSelections });
        if (isLatestRequest()) applyPatch(patch);
        return;
      }
      if (tabKind === "invoices") {
        const patch = await fetchInvoicesTabRemote({ ...listParams, statusSelections });
        if (isLatestRequest()) applyPatch(patch);
        return;
      }
      if (tabKind === "shipments") {
        const patch = await fetchShipmentsTabRemote(listParams);
        if (isLatestRequest()) applyPatch(patch);
        return;
      }
      if (tabKind === "orders") {
        const patch = await fetchOrdersTabRemote({ ...listParams, statusSelections, beltApplied });
        if (isLatestRequest()) applyPatch(patch);
        return;
      }
    } finally {
      if (isLatestRequest()) {
        setIsOrdersListLoading(false);
      }
    }
  }, [
    accountId,
    appliedSearch,
    beltApplied,
    currentPage,
    dateRange,
    locationSearch,
    pageSize,
    sortColumn,
    sortDir,
    statusSelections,
    tabFieldsCore,
    tabKind,
  ]);

  useEffect(() => {
    if (!filtersHydrated) return;
    void fetchRemote();
  }, [fetchRemote, filtersHydrated]);

  useEffect(() => {
    if (!tabFieldsCore || !dateRange || tabKind !== "orders") return;
    const accountNum = Number.parseInt(String(accountId), 10);
    if (!Number.isFinite(accountNum) || accountNum <= 0) {
      setBeltSsmcRows([]);
      setBeltFacetOptions({ series: [], style: [], material: [], color: [] });
      return;
    }

    const urlSearchLive =
      typeof window !== "undefined" && appliedSearch.trim() === ""
        ? readOrderManagementUrlSearchQuery()
        : "";
    const appliedSearchForRequest = urlSearchLive !== "" ? urlSearchLive : appliedSearch.trim();

    let cancelled = false;
    void (async () => {
      try {
        const res = await postOrderFacets({
          accountId: accountNum,
          orderDateFrom: toApiDateRangeStart(dateRange.start),
          orderDateTo: toApiDateRangeEnd(dateRange.end),
          search: appliedSearchForRequest,
          searchIn: resolveApiSearchInFromCmsSearchAttributes(tabFieldsCore?.SearchAttribute),
          orderStatus: orderStatusFilterKeysToApiValues(statusSelections, tabFieldsCore),
        });
        if (cancelled) return;
        if (!res?.success || !res.data) {
          setBeltSsmcRows([]);
          setBeltFacetOptions({ series: [], style: [], material: [], color: [] });
          return;
        }
        const ssmc = res.data.ssmc ?? [];
        setBeltSsmcRows(ssmc);
        setBeltFacetOptions(buildBeltOptionsFromSsmc(ssmc));
      } catch {
        if (!cancelled) {
          setBeltSsmcRows([]);
          setBeltFacetOptions({ series: [], style: [], material: [], color: [] });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    accountId,
    appliedSearch,
    dateRange,
    locationSearch,
    statusSelections,
    tabFieldsCore,
    tabKind,
  ]);

  const totalResults = useMemo(() => {
    if (!apiLive) return 0;
    const rowFallback =
      tabKind === "invoices"
        ? (remoteInvoices?.length ?? 0)
        : tabKind === "quotes"
          ? (remoteQuotes?.length ?? 0)
          : tabKind === "orders" || tabKind === "shipments"
            ? (remoteOrders?.length ?? 0)
            : 0;
    return normalizeListTotalRecords(apiTotalRecords, rowFallback);
  }, [apiLive, apiTotalRecords, remoteInvoices, remoteOrders, remoteQuotes, tabKind]);

  useEffect(() => {
    if (isOrdersListLoading || tabKind === "unknown") return;

    if (pendingSearchAnalyticsRef.current) {
      const { searchTerm, tabName } = pendingSearchAnalyticsRef.current;
      const noResults = totalResults === 0;
      logGTMSearch({
        search_term: searchTerm,
        search_category: tabName,
        no_results: noResults,
      });
      void sendSearchEvent({
        type: "customerportal:SEARCH",
        searchTerm,
        searchCategory: tabName,
        noResults,
      });
      pendingSearchAnalyticsRef.current = null;
    }

    if (pendingFilterAnalyticsRef.current) {
      const { tabName, filterParameters } = pendingFilterAnalyticsRef.current;
      logGTMSearchFilter({
        tab_name: tabName,
        filter_parameters: filterParameters,
      });
      void sendOrderManagementSearchFilterEvent({
        type: "customerportal:SEARCH_FILTER",
        tabName,
        filterParameters,
      });
      pendingFilterAnalyticsRef.current = null;
    }
  }, [isOrdersListLoading, totalResults]);

  const totalPages = useMemo(
    () => (apiLive ? computeOrderManagementTotalPages(apiTotalRecords, pageSize) : 1),
    [apiLive, apiTotalRecords, pageSize]
  );

  const safePage = useMemo(
    () => clampOrderManagementPageIndex(currentPage, totalPages),
    [currentPage, totalPages]
  );

  useEffect(() => {
    if (!apiLive) return;
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [apiLive, currentPage, setCurrentPage, totalPages]);

  const pageSlice = useMemo((): OrderRecord[] => {
    if (tabKind === "shipments" || tabKind === "invoices" || tabKind === "quotes") return [];
    const rows = remoteOrders ?? [];
    return apiLive ? rows : capGridRowsToPageSize(rows, safePage, pageSize);
  }, [apiLive, remoteOrders, tabKind, safePage, pageSize]);

  const shipmentPageSlice = useMemo((): ShipmentGridRow[] => {
    if (tabKind !== "shipments") return [];
    return flattenOrdersToShipmentRows(remoteOrders ?? [], trackingCarrierSelection);
  }, [remoteOrders, trackingCarrierSelection, tabKind]);

  const invoicePageSlice = useMemo((): InvoiceRecord[] => {
    if (tabKind !== "invoices") return [];
    const rows = Array.isArray(remoteInvoices) ? remoteInvoices : [];
    return apiLive ? rows : capGridRowsToPageSize(rows, safePage, pageSize);
  }, [apiLive, remoteInvoices, tabKind, safePage, pageSize]);

  const quotePageSlice = useMemo((): QuoteRecord[] => {
    if (tabKind !== "quotes") return [];
    const rows = remoteQuotes ?? [];
    return apiLive ? rows : capGridRowsToPageSize(rows, safePage, pageSize);
  }, [apiLive, remoteQuotes, tabKind, safePage, pageSize]);

  useLayoutEffect(() => {
    if (!pendingCompactRelayout) return;
    if (!isListingCompactViewport) {
      setPendingCompactRelayout(false);
      return;
    }
    if (isOrdersListLoading) return;
    if (compactRelayoutWaitingForFetchRef.current) return;

    queueScrollExtentSync();
    setPendingCompactRelayout(false);
  }, [
    pendingCompactRelayout,
    isListingCompactViewport,
    isOrdersListLoading,
    pageSize,
    totalResults,
    tabKind,
    pageSlice.length,
    shipmentPageSlice.length,
    invoicePageSlice.length,
    quotePageSlice.length,
  ]);

  const handleSearchInputChange = useCallback(
    (value: string) => {
      markOrdersFiltersUserModified();
      setSearchInput(value);
      if (value.trim().length === 0) {
        requestCompactRelayout();
        setAppliedSearch("");
        setCurrentPage(1);
        stripOrderManagementSearchQueryFromUrl();
      }
    },
    [markOrdersFiltersUserModified, requestCompactRelayout]
  );

  const applySearchAllAttributes = useCallback(() => {
    const trimmed = searchInput.trim();
    if (!trimmed) return;
    markOrdersFiltersUserModified();
    requestCompactRelayout();
    setAppliedSearch(trimmed);
    setCurrentPage(1);
    queueSearchAnalytics(trimmed);
  }, [markOrdersFiltersUserModified, queueSearchAnalytics, requestCompactRelayout, searchInput]);

  const handleSearchInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applySearchAllAttributes();
      }
    },
    [applySearchAllAttributes]
  );

  const cascadingBeltFacetOptions = useMemo(
    () => buildCascadingBeltOptions(beltSsmcRows, beltDraft),
    [beltDraft, beltSsmcRows]
  );

  const beltSubgroupMeta = useMemo((): BeltSubgroupMetaRow[] => {
    const f = tabFields;
    const m = beltSsmcRows.length > 0 ? cascadingBeltFacetOptions : beltFacetOptions;
    const rows: BeltSubgroupMetaRow[] = [
      {
        key: "series",
        labelField: f?.BeltSeriesLabel,
        label: f?.BeltSeriesLabel?.value,
        options: [...m.series],
      },
      {
        key: "style",
        labelField: f?.BeltStyleLabel,
        label: f?.BeltStyleLabel?.value,
        options: [...m.style],
      },
      {
        key: "material",
        labelField: f?.BeltMaterialLabel,
        label: f?.BeltMaterialLabel?.value,
        options: [...m.material],
      },
      {
        key: "color",
        labelField: f?.BeltColorLabel,
        label: f?.BeltColorLabel?.value,
        options: [...m.color],
      },
    ];
    return rows.filter(
      (row) => String(row.label ?? "").trim().length > 0 && row.options.length > 0
    );
  }, [beltFacetOptions, cascadingBeltFacetOptions, beltSsmcRows.length, tabFields]);
  const hideStatusFilter =
    tabFields?.HideFilter?.value === true ||
    ((tabKind === "quotes" || tabKind === "invoices") &&
      (tabFields?.FilterOptions?.length ?? 0) === 0);
  const showBanner = tabFields?.HideBanner?.value !== true;

  const showBeltFilter = useMemo(() => {
    const m = beltFacetOptions;
    const hasFacetData =
      m.series.length > 0 || m.style.length > 0 || m.material.length > 0 || m.color.length > 0;
    return hasFacetData && tabFields?.HideBeltFilter?.value !== true;
  }, [beltFacetOptions, tabFields?.HideBeltFilter?.value]);

  const gridColumns = useMemo(() => {
    return (tabFields?.GridSelection ?? []).filter((c) => c?.fields);
  }, [tabFields?.GridSelection]);

  const statusDisplay = useCallback(
    (key: string) => resolveStatusDisplayForOrderKey(key, tabFields),
    [tabFields]
  );

  const statusPhrase = useCallback((key: string) => statusDisplay(key).label, [statusDisplay]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleStatusDraftOption = useCallback(
    (label: string) => {
      const key = filterLabelToStatusKey(label, tabFields);
      if (!key) return;
      const applyNext = (prev: Set<string>) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      };
      markOrdersFiltersUserModified();
      requestCompactRelayout();
      setStatusDraft(applyNext);
      setStatusSelections(applyNext);
      setCurrentPage(1);
      queueFilterAnalytics([`Status=${statusDisplay(key).label}`]);
    },
    [
      markOrdersFiltersUserModified,
      queueFilterAnalytics,
      requestCompactRelayout,
      statusDisplay,
      tabFields,
    ]
  );

  const syncStatusDraftFromApplied = useCallback(() => {
    setStatusDraft(new Set(statusSelections));
  }, [statusSelections]);

  const syncBeltDraftFromApplied = useCallback(() => {
    const draft = copyBeltSelections(beltApplied);
    if (beltSsmcRows.length === 0) {
      setBeltDraft(draft);
      return;
    }
    const options = buildCascadingBeltOptions(beltSsmcRows, draft);
    setBeltDraft(pruneBeltDraft(draft, options));
  }, [beltApplied, beltSsmcRows]);

  const beltCount =
    beltApplied.series.size +
    beltApplied.style.size +
    beltApplied.material.size +
    beltApplied.color.size;

  const scrollThreshold = parseInt(tabFields?.BeltScrollableListThreshold?.value ?? "8", 10) || 8;
  const searchThreshold = parseInt(tabFields?.BeltSearchDisplayThreshold?.value ?? "5", 10) || 5;
  const beltSearchPh = tabFields?.BeltSearchPlaceholder?.value ?? "Search…";

  const toggleBeltDraft = useCallback(
    (group: keyof BeltSelections, value: string) => {
      setBeltDraft((prev) => {
        const next = { ...prev, [group]: new Set(prev[group]) };
        if (next[group].has(value)) next[group].delete(value);
        else next[group].add(value);
        if (beltSsmcRows.length === 0) return next;
        const options = buildCascadingBeltOptions(beltSsmcRows, next);
        return pruneBeltDraftExceptDimension(next, options, group);
      });
    },
    [beltSsmcRows]
  );

  const applyBelt = useCallback(() => {
    const draftToApply =
      beltSsmcRows.length > 0
        ? pruneBeltDraft(beltDraft, buildCascadingBeltOptions(beltSsmcRows, beltDraft))
        : beltDraft;
    const nextFilterParameters = [
      ...[...draftToApply.series].map((value) => `Series=${value}`),
      ...[...draftToApply.style].map((value) => `Style=${value}`),
      ...[...draftToApply.material].map((value) => `Material=${value}`),
      ...[...draftToApply.color].map((value) => `Color=${value}`),
    ];
    markOrdersFiltersUserModified();
    requestCompactRelayout();
    queueFilterAnalytics(nextFilterParameters);
    setBeltApplied({
      series: new Set(draftToApply.series),
      style: new Set(draftToApply.style),
      material: new Set(draftToApply.material),
      color: new Set(draftToApply.color),
    });
    setBeltDraft(copyBeltSelections(draftToApply));
    setOpenBelt(false);
    setCurrentPage(1);
  }, [
    beltDraft,
    beltSsmcRows,
    markOrdersFiltersUserModified,
    queueFilterAnalytics,
    requestCompactRelayout,
  ]);

  const clearBeltDraft = useCallback(() => setBeltDraft(createEmptyBeltSelections()), []);

  const clearAllChips = useCallback(() => {
    markOrdersFiltersUserModified();
    requestCompactRelayout();
    setStatusSelections(new Set());
    setStatusDraft(new Set());
    setBeltApplied(createEmptyBeltSelections());
    setCurrentPage(1);
  }, [markOrdersFiltersUserModified, requestCompactRelayout]);

  const removeStatusChip = useCallback(
    (key: string) => {
      markOrdersFiltersUserModified();
      requestCompactRelayout();
      setStatusSelections((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      setStatusDraft((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      setCurrentPage(1);
      queueFilterAnalytics([`Status=${statusDisplay(key).label}`]);
    },
    [markOrdersFiltersUserModified, queueFilterAnalytics, requestCompactRelayout, statusDisplay]
  );

  const removeBeltChip = useCallback(
    (group: keyof BeltSelections, value: string) => {
      markOrdersFiltersUserModified();
      requestCompactRelayout();
      setBeltApplied((prev) => {
        const next = { ...prev, [group]: new Set(prev[group]) };
        next[group].delete(value);
        return next;
      });
      setCurrentPage(1);
      queueFilterAnalytics([`${group}=${value}`]);
    },
    [markOrdersFiltersUserModified, queueFilterAnalytics, requestCompactRelayout]
  );

  const sortableColumnId = useCallback((col: OrderManagementGridColumnItem): SortColumnId => {
    return gridColumnToSortColumnId(col);
  }, []);

  const sortableShipmentColumnId = useCallback(
    (col: OrderManagementGridColumnItem): ShipmentSortColumnId => {
      return shipmentGridColumnToSortColumnId(col);
    },
    []
  );

  const onSortHeader = useCallback(
    (col: OrderManagementGridColumnItem) => {
      if (!isGridColumnSortable(col)) return;
      const id = gridColumnToSortColumnId(col);
      if (!id) return;
      markOrdersFiltersUserModified();
      requestCompactRelayout();
      setCurrentPage(1);
      if (sortColumn === id) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else {
        setSortColumn(id);
        setSortDir(id === "orderDate" ? "desc" : "asc");
      }
    },
    [markOrdersFiltersUserModified, requestCompactRelayout, sortColumn]
  );

  const onSortShipmentBySortColumnId = useCallback(
    (id: ShipmentSortColumnId) => {
      if (!id) return;
      requestCompactRelayout();
      setCurrentPage(1);
      if (sortColumn === id) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else {
        setSortColumn(id);
        setSortDir(id === "items" || id === "shipDate" ? "desc" : "asc");
      }
    },
    [requestCompactRelayout, sortColumn]
  );

  const onSortShipmentHeader = useCallback(
    (col: OrderManagementGridColumnItem) => {
      const id = shipmentGridColumnToSortColumnId(col);
      if (!id) return;
      onSortShipmentBySortColumnId(id);
    },
    [onSortShipmentBySortColumnId]
  );

  const sortableInvoiceColumnId = useCallback(
    (col: OrderManagementGridColumnItem) => invoiceGridColumnToSortColumnId(col),
    []
  );

  const onSortInvoiceBySortColumnId = useCallback(
    (id: SortColumnId) => {
      if (
        id !== "invoiceNumber" &&
        id !== "poNumber" &&
        id !== "orderNumber" &&
        id !== "invoiceStatus" &&
        id !== "invoiceDate" &&
        id !== "dueIn" &&
        id !== "invoiceAmount"
      ) {
        return;
      }
      requestCompactRelayout();
      setCurrentPage(1);
      if (sortColumn === id) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else {
        setSortColumn(id);
        setSortDir(id === "invoiceDate" || id === "invoiceAmount" ? "desc" : "asc");
      }
    },
    [requestCompactRelayout, sortColumn]
  );

  const onSortInvoiceHeader = useCallback(
    (col: OrderManagementGridColumnItem) => {
      if (!isGridColumnSortable(col)) return;
      const id = invoiceGridColumnToSortColumnId(col);
      if (!id) return;
      onSortInvoiceBySortColumnId(id);
    },
    [onSortInvoiceBySortColumnId]
  );

  const sortableQuoteColumnId = useCallback(
    (col: OrderManagementGridColumnItem) => quoteGridColumnToSortColumnId(col),
    []
  );

  const onSortQuoteBySortColumnId = useCallback(
    (id: SortColumnId) => {
      const allowed: SortColumnId[] = [
        "quoteId",
        "quoteContactPerson",
        "items",
        "quoteStatus",
        "quoteDate",
        "quoteExpiresIn",
        "total",
        "orderDate",
      ];
      if (!id || !allowed.includes(id)) return;
      requestCompactRelayout();
      setCurrentPage(1);
      const nextCol = id === "orderDate" ? "quoteDate" : id;
      const normalizedCurrent = sortColumn === "orderDate" ? "quoteDate" : sortColumn;
      if (normalizedCurrent === nextCol) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortColumn(nextCol);
        setSortDir(
          nextCol === "quoteDate" || nextCol === "total" || nextCol === "quoteExpiresIn"
            ? "desc"
            : "asc"
        );
      }
    },
    [requestCompactRelayout, sortColumn]
  );

  const onSortQuoteHeader = useCallback(
    (col: OrderManagementGridColumnItem) => {
      if (!isGridColumnSortable(col)) return;
      const id = quoteGridColumnToSortColumnId(col);
      if (!id) return;
      onSortQuoteBySortColumnId(id);
    },
    [onSortQuoteBySortColumnId]
  );

  const invoiceDueSoonThresholdDays = parseInt(tabFields?.DueSoonThreshold?.value ?? "5", 10);

  const quoteExpirySoonThresholdDays = parseInt(tabFields?.ExpirySoonThreshold?.value ?? "7", 10);

  const dateTriggerLabel = useMemo(
    () =>
      getOrderManagementDateTriggerLabel(
        selectedPresetId,
        dateRange,
        tabFields?.DatePickerSelection,
        locale
      ),
    [dateRange, locale, selectedPresetId, tabFields?.DatePickerSelection]
  );

  const showExpandColumn = !isListingCompactViewport;

  const applyDatePanelWithAnalytics = useCallback(
    (committedPresetId?: string, committedRangeStrings?: DraftDateRangeStrings) => {
      markOrdersFiltersUserModified();
      requestCompactRelayout();
      const applied = datePanel.applyDatePanel(committedPresetId, committedRangeStrings);
      if (applied) {
        queueFilterAnalytics([`DateRange=${toYmd(applied.start)}..${toYmd(applied.end)}`]);
      }
    },
    [datePanel, markOrdersFiltersUserModified, queueFilterAnalytics, requestCompactRelayout]
  );

  const clearDatePanelWithAnalytics = useCallback(() => {
    markOrdersFiltersUserModified();
    requestCompactRelayout();
    queueFilterAnalytics(["DateRange=Default"]);
    datePanel.clearDatePanel();
  }, [datePanel, markOrdersFiltersUserModified, queueFilterAnalytics, requestCompactRelayout]);

  const trackDocumentDownload = useCallback(
    (documentType: "Quote" | "Invoice" | "Packing Slip", documentId?: string) => {
      const tabName = resolveActiveTabName();
      logGTMOrderManagementDocumentDownload({
        document_type: documentType,
        tab_name: tabName,
        document_id: documentId,
      });
      void sendOrderManagementDocumentDownloadEvent({
        type: "customerportal:DOCUMENT_DOWNLOAD",
        documentType,
        tabName,
        documentId,
      });
    },
    [resolveActiveTabName]
  );

  const onInvoiceDownloadStart = useCallback(
    (invoiceNumber: string) => {
      trackDocumentDownload("Invoice", invoiceNumber);
    },
    [trackDocumentDownload]
  );

  const onQuoteDownloadStart = useCallback(
    (quoteNumber: string) => {
      trackDocumentDownload("Quote", quoteNumber);
    },
    [trackDocumentDownload]
  );

  const onPackingSlipDownloadStart = useCallback(
    (shipmentReference: string) => {
      trackDocumentDownload("Packing Slip", shipmentReference);
    },
    [trackDocumentDownload]
  );

  const trackQuoteRequested = useCallback(
    (
      initiationPoint: "Header" | "Line Item" | "OrderDetailHeader",
      requestMode: "Bulk" | "Single" | "AllOrderLines"
    ) => {
      if (initiationPoint === "OrderDetailHeader") {
        return;
      }
      const tabName = resolveActiveTabName();
      const requestModeGtm: "Bulk" | "Single" =
        requestMode === "AllOrderLines" ? "Bulk" : requestMode;
      logGTMOrderManagementQuoteRequested({
        initiation_point: initiationPoint,
        request_mode: requestModeGtm,
        tab_name: tabName,
      });
      void sendOrderManagementQuoteRequestedEvent({
        type: "customerportal:QUOTE_REQUESTED",
        initiationPoint,
        requestMode: requestModeGtm,
        tabName,
      });
    },
    [resolveActiveTabName]
  );

  const onHeaderQuoteRequestStart = useCallback(() => {
    trackQuoteRequested("Header", "Bulk");
  }, [trackQuoteRequested]);

  const onLineItemQuoteRequestStart = useCallback(() => {
    trackQuoteRequested("Line Item", "Single");
  }, [trackQuoteRequested]);

  const orderDetailHref = useCallback((order: OrderRecord) => {
    const base = "/orders-management/orders";
    return `${base}/${encodeURIComponent(order.orderHeaderId)}`;
  }, []);

  const quoteDetailHref = useCallback((row: QuoteRecord) => {
    const base = "/orders-management/quotes";
    return `${base}/${encodeURIComponent(quoteDetailRouteId(row))}`;
  }, []);

  useEffect(() => {
    if (tabKind !== "orders") {
      setDocumentRequestListingTarget(null);
    }
  }, [tabKind]);

  const openDocumentRequestFromOrdersList = useCallback(
    (order: OrderRecord, line: OrderLineItem) => {
      setDocumentRequestListingTarget({ order, line });
    },
    []
  );

  const closeDocumentRequestFromOrdersList = useCallback(() => {
    setDocumentRequestListingTarget(null);
  }, []);

  return {
    fields,
    paramsStyles,
    renderingId,
    accountId,
    pathname,
    isMobile,
    isTablet,
    isListingCompactViewport,
    locale,
    canRequestQuote,
    canRequestDocumentation,
    onHeaderQuoteRequestStart,
    onLineItemQuoteRequestStart,
    trackQuoteRequested,
    onInvoiceDownloadStart,
    onQuoteDownloadStart,
    onPackingSlipDownloadStart,
    visibleTabs,
    activeTab,
    tabKind,
    isRenderableDataTab,
    isOnOrdersTab: isRenderableDataTab,
    tabFields,
    trackingCarrierSelection,
    shipmentPageSlice,
    invoicePageSlice,
    resultSummaryPatternField,
    sortableShipmentColumnId,
    onSortShipmentHeader,
    onSortShipmentBySortColumnId,
    sortableInvoiceColumnId,
    onSortInvoiceHeader,
    onSortInvoiceBySortColumnId,
    invoiceDueSoonThresholdDays: Number.isFinite(invoiceDueSoonThresholdDays)
      ? invoiceDueSoonThresholdDays
      : 5,
    quotePageSlice,
    quoteExpirySoonThresholdDays: Number.isFinite(quoteExpirySoonThresholdDays)
      ? quoteExpirySoonThresholdDays
      : 7,
    onSortQuoteHeader,
    onSortQuoteBySortColumnId,
    sortableQuoteColumnId,
    searchInput,
    setSearchInput,
    handleSearchInputChange,
    appliedSearch,
    setAppliedSearch,
    handleSearchInputKeyDown,
    applySearchAllAttributes,
    statusSelections,
    beltApplied,
    beltDraft,
    setBeltDraft,
    dateRange,
    currentPage,
    setCurrentPage: setCurrentPageFromUser,
    pageSize,
    setPageSize: setPageSizeFromUser,
    onPageSizeChange,
    sortColumn,
    sortDir,
    expandedIds,
    loadError,
    isOrdersListLoading,
    fetchRemote,
    apiLive,
    openStatus,
    setOpenStatus,
    openBelt,
    setOpenBelt,
    openDate,
    setOpenDate,
    mobileSheet,
    setMobileSheet,
    draftPresetId: datePanel.draftPresetId,
    setDraftPresetId: datePanel.setDraftPresetId,
    draftStartStr: datePanel.draftStartStr,
    draftEndStr: datePanel.draftEndStr,
    onDraftStartStrChange: datePanel.onDraftStartStrChange,
    onDraftEndStrChange: datePanel.onDraftEndStrChange,
    onDraftStartFocus: datePanel.onDraftStartFocus,
    onDraftEndFocus: datePanel.onDraftEndFocus,
    onDraftInvalidYearFieldsChange: datePanel.onDraftInvalidYearFieldsChange,
    beltSearch,
    setBeltSearch,
    statusRef,
    beltRef,
    dateRef,
    totalResults,
    totalPages,
    safePage,
    pageSizeOptions,
    pageSlice,
    beltSubgroupMeta,
    showBeltFilter,
    hideStatusFilter,
    showBanner,
    gridColumns,
    statusPhrase,
    statusDisplay,
    toggleExpand,
    statusDraft,
    toggleStatusDraftOption,
    syncStatusDraftFromApplied,
    syncBeltDraftFromApplied,
    beltCount,
    scrollThreshold,
    searchThreshold,
    beltSearchPh,
    toggleBeltDraft,
    applyBelt,
    clearBeltDraft,
    clearAllChips,
    removeStatusChip,
    removeBeltChip,
    openDatePanel: datePanel.openDatePanel,
    applyPresetRange: datePanel.applyPresetRange,
    applyDatePanel: applyDatePanelWithAnalytics,
    clearDatePanel: clearDatePanelWithAnalytics,
    validationMessage: datePanel.validationMessage,
    rangeConstraintInvalid: datePanel.rangeConstraintInvalid,
    rangeInvalid: datePanel.rangeInvalid,
    defaultPresetId: datePanel.defaultDatePreset.presetId,
    datePanelApplyDisabled: datePanel.datePanelApplyDisabled,
    draftRangeCalendarValue: datePanel.draftRangeCalendarValue,
    draftCalendarViewFocus: datePanel.draftCalendarViewFocus,
    onDraftRangeCalendarChange: datePanel.onDraftRangeCalendarChange,
    rangeCalendarBounds,
    dateInputBounds,
    sortableColumnId,
    onSortHeader,
    dateTriggerLabel,
    allowCustomDateRange,
    showExpandColumn,
    orderDetailHref,
    quoteDetailHref,
    draftRange: datePanel.draftRange,
    selectedPresetId,
    setSelectedPresetId,
    documentRequestListingTarget,
    openDocumentRequestFromOrdersList,
    closeDocumentRequestFromOrdersList,
  };
}

/** View-model returned by {@link useOrderManagementShell} (state, handlers, and derived data for the orders UI). */
export type OrderManagementShell = ReturnType<typeof useOrderManagementShell>;
