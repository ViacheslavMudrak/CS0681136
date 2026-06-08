import { isApiRequestError } from "@/lib/apis/api-service";

const OPAQUE_FETCH_ERROR_MESSAGES = new Set([
  "failed to fetch",
  "networkerror when attempting to fetch resource.",
  "networkerror when attempting to fetch resource",
  "network request failed",
  "load failed",
]);

export const QUOTE_REQUEST_SAVE_CONNECTION_MESSAGE =
  "Could not process your quote request. Check your internet connection and try again.";

export const QUOTE_REQUEST_SAVE_FALLBACK_MESSAGE =
  "Could not process your quote request. Please try again.";

/** Browser/network failures that should not be shown verbatim to users. */
export function isOpaqueBrowserFetchError(err: unknown): boolean {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return true;
  }
  if (!(err instanceof Error)) return false;

  const msg = err.message.trim().toLowerCase();
  if (OPAQUE_FETCH_ERROR_MESSAGES.has(msg)) return true;
  if (err.name === "NetworkError") return true;
  if (err.name === "TypeError" && msg.includes("fetch")) return true;

  return false;
}

export function resolveQuoteRequestErrorMessage(
  err: unknown,
  options: {
    cmsMessage?: string;
    connectionMessage?: string;
    fallbackMessage?: string;
  } = {}
): string {
  const connection = options.connectionMessage?.trim() || QUOTE_REQUEST_SAVE_CONNECTION_MESSAGE;
  const cms = options.cmsMessage?.trim();
  const fallback = options.fallbackMessage?.trim() || cms || QUOTE_REQUEST_SAVE_FALLBACK_MESSAGE;

  if (isApiRequestError(err)) {
    const apiMsg = err.message.trim();
    return apiMsg || cms || fallback;
  }

  if (isOpaqueBrowserFetchError(err)) {
    return connection;
  }

  if (err instanceof Error && err.message.trim()) {
    return err.message.trim();
  }

  return cms || fallback;
}
