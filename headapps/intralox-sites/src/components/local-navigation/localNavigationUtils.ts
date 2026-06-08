import type { LinkField } from '@sitecore-content-sdk/nextjs';

import type {
  MainNavItem,
  NavChildItem,
  RawOrResolvedChildren,
} from 'components/navigation/Navigation.type';
import {
  getLinkFieldHref,
  getLinkFieldTargetItemId,
  getLinkText,
  getNavChildItemLabel,
  normalizeAppPathname,
  resolveChildLinks,
  resolveMegaMenuPromoLink,
  resolveNavFieldsLinkField,
} from 'components/navigation/navigationUtils';

import type {
  LocalNavLinkItem,
  LocalNavigationFields,
  LocalNavResolvedItem,
} from './LocalNavigation.type';

type UnknownRecord = Record<string, unknown>;

function pickList(
  flat: UnknownRecord,
  ds: UnknownRecord | undefined,
  pascalKey: string,
  camelKey: string
): LocalNavLinkItem[] | undefined {
  const fromDs = ds ? (ds[pascalKey] ?? ds[camelKey]) : undefined;
  const raw = flat[pascalKey] ?? flat[camelKey] ?? fromDs;
  return Array.isArray(raw) ? (raw as LocalNavLinkItem[]) : undefined;
}

/**
 * Merges flat layout fields with `fields.data.datasource` (integrated GraphQL) for local navigation lists.
 *
 * @param raw - Raw `fields` from the Local Navigation rendering
 * @returns Normalized {@link LocalNavigationFields} (empty object when `raw` is not a non-null object)
 */
export function resolveLocalNavigationFields(raw: unknown): LocalNavigationFields {
  if (!raw || typeof raw !== 'object') return {};
  const flat = raw as UnknownRecord;
  const ds = (flat.data as UnknownRecord | undefined)?.datasource as UnknownRecord | undefined;

  return {
    ...flat,
    PrimaryLinkList: pickList(flat, ds, 'PrimaryLinkList', 'primaryLinkList'),
    SecondaryLinkList: pickList(flat, ds, 'SecondaryLinkList', 'secondaryLinkList'),
  } as LocalNavigationFields;
}

const trimStr = (v?: string | number): string =>
  v === undefined || v === null ? '' : String(v).trim();

/**
 * Parses a Sitecore or absolute URL into a normalized site-relative path for matching.
 *
 * @param href - Raw `link.value.href`
 * @returns Path starting with `/`, or `/` when empty / unparsable
 */
export function hrefToNormalizedPath(href: string | undefined): string {
  if (!href || !trimStr(href)) return '/';
  const t = trimStr(href);
  if (/^https?:\/\//i.test(t)) {
    try {
      const u = new URL(t);
      return normalizeAppPathname(u.pathname);
    } catch {
      return '/';
    }
  }
  return normalizeAppPathname(t);
}

/**
 * Normalizes a link target to the same shape as {@link getContentPathFromAppPathname} when possible
 * (strips leading `[site]/[locale]` from absolute paths).
 *
 * @param href - General Link `href`
 * @param appPathname - Optional current app path to align site segment heuristics
 * @returns Content path starting with `/`, suitable for comparing to {@link getContentPathFromAppPathname}
 */
export function hrefToContentPathForMatch(href: string | undefined, appPathname?: string): string {
  const raw = hrefToNormalizedPath(href);
  const parts = raw.split('/').filter(Boolean);
  if (parts.length === 0) return '/';

  const appParts = appPathname
    ? normalizeAppPathname(appPathname).split('/').filter(Boolean)
    : [];
  const siteSeg = appParts[0];
  let i = 0;
  if (siteSeg && parts[0] === siteSeg) {
    i = 1;
    if (parts[i] && /^[a-z]{2}(-[a-z0-9]+)?$/i.test(parts[i])) {
      i += 1;
    }
    const rest = parts.slice(i).join('/');
  /**
   * Do not strip a single-segment pathname to `/` when aligning hrefs with `usePathname()`.
   */
  if (appParts.length === 1 && !rest) {
      return normalizeAppPathname(`/${parts[0]}`);
    }
    return normalizeAppPathname(`/${rest}`);
  }

  if (parts.length >= 2 && /^[a-z]{2}(-[a-z0-9]+)?$/i.test(parts[1])) {
    return normalizeAppPathname(`/${parts.slice(2).join('/')}`);
  }

  return raw;
}

/** BCP 47–style segment when default locale is omitted from the URL (see `localePrefix: 'as-needed'`). */
const APP_PATH_LOCALE_SEGMENT = /^[a-z]{2}(-[a-z0-9]+)?$/i;

/**
 * True when the browser pathname starts with the App Router `[site]` segment.
 * Middleware often serves content at `/products/...` while `useParams().site` is still `Intralox`.
 *
 * @param appPathname - `usePathname()` value
 * @param site - Site name from `useParams()` or Sitecore config
 */
export function pathnameIncludesSitePrefix(appPathname: string, site?: string): boolean {
  const siteName = site?.trim();
  if (!siteName) return false;
  const parts = normalizeAppPathname(appPathname).split('/').filter(Boolean);
  if (parts.length === 0) return false;
  return parts[0].toLowerCase() === siteName.toLowerCase();
}

/**
 * Strips the App Router `[site]` and optional `[locale]` prefix so nav hrefs match the current page.
 *
 * @param pathname - `usePathname()` value
 * @param routeContext - When `site` is set and the pathname omits that segment, the full pathname is the content path
 * @returns Sitecore-style content path (e.g. `/Foodsafe`, `/products/belts`) or `/` on site home
 */
export function getContentPathFromAppPathname(
  pathname: string,
  routeContext?: Pick<AppRouteContext, 'site'>
): string {
  const norm = normalizeAppPathname(pathname);
  const parts = norm.split('/').filter(Boolean);
  if (parts.length === 0) {
    return '/';
  }
  /** Pathname is a single segment (no `/site/locale/…` prefix) — treat it as the content path. */
  if (parts.length === 1) {
    return normalizeAppPathname(`/${parts[0]}`);
  }
  if (routeContext?.site && !pathnameIncludesSitePrefix(pathname, routeContext.site)) {
    return norm;
  }
  const afterSite = parts.slice(1);
  const head = afterSite[0] ?? '';
  if (APP_PATH_LOCALE_SEGMENT.test(head)) {
    const rest = afterSite.slice(1);
    return rest.length === 0 ? '/' : normalizeAppPathname(`/${rest.join('/')}`);
  }
  return normalizeAppPathname(`/${afterSite.join('/')}`);
}

/**
 * True when the visitor is on the site home route (no segments after site + locale).
 *
 * @param pathname - Full app pathname
 * @returns `true` when {@link getContentPathFromAppPathname} yields `/`
 */
export function isAppHomePathname(pathname: string): boolean {
  return getContentPathFromAppPathname(pathname) === '/';
}

/** App Router segments from `useParams()` — more reliable than pathname heuristics in XM Preview. */
export type AppRouteContext = {
  site?: string;
  locale?: string;
  defaultLocale?: string;
};

/**
 * Builds `/[site]` or `/[site]/[locale]` from App Router params (`localePrefix: as-needed` omits default locale).
 */
export function buildAppRoutePrefixFromParams(ctx: AppRouteContext | undefined): string | undefined {
  const site = ctx?.site?.trim();
  if (!site) return undefined;
  const locale = ctx?.locale?.trim();
  const defaultLocale = ctx?.defaultLocale?.trim() || 'en';
  if (locale && locale !== defaultLocale) {
    return normalizeAppPathname(`/${site}/${locale}`);
  }
  return normalizeAppPathname(`/${site}`);
}

/** Query keys required by {@link client.getPreview} / XM Pages when navigating inside Preview Mode. */
const PREVIEW_NAV_QUERY_KEYS = [
  'secret',
  'mode',
  'sc_site',
  'sc_lang',
  'sc_layoutKind',
  'sc_version',
  'sc_variant',
] as const;

/**
 * Builds preview query params for in-app navigation in XM Cloud Preview Mode.
 */
export function buildPreviewNavigationQueryString(
  currentParams: URLSearchParams,
  contentRoute: string,
  targetItemId?: string
): string {
  const next = new URLSearchParams();
  for (const key of PREVIEW_NAV_QUERY_KEYS) {
    const val = currentParams.get(key);
    if (val) next.set(key, val);
  }
  currentParams.forEach((val, key) => {
    if (key.includes('bypass') || key.startsWith('x-vercel')) {
      next.set(key, val);
    }
  });
  const route = normalizeAppPathname(contentRoute);
  next.set('route', route);
  const itemId = targetItemId?.replace(/[{}]/g, '').trim();
  if (itemId) next.set('sc_itemid', itemId);
  return next.toString();
}

export type ResolveLocalNavLinkOptions = {
  routeContext?: AppRouteContext;
  isPreview?: boolean;
  previewSearchParams?: URLSearchParams;
};

/**
 * Prefixes a Sitecore content href with App Router `[site]` / `[locale]` segments.
 *
 * @param href - General Link `href` (content path or already site-prefixed)
 * @param appPathname - `usePathname()` value
 * @param routeContext - Optional `useParams()` site/locale (preferred over pathname parsing)
 * @returns App Router path, or the original href for external / special schemes
 */
export function buildAppHrefFromContentHref(
  href: string | undefined,
  appPathname: string,
  routeContext?: AppRouteContext
): string | undefined {
  if (!href || !trimStr(href)) return href;
  const t = trimStr(href);
  if (/^https?:\/\//i.test(t) || t.startsWith('#') || /^mailto:/i.test(t) || /^tel:/i.test(t)) {
    return t;
  }

  const content = hrefToContentPathForMatch(t, appPathname);

  /** Default-site URLs omit `[site]` — do not inject it from `useParams()`. */
  if (routeContext?.site && !pathnameIncludesSitePrefix(appPathname, routeContext.site)) {
    return hrefToNormalizedPath(t);
  }

  const prefixFromParams = buildAppRoutePrefixFromParams(routeContext);
  if (prefixFromParams) {
    return content === '/'
      ? prefixFromParams
      : normalizeAppPathname(`${prefixFromParams}${content}`);
  }

  const parts = normalizeAppPathname(appPathname).split('/').filter(Boolean);

  if (parts.length === 0) {
    return content;
  }
  /** Preview / single-segment pathname — href is already relative to that root. */
  if (parts.length === 1) {
    return content;
  }

  const site = parts[0];
  const afterSite = parts.slice(1);
  const head = afterSite[0] ?? '';

  if (APP_PATH_LOCALE_SEGMENT.test(head)) {
    const prefix = `/${site}/${head}`;
    return content === '/' ? prefix : normalizeAppPathname(`${prefix}${content}`);
  }

  const prefix = `/${site}`;
  return content === '/' ? prefix : normalizeAppPathname(`${prefix}${content}`);
}

function cloneLinkFieldWithHref(
  link: LinkField,
  appHref: string,
  querystring?: string
): LinkField {
  const value = link.value
    ? {
        ...link.value,
        href: appHref,
        ...(querystring !== undefined ? { querystring } : {}),
      }
    : { href: appHref, ...(querystring !== undefined ? { querystring } : {}) };
  const withJson = link as LinkField & {
    jsonValue?: { value?: { href?: string; querystring?: string } };
  };
  if (withJson.jsonValue?.value) {
    return {
      ...link,
      value,
      jsonValue: {
        ...withJson.jsonValue,
        value: {
          ...withJson.jsonValue.value,
          href: appHref,
          ...(querystring !== undefined ? { querystring } : {}),
        },
      },
    } as LinkField;
  }
  return { ...link, value };
}

/**
 * Clones a General Link field with an App Router–safe `href` for {@link SitecoreLink} when not editing.
 *
 * @param link - Link field from layout or Edge
 * @param appPathname - `usePathname()` value
 * @param options - Route params and preview query preservation for XM Cloud Preview
 * @returns Link field with prefixed href, or the original when unchanged
 */
export function resolveLocalNavLinkFieldForAppRouter(
  link: LinkField | undefined,
  appPathname: string,
  options?: ResolveLocalNavLinkOptions
): LinkField | undefined {
  if (!link) return link;
  const rawHref = getLinkFieldHref(link);
  if (!rawHref) return link;
  let appHref =
    buildAppHrefFromContentHref(rawHref, appPathname, options?.routeContext) ?? rawHref;

  let previewQuerystring: string | undefined;
  if (options?.isPreview && options.previewSearchParams) {
    const contentRoute = hrefToContentPathForMatch(rawHref, appPathname);
    previewQuerystring = buildPreviewNavigationQueryString(
      options.previewSearchParams,
      contentRoute,
      getLinkFieldTargetItemId(link)
    );
  }

  const hrefChanged = appHref !== rawHref;
  const queryChanged =
    previewQuerystring !== undefined &&
    previewQuerystring !== (link.value?.querystring ?? '');

  if (!hrefChanged && !queryChanged) return link;
  return cloneLinkFieldWithHref(link, appHref, previewQuerystring);
}

function pathMatchesMainNavHref(
  appPathname: string,
  contentPath: string,
  href: string | undefined
): boolean {
  const c = normalizeAppPathname(contentPath).toLowerCase();
  const h = hrefToContentPathForMatch(href, appPathname).toLowerCase();
  if (h === '/' || h === '') return false;
  return c === h || c.startsWith(`${h}/`);
}

function mainNavChildSubtreeMatchesPath(
  appPathname: string,
  contentPath: string,
  child: NavChildItem
): boolean {
  const href = getLinkFieldHref(resolveNavFieldsLinkField(child.fields));
  if (pathMatchesMainNavHref(appPathname, contentPath, href)) return true;
  if (child.url && pathMatchesMainNavHref(appPathname, contentPath, child.url)) return true;
  return resolveChildLinks(child.fields?.ChildLinks).some((sub) =>
    mainNavChildSubtreeMatchesPath(appPathname, contentPath, sub)
  );
}

/**
 * True when the current route matches this primary header item, its mega-menu promo CTA,
 * or any secondary/tertiary link under it (for desktop main-nav selected state).
 */
export function mainNavItemMatchesCurrentPath(pathname: string, item: MainNavItem): boolean {
  if (isAppHomePathname(pathname)) return false;
  const contentPath = getContentPathFromAppPathname(pathname);
  if (pathMatchesMainNavHref(pathname, contentPath, getLinkFieldHref(resolveNavFieldsLinkField(item.fields)))) {
    return true;
  }
  if (item.url && pathMatchesMainNavHref(pathname, contentPath, item.url)) {
    return true;
  }
  const { field: promo } = resolveMegaMenuPromoLink(item);
  const promoHref = promo?.value?.href;
  if (promoHref && pathMatchesMainNavHref(pathname, contentPath, promoHref)) {
    return true;
  }
  return resolveChildLinks(item.fields?.ChildLinks).some((ch) =>
    mainNavChildSubtreeMatchesPath(pathname, contentPath, ch)
  );
}

/**
 * True when `context.itemPath` is a Sitecore content/media path, not a public URL segment list.
 * Those values do not align with General Link `href` matching — use {@link getContentPathFromAppPathname} instead.
 */
function isSitecoreInternalItemPath(raw: string): boolean {
  return normalizeAppPathname(raw).toLowerCase().includes('/sitecore/');
}

/**
 * Content path for mega-menu “current” row matching (prefers public `context.itemPath`).
 *
 * @param appPathname - `usePathname()` value
 * @param itemPathFromContext - `layout.sitecore.context.itemPath` when the layout service provides it
 */
export function megaMenuMatchContentPath(
  appPathname: string,
  itemPathFromContext?: string | null
): string {
  if (isAppHomePathname(appPathname)) {
    return getContentPathFromAppPathname(appPathname);
  }
  const trimmed = itemPathFromContext?.trim();
  if (trimmed && !isSitecoreInternalItemPath(trimmed)) {
    return normalizeAppPathname(trimmed);
  }
  return getContentPathFromAppPathname(appPathname);
}

/**
 * True when this mega-menu row (secondary or tertiary) should use the current-page style: the URL
 * matches this row’s link and no nested child is a more specific match.
 *
 * @param appPathname - `usePathname()` value
 * @param child - A secondary or tertiary nav row from the mega menu
 * @param itemPathFromContext - Optional `layout.sitecore.context.itemPath` (authoritative when set)
 * @param routeItemGuid - Optional `layout.sitecore.route.itemId` — matches General Link target id when href/path differ
 */
export function megaMenuChildRowIsCurrentPage(
  appPathname: string | undefined | null,
  child: NavChildItem,
  itemPathFromContext?: string | null,
  routeItemGuid?: string | null
): boolean {
  const appPath = typeof appPathname === 'string' ? appPathname : '';
  if (isAppHomePathname(appPath)) return false;
  const contentPath = megaMenuMatchContentPath(appPath, itemPathFromContext);
  const href = getLinkFieldHref(resolveNavFieldsLinkField(child.fields));
  const routeNorm = routeItemGuid ? normalizeGuid(routeItemGuid) : '';

  const matchesByPath =
    pathMatchesMainNavHref(appPath, contentPath, href) ||
    (!!child.url && pathMatchesMainNavHref(appPath, contentPath, child.url));

  const matchesById =
    routeNorm !== '' && linkIdMatchesRoute(resolveNavFieldsLinkField(child.fields), routeNorm);

  if (!matchesByPath && !matchesById) return false;

  const nested = resolveChildLinks(child.fields?.ChildLinks);
  if (!nested.length) return true;

  return !nested.some(
    (sub) =>
      mainNavChildSubtreeMatchesPath(appPath, contentPath, sub) ||
      (routeNorm !== '' && linkIdMatchesRoute(resolveNavFieldsLinkField(sub.fields), routeNorm))
  );
}

/**
 * True when the section “Overview” link in the mega-menu footer should show as the current page:
 * the primary section URL matches, but no secondary/tertiary child URL is a better match.
 *
 * @param appPathname - `usePathname()` value
 * @param item - The primary navigation item that owns the mega menu
 * @param itemPathFromContext - Optional `layout.sitecore.context.itemPath` (authoritative when set)
 * @param routeItemGuid - Optional `layout.sitecore.route.itemId` for link-target id matching
 */
export function megaMenuSectionOverviewIsCurrentPage(
  appPathname: string | undefined | null,
  item: MainNavItem,
  itemPathFromContext?: string | null,
  routeItemGuid?: string | null
): boolean {
  const appPath = typeof appPathname === 'string' ? appPathname : '';
  if (isAppHomePathname(appPath)) return false;
  const contentPath = megaMenuMatchContentPath(appPath, itemPathFromContext);
  const href = getLinkFieldHref(resolveNavFieldsLinkField(item.fields));
  const routeNorm = routeItemGuid ? normalizeGuid(routeItemGuid) : '';
  const matchesSelf =
    pathMatchesMainNavHref(appPath, contentPath, href) ||
    (!!item.url && pathMatchesMainNavHref(appPath, contentPath, item.url));
  if (!matchesSelf) return false;

  const primaryHrefRaw = href || item.url;
  const primaryPathNorm = primaryHrefRaw
    ? hrefToContentPathForMatch(primaryHrefRaw, appPath).toLowerCase()
    : '';

  return !resolveChildLinks(item.fields?.ChildLinks).some((ch) => {
    const chField = resolveNavFieldsLinkField(ch.fields);
    const chHrefRaw = getLinkFieldHref(chField) || ch.url;
    if (primaryPathNorm && primaryPathNorm !== '/' && chHrefRaw) {
      const chNorm = hrefToContentPathForMatch(chHrefRaw, appPath).toLowerCase();
      /** Same destination as the section root link — duplicate CMS row; must not block Overview highlight. */
      if (chNorm === primaryPathNorm) {
        return false;
      }
    }
    return (
      mainNavChildSubtreeMatchesPath(appPath, contentPath, ch) ||
      (routeNorm !== '' && linkIdMatchesRoute(chField, routeNorm))
    );
  });
}

function linkFieldIsRenderable(link: LinkField | undefined): boolean {
  return !!getLinkFieldHref(link);
}

function labelForItem(item: LocalNavLinkItem, link: LinkField | undefined): string {
  const fromLink = trimStr(getLinkText(link));
  if (fromLink) return fromLink;
  return trimStr(item.displayName ?? '');
}

/**
 * Resolves nested items up to two child levels under each row (tertiary + quaternary).
 * Skips `ChildLinks` when `ShowChildLinks` is true — those children belong in the header mega menu, not the strip flyout.
 *
 * @param item - CMS row
 * @param depth - 0 = the row itself; 1 = tertiary; 2 = quaternary (no further `ChildLinks`)
 */
function resolveTree(item: LocalNavLinkItem, depth: number): LocalNavResolvedItem | null {
  const link = item.fields?.Link;
  if (!linkFieldIsRenderable(link)) return null;
  const label = labelForItem(item, link);
  if (!label) return null;

  const rawChildren = item.fields?.ChildLinks;
  const maxDepthIndex = 2;
  /** Mega-menu-only nesting (e.g. Solutions › Packer) — strip stays a flat sibling link. */
  const childLinksAreMegaMenuOnly = item.fields?.ShowChildLinks?.value === true;

  let children: LocalNavResolvedItem[] = [];
  if (depth < maxDepthIndex && !childLinksAreMegaMenuOnly) {
    children = resolveChildLinks(rawChildren as RawOrResolvedChildren)
      .map((c) => resolveTree(c as LocalNavLinkItem, depth + 1))
      .filter((x): x is LocalNavResolvedItem => x !== null);
  }

  return {
    id: item.id,
    label,
    link: link as LinkField,
    children,
  };
}

/**
 * Maps CMS list rows to resolved items; skips blank links or labels.
 *
 * @param items - Primary or secondary list from Sitecore
 * @returns Flattened, renderable tree nodes with stable `id` and resolved `label`/`link`
 */
export function mapLinkListToResolved(items: LocalNavLinkItem[] | undefined): LocalNavResolvedItem[] {
  if (!items?.length) return [];
  return items
    .filter((row) => row?.fields)
    .map((row) => resolveTree(row, 0))
    .filter((x): x is LocalNavResolvedItem => x !== null);
}

/**
 * True when `contentPath` is exactly `base` or nested under `base` as a path segment.
 *
 * @param contentPath - {@link getContentPathFromAppPathname}
 * @param base - Normalized link path
 * @returns `true` when the current page path is the base or a deeper segment under it (with special case for base `/`)
 */
export function contentPathUnderBase(contentPath: string, base: string): boolean {
  const c = normalizeAppPathname(contentPath);
  const b = normalizeAppPathname(base);
  /** Treat `/` as home only — avoids every page matching a primary whose href collapses to `/`. */
  if (b === '/') return c === '/';
  return c === b || c.startsWith(`${b}/`);
}

/**
 * Picks the primary item whose link path is the longest prefix match of the current content path.
 *
 * @param contentPath - Current page content path
 * @param appPathname - Full app pathname (for site/locale alignment in {@link hrefToContentPathForMatch})
 * @param primaries - Resolved primary links
 * @returns Index `>= 0`, or `-1` when none match
 */
export function findActivePrimaryIndex(
  contentPath: string,
  appPathname: string,
  primaries: LocalNavResolvedItem[]
): number {
  let bestIdx = -1;
  let bestLen = -1;
  primaries.forEach((p, idx) => {
    const base = hrefToContentPathForMatch(getLinkFieldHref(p.link), appPathname);
    if (!contentPathUnderBase(contentPath, base)) return;
    const len = base === '/' ? 0 : base.length;
    if (len >= bestLen) {
      bestLen = len;
      bestIdx = idx;
    }
  });
  return bestIdx;
}

/**
 * True when this resolved node or any descendant matches the current content path.
 *
 * @param contentPath - Current page content path
 * @param appPathname - Full app pathname (for site/locale alignment)
 * @param item - Resolved tree node
 * @returns `true` if this node or any descendant URL matches the active route
 */
export function resolvedItemOrDescendantActive(
  contentPath: string,
  appPathname: string,
  item: LocalNavResolvedItem
): boolean {
  const selfPath = hrefToContentPathForMatch(getLinkFieldHref(item.link), appPathname);
  const c = normalizeAppPathname(contentPath);
  if (c === selfPath || (selfPath !== '/' && c.startsWith(`${selfPath}/`))) {
    return true;
  }
  return item.children.some((ch) => resolvedItemOrDescendantActive(contentPath, appPathname, ch));
}

/**
 * Among sibling local-nav links, returns the row that should show “current” styling.
 *
 * @param contentPath - Same shape as {@link getContentPathFromAppPathname} (`usePathname()`-derived)
 * @param appPathname - `usePathname()` value (aligns site/locale with {@link hrefToContentPathForMatch})
 * @param siblings - Items rendered as peers (strip tabs, mobile submenu rows, or flyout column)
 * @param routeItemGuid - Optional `layout.sitecore.route.itemId` for id-based match when hrefs disagree
 * @returns The winning sibling, or `null` when none match or on site home
 */
export function localNavSiblingActiveItem(
  contentPath: string,
  appPathname: string,
  siblings: LocalNavResolvedItem[],
  routeItemGuid?: string | null
): LocalNavResolvedItem | null {
  if (isAppHomePathname(appPathname)) return null;
  const routeNorm = routeItemGuid ? normalizeGuid(routeItemGuid) : '';
  const rawContentPath = normalizeAppPathname(contentPath).toLowerCase();
  const alignedContentPath = hrefToContentPathForMatch(contentPath, appPathname).toLowerCase();
  const candidateContentPaths =
    rawContentPath === alignedContentPath
      ? [rawContentPath]
      : [rawContentPath, alignedContentPath];

  type Cand = { item: LocalNavResolvedItem; h: string; exact: boolean };
  const candidates: Cand[] = [];
  for (const item of siblings) {
    const rawHref = getLinkFieldHref(item.link);
    const h = hrefToContentPathForMatch(rawHref, appPathname).toLowerCase();
    if (h === '/' || h === '') continue;
    const exact = candidateContentPaths.some((c) => c === h);
    const prefix = candidateContentPaths.some((c) => c.startsWith(`${h}/`));
    if (!exact && !prefix) continue;
    candidates.push({ item, h, exact });
  }

  if (candidates.length === 0) {
    if (!routeNorm) return null;
    const byId = siblings.filter((s) => linkIdMatchesRoute(s.link, routeNorm));
    if (byId.length === 1) return byId[0]!;
    if (byId.length > 1) {
      let best = byId[0]!;
      let bestLen = hrefToContentPathForMatch(getLinkFieldHref(best.link), appPathname).length;
      for (let i = 1; i < byId.length; i += 1) {
        const hi = hrefToContentPathForMatch(getLinkFieldHref(byId[i]!.link), appPathname);
        if (hi.length > bestLen) {
          best = byId[i]!;
          bestLen = hi.length;
        }
      }
      return best;
    }
    return null;
  }

  const exactOnes = candidates.filter((x) => x.exact);
  const pool = exactOnes.length > 0 ? exactOnes : candidates;

  if (routeNorm) {
    const idMatched = pool.filter((x) => linkIdMatchesRoute(x.item.link, routeNorm));
    if (idMatched.length === 1) return idMatched[0]!.item;
  }

  let best = pool[0]!;
  for (let i = 1; i < pool.length; i += 1) {
    const cur = pool[i]!;
    if (cur.h.length > best.h.length) best = cur;
  }
  return best.item;
}

/**
 * True when the local-nav primary should match Overview “current” styling.
 *
 * @param contentPath - {@link getContentPathFromAppPathname}
 * @param appPathname - `usePathname()` value
 * @param primary - Resolved section primary
 * @param secondaries - Strip / mobile submenu siblings (includes Overview when authored)
 * @param routeItemGuid - Optional `route.itemId` for id-based sibling selection
 */
export function localNavPrimaryOverviewIsCurrent(
  contentPath: string,
  appPathname: string,
  primary: LocalNavResolvedItem,
  secondaries: LocalNavResolvedItem[],
  routeItemGuid?: string | null
): boolean {
  if (isAppHomePathname(appPathname)) return false;
  const p = hrefToContentPathForMatch(getLinkFieldHref(primary.link), appPathname).toLowerCase();
  if (p === '/' || p === '') return false;

  if (secondaries.length > 0) {
    const activeSibling = localNavSiblingActiveItem(contentPath, appPathname, secondaries, routeItemGuid);
    if (activeSibling) {
      const a = hrefToContentPathForMatch(getLinkFieldHref(activeSibling.link), appPathname).toLowerCase();
      return a === p;
    }
  }

  const c = normalizeAppPathname(contentPath).toLowerCase();
  return c === p;
}

/**
 * Reads route-level “show sub navigation” checkbox (layout + camelCase).
 *
 * @param routeFields - `page.layout.sitecore.route.fields`
 * @returns `true` when `ShowSubNavigation` / `showSubNavigation` field value is boolean `true`
 */
export function routeShowsSubNavigation(routeFields: unknown): boolean {
  if (!routeFields || typeof routeFields !== 'object') return false;
  const bag = routeFields as UnknownRecord;
  const pascal = bag.ShowSubNavigation as { value?: boolean } | undefined;
  const camel = bag.showSubNavigation as { value?: boolean } | undefined;
  return pascal?.value === true || camel?.value === true;
}

/** Sitecore route `placeholders` key for the Local Navigation rendering (see `Layout.tsx`). */
export const LOCAL_NAV_PLACEHOLDER_KEY = 'headless-local-navigation';

/**
 * True when the route layout already includes at least one rendering in the local-navigation placeholder.
 *
 * @param route - `page.layout.sitecore.route`
 * @returns `true` when `placeholders['headless-local-navigation']` is a non-empty array
 */
export function routeHasLocalNavigationPlaceholderContent(route: unknown): boolean {
  if (!route || typeof route !== 'object') return false;
  const ph = (route as UnknownRecord).placeholders as UnknownRecord | undefined;
  if (!ph || typeof ph !== 'object') return false;
  const block = ph[LOCAL_NAV_PLACEHOLDER_KEY];
  return Array.isArray(block) && block.length > 0;
}

function normalizeGuid(raw: string | undefined): string {
  if (!raw || typeof raw !== 'string') return '';
  return raw.replace(/[{}]/g, '').trim().toLowerCase();
}

function linkIdMatchesRoute(link: LinkField | undefined, routeItemIdNorm: string): boolean {
  if (!routeItemIdNorm) return false;
  const id = getLinkFieldTargetItemId(link);
  return !!id && normalizeGuid(id) === routeItemIdNorm;
}

function linkHrefMatchesItemPath(link: LinkField | undefined, itemPathNorm: string): boolean {
  if (!itemPathNorm) return false;
  const href = getLinkFieldHref(link);
  if (typeof href !== 'string' || !trimStr(href)) return false;
  const linkPath = normalizeAppPathname(hrefToNormalizedPath(href)).toLowerCase();
  const target = normalizeAppPathname(itemPathNorm).toLowerCase();
  if (linkPath === '/' || linkPath === '') {
    return target === '/';
  }
  return target === linkPath || target.startsWith(`${linkPath}/`);
}

function navNodeMatchesRoute(
  node: MainNavItem | NavChildItem,
  routeItemIdNorm: string,
  itemPathNorm: string
): boolean {
  const link = resolveNavFieldsLinkField(node.fields);
  if (linkIdMatchesRoute(link, routeItemIdNorm)) return true;
  if (itemPathNorm && linkHrefMatchesItemPath(link, itemPathNorm)) return true;
  return false;
}

type NavMatch = {
  node: MainNavItem | NavChildItem;
  /** Null when the current page matched a top-level main nav item. */
  parent: MainNavItem | NavChildItem | null;
};

function searchChildren(
  children: NavChildItem[],
  parent: MainNavItem | NavChildItem,
  routeItemIdNorm: string,
  itemPathNorm: string
): NavMatch | null {
  for (const ch of children) {
    if (navNodeMatchesRoute(ch, routeItemIdNorm, itemPathNorm)) {
      return { node: ch, parent };
    }
    const deeper = resolveChildLinks(ch.fields?.ChildLinks);
    const hit = searchChildren(deeper, ch, routeItemIdNorm, itemPathNorm);
    if (hit) return hit;
  }
  return null;
}

function searchMainNavigation(
  items: MainNavItem[],
  routeItemIdNorm: string,
  itemPathNorm: string
): NavMatch | null {
  for (const main of items) {
    if (navNodeMatchesRoute(main, routeItemIdNorm, itemPathNorm)) {
      return { node: main, parent: null };
    }
    const children = resolveChildLinks(main.fields?.ChildLinks);
    const hit = searchChildren(children, main, routeItemIdNorm, itemPathNorm);
    if (hit) return hit;
  }
  return null;
}

function walkComponentsForHeaderMainNav(nodes: unknown[]): MainNavItem[] | undefined {
  for (const n of nodes) {
    if (!n || typeof n !== 'object') continue;
    const o = n as UnknownRecord;
    const name = o.componentName ?? o.ComponentName;
    if (name === 'Header') {
      const fields = o.fields as UnknownRecord | undefined;
      const raw = fields?.MainNavigationLinks ?? fields?.mainNavigationLinks;
      if (Array.isArray(raw) && raw.length > 0) {
        return raw as MainNavItem[];
      }
    }
    const ph = o.placeholders as UnknownRecord | undefined;
    if (ph && typeof ph === 'object') {
      for (const key of Object.keys(ph)) {
        const child = ph[key];
        if (Array.isArray(child)) {
          const found = walkComponentsForHeaderMainNav(child);
          if (found) return found;
        }
      }
    }
  }
  return undefined;
}

/**
 * Reads `MainNavigationLinks` from the first `Header` rendering under `route.placeholders` (any depth).
 *
 * @param route - `page.layout.sitecore.route`
 * @returns Top-level main nav link items, or `undefined` when no Header with links is found
 */
export function extractMainNavigationLinksFromRoute(route: unknown): MainNavItem[] | undefined {
  if (!route || typeof route !== 'object') return undefined;
  const ph = (route as UnknownRecord).placeholders as UnknownRecord | undefined;
  if (!ph || typeof ph !== 'object') return undefined;
  for (const key of Object.keys(ph)) {
    const block = ph[key];
    if (Array.isArray(block)) {
      const found = walkComponentsForHeaderMainNav(block);
      if (found) return found;
    }
  }
  return undefined;
}

function resolvedPrimaryFromMatch(m: NavMatch): LocalNavResolvedItem | null {
  if (m.parent === null) {
    const main = m.node as MainNavItem;
    const link = main.fields?.Link;
    if (!linkFieldIsRenderable(link)) return null;
    const label =
      trimStr(getNavChildItemLabel(main as unknown as NavChildItem)) || trimStr(getLinkText(link));
    if (!label) return null;
    return { id: `${main.id}-localnav-primary`, label, link: link as LinkField, children: [] };
  }
  const link = m.parent.fields?.Link;
  if (!linkFieldIsRenderable(link)) return null;
  const label =
    trimStr(getNavChildItemLabel(m.parent as unknown as NavChildItem)) || trimStr(getLinkText(link));
  if (!label) return null;
  return {
    id: `${m.parent.id}-localnav-primary`,
    label,
    link: link as LinkField,
    children: [],
  };
}

function secondarySourceItems(m: NavMatch): LocalNavLinkItem[] {
  if (m.parent === null) {
    const main = m.node as MainNavItem;
    return resolveChildLinks(main.fields?.ChildLinks) as LocalNavLinkItem[];
  }
  return resolveChildLinks(m.parent.fields?.ChildLinks) as LocalNavLinkItem[];
}

/** Result of {@link deriveLocalNavFromHeaderPlaceholders} (layout service–derived strip). */
export type DerivedLocalNavFromHeader = {
  primaries: LocalNavResolvedItem[];
  secondaries: LocalNavResolvedItem[];
  /** When true, nested strip items use chevron dropdowns (Industries hub pattern). */
  useIndustryNavDropdowns: boolean;
};

function isIndustriesMainNavItem(main: MainNavItem): boolean {
  const candidates = [
    trimStr(main.name),
    trimStr(main.displayName),
    trimStr(main.fields?.Title?.value),
  ].map((s) => s.toLowerCase());
  return candidates.some((s) => s === 'industries');
}

function navChildSubtreeContainsId(node: NavChildItem, targetId: string): boolean {
  if (node.id === targetId) return true;
  for (const ch of resolveChildLinks(node.fields?.ChildLinks)) {
    if (navChildSubtreeContainsId(ch, targetId)) return true;
  }
  return false;
}

function industriesSubtreeContainsNodeId(industriesMain: MainNavItem, targetId: string): boolean {
  for (const ch of resolveChildLinks(industriesMain.fields?.ChildLinks)) {
    if (navChildSubtreeContainsId(ch, targetId)) return true;
  }
  return false;
}

/**
 * True when the matched page lives under Industries in the mega-menu tree, but not on the
 * top-level Industries overview itself (that strip stays a simple section list).
 */
function isUnderIndustriesContentHub(industriesMain: MainNavItem, m: NavMatch): boolean {
  const onOverview = m.parent === null && m.node === industriesMain;
  if (onOverview) return false;
  return industriesSubtreeContainsNodeId(industriesMain, (m.node as NavChildItem).id);
}

/**
 * Builds a primary strip label from any header nav child (e.g. Packaging under Industries).
 */
function resolvedFromNavChild(node: NavChildItem): LocalNavResolvedItem | null {
  const link = node.fields?.Link;
  if (!linkFieldIsRenderable(link)) return null;
  const label = trimStr(getNavChildItemLabel(node)) || trimStr(getLinkText(link));
  if (!label) return null;
  return {
    id: `${node.id}-localnav-primary`,
    label,
    link: link as LinkField,
    children: [],
  };
}

/**
 * Hub layout when the page is a top-level secondary with tertiary children.
 */
function topLevelSecondaryHubLayout(
  match: NavMatch,
  mainLinks: MainNavItem[]
): { primary: LocalNavResolvedItem; secondaries: LocalNavResolvedItem[] } | null {
  if (match.parent === null) return null;
  const parentIsTopLevelMain = mainLinks.some((m) => m === match.parent);
  if (!parentIsTopLevelMain) return null;
  const sec = match.node as NavChildItem;
  const hubKids = resolveChildLinks(sec.fields?.ChildLinks) as LocalNavLinkItem[];
  if (hubKids.length === 0) return null;
  const hub = resolvedFromNavChild(sec);
  if (!hub) return null;
  return {
    primary: hub,
    secondaries: mapLinkListToResolved(hubKids),
  };
}

/**
 * Builds local-nav primary/secondary links from the header mega-menu when the placeholder is empty.
 *
 * @param route - `page.layout.sitecore.route`
 * @param routeItemId - `route.itemId` (GUID string)
 * @param itemPath - `layout.sitecore.context.itemPath` (e.g. `/Solutions/Foodsafe`)
 * @returns Resolved primary/secondary strips and whether industry-style dropdowns apply
 */
export function deriveLocalNavFromHeaderPlaceholders(
  route: unknown,
  routeItemId: string,
  itemPath: string | undefined
): DerivedLocalNavFromHeader {
  const mainLinks = extractMainNavigationLinksFromRoute(route);
  if (!mainLinks?.length) {
    return { primaries: [], secondaries: [], useIndustryNavDropdowns: false };
  }
  const routeIdNorm = normalizeGuid(routeItemId);
  const pathNorm = itemPath ? normalizeAppPathname(itemPath) : '';
  const match = searchMainNavigation(mainLinks, routeIdNorm, pathNorm);
  if (!match) {
    return { primaries: [], secondaries: [], useIndustryNavDropdowns: false };
  }

  const industriesMain = mainLinks.find(isIndustriesMainNavItem);
  const hubLayout = topLevelSecondaryHubLayout(match, mainLinks);
  const primary = hubLayout?.primary ?? resolvedPrimaryFromMatch(match);
  const secondaries = hubLayout?.secondaries ?? mapLinkListToResolved(secondarySourceItems(match));
  const useIndustryNavDropdowns = Boolean(
    industriesMain && isUnderIndustriesContentHub(industriesMain, match)
  );

  return {
    primaries: primary ? [primary] : [],
    secondaries,
    useIndustryNavDropdowns,
  };
}
