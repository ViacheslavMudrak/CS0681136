import type { BeltSelections } from "@/lib/orderManagementUtils";
import {
  endOfDayClone,
  parseIsoYmdToLocalDate,
  startOfDayClone,
  type SortColumnId,
} from "@/lib/orderManagementUtils";

/** sessionStorage root for order list UI state (filters, paging, sort) — keyed by account. */
export const ORDER_MANAGEMENT_FILTERS_STORAGE_KEY = "cp_order_management_filters_v1";

export interface OrderManagementFiltersPersistedV1 {
  version: 1;
  /** True after the user changes the persisted list state; absent legacy snapshots are treated as modified. */
  hasUserModifiedFilters?: boolean;
  searchInput: string;
  appliedSearch: string;
  statusKeys: string[];
  belt: {
    series: string[];
    style: string[];
    material: string[];
    color: string[];
  };
  /** Local calendar dates as YYYY-MM-DD (same as {@link toYmd} / draft inputs). */
  dateStartYmd: string;
  dateEndYmd: string;
  selectedPresetId: string;
  currentPage: number;
  pageSize: number;
  sortColumn: SortColumnId;
  sortDir: "asc" | "desc";
}

interface StorageRootV1 {
  v: 1;
  accounts: Record<string, OrderManagementFiltersPersistedV1>;
}

function isSortColumnId(x: unknown): x is SortColumnId {
  return x === null || x === "orderDate" || x === "items" || x === "total";
}

function clampPageSize(requested: number, allowed: number[], fallback: number): number {
  const n = Number.isFinite(requested) && requested > 0 ? Math.floor(requested) : fallback;
  if (allowed.includes(n)) return n;
  if (allowed.includes(fallback)) return fallback;
  return allowed[0] ?? fallback;
}

function parsePersisted(raw: unknown): OrderManagementFiltersPersistedV1 | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.version !== 1) return null;
  if (typeof o.searchInput !== "string" || typeof o.appliedSearch !== "string") return null;
  if (!Array.isArray(o.statusKeys) || !o.statusKeys.every((k) => typeof k === "string"))
    return null;
  const belt = o.belt;
  if (!belt || typeof belt !== "object") return null;
  const b = belt as Record<string, unknown>;
  const dims = ["series", "style", "material", "color"] as const;
  for (const d of dims) {
    if (!Array.isArray(b[d]) || !(b[d] as unknown[]).every((x) => typeof x === "string"))
      return null;
  }
  if (typeof o.dateStartYmd !== "string" || typeof o.dateEndYmd !== "string") return null;
  if (typeof o.selectedPresetId !== "string") return null;
  if (typeof o.currentPage !== "number" || o.currentPage < 1) return null;
  if (typeof o.pageSize !== "number" || o.pageSize < 1) return null;
  if (!isSortColumnId(o.sortColumn)) return null;
  if (o.sortDir !== "asc" && o.sortDir !== "desc") return null;

  return {
    version: 1,
    hasUserModifiedFilters:
      typeof o.hasUserModifiedFilters === "boolean" ? o.hasUserModifiedFilters : true,
    searchInput: o.searchInput,
    appliedSearch: o.appliedSearch,
    statusKeys: o.statusKeys as string[],
    belt: {
      series: b.series as string[],
      style: b.style as string[],
      material: b.material as string[],
      color: b.color as string[],
    },
    dateStartYmd: o.dateStartYmd,
    dateEndYmd: o.dateEndYmd,
    selectedPresetId: o.selectedPresetId,
    currentPage: Math.floor(o.currentPage),
    pageSize: Math.floor(o.pageSize),
    sortColumn: o.sortColumn as SortColumnId,
    sortDir: o.sortDir,
  };
}

/** Restores date range from persisted YMD; returns null if invalid. */
export function dateRangeFromPersistedYmd(
  dateStartYmd: string,
  dateEndYmd: string
): { start: Date; end: Date } | null {
  const s = parseIsoYmdToLocalDate(dateStartYmd.trim());
  const e = parseIsoYmdToLocalDate(dateEndYmd.trim());
  if (!s || !e) return null;
  const start = startOfDayClone(s);
  const end = endOfDayClone(e);
  if (end < start) return null;
  return { start, end };
}

export function beltSelectionsFromPersisted(
  belt: OrderManagementFiltersPersistedV1["belt"]
): BeltSelections {
  return {
    series: new Set(belt.series),
    style: new Set(belt.style),
    material: new Set(belt.material),
    color: new Set(belt.color),
  };
}

/** Returns Sitecore defaults only before an Orders snapshot exists for the account/session. */
export function resolveOrderManagementStatusKeysForHydration(
  persisted: OrderManagementFiltersPersistedV1 | null,
  cmsDefaultStatusKeys: string[]
): string[] {
  return persisted ? persisted.statusKeys : cmsDefaultStatusKeys;
}

export function readOrderManagementFilters(
  accountId: string,
  pageSizeAllowed: number[],
  defaultPageSize: number
): OrderManagementFiltersPersistedV1 | null {
  if (typeof window === "undefined" || !accountId.trim()) return null;
  try {
    const raw = sessionStorage.getItem(ORDER_MANAGEMENT_FILTERS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StorageRootV1;
    if (!parsed || parsed.v !== 1 || !parsed.accounts || typeof parsed.accounts !== "object") {
      return null;
    }
    const rec = parsed.accounts[accountId];
    const valid = parsePersisted(rec);
    if (!valid) return null;
    const pageSize = clampPageSize(valid.pageSize, pageSizeAllowed, defaultPageSize);
    const currentPage = Math.max(1, Math.floor(valid.currentPage));
    return { ...valid, pageSize, currentPage };
  } catch {
    return null;
  }
}

export function writeOrderManagementFilters(
  accountId: string,
  snapshot: OrderManagementFiltersPersistedV1,
  pageSizeAllowed: number[],
  defaultPageSize: number
): void {
  if (typeof window === "undefined" || !accountId.trim()) return;
  try {
    const pageSize = clampPageSize(snapshot.pageSize, pageSizeAllowed, defaultPageSize);
    const normalized: OrderManagementFiltersPersistedV1 = {
      ...snapshot,
      hasUserModifiedFilters: snapshot.hasUserModifiedFilters === true,
      pageSize,
      currentPage: Math.max(1, Math.floor(snapshot.currentPage)),
    };
    const raw = sessionStorage.getItem(ORDER_MANAGEMENT_FILTERS_STORAGE_KEY);
    const root: StorageRootV1 = raw
      ? (() => {
          try {
            const p = JSON.parse(raw) as StorageRootV1;
            if (p && p.v === 1 && p.accounts && typeof p.accounts === "object") return p;
          } catch {
            /* fall through */
          }
          return { v: 1, accounts: {} };
        })()
      : { v: 1, accounts: {} };
    root.accounts[accountId] = normalized;
    sessionStorage.setItem(ORDER_MANAGEMENT_FILTERS_STORAGE_KEY, JSON.stringify(root));
  } catch {
    // quota / private mode
  }
}

/** Clear all persisted order-list filter state (e.g. logout). */
export function clearOrderManagementFiltersStorage(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(ORDER_MANAGEMENT_FILTERS_STORAGE_KEY);
  } catch {
    // ignore
  }
}
