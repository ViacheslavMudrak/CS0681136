import { API_ROUTES } from "@/lib/apis/api-routes";
import { request } from "@/lib/apis/api-service";
import type { QuoteRequestDraftDto } from "@/lib/quote-request/request-quote.types";

/**
 * DXP quote-request draft (GET/POST) and submit (POST). {@link useQuoteRequest} awaits these
 * calls before updating UI state; failures propagate to callers for error handling.
 */
function ensureAccountOnDraft(
  accountId: string,
  body: QuoteRequestDraftDto,
  email?: string
): QuoteRequestDraftDto {
  const n = Number(accountId);
  const trimmed = (email ?? body.email ?? "").trim();
  return {
    ...body,
    accountID: Number.isFinite(n) && n > 0 ? n : body.accountID,
    ...(trimmed ? { email: trimmed } : {}),
  };
}

/** DXP wrapper: `{ success, data: { ...draft } }` or raw draft for backwards compatibility. */
function unwrapQuoteDraftResponse(json: unknown): QuoteRequestDraftDto {
  if (json && typeof json === "object" && "data" in json) {
    const data = (json as { data?: unknown }).data;
    if (data && typeof data === "object") {
      return data as QuoteRequestDraftDto;
    }
  }
  return json as QuoteRequestDraftDto;
}

/**
 * Load the customer’s quote-request draft (`GET /quotes?email=&accountId=`). On mount,
 * `useQuoteRequest` shows local data first, then calls this in the background and updates
 * state + `localStorage` on success.
 */
export async function fetchQuoteRequestDraft(
  accountId: string,
  email: string
): Promise<QuoteRequestDraftDto> {
  const raw = await request<unknown>({
    method: "GET",
    path: API_ROUTES.QUOTE_REQUEST,
    params: {
      email: email.trim(),
      accountId: String(accountId),
    },
  });
  return unwrapQuoteDraftResponse(raw);
}

/**
 * Save the full draft (`POST /quotes`). Response includes `quoteRequestId` and updated rows.
 */
export async function saveQuoteRequestDraft(
  accountId: string,
  body: QuoteRequestDraftDto,
  email?: string
): Promise<QuoteRequestDraftDto> {
  const payload = ensureAccountOnDraft(accountId, body, email);
  const raw = await request<unknown>({
    method: "POST",
    path: API_ROUTES.QUOTE_REQUEST,
    body: payload,
  });
  return unwrapQuoteDraftResponse(raw);
}

export type SubmitQuoteRequestResult =
  | { success: true; requestId: string }
  | { success: false; errorMessage?: string };

function parseSubmitQuoteResponse(
  raw: unknown,
  fallbackQuoteRequestId: number
): SubmitQuoteRequestResult {
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    if (o.success === false) {
      return {
        success: false,
        errorMessage: typeof o.message === "string" ? o.message : undefined,
      };
    }
    const data = o.data;
    let idStr = "";
    if (data && typeof data === "object") {
      const d = data as Record<string, unknown>;
      if (typeof d.quoteRequestId === "number") idStr = String(d.quoteRequestId);
    }
    if (!idStr && typeof o.quoteRequestId === "number") {
      idStr = String(o.quoteRequestId);
    }
    if (o.success === true) {
      return { success: true, requestId: idStr || String(fallbackQuoteRequestId) };
    }
  }
  return { success: true, requestId: String(fallbackQuoteRequestId) };
}

/** Body for final submit (`POST /quotes/{quoteRequestId}`). */
export type SubmitQuoteRequestBody = {
  additionalComments: string;
};

/**
 * Final submit (`POST /quotes/{quoteRequestId}`) with optional reviewer notes.
 */
export async function submitQuoteRequest(
  quoteRequestId: number,
  body: SubmitQuoteRequestBody
): Promise<SubmitQuoteRequestResult> {
  const id = encodeURIComponent(String(quoteRequestId));
  const raw = await request<unknown>({
    method: "POST",
    path: `${API_ROUTES.QUOTE_REQUEST}/${id}`,
    body: {
      additionalComments: body.additionalComments.trim(),
    },
  });
  return parseSubmitQuoteResponse(raw, quoteRequestId);
}
