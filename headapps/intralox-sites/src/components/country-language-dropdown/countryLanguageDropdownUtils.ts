import type {
  CountryItem,
  LanguageDocumentItem,
} from "./CountryLanguageDropdown.type";

export const DROPDOWN_EMPTY_HINT = "Country/Language Dropdown";
export const DROPDOWN_SELECT_PLACEHOLDER = "-- Select --";
export const DROPDOWN_NO_DATA_MESSAGE =
  "There are no results that match your selection";
export const DROPDOWN_COUNTRY_ARIA_LABEL_FALLBACK = "Select country or region";
export const DROPDOWN_LANGUAGE_ARIA_LABEL_FALLBACK = "Select language";
export const DROPDOWN_CONTENT_REGION_LABEL = "Policy document";

/** Multilist entry: country reference, optional language label, and policy page path. */
export interface RawCountryEntry {
  /** Linked Country item carrying display name and ISO code. */
  Country?: {
    data?: {
      /** Display name of the country (plain string from Sitecore item name / Name field). */
      Name?: string | null;
      Code?: { value?: string | null } | null;
    } | null;
  } | null;
  /**
   * Optional language label for this entry (e.g. "English", "Hindi").
   * Present only when a country has multiple language variants.
   */
  Language?: { value?: string | null } | null;
  /** Path to the Sitecore item that holds the policy content (page or document). */
  CountryLink?: { path?: string | null } | null;
}

/**
 * The parent object from `fields.data.PolicyStatementsData` (GraphQL shape).
 */
export interface RawPolicyStatementsData {
  CountryLabel?: { value?: string } | null;
  LanguageLabel?: { value?: string } | null;
  Countries?: {
    data?: RawCountryEntry[] | null;
  } | null;
}

/** Groups multilist entries by country code; multiple languages become one dropdown with a language list. */
export function normalizeCountries(
  raw: RawPolicyStatementsData | null | undefined,
): CountryItem[] {
  const entries = raw?.Countries?.data;
  if (!entries?.length) return [];

  const grouped = new Map<string, CountryItem>();

  entries.forEach((entry, index) => {
    if (entry == null) return;

    const name = entry.Country?.data?.Name?.trim() ?? "";
    const code = (entry.Country?.data?.Code?.value ?? "").trim().toUpperCase();
    const href = entry.CountryLink?.path?.trim() ?? "";
    const language = entry.Language?.value?.trim() ?? "";

    if (!name || !href) return;

    const key = code || name;

    if (!grouped.has(key)) {
      grouped.set(key, {
        id: `country-${code || index}`,
        name,
        code,
        documents: [],
      });
    }

    const country = grouped.get(key)!;
    country.documents.push({
      id: `doc-${key}-${country.documents.length}`,
      language,
      href,
      target: undefined,
    });
  });

  return Array.from(grouped.values());
}

// Geo + language resolution helpers

/**
 * Trims whitespace and removes trailing slashes (except root `/`) so
 * `usePathname()` and Sitecore link fields compare reliably.
 */
export function normalizePathForCompare(path: string): string {
  let t = path.trim();
  if (t.length > 1 && t.endsWith("/")) {
    t = t.replace(/\/+$/, "");
  }
  return t;
}

/**
 * Picks the best initial country code given:
 * 1. `serverCountryCode` — when non-empty and matches a list entry (e.g. route
 *    `Country` from CMS; callers that want no default pass `''`).
 * 2. `cmsDefaultCode` — from datasource "Default Country" field
 * Falls back to `''` (no preselect) if neither matches the list.
 */
export function resolveInitialCountryCode(
  countries: CountryItem[],
  serverCountryCode?: string,
  cmsDefaultCode?: string,
): string {
  const codes = countries.map((c) => c.code);
  if (serverCountryCode) {
    const upper = serverCountryCode.toUpperCase();
    if (codes.includes(upper)) return upper;
  }
  if (cmsDefaultCode) {
    const upper = cmsDefaultCode.toUpperCase();
    if (codes.includes(upper)) return upper;
  }
  return "";
}

/**
 * Matches the browser's `navigator.languages` list against a country's
 * language document array and returns the best index.
 *
 * Only call client-side; never import in server modules.
 */
export function resolvePreferredLanguageIndex(
  documents: LanguageDocumentItem[],
  browserLanguages: readonly string[],
): number {
  if (documents.length <= 1) return 0;
  for (const bcp of browserLanguages) {
    const region = bcp.split("-")[1]?.toUpperCase();
    const lang = bcp.split("-")[0]?.toLowerCase();
    for (let i = 0; i < documents.length; i++) {
      const docLang = documents[i].language.toLowerCase();
      if (region && docLang.includes(region.toLowerCase())) return i;
      if (lang && docLang.includes(lang)) return i;
    }
  }
  return 0;
}

/** Returns true when the href looks like a PDF link. */
export function isPdfLink(href: string): boolean {
  return href.toLowerCase().includes(".pdf");
}

/** Returns true when the href is an absolute external URL. */
export function isExternalLink(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

/**
 * Finds the route-document index whose internal (same-origin) href matches
 * the current pathname. Used so the language dropdown stays in sync after
 * `router.push` navigation and when the visitor uses the browser Back/Forward
 * buttons (React state alone would otherwise reset to “Select”).
 *
 * Skips PDF and `http(s)` links. Prefers an exact pathname match, otherwise
 * the longest href that is a proper path prefix of `pathname`.
 */
export function resolveLanguageDocIndexFromPathname(
  pathname: string,
  documents: LanguageDocumentItem[],
): number {
  const path = normalizePathForCompare(pathname);
  if (!path || documents.length === 0) return -1;

  for (let i = 0; i < documents.length; i++) {
    const rawHref = documents[i]?.href?.trim() ?? "";
    const href = normalizePathForCompare(rawHref);
    if (!href || isPdfLink(rawHref) || isExternalLink(rawHref)) continue;
    if (path === href) return i;
  }

  let best = -1;
  let bestLen = -1;
  for (let i = 0; i < documents.length; i++) {
    const rawHref = documents[i]?.href?.trim() ?? "";
    const href = normalizePathForCompare(rawHref);
    if (!href || isPdfLink(rawHref) || isExternalLink(rawHref)) continue;
    if (
      path.startsWith(href) &&
      path.length > href.length &&
      path.charAt(href.length) === "/"
    ) {
      if (href.length > bestLen) {
        bestLen = href.length;
        best = i;
      }
    }
  }
  return best;
}

/** `sessionStorage` key: last PDF / external language choice before full navigation away. */
export const POLICY_STATEMENTS_LAST_LANGUAGE_NAV_STORAGE_KEY =
  "intralox.policyStatements.lastLanguageNav";

export interface LastLanguageNavPayload {
  readonly v: 1;
  readonly originPath: string;
  readonly documentHref: string;
}

/**
 * Persists the policy page path and document link before assigning `location.href`
 * to a PDF or external URL so Back can restore the language row (pathname alone
 * cannot match those targets).
 */
export function persistLastPdfOrExternalLanguageNav(
  originPath: string,
  documentHref: string,
): void {
  if (typeof window === "undefined") return;
  const origin = originPath.trim();
  const href = documentHref.trim();
  if (!origin || !href) return;
  try {
    const payload: LastLanguageNavPayload = {
      v: 1,
      originPath: origin,
      documentHref: href,
    };
    window.sessionStorage.setItem(
      POLICY_STATEMENTS_LAST_LANGUAGE_NAV_STORAGE_KEY,
      JSON.stringify(payload),
    );
  } catch {
    // QuotaExceededError, private mode, etc.
  }
}

/** Clears the PDF/external “returning visitor” hint (e.g. country or internal doc change). */
export function clearLastPdfOrExternalLanguageNav(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(
      POLICY_STATEMENTS_LAST_LANGUAGE_NAV_STORAGE_KEY,
    );
  } catch {
    /* ignore */
  }
}

/**
 * If `sessionStorage` holds a payload for this pathname, returns the matching
 * document index; otherwise `-1`. Intended only when pathname-based resolution failed.
 */
export function resolveLanguageDocIndexFromSessionNav(
  originPath: string,
  documents: LanguageDocumentItem[],
): number {
  if (typeof window === "undefined") return -1;
  const pathNorm = normalizePathForCompare(originPath);
  if (!pathNorm || documents.length === 0) return -1;

  let raw: string | null;
  try {
    raw = window.sessionStorage.getItem(
      POLICY_STATEMENTS_LAST_LANGUAGE_NAV_STORAGE_KEY,
    );
  } catch {
    return -1;
  }
  if (!raw) return -1;

  try {
    const data = JSON.parse(raw) as Partial<LastLanguageNavPayload>;
    if (
      data.v !== 1 ||
      typeof data.originPath !== "string" ||
      typeof data.documentHref !== "string"
    ) {
      return -1;
    }
    if (normalizePathForCompare(data.originPath) !== pathNorm) return -1;

    const href = data.documentHref.trim();
    const idx = documents.findIndex(
      (d) =>
        normalizePathForCompare(d.href.trim()) ===
        normalizePathForCompare(href),
    );
    return idx;
  } catch {
    return -1;
  }
}

/**
 * Country code from route path or `initialCountryCode`, safe for the first client render
 * (before `CountryLanguageDropdown` sync effects run).
 *
 * @param pathname - Content path from `getContentPathFromAppPathname(usePathname())` (no `[site]` / `[locale]`).
 */
export function resolveCountryCodeFromRouteSync(
  countries: CountryItem[],
  initialCountryCode: string | undefined,
  pathname: string,
): string {
  if (countries.length === 0) return "";
  let codeToSelect = initialCountryCode?.trim().toUpperCase() ?? "";
  if (!codeToSelect) {
    const path = normalizePathForCompare(pathname);
    let best: { code: string; len: number } | null = null;
    for (const c of countries) {
      for (const doc of c.documents) {
        const href = normalizePathForCompare(doc.href?.trim() ?? "");
        if (!href) continue;
        if (
          path === href ||
          (path.startsWith(href) &&
            path.length > href.length &&
            path.charAt(href.length) === "/")
        ) {
          if (!best || href.length > best.len) {
            best = { code: c.code, len: href.length };
          }
        }
      }
    }
    if (best) codeToSelect = best.code;
  }
  if (!codeToSelect) return "";
  const match = countries.find((c) => c.code === codeToSelect);
  return match?.code ?? "";
}

/**
 * Language document index from pathname, then `sessionStorage` (PDF/external Back).
 *
 * @param pathname - Content path from `getContentPathFromAppPathname(usePathname())`.
 */
export function resolveLanguageDocIndexFromRouteSync(
  pathname: string,
  documents: LanguageDocumentItem[],
): number {
  if (documents.length === 0) return -1;
  let next = resolveLanguageDocIndexFromPathname(pathname, documents);
  if (next < 0) {
    next = resolveLanguageDocIndexFromSessionNav(pathname, documents);
  }
  return next;
}

// Route-level document types (Country Policy Statement page)

/**
 * A single document item from the route item's `Documents` multilist field.
 * Shape matches the GraphQL Edge query on `$contextItem`.
 */
export interface RawRouteDocument {
  id?: string | null;
  /** Linked Language reference item containing the display label. */
  Language?: {
    data?: {
      LanguageValue?: { value?: string | null } | null;
    } | null;
  } | null;
  /** General Link field serialized as JSON value. */
  DocumentLink?: {
    jsonValue?: {
      href?: string | null;
      target?: string | null;
    } | null;
  } | null;
}

/**
 * Converts the route-level `Documents` array into `LanguageDocumentItem[]`
 * ready for the language dropdown. Entries without a valid `href` are dropped.
 */
export function normalizeRouteDocuments(
  docs: RawRouteDocument[] | null | undefined,
): LanguageDocumentItem[] {
  if (!docs?.length) return [];
  return docs
    .filter((d): d is NonNullable<typeof d> => d != null)
    .map((d, index) => ({
      id: d.id?.trim() || `route-doc-${index}`,
      language: d.Language?.data?.LanguageValue?.value?.trim() ?? "",
      href: d.DocumentLink?.jsonValue?.href?.trim() ?? "",
      target: d.DocumentLink?.jsonValue?.target ?? undefined,
    }))
    .filter((d) => d.href !== "");
}
