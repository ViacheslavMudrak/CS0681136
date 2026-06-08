/**
 * Maps URL / next-intl locale codes to the locale codes Sitecore XM Cloud
 * uses internally. Add an entry here whenever a Sitecore language code
 * differs from the code that should appear in the URL.
 *
 * URL locale  →  Sitecore locale
 *
 * Currently empty — all URL locale codes match Sitecore locale codes directly.
 * Example: if the URL should show "zh-CN" but Sitecore stores content as "cn":
 *   'zh-CN': 'cn',
 */
const URL_TO_SITECORE_LOCALE: Record<string, string> = {
  'cn': 'zh',
};

/** Reverse map: Sitecore locale → URL locale */
const SITECORE_TO_URL_LOCALE: Record<string, string> = Object.fromEntries(
  Object.entries(URL_TO_SITECORE_LOCALE).map(([url, sc]) => [sc, url])
);

/**
 * Converts a URL / next-intl locale code to the Sitecore locale code.
 * Falls back to the input value when no mapping exists.
 */
export function toSitecoreLocale(locale: string): string {
  return URL_TO_SITECORE_LOCALE[locale] ?? locale;
}

/**
 * Converts a Sitecore locale code back to the URL / next-intl locale code.
 * Falls back to the input value when no mapping exists.
 */
export function toUrlLocale(locale: string): string {
  return SITECORE_TO_URL_LOCALE[locale] ?? locale;
}
