"use client";

import { API_ROUTES } from "@/lib/apis/api-routes";
import { request } from "@/lib/apis/api-service";

export type DocumentRequestEntryPoint = "EP1" | "EP2a" | "EP2b";

export interface DocumentRequestLinePayload {
  lineId: string;
  customerPartNumber: string;
  intraloxPartNumber: string;
  description: string;
  quantity: number;
}

export interface DocumentRequestRecipientPayload {
  email: string;
  name: string;
}

/** One selected document type row sent to the notification API (CMS Label + optional other). */
export interface DocumentRequestItemPayload {
  documentType: string;
  otherDocumentType?: string;
}

export interface DocumentRequestPayload {
  entryPoint: DocumentRequestEntryPoint;
  accountId: string;
  customerAccountName: string;
  customerAccountNumber: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  dynamicsLink: string;
  orderNumber: string;
  poNumber: string;
  requests: DocumentRequestItemPayload[];
  /** Single shared notes from the Request Document form (same value as the UI “additional notes” field). */
  comments: string;
  lineItems: DocumentRequestLinePayload[];
  recipients: DocumentRequestRecipientPayload[];
}

export interface DocumentRequestApiResult {
  success: boolean;
  message?: string;
  requestId?: string;
}

export async function submitDocumentRequest(
  body: DocumentRequestPayload
): Promise<DocumentRequestApiResult> {
  try {
    const raw = await request<unknown>({
      method: "POST",
      path: API_ROUTES.DOCUMENT_REQUEST_NOTIFICATION,
      body,
    });
    if (raw && typeof raw === "object") {
      const o = raw as Record<string, unknown>;
      if ("success" in o && o.success === true) {
        const data = o.data;
        const requestId =
          data && typeof data === "object"
            ? String((data as Record<string, unknown>).requestId ?? "").trim()
            : "";
        return { success: true, ...(requestId ? { requestId } : {}) };
      }
      const msg =
        typeof o.message === "string"
          ? o.message
          : typeof o.Message === "string"
            ? o.Message
            : undefined;
      const trimmed = msg?.trim();
      return { success: false, ...(trimmed ? { message: trimmed } : {}) };
    }
    return { success: true };
  } catch {
    return { success: false };
  }
}
