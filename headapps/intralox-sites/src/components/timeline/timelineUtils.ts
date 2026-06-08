import type { ImageField } from '@sitecore-content-sdk/nextjs';

import type {
  TimelineDecadeBlock,
  TimelineEvent,
  TimelineGroup,
  TimelineNavigatorEntry,
} from './Timeline.type';

/**
 * Document scroll offset when jumping to an event; must match `scroll-mt-24` on each timeline event row.
 * Programmatic year-rail navigation prefers spine-dot ↔ up-chevron alignment; this margin is the fallback only.
 */
export const TIMELINE_EVENT_SCROLL_MARGIN_PX = 96;

/** `data-*` hook on the desktop spine event disc for scroll + year-rail alignment. */
export const TIMELINE_SPINE_DOT_DATA_ATTR = 'data-timeline-spine-dot';

/** `data-*` hook on the year rail “previous event” chevron. */
export const TIMELINE_YEAR_RAIL_UP_DATA_ATTR = 'data-timeline-year-rail-up';

/** Fixed year-rail nav height (`h-32`) — used to derive the pinned up-chevron viewport Y. */
export const TIMELINE_YEAR_RAIL_HEIGHT_PX = 128;

/** Up-chevron center offset from the top of the fixed year rail (`h-32` nav, first `h-8` button). */
export const TIMELINE_YEAR_RAIL_UP_CHEVRON_CENTER_INSET_PX = 16;

/**
 * Viewport Y of the up-chevron when the year rail is vertically centered (`top-1/2 -translate-y-1/2`).
 * Timeline spine discs scroll to this fixed line; the rail itself does not move.
 */
export function getTimelineYearRailFixedUpChevronCenterY(viewportHeight: number): number {
  return (
    viewportHeight * 0.5 -
    (TIMELINE_YEAR_RAIL_HEIGHT_PX / 2 - TIMELINE_YEAR_RAIL_UP_CHEVRON_CENTER_INSET_PX)
  );
}

export const TIMELINE_LABELS = {
  emptyHint: 'Timeline',
  noGroupsHint: 'No timeline sections configured',
  noEventsHint: 'No events configured for this section',
  watchVideo: 'Watch Video',
  playerNotConfigured: 'Video player is not configured.',
  videoAriaFallback: 'Video',
  closeModal: 'Close video',
  imageEmptyHint: 'No image configured',
  videoEmptyHint: 'No video configured',
  /** Modal `aria-label` when the image has no alt text and no event title. */
  imageModalAriaFallback: 'Timeline image',
  /** `aria-label` for the year jump rail around the timeline. */
  yearRailNavLabel: 'Timeline by year',
  /** `aria-label` for “previous event” control; `{year}` is replaced. */
  yearRailPreviousAria: 'Previous timeline event, {year}',
  /** `aria-label` for “next event” control; `{year}` is replaced. */
  yearRailNextAria: 'Next timeline event, {year}',
  /** `aria-label` when already on the first event. */
  yearRailPreviousDisabled: 'Previous timeline event (at first entry)',
  /** `aria-label` when already on the last event. */
  yearRailNextDisabled: 'Next timeline event (at last entry)',
} as const;

// --- decade header ---

/**
 * Floors a calendar year to the decade start label (e.g. 1949 → 1940, 1971 → 1970).
 */
export function floorYearToDecadeStart(year: number): number {
  return Math.floor(year / 10) * 10;
}

/**
 * Parses an event's `Year` field; returns `null` when missing or not a finite integer.
 */
export function parseTimelineEventYear(event: TimelineEvent): number | null {
  const y = parseInt(event.fields?.Year?.value?.trim() ?? '', 10);
  return Number.isFinite(y) && !isNaN(y) ? y : null;
}

/**
 * Derives the decade label (e.g., "1940", "1970") for a timeline section header.
 * Finds the minimum year across all events, then floors to the nearest decade.
 *
 * @param events - Array of timeline events for the section.
 * @returns Decade string or empty string when no valid years are found.
 */
export function getDecadeHeader(events: TimelineEvent[]): string {
  const validYears = events
    .map((e) => parseTimelineEventYear(e))
    .filter((y): y is number => y !== null);

  if (validYears.length === 0) return '';

  const minYear = Math.min(...validYears);
  return String(floorYearToDecadeStart(minYear));
}

export interface TimelineDecadeEventBand {
  decadeStart: number;
  events: TimelineEvent[];
}

/**
 * Splits a Sitecore group's events into chronological decade bands (one chip row per decade).
 * Events without a parseable year are appended to the last band, or returned alone when no decades exist.
 */
export function groupEventsByDecadeInGroup(
  events: TimelineEvent[],
): TimelineDecadeEventBand[] {
  const sorted = sortEventsByYear(events);
  const byDecade = new Map<number, TimelineEvent[]>();

  for (const event of sorted) {
    const year = parseTimelineEventYear(event);
    if (year === null) {
      continue;
    }
    const decadeStart = floorYearToDecadeStart(year);
    const list = byDecade.get(decadeStart) ?? [];
    list.push(event);
    byDecade.set(decadeStart, list);
  }

  const orphans = sorted.filter((e) => parseTimelineEventYear(e) === null);
  const bands: TimelineDecadeEventBand[] = [...byDecade.entries()]
    .sort(([a], [b]) => a - b)
    .map(([decadeStart, decadeEvents]) => ({
      decadeStart,
      events: decadeEvents,
    }));

  if (orphans.length > 0) {
    if (bands.length > 0) {
      const last = bands[bands.length - 1]!;
      last.events = sortEventsByYear([...last.events, ...orphans]);
    } else {
      bands.push({ decadeStart: 0, events: orphans });
    }
  }

  return bands;
}

/**
 * Calendar decade used for chip label and global deduplication (floored year or parsed fallback header).
 */
export function resolveTimelineDecadeChipStart(
  band: TimelineDecadeEventBand,
  fallbackDecadeHeader: string,
): number | null {
  if (band.decadeStart > 0) return band.decadeStart;
  if (!fallbackDecadeHeader.trim()) return null;
  const parsed = parseInt(fallbackDecadeHeader, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export interface TimelineDecadeChipPlacement {
  /** Whether the slate decade chip row renders for this band. */
  showChip: boolean;
  /** First visible chip on the page (top inset); only one row uses this. */
  usesFirstSectionSpacing: boolean;
}

/**
 * Decides which decade chip rows render across all Sitecore groups in datasource order.
 * Suppresses a chip when the calendar decade matches the previous visible chip (e.g. group 1
 * ends in the 1970s and group 2 continues with 1975/1978 under the same 1970 label).
 *
 * @param groups - Timeline groups from Sitecore.
 * @returns Per-group arrays aligned with {@link groupEventsByDecadeInGroup} bands (or the single fallback band).
 */
export function buildTimelineDecadeChipPlacements(
  groups: TimelineGroup[],
): TimelineDecadeChipPlacement[][] {
  let lastDisplayedDecade: number | null = null;
  let firstChipPlaced = false;
  const result: TimelineDecadeChipPlacement[][] = [];

  for (const group of groups) {
    if (!group?.fields) {
      result.push([]);
      continue;
    }

    const raw = group.fields.TimelineEvents?.filter((e) => e?.fields) ?? [];
    const events = sortEventsByYear(raw);
    const bands = groupEventsByDecadeInGroup(events);
    const bandsToRender =
      bands.length > 0 ? bands : [{ decadeStart: 0, events }];
    const fallback = getDecadeHeader(events);

    const placements: TimelineDecadeChipPlacement[] = [];
    for (const band of bandsToRender) {
      const decade = resolveTimelineDecadeChipStart(band, fallback);
      const showChip = decade !== null && decade !== lastDisplayedDecade;

      if (showChip) {
        lastDisplayedDecade = decade;
      }

      const usesFirstSectionSpacing = showChip && !firstChipPlaced;
      if (usesFirstSectionSpacing) {
        firstChipPlaced = true;
      }

      placements.push({ showChip, usesFirstSectionSpacing });
    }

    result.push(placements);
  }

  return result;
}

/**
 * Collects all timeline events from every group (datasource order), then sorts by year.
 */
export function collectAllTimelineEventsSorted(groups: TimelineGroup[]): TimelineEvent[] {
  const all: TimelineEvent[] = [];
  for (const g of groups) {
    const raw = g.fields?.TimelineEvents?.filter((e) => e?.fields) ?? [];
    all.push(...raw);
  }
  return sortEventsByYear(all);
}

/**
 * Whether any timeline event has a parseable year (closing year band / spine terminal).
 */
export function timelineHasParseableEventYears(groups: TimelineGroup[]): boolean {
  return collectAllTimelineEventsSorted(groups).some(
    (e) => parseTimelineEventYear(e) !== null,
  );
}

/**
 * Builds decade metadata from the **global** event list (parseable years only). Used for unit tests
 * and helpers — **not** for section/backdrop layout; `Timeline.tsx` renders one band per
 * {@link TimelineGroup} in datasource order (each group’s own `BackgroundColor` / `BackgroundImage`).
 *
 * When non-empty: only decades that contain at least one event; events with unparseable years are
 * merged into the current-decade band when it exists, otherwise into the last populated decade.
 *
 * @param groups - Timeline groups from Sitecore (each may contribute events).
 * @param options - Optional `currentYear` override (e.g. tests) for orphan-year placement.
 * @returns Empty array when no event has a parseable year.
 */
export function buildDecadeTimelineBlocks(
  groups: TimelineGroup[],
  options?: { currentYear?: number },
): TimelineDecadeBlock[] {
  if (!groups.length) return [];

  const currentYear = options?.currentYear ?? new Date().getFullYear();
  const currentDecade = floorYearToDecadeStart(currentYear);

  const sorted = collectAllTimelineEventsSorted(groups);
  const validYears = sorted.map(parseTimelineEventYear).filter((y): y is number => y !== null);

  if (validYears.length === 0) {
    return [];
  }

  const decadeStarts = [...new Set(validYears.map((y) => floorYearToDecadeStart(y)))].sort(
    (a, b) => a - b,
  );

  const firstStyleGroup = groups[0];
  const blocks: TimelineDecadeBlock[] = [];

  for (const d of decadeStarts) {
    const eventsInDecade = sorted.filter((e) => {
      const y = parseTimelineEventYear(e);
      if (y === null) return false;
      return floorYearToDecadeStart(y) === d;
    });

    const styleSource =
      groups.find((g) => {
        const raw = g.fields?.TimelineEvents?.filter((e) => e?.fields) ?? [];
        return raw.some((e) => {
          const y = parseTimelineEventYear(e);
          return y !== null && floorYearToDecadeStart(y) === d;
        });
      }) ?? firstStyleGroup;

    blocks.push({
      decadeStart: d,
      events: sortEventsByYear(eventsInDecade),
      styleSource,
    });
  }

  const orphanEvents = sorted.filter((e) => parseTimelineEventYear(e) === null);
  if (orphanEvents.length > 0 && blocks.length > 0) {
    const targetDecade = decadeStarts.includes(currentDecade)
      ? currentDecade
      : decadeStarts[decadeStarts.length - 1]!;
    const target = blocks.find((b) => b.decadeStart === targetDecade);
    if (target) {
      target.events = sortEventsByYear([...target.events, ...orphanEvents]);
    }
  }

  return blocks;
}

/**
 * Partitions decade blocks into **consecutive runs** that share the same `styleSource.id`.
 * Used to render one shared viewport-bleed background when a single Sitecore timeline group spans
 * multiple decade sections.
 *
 * @param blocks - Ordered output from {@link buildDecadeTimelineBlocks}.
 * @returns Non-empty arrays; each run’s blocks share one `styleSource` (the same id).
 */
export function groupTimelineDecadeBlocksByStyleSource(
  blocks: TimelineDecadeBlock[],
): TimelineDecadeBlock[][] {
  if (blocks.length === 0) return [];

  const runs: TimelineDecadeBlock[][] = [];
  let current: TimelineDecadeBlock[] = [blocks[0]!];

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i]!;
    if (block.styleSource.id === current[0]!.styleSource.id) {
      current.push(block);
    } else {
      runs.push(current);
      current = [block];
    }
  }
  runs.push(current);
  return runs;
}

// --- sort helpers ---

/**
 * Sorts timeline events by year in ascending (chronological) order.
 * Events with missing or unparseable years are placed last.
 *
 * @param events - Array of timeline events to sort.
 * @returns New sorted array of timeline events.
 */
export function sortEventsByYear(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort((a, b) => {
    const yearA = parseInt(a.fields?.Year?.value?.trim() ?? '', 10);
    const yearB = parseInt(b.fields?.Year?.value?.trim() ?? '', 10);
    if (isNaN(yearA) && isNaN(yearB)) return 0;
    if (isNaN(yearA)) return 1;
    if (isNaN(yearB)) return -1;
    return yearA - yearB;
  });
}

/**
 * Stable `id` for `scrollIntoView` / `IntersectionObserver` (HTML `id` must not use `{` / `}`).
 *
 * @param eventId - Sitecore item id (often GUID in braces).
 * @returns DOM-safe anchor string prefixed with `timeline-event-`.
 */
export function timelineEventAnchorId(eventId: string): string {
  return `timeline-event-${eventId.replace(/[{}]/g, '')}`;
}

/**
 * Mirrors timeline event card visibility (see `TimelineSection`): an event renders when it has an image or any text/video CTA content (or in editing mode placeholders apply).
 *
 * @param event - Timeline event item.
 * @param isEditing - XM Cloud Pages editing mode.
 * @returns Whether a card is emitted for this event.
 */
export function isRenderableTimelineEvent(event: TimelineEvent, isEditing: boolean): boolean {
  const f = event.fields;
  if (!f) return isEditing;

  const hasImage = Boolean(f.Image?.value?.src) || isEditing;
  const hasYear = Boolean(f.Year?.value?.trim()) || isEditing;
  const hasTitle = Boolean(f.Title?.value?.trim()) || isEditing;
  const hasDescription = Boolean(f.Description?.value?.trim()) || isEditing;
  const brightcoveId = extractBrightcoveId(f.Video);
  const hasVideo = Boolean(f.Video && brightcoveId);
  const hasContent = hasYear || hasTitle || hasDescription || hasVideo;

  return hasImage || hasContent;
}

function resolveNavigatorYearLabel(event: TimelineEvent, isEditing: boolean): string {
  const raw = event.fields?.Year?.value?.trim();
  if (raw) return raw;
  if (isEditing) return event.displayName?.trim() || '…';
  const parsed = parseTimelineEventYear(event);
  return parsed !== null ? String(parsed) : '—';
}

/**
 * Builds the year rail entry list in **global chronological order** (all groups), regardless of
 * whether sections render per-group or merged—jump targets stay year-ordered for the fixed rail.
 *
 * @param groups - Filtered timeline groups with `fields`.
 * @param isEditing - Passed to {@link isRenderableTimelineEvent} and label fallbacks.
 * @returns Chronological jump targets; empty when nothing renderable.
 */
export function buildTimelineNavigatorEntries(
  groups: TimelineGroup[],
  isEditing: boolean,
): TimelineNavigatorEntry[] {
  const ordered = collectAllTimelineEventsSorted(groups).filter((e) => e?.fields);

  return ordered
    .filter((e) => isRenderableTimelineEvent(e, isEditing))
    .map((e) => ({
      anchorId: timelineEventAnchorId(e.id),
      yearLabel: resolveNavigatorYearLabel(e, isEditing),
    }));
}

/**
 * For each timeline group (in datasource order), returns how many renderable events
 * appear in all **previous** groups. Used so alternating image/text follows the **global**
 * event sequence (first event = image left), not the group array index.
 *
 * @param groups - Filtered timeline groups with `fields` populated.
 * @returns Same length as `groups`; entry `i` is the count of events in groups `0..i-1`.
 */
export function getPriorEventCountByGroup(groups: TimelineGroup[]): number[] {
  const offsets: number[] = [];
  let sum = 0;
  for (const g of groups) {
    offsets.push(sum);
    const raw = g.fields?.TimelineEvents?.filter((e) => e?.fields) ?? [];
    sum += sortEventsByYear(raw).length;
  }
  return offsets;
}

/**
 * For decade-merged layout ({@link buildDecadeTimelineBlocks}), returns how many events appear in all
 * **previous** decades so {@link TimelineSection} can keep global image/text alternation aligned with
 * chronological order (not Sitecore group order).
 *
 * @param blocks - Sorted decade blocks from {@link buildDecadeTimelineBlocks}.
 * @param blockIndex - Index of the current block in `blocks`.
 * @returns Count of events in `blocks[0..blockIndex-1]` (0 when `blockIndex <= 0`).
 */
export function getPriorEventCountByDecadeBlockIndex(
  blocks: TimelineDecadeBlock[],
  blockIndex: number,
): number {
  let sum = 0;
  for (let i = 0; i < blockIndex; i += 1) {
    sum += blocks[i]?.events.length ?? 0;
  }
  return sum;
}

/**
 * Last group index that would render a {@link TimelineSection} (has events, or editing placeholders).
 * Used for the closing spine terminal on the final renderable group.
 *
 * @param groups - Timeline groups from Sitecore.
 * @param isEditing - XM Cloud Pages editing mode.
 * @returns Index in `groups`, or `-1` when none would render.
 */
export function getLastRenderableTimelineGroupIndex(
  groups: TimelineGroup[],
  isEditing: boolean,
): number {
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (!g?.fields) continue;
    const raw = g.fields.TimelineEvents?.filter((e) => e?.fields) ?? [];
    const events = sortEventsByYear(raw);
    if (events.length > 0 || isEditing) return i;
  }
  return -1;
}

/** Derived from `Image.value` width/height when present. */
export type TimelineImageFrameVariant = 'landscape' | 'portrait' | 'unknown';

/** Reads a single dimension from Sitecore (number or numeric string from Edge). */
function readTimelineImagePixel(value: unknown): number {
  if (value === undefined) return NaN;
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : NaN;
  }
  if (typeof value !== 'string') return NaN;
  const n = parseFloat(value.trim());
  return Number.isFinite(n) && n > 0 ? n : NaN;
}

/**
 * Parses timeline image pixel dimensions from `Image.value`. XM Cloud / Edge responses often send
 * `width` and `height` as strings (e.g. `"600"`, `"776"`), while other paths use numbers.
 *
 * @param image - The event image field (optional).
 * @returns Positive finite width and height, or `null` when missing or invalid.
 */
export function parseTimelineImagePixelDimensions(
  image?: ImageField,
): { w: number; h: number } | null {
  const w = readTimelineImagePixel(image?.value?.width);
  const h = readTimelineImagePixel(image?.value?.height);
  if (!Number.isFinite(w) || !Number.isFinite(h)) {
    return null;
  }
  return { w, h };
}

/**
 * Classifies timeline event media as landscape or portrait using Sitecore image dimensions
 * (`width` / `height` on `Image.value`, as numbers or numeric strings). Square images use landscape.
 *
 * @param image - The event image field.
 * @returns `landscape` when width ≥ height, `portrait` when height is greater than width, else `unknown`.
 */
export function getTimelineImageFrameVariant(image?: ImageField): TimelineImageFrameVariant {
  const dims = parseTimelineImagePixelDimensions(image);
  if (!dims) return 'unknown';
  return dims.w >= dims.h ? 'landscape' : 'portrait';
}

/** Design-reference aspect ratios when Sitecore does not supply image dimensions. */
const TIMELINE_IMAGE_FALLBACK_ASPECT_LANDSCAPE = '399.195 / 255.734';
const TIMELINE_IMAGE_FALLBACK_ASPECT_PORTRAIT = '284 / 430.84';

/**
 * CSS `aspect-ratio` value for the timeline event image wrapper: uses `Image.value` width/height when
 * present so each asset keeps its proportions inside the portrait/landscape max bounds; otherwise a
 * reference ratio matching the layout variant (unknown → landscape reference).
 *
 * @param image - The event image field (may omit dimensions).
 * @param variant - Portrait vs landscape classification from {@link getTimelineImageFrameVariant}.
 * @returns A string suitable for `style={{ aspectRatio: … }}`.
 */
export function getTimelineImageAspectRatioCss(
  image: ImageField | undefined,
  variant: TimelineImageFrameVariant,
): string {
  const dims = parseTimelineImagePixelDimensions(image);
  if (dims) {
    return `${dims.w} / ${dims.h}`;
  }
  if (variant === 'portrait') {
    return TIMELINE_IMAGE_FALLBACK_ASPECT_PORTRAIT;
  }
  return TIMELINE_IMAGE_FALLBACK_ASPECT_LANDSCAPE;
}

// --- video helpers ---

/**
 * Extracts the Brightcove video ID from a video item's BrightcoveId field.
 *
 * @param videoFields - The video item fields.
 * @returns Brightcove video ID string or empty string.
 */
export function extractBrightcoveId(videoFields: { fields?: { BrightcoveId?: { value?: string } } } | null | undefined): string {
  return videoFields?.fields?.BrightcoveId?.value?.trim() ?? '';
}

/**
 * Extracts the CTA button label from a Link field's text value.
 * Falls back to the default "Watch Video" label.
 *
 * @param linkValue - The link field value object.
 * @param fallback - Fallback label when link text is absent.
 * @returns Display text for the CTA button.
 */
export function resolveCTAText(
  linkValue?: { text?: string; description?: string } | null,
  fallback = TIMELINE_LABELS.watchVideo,
): string {
  const text = linkValue?.text?.trim() || linkValue?.description?.trim() || '';
  return text || fallback;
}
