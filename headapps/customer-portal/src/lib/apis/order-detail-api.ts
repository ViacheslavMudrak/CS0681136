"use client";

import type {
  OrderDetailApiData,
  OrderDetailApiEnvelope,
  OrderDetailDocument,
} from "@/components/core/OrderDetail/OrderDetail.type";
import { API_ROUTES } from "@/lib/apis/api-routes";
import { isApiRequestError, request } from "@/lib/apis/api-service";

export interface GetOrderDetailParams {
  orderHeaderId: number;
  accountId: number;
}

/** DXP envelope for GET /Orders/{orderHeaderId} (same shape as POST /orders). */
export interface DxpOrderDetailApiResponse {
  success: boolean;
  statusCode: number;
  methodName?: string;
  message: string;
  data: OrderDetailApiData | null;
  errors: unknown;
}

type RawOrderDetailDocument = OrderDetailDocument & {
  Language?: string | null;
  LanguageCode?: string | null;
};

function hasUsableOrderDetailData(data: OrderDetailApiData | null | undefined): data is OrderDetailApiData {
  return Boolean(data?.order && typeof data.order === "object");
}

function normalizeDocumentLanguageCode(doc: RawOrderDetailDocument): string | undefined {
  const raw = doc.languageCode ?? doc.LanguageCode ?? doc.language ?? doc.Language;
  const normalized = String(raw ?? "").trim().toUpperCase();
  return normalized || undefined;
}

function normalizeOrderDetailData(data: OrderDetailApiData): OrderDetailApiData {
  return {
    ...data,
    shipments: (data.shipments ?? []).map((shipment) => ({
      ...shipment,
      packingSlip: shipment.packingSlip?.map((doc) => {
        const languageCode = normalizeDocumentLanguageCode(doc);
        return languageCode ? { ...doc, languageCode } : doc;
      }),
    })),
  };
}

/**
 * Fetches order detail for a specific order header id (GET /Orders/{orderHeaderId}?accountId=).
 */
export async function getOrderDetail({
  orderHeaderId,
  accountId,
}: GetOrderDetailParams): Promise<OrderDetailApiEnvelope> {
  const trimmedHeaderId = String(orderHeaderId).trim();
  const account = String(accountId).trim();

  if (!trimmedHeaderId || !account) {
    return { success: false, data: null };
  }

  try {
    const raw = await request<DxpOrderDetailApiResponse | OrderDetailApiData>({
      method: "GET",
      path: `${API_ROUTES.ORDER_DETAIL}?orderHeaderId=${encodeURIComponent(trimmedHeaderId)}&accountId=${encodeURIComponent(account)}`,      
    });

    if (raw && typeof raw === "object" && "success" in raw) {
      const apiResponse = raw as DxpOrderDetailApiResponse;
      if (!apiResponse.success || !hasUsableOrderDetailData(apiResponse.data)) {
        if (apiResponse.statusCode === 404) {
          return { success: false, data: null, notFound: true };
        }
        if (apiResponse.success) {
          return { success: false, data: null, notFound: true };
        }
        return { success: false, data: null };
      }
      return { success: true, data: normalizeOrderDetailData(apiResponse.data) };
    }

    const direct = raw as OrderDetailApiData;
    if (direct?.order && typeof direct.order === "object") {
      return { success: true, data: normalizeOrderDetailData(direct) };
    }

    return { success: false, data: null };
  } catch (error) {
    if (isApiRequestError(error) && error.status === 404) {
      return { success: false, data: null, notFound: true };
    }
    return { success: false, data: null };
  }
}