/** Allowed values for analytics `entry_point` on Quote Detail. */
export type QuoteDetailEntryPoint = "Quotes_Listing" | "Direct_URL";

const SESSION_KEY = "cp_quote_detail_entry_point";
const RETURN_HREF_SESSION_KEY = "cp_quote_detail_return_href";

const ALLOWED = new Set<string>(["Quotes_Listing", "Direct_URL"]);

/** Path without locale: `/orders-management/quotes/:id`. */
export const QUOTE_DETAIL_PATH_REGEX = /^\/orders-management\/quotes\/([^/]+)$/;

/**
 * True when `[[...path]]` segments are …/orders-management/quotes/&lt;id&gt; (quote detail route).
 */
export function isOrdersManagementQuoteDetailPathSegments(path: string[] | undefined): boolean {
  if (!path || path.length < 3) return false;
  const folder = path[0]?.toLowerCase() ?? "";
  const tab = path[path.length - 2]?.toLowerCase() ?? "";
  const id = path[path.length - 1] ?? "";
  if (folder !== "orders-management" || tab !== "quotes") return false;
  return id.length > 0 && id !== ",-w-,";
}

function peekEntryPointFromSession(): QuoteDetailEntryPoint | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)?.trim();
    if (raw && ALLOWED.has(raw)) {
      return raw as QuoteDetailEntryPoint;
    }
  } catch {
    // private mode / quota
  }
  return null;
}

function normalizeReturnHref(href: string | null | undefined): string | null {
  const trimmed = href?.trim();
  if (!trimmed || !trimmed.startsWith("/") || trimmed.startsWith("//")) return null;
  return trimmed;
}

let sessionCleanupMicrotaskQueued = false;

export function stashQuoteDetailEntryPoint(
  entryPoint: QuoteDetailEntryPoint,
  returnHref?: string
): void {
  if (!ALLOWED.has(entryPoint)) return;
  try {
    sessionStorage.setItem(SESSION_KEY, entryPoint);
    const normalizedReturnHref = normalizeReturnHref(returnHref);
    if (normalizedReturnHref) {
      sessionStorage.setItem(RETURN_HREF_SESSION_KEY, normalizedReturnHref);
    } else {
      sessionStorage.removeItem(RETURN_HREF_SESSION_KEY);
    }
  } catch {
    // ignore
  }
}

export function stashQuoteDetailListingEntryPoint(): void {
  const returnHref =
    typeof window === "undefined" ? undefined : `${window.location.pathname}${window.location.search}`;
  stashQuoteDetailEntryPoint("Quotes_Listing", returnHref);
}

export function resolveQuoteDetailReturnHref(): string | null {
  try {
    return normalizeReturnHref(sessionStorage.getItem(RETURN_HREF_SESSION_KEY));
  } catch {
    return null;
  }
}

export function clearQuoteDetailReturnHref(): void {
  try {
    sessionStorage.removeItem(RETURN_HREF_SESSION_KEY);
  } catch {
    // ignore
  }
}

export function scheduleQuoteDetailEntryPointSessionCleanup(): void {
  if (sessionCleanupMicrotaskQueued) return;
  sessionCleanupMicrotaskQueued = true;
  queueMicrotask(() => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
    sessionCleanupMicrotaskQueued = false;
  });
}

export function resolveQuoteDetailEntryPoint(): QuoteDetailEntryPoint {
  return peekEntryPointFromSession() ?? "Direct_URL";
}
