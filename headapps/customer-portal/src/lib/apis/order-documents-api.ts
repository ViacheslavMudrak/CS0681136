"use client";

import { API_ROUTES } from "@/lib/apis/api-routes";
import { DXP_PROXY_PREFIX, requestBlob } from "@/lib/apis/api-service";

export interface FetchOrderDocumentPdfBlobInput {
  path: string;
  requestId?: string;
  language?: string;
  requestSource?: string;
}

const DEFAULT_ORDER_DOCUMENT_REQUEST_ID = "1";
const DEFAULT_ORDER_DOCUMENT_LANGUAGE = "1";
const DEFAULT_ORDER_DOCUMENT_REQUEST_SOURCE = "1";

export function buildOrderDocumentBinaryParams(
  input: FetchOrderDocumentPdfBlobInput
): Record<string, string> {
  const path = input.path.trim();
  if (!path) {
    throw new Error("Document path is required.");
  }

  return {
    path,
    requestId: (input.requestId ?? DEFAULT_ORDER_DOCUMENT_REQUEST_ID).trim(),
    language: (input.language ?? DEFAULT_ORDER_DOCUMENT_LANGUAGE).trim(),
    requestSource: (input.requestSource ?? DEFAULT_ORDER_DOCUMENT_REQUEST_SOURCE).trim(),
  };
}

export function buildOrderDocumentBinaryApiUrl(input: FetchOrderDocumentPdfBlobInput): string {
  const params = buildOrderDocumentBinaryParams(input);
  const qs = new URLSearchParams(params).toString();
  return `${DXP_PROXY_PREFIX}${API_ROUTES.ORDERS_DOCUMENTS_BINARY}?${qs}`;
}

export async function fetchOrderDocumentPdfBlob(
  input: FetchOrderDocumentPdfBlobInput
): Promise<Blob> {
  const params = buildOrderDocumentBinaryParams(input);

  return requestBlob({
    method: "GET",
    path: API_ROUTES.ORDERS_DOCUMENTS_BINARY,
    params,
    options: {
      headers: {
        Accept: "application/pdf, application/octet-stream;q=0.9, */*;q=0.8",
        requestId: params.requestId,
        language: params.language,
      },
    },
  });
}
