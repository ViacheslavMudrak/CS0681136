import type { LinkField } from '@sitecore-content-sdk/nextjs';

import { routing } from 'src/i18n/routing';

import type {
  LanguageItem,
  MainNavItem,
  NavChildItem,
  NavigationFields,
  RawOrResolvedChildren,
  TopBarFields,
  TopNavLinkItem,
} from './Navigation.type';

/**
 * Reads a Sitecore single-line text field from layout / Edge JSON.
 * Some responses use top-level `.value`; integrated GraphQL-style payloads use `.jsonValue.value`.
 *
 * @param field - Raw field object, plain string, or null/undefined
 * @returns Trimmed string content, or empty string when missing
 */
export function getTextFieldString(field: unknown): string {
  if (field == null) return '';
  if (typeof field === 'string') return field;
  if (typeof field !== 'object') return '';
  const o = field as Record<string, unknown>;
  const direct = o.value;
  if (typeof direct === 'string') return direct;
  const jv = o.jsonValue as Record<string, unknown> | undefined;
  const nested = jv?.value;
  if (typeof nested === 'string') return nested;
  return '';
}

/**
 * Reads a text-like field from a Sitecore `fields` object when the key may be PascalCase
 * (layout) or camelCase (integrated GraphQL).
 *
 * @param fieldsBag - `item.fields` or `topBar.fields`
 * @param pascalKey - Template-style name (e.g. `CssClass`)
 * @param camelKey - GraphQL-style name (e.g. `cssClass`)
 * @returns Trimmed string from {@link getTextFieldString}
 */
export function getFieldsTextByKey(
  fieldsBag: Record<string, unknown> | null | undefined,
  pascalKey: string,
  camelKey: string
): string {
  if (!fieldsBag) return '';
  return getTextFieldString(fieldsBag[pascalKey] ?? fieldsBag[camelKey]);
}

/**
 * Returns the first non-empty text from Sitecore field objects (same pattern as footer reading
 * `IconCssClass`, but supports `jsonValue` via {@link getTextFieldString}).
 *
 * @param candidates - Field values tried in order
 * @returns First trimmed string, or empty string
 */
export function firstNonEmptyTextField(...candidates: unknown[]): string {
  for (const c of candidates) {
    const s = getTextFieldString(c).trim();
    if (s) return s;
  }
  return '';
}

/**
 * Top Bar treelist may arrive as `TopNavLinks` (layout) or `topNavLinks` (GraphQL JSON).
 *
 * @param topBar - Resolved Top Bar datasource
 * @returns Utility link items for the header strip
 */
export function getTopNavLinksFromTopBar(topBar: TopBarFields | undefined): TopNavLinkItem[] {
  const f = topBar?.fields as Record<string, unknown> | undefined;
  if (!f) return [];
  const raw = f.TopNavLinks ?? f.topNavLinks;
  return Array.isArray(raw) ? (raw as TopNavLinkItem[]) : [];
}

/**
 * Language rows may be `Languages` or `languages` on the Top Bar fields object.
 *
 * @param topBar - Resolved Top Bar datasource
 * @returns Language switcher items
 */
export function getLanguagesFromTopBar(topBar: TopBarFields | undefined): LanguageItem[] {
  const f = topBar?.fields as Record<string, unknown> | undefined;
  if (!f) return [];
  const raw = f.Languages ?? f.languages;
  return Array.isArray(raw) ? (raw as LanguageItem[]) : [];
}

/**
 * General Link on a utility bar item — Edge often uses camelCase `link`.
 *
 * @param fields - `TopNavLinkItem.fields`
 * @returns Link field or undefined
 */
export function getTopNavLinkFieldFromItem(
  fields: TopNavLinkItem['fields']
): LinkField | undefined {
  if (!fields) return undefined;
  const bag = fields as Record<string, unknown>;
  const raw = bag.Link ?? bag.link;
  if (raw && typeof raw === 'object' && raw !== null && 'value' in (raw as object)) {
    return raw as LinkField;
  }
  return undefined;
}

/**
 * True when a nav child has nested links (flags or resolved/unresolved `ChildLinks`).
 *
 * @param item - A secondary navigation child item
 * @returns True if the item has child links
 */
export const itemHasChildren = (item: NavChildItem): boolean => {
  if (item.fields?.HasChildLinks?.value === true) return true;
  if (item.fields?.ShowChildLinks?.value === true) return true;
  const raw = item.fields?.ChildLinks;
  if (Array.isArray(raw) && raw.length > 0) return true;
  if (typeof raw === 'string' && raw.trim().length > 0) return true;
  return false;
};

/** Placeholder LinkField used when Sitecore returns no link data. */
export const EMPTY_LINK: LinkField = { value: { href: '' } };

/**
 * True when the value looks like a Sitecore General Link field (layout / Edge JSON).
 */
const isGeneralLinkField = (v: unknown): v is LinkField => {
  if (v === null || typeof v !== 'object') return false;
  const inner = (v as LinkField).value;
  if (inner === null || typeof inner !== 'object') return false;
  return 'href' in inner;
};

const linkHasHref = (link: LinkField): boolean => {
  const href = link.value?.href;
  return typeof href === 'string' && href.trim().length > 0;
};

/** Primary tab `Link` is not the featured-column CTA. */
const MEGA_MENU_PROMO_EXCLUDED_KEYS = new Set(['Link', 'ChildLinks']);

/**
 * Explicit API names first (matches common templates / QA-added fields), then `*Link` keys,
 * then any other General Link–shaped field on the item so CMS keys we do not list still resolve.
 */
const MEGA_MENU_PROMO_PREFERRED_KEYS: readonly string[] = [
  'PromoLink',
  'FeaturedLink',
  'HeadingLink',
  'TileLink',
  'PromotionalLink',
  'CallToAction',
  'CTALink',
  'FeaturedTileLink',
  'BeltFinderLink',
];

type MegaMenuPromoEntry = { key: string; field: LinkField };

const findMegaMenuPromoEntry = (
  fields: Record<string, unknown>,
  requireHref: boolean
): MegaMenuPromoEntry | undefined => {
  const tryKey = (key: string): LinkField | undefined => {
    if (MEGA_MENU_PROMO_EXCLUDED_KEYS.has(key)) return undefined;
    const v = fields[key];
    if (!isGeneralLinkField(v)) return undefined;
    if (requireHref && !linkHasHref(v)) return undefined;
    return v;
  };

  for (const key of MEGA_MENU_PROMO_PREFERRED_KEYS) {
    const hit = tryKey(key);
    if (hit) return { key, field: hit };
  }
  for (const key of Object.keys(fields)) {
    if (!key.endsWith('Link')) continue;
    const hit = tryKey(key);
    if (hit) return { key, field: hit };
  }
  for (const key of Object.keys(fields)) {
    if (key.endsWith('Link')) continue;
    const hit = tryKey(key);
    if (hit) return { key, field: hit };
  }
  return undefined;
};

/**
 * CMS field key for the mega-menu featured CTA, if any.
 *
 * @param item - Primary navigation item
 * @returns The winning field key, or undefined when no promo link field exists
 */
export const getResolvedMegaMenuPromoLinkKey = (item: MainNavItem): string | undefined => {
  const fields = item.fields as Record<string, unknown> | undefined;
  if (!fields) return undefined;
  return (
    findMegaMenuPromoEntry(fields, true)?.key ?? findMegaMenuPromoEntry(fields, false)?.key
  );
};

/**
 * Resolves the optional mega-menu featured-tile link on a primary nav item.
 *
 * @param item - Primary navigation item with optional mega-menu promo fields
 * @returns The link field if present, whether it has a non-empty href, and the CMS field key used
 */
export const resolveMegaMenuPromoLink = (
  item: MainNavItem
): { field: LinkField | undefined; hasHref: boolean; resolvedKey?: string } => {
  const fields = item.fields as Record<string, unknown> | undefined;
  if (!fields) {
    return { field: undefined, hasHref: false };
  }

  const withHref = findMegaMenuPromoEntry(fields, true);
  if (withHref) {
    return { field: withHref.field, hasHref: true, resolvedKey: withHref.key };
  }

  const forEditing = findMegaMenuPromoEntry(fields, false);
  if (forEditing) {
    return {
      field: forEditing.field,
      hasHref: linkHasHref(forEditing.field),
      resolvedKey: forEditing.key,
    };
  }

  return { field: undefined, hasHref: false };
};

/** Delay (ms) before closing the mega menu on mouse leave. */
export const MEGA_MENU_CLOSE_DELAY = 150;

export const MOBILE_MENU_LAYOUT_MEDIA_QUERY = '(max-width: 991px)';

/**
 * Normalizes a path for comparison (leading slash, no trailing slash except root).
 *
 * @param pathname - Path from `usePathname()` or parsed URL path
 * @returns Canonical path starting with `/`
 */
export const normalizeAppPathname = (pathname: string): string => {
  const trimmed = pathname.trim();
  if (!trimmed || trimmed === '/') {
    return '/';
  }
  const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const noTrailing = withLeading.replace(/\/+$/, '');
  return noTrailing.length > 0 ? noTrailing : '/';
};

/**
 * Logo home `href`; override with `NEXT_PUBLIC_HOME_PATH` when set.
 *
 * @returns Path suitable for `next/link` `href`
 */
export const getLogoHomeHref = (): string => {
  const raw = process.env.NEXT_PUBLIC_HOME_PATH?.trim();
  if (!raw) {
    return '/';
  }
  if (/^https?:\/\//i.test(raw)) {
    try {
      const { pathname } = new URL(raw);
      return normalizeAppPathname(pathname);
    } catch {
      return '/';
    }
  }
  return normalizeAppPathname(raw.startsWith('/') ? raw : `/${raw}`);
};

/**
 * Whether the logo should not navigate (already on the configured home path).
 *
 * @param pathname - `usePathname()` value
 * @returns True when current path matches {@link getLogoHomeHref}
 */
export const isLogoOnHomePage = (pathname: string): boolean =>
  normalizeAppPathname(pathname) === normalizeAppPathname(getLogoHomeHref());

/** Primary nav titles forced to simple (flat-list) mega-menu layout. */
export const SIMPLE_LAYOUT_OVERRIDES = new Set(['solutions', 'products']);

/** Primary nav titles that suppress mobile secondary tertiary expand (e.g. Products). */
export const MOBILE_SUPPRESS_SECONDARY_TERTIARY_EXPAND_PRIMARIES = new Set(['products']);

/**
 * User-facing label constants. These should be replaced with Sitecore
 * dictionary items when localization support is implemented.
 */
export const NAV_LABELS = {
  overview: 'Overview',
  search: 'SEARCH',
  searchFallback: 'Search',
  languageFallback: 'Language',
  logoAriaLabel: 'Intralox Home',
  logoFallbackText: 'Intralox',
  openMenu: 'Open menu',
  closeMenu: 'Close menu',
  expandSection: 'Expand',
  navigationMenu: 'Navigation menu',
  mainNavigation: 'Main navigation',
  mobileNavigation: 'Mobile navigation',
  utilityNavigation: 'Utility navigation',
  closeSearch: 'Close search',
  /** Shown when the Navigation rendering has no datasource fields (authoring hint). */
  navigationEmptyHint: 'Navigation',
} as const;

/** Belt Finder promo image width (desktop mega menu and mobile drawer). */
export const NAV_BELT_FINDER_IMAGE_WIDTH = 195;

/** Desktop mega-menu Belt Finder image height. */
export const NAV_BELT_FINDER_IMAGE_HEIGHT_DESKTOP = 65;

/** Mobile/tablet drawer Belt Finder image height. */
export const NAV_BELT_FINDER_IMAGE_HEIGHT_MOBILE = 81.25;

/** `sizes` for desktop mega-menu Belt Finder image. */
export const NAV_BELT_FINDER_IMAGE_SIZES = `${NAV_BELT_FINDER_IMAGE_WIDTH}px`;

/** `sizes` for mobile/tablet drawer Belt Finder image. */
export const NAV_BELT_FINDER_IMAGE_SIZES_MOBILE =
  '(max-width: 991px) min(75vw, 280px)';

/** Intrinsic `NextImage` dimensions for mobile drawer Belt Finder promo. */
export const NAV_BELT_FINDER_IMAGE_MOBILE_NEXT_WIDTH = 560;
export const NAV_BELT_FINDER_IMAGE_MOBILE_NEXT_HEIGHT = Math.round(
  (NAV_BELT_FINDER_IMAGE_MOBILE_NEXT_WIDTH * NAV_BELT_FINDER_IMAGE_HEIGHT_MOBILE) / 280
);

/**
 * Safely coerce ChildLinks into an array. When Sitecore returns an unresolved
 * treelist/multilist field the value is a pipe-delimited string of GUIDs —
 * these cannot be rendered so we fall back to an empty array.
 *
 * @param raw - The raw child links value from Sitecore
 * @returns An array of resolved child items, or empty array if unresolvable
 */
export const resolveChildLinks = (raw?: RawOrResolvedChildren): NavChildItem[] => {
  if (Array.isArray(raw)) return raw;
  return [];
};

type NavItemFieldsWithHide = MainNavItem['fields'] | NavChildItem['fields'];

/**
 * True when Sitecore `HideFromNav` is explicitly `true` (header-only suppression).
 *
 * @param fields - `MainNavItem.fields` or `NavChildItem.fields`
 */
export function isNavItemHiddenFromNav(fields: NavItemFieldsWithHide | undefined): boolean {
  return fields?.HideFromNav?.value === true;
}

/**
 * Top-level main nav items shown in the header (excludes `HideFromNav`).
 *
 * @param items - `MainNavigationLinks` from the Header rendering
 */
export function filterMainNavItemsForHeaderDisplay(items: MainNavItem[] | undefined): MainNavItem[] {
  if (!items?.length) return [];
  return items.filter((item) => item?.fields && !isNavItemHiddenFromNav(item.fields));
}

/**
 * Child links for header mega-menu / mobile nav (excludes `HideFromNav`).
 * Use {@link resolveChildLinks} when matching routes for the local navigation strip.
 *
 * @param raw - `ChildLinks` from a nav item
 */
export function resolveChildLinksForHeaderDisplay(raw?: RawOrResolvedChildren): NavChildItem[] {
  return resolveChildLinks(raw).filter((child) => !isNavItemHiddenFromNav(child.fields));
}

/**
 * Extracts the display text from a Sitecore LinkField.
 *
 * @param link - The Sitecore LinkField
 * @returns The link text or empty string
 */
export const getLinkText = (link?: LinkField): string => link?.value?.text || '';

/**
 * True when a top utility-bar link is a “get / request a quote” style CTA, from link text
 * or item display name. Used to hide only that link on narrow viewports (not “Call us”, etc.).
 *
 * @param link - Sitecore general link field
 * @param displayName - Item display name fallback from Sitecore
 */
export const isQuoteUtilityBarLink = (link?: LinkField, displayName?: string): boolean => {
  const label = `${getLinkText(link)} ${displayName ?? ''}`.trim().toLowerCase();
  return /\bquote\b/.test(label);
};

/**
 * Nav row label: `Title`, then Link text, then display name.
 *
 * @param child - A nav child item from Sitecore
 * @returns Resolved label text
 */
export const getNavChildItemLabel = (child: NavChildItem): string => {
  const fromTitle = child.fields?.Title?.value?.toString().trim();
  if (fromTitle) return fromTitle;
  return getLinkText(child.fields?.Link) || child.displayName || '';
};

/**
 * Primary nav item display title (`Title`, Link text, then display name).
 *
 * @param item - A primary navigation item
 * @returns The best available display title
 */
export const getNavItemTitle = (item: MainNavItem): string =>
  item.fields?.Title?.value?.toString().trim() ||
  getLinkText(item.fields?.Link) ||
  item.displayName ||
  '';

/** Same-tab target for header links — overrides Sitecore “open in new window”. */
export const NAV_SAME_TAB_TARGET = '_self' as const;

/**
 * Determines the rel attribute value for link security.
 * Returns "noopener noreferrer" when target is "_blank".
 *
 * @param target - The link target attribute value
 * @returns The appropriate rel attribute or undefined
 */
export const getLinkRel = (target?: string): string | undefined =>
  target === '_blank' ? 'noopener noreferrer' : undefined;

const trimStr = (v?: string): string => v?.trim() ?? '';

/**
 * Resolves a General Link field from nav item fields — layout uses `Link`, integrated GraphQL often `link`.
 *
 * @param fields - `NavChildItem.fields`, `MainNavItem.fields`, or similar
 */
export function resolveNavFieldsLinkField(fields: unknown): LinkField | undefined {
  if (!fields || typeof fields !== 'object') return undefined;
  const bag = fields as Record<string, unknown>;
  const raw = bag.Link ?? bag.link;
  if (raw && typeof raw === 'object' && raw !== null) {
    if ('value' in raw || 'jsonValue' in raw) {
      return raw as LinkField;
    }
  }
  return undefined;
}

/**
 * Resolves `href` from a Sitecore General Link field (`value.href` and `jsonValue.value.href`).
 *
 * @param link - Link field from Sitecore layout or Edge
 */
export function getLinkFieldHref(link: LinkField | undefined): string | undefined {
  if (!link) return undefined;
  const direct = link.value?.href;
  if (typeof direct === 'string' && trimStr(direct)) return direct;
  const jv = (link as LinkField & { jsonValue?: { value?: { href?: string } } }).jsonValue;
  const nested = jv?.value?.href;
  if (typeof nested === 'string' && trimStr(nested)) return nested;
  return undefined;
}

/**
 * Target Sitecore item id from a General Link (`value.id` or `jsonValue.value.id`), when present.
 *
 * @param link - Link field from layout or Edge
 */
export function getLinkFieldTargetItemId(link: LinkField | undefined): string | undefined {
  if (!link) return undefined;
  const top = (link.value as { id?: string } | undefined)?.id;
  if (typeof top === 'string' && trimStr(top)) return top;
  const jv = (link as LinkField & { jsonValue?: { value?: { id?: string } } }).jsonValue;
  const nested = jv?.value?.id;
  if (typeof nested === 'string' && trimStr(nested)) return nested;
  return undefined;
}

/**
 * Reads optional country/region text from the language item or nested language definition item.
 */
const getLanguageCountryLabel = (lang: LanguageItem): string => {
  const f = lang.fields;
  const srcFields = f?.LanguageSource?.fields;
  return (
    trimStr(f?.LanguageCountry?.value?.toString()) ||
    trimStr(f?.CountryTitle?.value?.toString()) ||
    trimStr(f?.Country?.value?.toString()) ||
    trimStr(srcFields?.LanguageCountry?.value?.toString()) ||
    trimStr(srcFields?.CountryTitle?.value?.toString()) ||
    trimStr(srcFields?.Country?.value?.toString()) ||
    ''
  );
};

/**
 * Language row label (`Language (Country)` when country is authored).
 *
 * @param lang - A language switcher item from the Top Bar `Languages` list
 */
export const getLanguageDisplayLabel = (lang: LanguageItem): string => {
  const country = getLanguageCountryLabel(lang);
  const title = trimStr(lang.fields?.LanguageTitle?.value?.toString());

  if (title) {
    if (title.includes('(') && title.includes(')')) return title;
    if (country) return `${title} (${country})`;
    return title;
  }

  const fromSource =
    trimStr(lang.fields?.LanguageSource?.displayName) ||
    trimStr(lang.fields?.LanguageSource?.name) ||
    trimStr(lang.displayName) ||
    '';

  if (fromSource) {
    if (fromSource.includes('(') && fromSource.includes(')')) return fromSource;
    if (country) return `${fromSource} (${country})`;
    return fromSource;
  }

  return country ? `(${country})` : '';
};

/**
 * @deprecated Prefer {@link getLanguageDisplayLabel} — behavior is identical.
 */
export const getLanguageTitle = (lang: LanguageItem): string => getLanguageDisplayLabel(lang);

const normalizeLocaleTag = (x: string): string => x.trim().toLowerCase().replace(/_/g, '-');

/** BCP 47–ish: `en`, `en-US`, `zh-Hans` (no spaces). */
const ISO_LIKE = /^[a-z]{2,3}(-[a-z0-9]{2,8}){0,3}$/i;

/**
 * Collects ISO-style language tags from Sitecore data. `LanguageSource` is often unexpanded in
 * layout JSON (no `name`); we also use the list item's `name` and ISO-shaped `displayName` values.
 */
const collectLanguageCodes = (lang: LanguageItem): string[] => {
  const out: string[] = [];
  const add = (v?: string) => {
    const t = trimStr(v).replace(/\s+/g, '');
    if (!t || !ISO_LIKE.test(t)) return;
    const n = normalizeLocaleTag(t);
    if (!out.includes(n)) out.push(n);
  };

  const src = lang.fields?.LanguageSource;
  if (src && typeof src === 'object' && !Array.isArray(src)) {
    add(src.name);
    add(src.displayName);
    const sf = src.fields as Record<string, { value?: unknown }> | undefined;
    if (sf) {
      const pick = (key: string) => sf[key]?.value?.toString();
      add(pick('LanguageCode'));
      add(pick('IsoCode'));
      add(pick('RegionalIsoCode'));
    }
  }

  add(lang.name);
  add(lang.displayName);
  add(lang.fields?.LanguageCode?.value?.toString());
  add(lang.fields?.LocaleCode?.value?.toString());

  return out;
};

const strictLocaleMatch = (routeNorm: string, codeNorm: string): boolean => {
  if (routeNorm === codeNorm) return true;
  if (routeNorm.startsWith(`${codeNorm}-`)) return true;
  if (codeNorm.startsWith(`${routeNorm}-`)) return true;
  return false;
};

/**
 * Resolves the active Top Bar language row for the current page locale.
 *
 * @param currentLanguage - Page root `language`, `locale`, or route `itemLanguage`
 * @param languages - Top Bar `Languages` list items
 */
export const resolveActiveLanguageId = (
  currentLanguage: string | undefined,
  languages: LanguageItem[]
): string | undefined => {
  const raw = currentLanguage?.trim();
  if (!raw || languages.length === 0) return undefined;

  const r = normalizeLocaleTag(raw);
  const list = languages.filter((l) => l?.fields);

  // 1) Match root `language` to `LanguageSource.name` (authoritative when present)
  const bySourceName = list.filter((l) => {
    const srcName = trimStr(l.fields?.LanguageSource?.name);
    if (!srcName) return false;
    const s = normalizeLocaleTag(srcName);
    return strictLocaleMatch(r, s);
  });

  if (bySourceName.length === 1) return bySourceName[0].id;
  if (bySourceName.length > 1) {
    const def = normalizeLocaleTag(routing.defaultLocale || 'en');
    const byDef = bySourceName.find((l) => {
      const s = normalizeLocaleTag(trimStr(l.fields?.LanguageSource?.name));
      return strictLocaleMatch(def, s) || s === def;
    });
    return (byDef ?? bySourceName[0]).id;
  }

  // 2) Fallback: collected codes (unexpanded LanguageSource, item name, LanguageCode, …)
  const entries = list.map((l) => ({ id: l.id, codes: collectLanguageCodes(l) }));
  const withCodes = entries.filter((e) => e.codes.length > 0);
  const strictWinners = withCodes.filter((e) => e.codes.some((c) => strictLocaleMatch(r, c)));

  if (strictWinners.length === 1) return strictWinners[0].id;
  if (strictWinners.length > 1) {
    const def = normalizeLocaleTag(routing.defaultLocale || 'en');
    const byDef = strictWinners.find((e) => e.codes.some((c) => strictLocaleMatch(def, c) || c === def));
    return (byDef ?? strictWinners[0]).id;
  }

  const rParts = r.split('-').filter(Boolean);
  const rPrimary = rParts[0] ?? '';
  if (rPrimary.length >= 2 && rPrimary.length <= 3 && rParts.length === 1) {
    const primaryHits = withCodes.filter((e) =>
      e.codes.some((c) => (c.split('-')[0] || '') === rPrimary)
    );
    if (primaryHits.length === 1) return primaryHits[0].id;
    if (primaryHits.length > 1) {
      const def = normalizeLocaleTag(routing.defaultLocale || 'en');
      const byDefFull = primaryHits.find((e) => e.codes.some((c) => strictLocaleMatch(def, c) || c === def));
      if (byDefFull) return byDefFull.id;
      const defPrimary = def.split('-')[0] || '';
      if (defPrimary === rPrimary) {
        const byPrimary = primaryHits.find((e) =>
          e.codes.some((c) => (c.split('-')[0] || '') === defPrimary)
        );
        if (byPrimary) return byPrimary.id;
      }
      return primaryHits[0].id;
    }
  }

  return undefined;
};

/**
 * True when this row is the resolved active language for the route (prefer passing `allLanguages`
 * so `en` vs `en-US` disambiguation matches {@link resolveActiveLanguageId}).
 */
export const isLanguageItemActiveForRoute = (
  routeLocale: string | undefined,
  lang: LanguageItem,
  allLanguages?: LanguageItem[]
): boolean => {
  const list = allLanguages?.length ? allLanguages : [lang];
  const id = resolveActiveLanguageId(routeLocale, list);
  return id === lang.id;
};

/**
 * Best-effort page content language from root `language`, `locale`, or layout route/context.
 */
export const getPageContentLanguage = (page: unknown): string | undefined => {
  if (!page || typeof page !== 'object') return undefined;
  const p = page as Record<string, unknown>;

  const rootLang = p.language;
  if (typeof rootLang === 'string' && rootLang.trim()) return rootLang.trim();

  const loc = p.locale;
  if (typeof loc === 'string' && loc.trim()) return loc.trim();

  const layout = p.layout;
  if (layout && typeof layout === 'object') {
    const sitecore = (layout as Record<string, unknown>).sitecore;
    if (sitecore && typeof sitecore === 'object') {
      const route = (sitecore as Record<string, unknown>).route;
      if (route && typeof route === 'object') {
        const itemLanguage = (route as Record<string, unknown>).itemLanguage;
        if (typeof itemLanguage === 'string' && itemLanguage.trim()) return itemLanguage.trim();
      }
      const context = (sitecore as Record<string, unknown>).context;
      if (context && typeof context === 'object') {
        const ctxLang = (context as Record<string, unknown>).language;
        if (typeof ctxLang === 'string' && ctxLang.trim()) return ctxLang.trim();
      }
    }
  }

  return undefined;
};

/** @deprecated Use {@link getPageContentLanguage} */
export const getPageRootLanguage = getPageContentLanguage;

type UnknownRecord = Record<string, unknown>;

function pickNavigationField(
  flat: UnknownRecord,
  ds: UnknownRecord | undefined,
  pascalKey: string,
  camelKey: string
): unknown {
  const fromDs = ds ? (ds[pascalKey] ?? ds[camelKey]) : undefined;
  return flat[pascalKey] ?? flat[camelKey] ?? fromDs;
}

/**
 * Normalizes Header / Navigation `fields` from flat layout JSON or GraphQL datasource.
 *
 * @param raw - Raw `fields` from the Header or Navigation rendering
 * @returns {@link NavigationFields} safe to destructure in Navigation
 */
export function resolveNavigationFields(raw: unknown): NavigationFields {
  if (!raw || typeof raw !== 'object') return {} as NavigationFields;
  const flat = raw as UnknownRecord;
  const ds = (flat.data as UnknownRecord | undefined)?.datasource as
    | UnknownRecord
    | undefined;

  if (!ds) return flat as NavigationFields;

  return {
    ...flat,
    TopBar: pickNavigationField(flat, ds, 'TopBar', 'topBar') as NavigationFields['TopBar'],
    ShowTopBar: pickNavigationField(flat, ds, 'ShowTopBar', 'showTopBar') as NavigationFields['ShowTopBar'],
    Logo: pickNavigationField(flat, ds, 'Logo', 'logo') as NavigationFields['Logo'],
    LogoLink: pickNavigationField(flat, ds, 'LogoLink', 'logoLink') as NavigationFields['LogoLink'],
    MainNavigationLinks: pickNavigationField(flat, ds, 'MainNavigationLinks', 'mainNavigationLinks') as
      | NavigationFields['MainNavigationLinks'],
    SearchBoxPlaceholder: pickNavigationField(flat, ds, 'SearchBoxPlaceholder', 'searchBoxPlaceholder') as
      NavigationFields['SearchBoxPlaceholder'],
    SearchPage: pickNavigationField(flat, ds, 'SearchPage', 'searchPage') as NavigationFields['SearchPage'],
    SearchIcon: pickNavigationField(flat, ds, 'SearchIcon', 'searchIcon') as NavigationFields['SearchIcon'],
    SearchIconCssClass: pickNavigationField(flat, ds, 'SearchIconCssClass', 'searchIconCssClass') as
      NavigationFields['SearchIconCssClass'],
    IconCssClass: pickNavigationField(flat, ds, 'IconCssClass', 'iconCssClass') as NavigationFields['IconCssClass'],
    SearchCloseIconCssClass: pickNavigationField(flat, ds, 'SearchCloseIconCssClass', 'searchCloseIconCssClass') as
      NavigationFields['SearchCloseIconCssClass'],
  } as NavigationFields;
}
