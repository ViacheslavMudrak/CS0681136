"use client";

import type { OrderDetailApiData } from "@/components/core/OrderDetail/OrderDetail.type";
import { getOrderDetail } from "@/lib/apis/order-detail-api";
import { getBlankOrderDetailApiData } from "@/lib/order-detail-blank-data";
import { useProfileContext } from "@/lib/profile-context";
import { useCallback, useEffect, useState } from "react";

export interface UseOrderDetailParams {
  orderHeaderId: string;
  isEditing: boolean;
}

export function useOrderDetail({ orderHeaderId, isEditing }: UseOrderDetailParams) {
  const { selectedAccount } = useProfileContext();
  const accountId = selectedAccount?.id ?? "";

  const [data, setData] = useState<OrderDetailApiData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrderDetail = useCallback(async () => {
    if (!orderHeaderId.trim()) {
      setLoadError("Missing order");
      setData(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError(null);
    try {
      const headerNum = Number(orderHeaderId);
      const acctNum = Number(accountId);
      if (!Number.isFinite(headerNum) || !Number.isFinite(acctNum)) {
        setData(null);
        setLoadError("Could not load order");
        return;
      }
      const res = await getOrderDetail({ orderHeaderId: headerNum, accountId: acctNum });
      if (!res.success || !res.data) {
        setData(null);
        setLoadError("Could not load order");
        return;
      }
      setData(res.data);
    } catch {
      setData(null);
      setLoadError("Could not load order");
    } finally {
      setIsLoading(false);
    }
  }, [accountId, orderHeaderId]);

  const refetchOrderDetail = useCallback(async () => {
    const noAccount = !accountId.trim();
    const noHeader = !orderHeaderId.trim();
    if (isEditing && noAccount && noHeader) {
      setData(getBlankOrderDetailApiData());
      setLoadError(null);
      setIsLoading(false);
      return;
    }
    await fetchOrderDetail();
  }, [accountId, fetchOrderDetail, isEditing, orderHeaderId]);

  useEffect(() => {
    const noAccount = !accountId.trim();
    const noHeader = !orderHeaderId.trim();
    if (isEditing && noAccount && noHeader) {
      setData(getBlankOrderDetailApiData());
      setLoadError(null);
      setIsLoading(false);
      return;
    }
    if (accountId && orderHeaderId.trim()) {
      void fetchOrderDetail();
      return;
    }
    setIsLoading(false);
    setData(null);
    setLoadError(null);
  }, [accountId, fetchOrderDetail, orderHeaderId, isEditing]);

  return { data, loadError, isLoading, refetch: refetchOrderDetail };
}
