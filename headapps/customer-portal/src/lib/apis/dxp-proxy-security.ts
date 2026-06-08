/** Builds a same-origin `/api/dxp/...` URL for client `fetch` calls. */
export function buildDxpProxyFetchUrl(
  proxyPrefix: string,
  path: string,
  params?: Record<string, string | undefined>
): string | null {
  const trimmedPath = path.trim();
  if (!trimmedPath.startsWith("/") || trimmedPath.startsWith("//") || trimmedPath.includes("://")) {
    return null;
  }

  const queryIndex = trimmedPath.indexOf("?");
  const pathname = queryIndex === -1 ? trimmedPath : trimmedPath.slice(0, queryIndex);
  const searchFromPath = queryIndex === -1 ? "" : trimmedPath.slice(queryIndex);
  const search = mergeDxpProxyQueryStrings(searchFromPath, params);
  const normalizedPrefix = proxyPrefix.replace(/\/$/, "");

  return `${normalizedPrefix}${normalizeDxpUpstreamPath(pathname)}${search}`;
}

/** Builds upstream URL from configured base (BFF route). */
export function buildUpstreamFetchUrl(
  baseUrl: string,
  upstreamPath: string,
  search: string
): URL | null {
  const normalizedBase = baseUrl.trim().replace(/\/$/, "");
  if (!normalizedBase) {
    return null;
  }

  let base: URL;
  try {
    base = new URL(normalizedBase);
  } catch {
    return null;
  }

  if (base.protocol !== "https:" && base.protocol !== "http:") {
    return null;
  }

  const baseHref = base.href.endsWith("/") ? base.href : `${base.href}/`;
  const relativePath = upstreamPath.startsWith("/") ? upstreamPath.slice(1) : upstreamPath;

  try {
    return new URL(`${relativePath}${search}`, baseHref);
  } catch {
    return null;
  }
}

export function normalizeDxpUpstreamPath(path: string): string {
  const trimmed = path.trim();
  const withLeading = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeading.replace(/\/+$/, "") || "/";
}

function mergeDxpProxyQueryStrings(
  searchFromPath: string,
  params?: Record<string, string | undefined>
): string {
  const merged = new URLSearchParams();

  if (searchFromPath.startsWith("?")) {
    const existing = new URLSearchParams(searchFromPath.slice(1));
    existing.forEach((value, key) => {
      merged.set(key, value);
    });
  }

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value != null && value !== "") {
        merged.set(key, value);
      }
    }
  }

  const query = merged.toString();
  return query ? `?${query}` : "";
}
