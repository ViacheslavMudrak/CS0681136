"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  fetchDashboardRecentData,
  type DashboardRecentDataPayload,
} from "@/lib/apis/dashboard-recent-data-api";
import { DEFAULT_RECENT_WIDGET_DAYS } from "@/lib/dashboard-recent-widgets.util";
import { useProfileContextOptional } from "@/lib/profile-context";

const DEFAULT_RECENT_ITEM_COUNT = 5;

export interface DashboardRecentDataContextValue {
  loading: boolean;
  error: string | null;
  data: DashboardRecentDataPayload | null;
  refetch: () => Promise<void>;
  recentDataSettled: boolean;
  /** Registers MaxItemsDisplayed from RecentOrderWidget. */
  registerOrderCount: (count: number | null) => void;
  /** Registers MaxItemsDisplayed from RecentQuoteWidget. */
  registerQuoteCount: (count: number | null) => void;
  /** Registers date window (days) from RecentOrderWidget CMS fields. */
  registerOrderDays: (days: number | null) => void;
  /** Registers date window (days) from RecentQuoteWidget CMS fields. */
  registerQuoteDays: (days: number | null) => void;
}

const DashboardRecentDataContext = createContext<DashboardRecentDataContextValue | undefined>(
  undefined
);

export function DashboardRecentDataProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const profile = useProfileContextOptional();
  const accountIdRaw = profile?.selectedAccount?.id ?? "";
  const accountId = Number.parseInt(String(accountIdRaw), 10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardRecentDataPayload | null>(null);
  const [recentDataSettled, setRecentDataSettled] = useState(false);
  const [orderCount, setOrderCount] = useState(DEFAULT_RECENT_ITEM_COUNT);
  const [quoteCount, setQuoteCount] = useState(DEFAULT_RECENT_ITEM_COUNT);
  const [orderDays, setOrderDays] = useState(DEFAULT_RECENT_WIDGET_DAYS);
  const [quoteDays, setQuoteDays] = useState(DEFAULT_RECENT_WIDGET_DAYS);

  const registerOrderCount = useCallback((count: number | null) => {
    setOrderCount(count ?? DEFAULT_RECENT_ITEM_COUNT);
  }, []);

  const registerQuoteCount = useCallback((count: number | null) => {
    setQuoteCount(count ?? DEFAULT_RECENT_ITEM_COUNT);
  }, []);

  const registerOrderDays = useCallback((days: number | null) => {
    setOrderDays(days ?? DEFAULT_RECENT_WIDGET_DAYS);
  }, []);

  const registerQuoteDays = useCallback((days: number | null) => {
    setQuoteDays(days ?? DEFAULT_RECENT_WIDGET_DAYS);
  }, []);

  const load = useCallback(async () => {
    if (!Number.isFinite(accountId) || accountId <= 0) {
      setLoading(false);
      setData(null);
      setError(null);
      setRecentDataSettled(false);
      return;
    }
    setLoading(true);
    setRecentDataSettled(false);
    setError(null);
    try {
      const payload = await fetchDashboardRecentData({
        accountId,
        orderCount,
        quoteCount,
        orderDays,
        quoteDays,
      });
      setData(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard data");
      setData(null);
    } finally {
      setLoading(false);
      setRecentDataSettled(true);
    }
  }, [accountId, orderCount, quoteCount, orderDays, quoteDays]);

  useEffect(() => {
    void load();
  }, [load]);

  const value = useMemo(
    () => ({
      loading,
      error,
      data,
      refetch: load,
      recentDataSettled,
      registerOrderCount,
      registerQuoteCount,
      registerOrderDays,
      registerQuoteDays,
    }),
    [
      loading,
      error,
      data,
      load,
      recentDataSettled,
      registerOrderCount,
      registerQuoteCount,
      registerOrderDays,
      registerQuoteDays,
    ]
  );

  return (
    <DashboardRecentDataContext.Provider value={value}>
      {children}
    </DashboardRecentDataContext.Provider>
  );
}

export function useDashboardRecentData(): DashboardRecentDataContextValue {
  const ctx = useContext(DashboardRecentDataContext);
  if (!ctx) {
    throw new Error("useDashboardRecentData must be used within DashboardRecentDataProvider");
  }
  return ctx;
}

export function useDashboardRecentDataOptional(): DashboardRecentDataContextValue | undefined {
  return useContext(DashboardRecentDataContext);
}
