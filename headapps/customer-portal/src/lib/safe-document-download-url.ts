import { API_ROUTES, getBaseApiUrl } from "@/lib/apis/api-routes";
import { DXP_PROXY_PREFIX } from "@/lib/apis/api-service";

const ORDERS_DOCUMENTS_BINARY = API_ROUTES.ORDERS_DOCUMENTS_BINARY;
const DXP_DOCUMENTS_BINARY_PROXY = `${DXP_PROXY_PREFIX}${ORDERS_DOCUMENTS_BINARY}`;

function hasHttpScheme(value: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(value);
}

function readPathQueryParam(search: string): string | null {
  if (!search) {
    return null;
  }
  try {
    const path = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search).get("path");
    const trimmed = path?.trim();
    return trimmed || null;
  } catch {
    return null;
  }
}

/**
 * Resolves a DXP document `path` for {@link fetchOrderDocumentPdfBlob} from API-provided URLs.
 * Returns null when the value is not a trusted document reference (e.g. arbitrary external URL).
 */
export function resolveDocumentPathForBinaryFetch(rawUrl: string): string | null {
  const value = rawUrl.trim();
  if (!value || value.includes("@") || value.startsWith("//")) {
    return null;
  }

  if (value.startsWith(DXP_DOCUMENTS_BINARY_PROXY)) {
    try {
      const parsed = new URL(value, "https://placeholder.local");
      return readPathQueryParam(parsed.search);
    } catch {
      return null;
    }
  }

  if (!hasHttpScheme(value)) {
    return value;
  }

  const base = getBaseApiUrl();
  if (!base) {
    return null;
  }

  try {
    const target = new URL(value);
    const baseUrl = new URL(base);

    if (target.origin !== baseUrl.origin) {
      return null;
    }
    if (!target.pathname.endsWith(ORDERS_DOCUMENTS_BINARY)) {
      return null;
    }

    return readPathQueryParam(target.search);
  } catch {
    return null;
  }
}
