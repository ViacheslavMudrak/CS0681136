import type { LinkField } from '@sitecore-content-sdk/nextjs';

import { readLinkGroupParamValue } from 'components/link-group/linkGroupUtils';

import type {
  EventListEventItem,
  EventListEventUrlJson,
  EventListYearGroup,
  EventListingsFieldNode,
  EventListParamRecord,
} from './EventList.type';

export const EVENT_LIST_REGION_ARIA = 'Events';

/**
 * Sitecore rendering parameter name for Event List banded layout.
 * This is **not** the shared Featured News / Media Tile `CardSize` param.
 */
export const EVENT_LIST_CARD_SIZE_PARAM = 'EventListCardSize';

export const EVENT_LIST_EMPTY_DATASOURCE = 'Event List';

export const EVENT_LIST_EMPTY_EDITING_HINT =
  'Events will appear here after the listing is configured.';

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

const MONTH_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

function utcDayParts(d: Date): { y: number; m: number; day: number } {
  return { y: d.getUTCFullYear(), m: d.getUTCMonth(), day: d.getUTCDate() };
}

/** Returns false for NaN dates and Sitecore's default unset date (year < 1900, e.g. 0001-01-01). */
function isValidEventDate(d: Date): boolean {
  return !Number.isNaN(d.getTime()) && d.getUTCFullYear() >= 1900;
}

function parseEventItemDates(item: EventListEventItem): { start: Date; end: Date } | null {
  const startRaw = item.EventStartDate ?? item.StartDate;
  const endRaw = item.EventEndDate ?? item.EndDate;

  const tryParse = (raw: string | null | undefined): Date | null => {
    if (typeof raw !== 'string' || raw.trim() === '') return null;
    const d = new Date(raw.trim());
    return isValidEventDate(d) ? d : null;
  };

  const start = tryParse(startRaw);
  // Fall back to startRaw when endRaw is not set, matching original behaviour.
  const end = tryParse(endRaw) ?? start;

  if (!start && !end) return null;

  // If start is Sitecore's default null-date but end is valid, use end for both.
  const resolvedStart = start ?? end!;
  const resolvedEnd = end ?? resolvedStart;

  return resolvedStart.getTime() <= resolvedEnd.getTime()
    ? { start: resolvedStart, end: resolvedEnd }
    : { start: resolvedEnd, end: resolvedStart };
}

/**
 * Left-column short range (e.g. `Apr 27 - 29`, cross-month `Apr 27 - May 1`).
 */
export function formatEventListShortDateRange(item: EventListEventItem): string {
  const parsed = parseEventItemDates(item);
  if (!parsed) {
    const s = typeof item.StartDate === 'string' ? item.StartDate.trim() : '';
    return s || '';
  }
  const { start, end } = parsed;
  const a = utcDayParts(start);
  const b = utcDayParts(end);
  const sm = MONTH_SHORT[a.m] ?? '';
  const em = MONTH_SHORT[b.m] ?? '';
  if (a.y === b.y && a.m === b.m && a.day === b.day) {
    return `${sm} ${a.day}`;
  }
  if (a.y === b.y && a.m === b.m) {
    return `${sm} ${a.day} - ${b.day}`;
  }
  if (a.y === b.y) {
    return `${sm} ${a.day} - ${em} ${b.day}`;
  }
  return `${sm} ${a.day}, ${a.y} - ${em} ${b.day}, ${b.y}`;
}

/**
 * Full calendar line for the metadata row (e.g. `February 26 - 27, 2027`).
 */
export function formatEventListFullDateRange(item: EventListEventItem): string {
  const parsed = parseEventItemDates(item);
  if (!parsed) {
    const s = typeof item.StartDate === 'string' ? item.StartDate.trim() : '';
    const e = typeof item.EndDate === 'string' ? item.EndDate.trim() : '';
    if (s && e && s !== e) return `${s} - ${e}`;
    return s || e || '';
  }
  const { start, end } = parsed;
  const a = utcDayParts(start);
  const b = utcDayParts(end);
  const lm = (i: number) => MONTH_LONG[i] ?? '';
  if (a.y === b.y && a.m === b.m && a.day === b.day) {
    return `${lm(a.m)} ${a.day}, ${a.y}`;
  }
  if (a.y === b.y && a.m === b.m) {
    return `${lm(a.m)} ${a.day} - ${b.day}, ${a.y}`;
  }
  if (a.y === b.y) {
    return `${lm(a.m)} ${a.day} - ${lm(b.m)} ${b.day}, ${a.y}`;
  }
  return `${lm(a.m)} ${a.day}, ${a.y} - ${lm(b.m)} ${b.day}, ${b.y}`;
}

export function readEventListParamValue(
  params: EventListParamRecord | undefined,
  key: string,
): string | undefined {
  return readLinkGroupParamValue(params, key);
}

export function resolveEventListCardSizeKey(raw: string | undefined): 'base' | 'compact' {
  const v = raw?.toLowerCase().trim();
  return v === 'base' ? 'base' : 'compact';
}

function unwrapEventUrl(raw: EventListEventItem['EventUrl']): EventListEventUrlJson | undefined {
  if (raw == null) return undefined;
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (t === '') return undefined;
    try {
      return JSON.parse(t) as EventListEventUrlJson;
    } catch {
      return undefined;
    }
  }
  if (typeof raw === 'object') return raw as EventListEventUrlJson;
  return undefined;
}

/**
 * Builds a `LinkField` for `Link` from resolver `EventUrl` plus display name.
 */
export function eventListItemToLinkField(
  eventName: string,
  eventUrl: EventListEventItem['EventUrl'],
): LinkField | undefined {
  const parsed = unwrapEventUrl(eventUrl);
  const href = typeof parsed?.url === 'string' ? parsed.url.trim() : '';
  if (!parsed || !href) return undefined;
  const target =
    typeof parsed.target === 'string' && parsed.target.trim() ? parsed.target.trim() : undefined;
  const query =
    typeof parsed.querystring === 'string' && parsed.querystring.trim() ?
      parsed.querystring.trim()
    : '';
  const hrefWithQs = query ? `${href}${href.includes('?') ? '&' : '?'}${query}` : href;
  const text = eventName.trim() || hrefWithQs;
  return {
    value: {
      href: hrefWithQs,
      text,
      target,
      id: typeof parsed.id === 'string' ? parsed.id : undefined,
      title:
        typeof parsed.displayName === 'string' && parsed.displayName.trim() ?
          parsed.displayName.trim()
        : undefined,
    },
  };
}

export function formatEventListLocationLine(item: EventListEventItem): string {
  const region = typeof item.Region === 'string' ? item.Region.trim() : '';
  const location = typeof item.Location === 'string' ? item.Location.trim() : '';
  if (region && location) return `${region}, ${location}`;
  return region || location;
}

function normalizeYearGroup(g: EventListYearGroup | null | undefined): EventListYearGroup | null {
  if (g == null || typeof g !== 'object') return null;
  return g;
}

/**
 * Unwraps `EventListings` whether Edge sends `{ value: [] }` or a bare array.
 */
export function extractEventListYearGroups(node: EventListingsFieldNode): EventListYearGroup[] {
  if (node == null) return [];
  if (Array.isArray(node)) {
    return node.map(normalizeYearGroup).filter((g): g is EventListYearGroup => g != null);
  }
  const arr = node.value;
  if (!Array.isArray(arr)) return [];
  return arr.map(normalizeYearGroup).filter((g): g is EventListYearGroup => g != null);
}

export function eventListItemHasVisitorContent(item: EventListEventItem): boolean {
  const name = typeof item.EventName === 'string' && item.EventName.trim().length > 0;
  const loc = formatEventListLocationLine(item).length > 0;
  const dates =
    formatEventListShortDateRange(item).length > 0 || formatEventListFullDateRange(item).length > 0;
  const link = eventListItemToLinkField(item.EventName ?? '', item.EventUrl) != null;
  return Boolean(name || loc || dates || link);
}

export function eventListYearGroupHasVisitorContent(group: EventListYearGroup): boolean {
  const items = Array.isArray(group.EventItems) ? group.EventItems : [];
  return items.some((row) => row != null && typeof row === 'object' && eventListItemHasVisitorContent(row));
}

export function eventListHasVisitorContent(groups: EventListYearGroup[]): boolean {
  return groups.some(eventListYearGroupHasVisitorContent);
}

/**
 * Stable key when items have no Sitecore id (resolver rows).
 */
export function eventListItemKey(
  yearLabel: string,
  item: EventListEventItem,
  index: number,
): string {
  const name = typeof item.EventName === 'string' ? item.EventName : '';
  const start = typeof item.EventStartDate === 'string' ? item.EventStartDate : '';
  const base = `${yearLabel}::${start}::${name}`.trim();
  if (base.replace(/:/g, '').length > 0) return base;
  return `event-list-row-${yearLabel}-${index}`;
}
