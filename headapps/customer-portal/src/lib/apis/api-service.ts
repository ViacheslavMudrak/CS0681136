import { buildLoginUrl } from "@/lib/auth-utils";
import {
  DXP_PROXY_QUOTE_SUBMIT_PATH,
  getDxpProxyFetchPathWhitelist,
} from "@/lib/apis/api-routes";
import { buildDxpProxyFetchUrl } from "@/lib/apis/dxp-proxy-security";
import {
  clearTokensFromLocalStorage,
  getAccessTokenFromLocalStorage,
  setTokensInLocalStorage,
} from "@/lib/okta-auth-client";

/** Next.js API route prefix that proxies to the DXP backend (see `app/api/dxp/[...path]/route.ts`). */
export const DXP_PROXY_PREFIX = "/api/dxp";

/** Derived from {@link API_ROUTES}; Endor SAST expects `whitelist.includes(url)` before `fetch`. */
const whitelist = getDxpProxyFetchPathWhitelist(DXP_PROXY_PREFIX);

const DEFAULT_HEADERS: HeadersInit = {
  Accept: "application/json",
};

const SESSION_EXPIRED_TOAST_EVENT = "customerportal:session-expired";
const REFRESH_GRANT_TYPE = "refresh_token";
const REFRESH_SESSION_ROUTE = "/api/auth/token";

let refreshInFlight: Promise<boolean> | null = null;
let sessionExpiryRedirectStarted = false;

const inFlightRequests = new Map<string, Promise<unknown>>();

/**
 * Deduplicates concurrent identical API calls within the same client session.
 */
export async function fetchWithDedup<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const existing = inFlightRequests.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = fetcher().finally(() => {
    inFlightRequests.delete(key);
  });
  inFlightRequests.set(key, promise);
  return promise;
}

/** Resolves auth header from localStorage (client only); server gets no token from here. */
function getAuthHeaders(): HeadersInit {
  const token = getAccessTokenFromLocalStorage();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface RequestOptions {
  method: "GET" | "POST" | "PATCH";
  path: string;
  params?: Record<string, string | undefined>;
  body?: unknown;
  options?: RequestInit;
}

async function executeRequest<T>(
  config: RequestOptions,
  parseSuccess: (res: Response) => Promise<T>
): Promise<T> {
  const { method, path, params, body, options = {} } = config;

  if (!path || !path.startsWith("/")) {
    throw new Error("API path must start with '/'.");
  }

  if (path.startsWith("//") || path.includes("://")) {
    throw new Error("Invalid API path.");
  }

  const fetchUrl = buildDxpProxyFetchUrl(DXP_PROXY_PREFIX, path, params);
  if (!fetchUrl) {
    throw new Error("Invalid URL");
  }

  const requestUrl = fetchUrl;
  const requestPathname =
    requestUrl.indexOf("?") === -1 ? requestUrl : requestUrl.slice(0, requestUrl.indexOf("?"));
  const quoteSubmitAllowed = DXP_PROXY_QUOTE_SUBMIT_PATH.test(requestPathname);
  const requestAllowed =
    whitelist.includes(requestPathname) || quoteSubmitAllowed;
  if (!requestAllowed) {
    throw new Error("Invalid URL");
  }

  const bodyPayload =
    (method === "POST" || method === "PATCH") && body !== undefined
      ? typeof body === "string"
        ? body
        : JSON.stringify(body)
      : undefined;

  const execute = async (allowRefreshRetry: boolean): Promise<T> => {
    const authHeaders = getAuthHeaders();
    const needsJsonBody = method === "POST" || method === "PATCH";
    const baseHeaders: HeadersInit = needsJsonBody
      ? {
          ...DEFAULT_HEADERS,
          "Content-Type": "application/json",
          ...authHeaders,
        }
      : {
          ...DEFAULT_HEADERS,
          ...authHeaders,
        };
    const headers: HeadersInit = {
      ...baseHeaders,
      ...(options.headers ?? {}),
    };

    let res: Response;
    if (whitelist.includes(requestPathname)) {
      res = await fetch(requestUrl, {
        ...options,
        method,
        headers,
        body: bodyPayload,
        redirect: "error",
      });
    } else if (quoteSubmitAllowed) {
      res = await fetch(requestUrl, {
        ...options,
        method,
        headers,
        body: bodyPayload,
        redirect: "error",
      });
    } else {
      throw new Error("Invalid URL");
    }

    if (!res.ok) {
      const payload = await parseErrorResponse(res);
      const status = res.status;

      if (status === 401 && allowRefreshRetry) {
        const refreshSucceeded = await refreshSessionTokensSilently();
        if (refreshSucceeded) {
          return execute(false);
        }

        clearTokensFromLocalStorage();
        emitSessionExpiredToastEvent();
        redirectToLoginAfterSessionExpiry();
      }

      throw new ApiRequestError(resolveErrorMessage(status, payload), status, payload);
    }

    return parseSuccess(res);
  };

  return execute(true);
}

interface ParsedErrorResponse {
  message?: string;
  error?: string;
  error_description?: string;
}

export class ApiRequestError extends Error {
  status: number;
  payload?: ParsedErrorResponse;
  isAuthError: boolean;
  isPermissionError: boolean;

  constructor(message: string, status: number, payload?: ParsedErrorResponse) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.payload = payload;
    this.isAuthError = status === 401;
    this.isPermissionError = status === 403;
  }
}

export function isApiRequestError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError;
}

function isClientRuntime(): boolean {
  return typeof window !== "undefined";
}

async function parseErrorResponse(res: Response): Promise<ParsedErrorResponse | undefined> {
  try {
    const responseData = (await res.json().catch(() => null)) as ParsedErrorResponse | null;
    if (responseData && typeof responseData === "object") {
      return responseData;
    }
  } catch {
    // ignore response parse failure
  }
  return undefined;
}

function resolveErrorMessage(status: number, payload?: ParsedErrorResponse): string {
  if (payload?.message) {
    return String(payload.message);
  }
  if (payload?.error_description) {
    return String(payload.error_description);
  }
  if (payload?.error) {
    return String(payload.error);
  }
  return `Request failed: ${status}`;
}

function emitSessionExpiredToastEvent(): void {
  if (!isClientRuntime()) {
    return;
  }
  window.dispatchEvent(
    new CustomEvent(SESSION_EXPIRED_TOAST_EVENT, {
      detail: {
        title: "Session expired",
        message: "Your session expired. Please sign in again.",
      },
    })
  );
}

function redirectToLoginAfterSessionExpiry(): void {
  if (!isClientRuntime() || sessionExpiryRedirectStarted) {
    return;
  }
  sessionExpiryRedirectStarted = true;
  const returnUrl = `${window.location.pathname}${window.location.search}`;
  window.location.assign(buildLoginUrl(returnUrl));
}

async function refreshSessionTokensSilently(): Promise<boolean> {
  if (!isClientRuntime()) {
    return false;
  }

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const res = await fetch(REFRESH_SESSION_ROUTE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grant_type: REFRESH_GRANT_TYPE }),
        credentials: "same-origin",
      });

      if (!res.ok) {
        return false;
      }

      const payload = (await res.json().catch(() => ({}))) as {
        access_token?: string;
        id_token?: string;
        refresh_token?: string;
      };

      if (!payload.access_token) {
        return false;
      }

      setTokensInLocalStorage(
        payload.access_token,
        payload.id_token ?? null,
        payload.refresh_token ?? null
      );
      return true;
    })().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

export async function request<T>(config: RequestOptions): Promise<T> {
  return executeRequest(config, (res) => res.json() as Promise<T>);
}

export async function requestBlob(config: RequestOptions): Promise<Blob> {
  return executeRequest(config, (res) => res.blob());
}

export const AUTH_EVENTS = {
  SESSION_EXPIRED_TOAST_EVENT,
} as const;
