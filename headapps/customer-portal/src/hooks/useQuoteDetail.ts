"use client";

import type { QuoteDetailViewData } from "@/lib/quote-detail-mapper";
import { getQuoteDetail } from "@/lib/apis/quote-detail-api";
import { useProfileContext } from "@/lib/profile-context";
import { useCallback, useEffect, useState } from "react";

export interface UseQuoteDetailParams {
  quoteId: string;
  isEditing: boolean;
}

export function useQuoteDetail({ quoteId, isEditing }: UseQuoteDetailParams) {
  const { selectedAccount } = useProfileContext();
  const accountId = selectedAccount?.id ?? "";

  const [data, setData] = useState<QuoteDetailViewData | null>(null);
  /** True when fetch failed, account invalid, or quote id missing (show CMS error / empty state). */
  const [loadFailed, setLoadFailed] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuoteDetail = useCallback(async () => {
    if (!quoteId.trim()) {
      setLoadFailed(true);
      setData(null);
      setNotFound(false);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadFailed(false);
    setNotFound(false);
    try {
      const acctNum = Number.parseInt(String(accountId), 10);
      if (!Number.isFinite(acctNum)) {
        setData(null);
        setNotFound(false);
        setLoadFailed(true);
        setIsLoading(false);
        return;
      }
      const res = await getQuoteDetail({ quoteId: quoteId.trim(), accountId: acctNum });
      if (!res.success || !res.data) {
        setData(null);
        setNotFound(Boolean(res.notFound));
        setLoadFailed(!res.notFound);
        return;
      }
      setNotFound(false);
      setLoadFailed(false);
      setData(res.data);
    } catch {
      setData(null);
      setLoadFailed(true);
    } finally {
      setIsLoading(false);
    }
  }, [accountId, quoteId]);

  const refetchQuoteDetail = useCallback(async () => {
    if (isEditing && !accountId.trim() && !quoteId.trim()) {
      setData(null);
      setLoadFailed(false);
      setNotFound(false);
      setIsLoading(false);
      return;
    }
    await fetchQuoteDetail();
  }, [accountId, fetchQuoteDetail, isEditing, quoteId]);

  useEffect(() => {
    if (isEditing && !accountId.trim() && !quoteId.trim()) {
      setData(null);
      setLoadFailed(false);
      setNotFound(false);
      setIsLoading(false);
      return;
    }
    if (accountId && quoteId.trim()) {
      void fetchQuoteDetail();
      return;
    }
    setIsLoading(false);
    setData(null);
    setLoadFailed(Boolean(accountId) && !quoteId.trim());
    setNotFound(false);
  }, [accountId, fetchQuoteDetail, quoteId, isEditing]);

  return { data, loadFailed, notFound, isLoading, refetch: refetchQuoteDetail };
}
