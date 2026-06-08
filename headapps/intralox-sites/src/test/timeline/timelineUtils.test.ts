import { describe, expect, it } from 'vitest';

import type { TimelineGroup } from 'components/timeline/Timeline.type';
import type { ImageField } from '@sitecore-content-sdk/nextjs';

import {
  buildDecadeTimelineBlocks,
  buildTimelineDecadeChipPlacements,
  groupEventsByDecadeInGroup,
  timelineHasParseableEventYears,
  buildTimelineNavigatorEntries,
  floorYearToDecadeStart,
  getLastRenderableTimelineGroupIndex,
  getPriorEventCountByDecadeBlockIndex,
  getTimelineImageAspectRatioCss,
  getTimelineImageFrameVariant,
  groupTimelineDecadeBlocksByStyleSource,
  parseTimelineImagePixelDimensions,
  parseTimelineEventYear,
  timelineEventAnchorId,
} from 'components/timeline/timelineUtils';

function makeEvent(id: string, year: string) {
  return {
    id,
    fields: { Year: { value: year } },
  };
}

function makeGroup(
  id: string,
  events: ReturnType<typeof makeEvent>[],
  extra?: Partial<TimelineGroup['fields']>,
): TimelineGroup {
  return {
    id,
    fields: {
      TimelineEvents: events,
      ...extra,
    },
  };
}

describe('getTimelineImageAspectRatioCss', () => {
  it('uses Sitecore width and height when both are positive numbers', () => {
    const image = { value: { width: 640, height: 480, src: '/x' } } as ImageField;
    expect(getTimelineImageAspectRatioCss(image, 'landscape')).toBe('640 / 480');
    expect(getTimelineImageAspectRatioCss(image, 'portrait')).toBe('640 / 480');
  });

  it('uses string width and height from Edge-style payloads', () => {
    const image = {
      value: { width: '600', height: '776', src: '/timeline.jpg' },
    } as ImageField;
    expect(getTimelineImageAspectRatioCss(image, 'portrait')).toBe('600 / 776');
    expect(getTimelineImageFrameVariant(image)).toBe('portrait');
  });

  it('falls back to design reference ratios when dimensions are missing', () => {
    expect(getTimelineImageAspectRatioCss(undefined, 'unknown')).toBe('399.195 / 255.734');
    expect(getTimelineImageAspectRatioCss(undefined, 'portrait')).toBe('284 / 430.84');
    expect(getTimelineImageAspectRatioCss(undefined, 'landscape')).toBe('399.195 / 255.734');
  });
});

describe('parseTimelineImagePixelDimensions / getTimelineImageFrameVariant', () => {
  it('returns portrait when string height is greater than string width', () => {
    const image = { value: { width: '600', height: '776', src: '/x' } } as ImageField;
    expect(parseTimelineImagePixelDimensions(image)).toEqual({ w: 600, h: 776 });
    expect(getTimelineImageFrameVariant(image)).toBe('portrait');
  });

  it('returns landscape when string width is greater than height', () => {
    const image = { value: { width: '800', height: '600', src: '/x' } } as ImageField;
    expect(getTimelineImageFrameVariant(image)).toBe('landscape');
  });

  it('returns landscape for square dimensions', () => {
    const image = { value: { width: '500', height: '500', src: '/x' } } as ImageField;
    expect(getTimelineImageFrameVariant(image)).toBe('landscape');
  });

  it('returns unknown when dimensions are invalid', () => {
    expect(getTimelineImageFrameVariant({ value: { width: '0', height: '100', src: '/x' } } as ImageField)).toBe(
      'unknown',
    );
    expect(parseTimelineImagePixelDimensions({ value: { src: '/x' } } as ImageField)).toBeNull();
  });
});

describe('floorYearToDecadeStart', () => {
  it('floors years into decade starts', () => {
    expect(floorYearToDecadeStart(1949)).toBe(1940);
    expect(floorYearToDecadeStart(1971)).toBe(1970);
    expect(floorYearToDecadeStart(2000)).toBe(2000);
    expect(floorYearToDecadeStart(2006)).toBe(2000);
  });
});

describe('parseTimelineEventYear', () => {
  it('returns null for missing or invalid years', () => {
    expect(parseTimelineEventYear({ id: '1', fields: {} })).toBeNull();
    expect(parseTimelineEventYear({ id: '1', fields: { Year: { value: '  ' } } })).toBeNull();
    expect(parseTimelineEventYear({ id: '1', fields: { Year: { value: 'abc' } } })).toBeNull();
  });

  it('parses integer year strings', () => {
    expect(parseTimelineEventYear(makeEvent('a', '1971'))).toBe(1971);
  });
});

describe('groupEventsByDecadeInGroup', () => {
  it('returns one band per decade with events in chronological order', () => {
    const events = [
      makeEvent('e71', '1971'),
      makeEvent('e49', '1949'),
      makeEvent('e75', '1975'),
    ];
    const bands = groupEventsByDecadeInGroup(events);
    expect(bands.map((b) => b.decadeStart)).toEqual([1940, 1970]);
    expect(bands[0]?.events.map((e) => e.id)).toEqual(['e49']);
    expect(bands[1]?.events.map((e) => e.id)).toEqual(['e71', 'e75']);
  });
});

describe('buildTimelineDecadeChipPlacements', () => {
  it('shows both decade chips within one group spanning decades', () => {
    const g1 = makeGroup('g1', [makeEvent('e49', '1949'), makeEvent('e71', '1971')]);
    const placements = buildTimelineDecadeChipPlacements([g1]);
    expect(placements[0]?.map((p) => p.showChip)).toEqual([true, true]);
    expect(placements[0]?.[0]?.usesFirstSectionSpacing).toBe(true);
    expect(placements[0]?.[1]?.usesFirstSectionSpacing).toBe(false);
  });

  it('suppresses duplicate decade chip when the next group continues the same decade', () => {
    const g1 = makeGroup('g1', [makeEvent('e71', '1971')]);
    const g2 = makeGroup('g2', [makeEvent('e75', '1975'), makeEvent('e78', '1978')]);
    const placements = buildTimelineDecadeChipPlacements([g1, g2]);
    expect(placements[0]?.map((p) => p.showChip)).toEqual([true]);
    expect(placements[1]?.map((p) => p.showChip)).toEqual([false]);
  });

  it('shows a new chip when the calendar decade advances across groups', () => {
    const g1 = makeGroup('g1', [makeEvent('e71', '1971')]);
    const g2 = makeGroup('g2', [makeEvent('e85', '1985')]);
    const placements = buildTimelineDecadeChipPlacements([g1, g2]);
    expect(placements[0]?.map((p) => p.showChip)).toEqual([true]);
    expect(placements[1]?.map((p) => p.showChip)).toEqual([true]);
  });
});

describe('timelineHasParseableEventYears', () => {
  it('returns false when no events have parseable years', () => {
    const groups = [makeGroup('g1', [makeEvent('e1', ''), makeEvent('e2', 'n/a')])];
    expect(timelineHasParseableEventYears(groups)).toBe(false);
  });

  it('returns true when any event has a parseable year', () => {
    const groups = [makeGroup('g1', [makeEvent('e1', '1949')])];
    expect(timelineHasParseableEventYears(groups)).toBe(true);
  });
});

describe('buildDecadeTimelineBlocks', () => {
  it('returns [] for empty groups', () => {
    expect(buildDecadeTimelineBlocks([])).toEqual([]);
  });

  it('returns [] when no parseable years', () => {
    const groups = [makeGroup('g1', [makeEvent('e1', ''), makeEvent('e2', 'n/a')])];
    expect(buildDecadeTimelineBlocks(groups)).toEqual([]);
  });

  it('includes only decades that have events (skips empty gaps)', () => {
    const groups = [
      makeGroup('g1', [makeEvent('e1', '1949'), makeEvent('e2', '1971')]),
    ];
    const blocks = buildDecadeTimelineBlocks(groups, { currentYear: 2026 });
    expect(blocks.map((b) => b.decadeStart)).toEqual([1940, 1970]);
    expect(blocks.find((b) => b.decadeStart === 1940)?.events.map((e) => e.id)).toEqual(['e1']);
    expect(blocks.find((b) => b.decadeStart === 1970)?.events.map((e) => e.id)).toEqual(['e2']);
  });

  it('uses first group contributing an event in a decade as styleSource', () => {
    const gA = makeGroup('A', [], {});
    const gB = makeGroup('B', [makeEvent('e1', '1985')], {});
    const blocks = buildDecadeTimelineBlocks([gA, gB], { currentYear: 2009 });
    expect(blocks.map((b) => b.decadeStart)).toEqual([1980]);
    expect(blocks[0]?.styleSource.id).toBe('B');
  });

  it('merges invalid-year events into the current decade when it exists, else the last populated decade', () => {
    const groups = [makeGroup('g1', [makeEvent('bad', 'x'), makeEvent('ok', '1992')])];
    const blocks = buildDecadeTimelineBlocks(groups, { currentYear: 1995 });
    expect(blocks.find((b) => b.decadeStart === 1990)?.events.map((e) => e.id).sort()).toEqual([
      'bad',
      'ok',
    ]);
  });

  it('merges invalid-year events into the last populated decade when current decade has no events', () => {
    const groups = [makeGroup('g1', [makeEvent('bad', 'x'), makeEvent('ok', '1992')])];
    const blocks = buildDecadeTimelineBlocks(groups, { currentYear: 2026 });
    expect(blocks.map((b) => b.decadeStart)).toEqual([1990]);
    expect(blocks[0]?.events.map((e) => e.id).sort()).toEqual(['bad', 'ok']);
  });
});

describe('groupTimelineDecadeBlocksByStyleSource', () => {
  it('returns one run per block when each decade uses a different styleSource', () => {
    const g1 = makeGroup('g1', [makeEvent('e1', '1949')]);
    const g2 = makeGroup('g2', [makeEvent('e2', '1971')]);
    const blocks = buildDecadeTimelineBlocks([g1, g2], { currentYear: 2026 });
    expect(blocks.map((b) => b.decadeStart)).toEqual([1940, 1970]);
    const runs = groupTimelineDecadeBlocksByStyleSource(blocks);
    expect(runs.length).toBe(2);
    expect(runs[0]).toHaveLength(1);
    expect(runs[1]).toHaveLength(1);
  });

  it('merges consecutive decades into one run when they share the same styleSource', () => {
    const g1 = makeGroup('g1', [makeEvent('e1', '1949'), makeEvent('e2', '1971')]);
    const blocks = buildDecadeTimelineBlocks([g1], { currentYear: 2026 });
    expect(blocks.map((b) => b.decadeStart)).toEqual([1940, 1970]);
    const runs = groupTimelineDecadeBlocksByStyleSource(blocks);
    expect(runs).toEqual([blocks]);
  });

  it('splits runs when the same group id does not appear consecutively', () => {
    const gA = makeGroup('A', [makeEvent('e80', '1985')]);
    const gB = makeGroup('B', [makeEvent('e90', '1992')]);
    const gC = makeGroup('A', [makeEvent('e00', '2001')]);
    const blocks = buildDecadeTimelineBlocks([gA, gB, gC], { currentYear: 2026 });
    expect(blocks.map((b) => b.styleSource.id)).toEqual(['A', 'B', 'A']);
    const runs = groupTimelineDecadeBlocksByStyleSource(blocks);
    expect(runs.map((r) => r.map((b) => b.styleSource.id))).toEqual([['A'], ['B'], ['A']]);
  });
});

describe('getPriorEventCountByDecadeBlockIndex', () => {
  it('returns cumulative event counts before each decade block', () => {
    const groups = [
      makeGroup('g1', [makeEvent('e1949', '1949')]),
      makeGroup('g2', [makeEvent('e1971', '1971'), makeEvent('e1970', '1970')]),
    ];
    const blocks = buildDecadeTimelineBlocks(groups, { currentYear: 2026 });
    expect(blocks.map((b) => b.decadeStart)).toEqual([1940, 1970]);
    expect(getPriorEventCountByDecadeBlockIndex(blocks, 0)).toBe(0);
    expect(getPriorEventCountByDecadeBlockIndex(blocks, 1)).toBe(1);
  });
});

describe('getLastRenderableTimelineGroupIndex', () => {
  it('returns -1 when no group has events and not editing', () => {
    const groups = [makeGroup('g1', []), makeGroup('g2', [])];
    expect(getLastRenderableTimelineGroupIndex(groups, false)).toBe(-1);
  });

  it('returns the last group index that has events', () => {
    const groups = [
      makeGroup('g1', [makeEvent('e1', '1990')]),
      makeGroup('g2', []),
      makeGroup('g3', [makeEvent('e2', '2000')]),
    ];
    expect(getLastRenderableTimelineGroupIndex(groups, false)).toBe(2);
  });

  it('skips trailing empty groups when not editing', () => {
    const groups = [
      makeGroup('g1', [makeEvent('e1', '1990')]),
      makeGroup('g2', []),
    ];
    expect(getLastRenderableTimelineGroupIndex(groups, false)).toBe(0);
  });

  it('returns last group index when editing even if empty', () => {
    const groups = [makeGroup('g1', [makeEvent('e1', '1990')]), makeGroup('g2', [])];
    expect(getLastRenderableTimelineGroupIndex(groups, true)).toBe(1);
  });
});

describe('timelineEventAnchorId', () => {
  it('strips braces from Sitecore ids for valid HTML ids', () => {
    expect(timelineEventAnchorId('{abc-def}')).toBe('timeline-event-abc-def');
  });
});

describe('buildTimelineNavigatorEntries', () => {
  it('lists events in global chronological order with anchor ids (single group)', () => {
    const groups = [makeGroup('g1', [makeEvent('e2', '1971'), makeEvent('e1', '1949')])];
    const nav = buildTimelineNavigatorEntries(groups, false);
    expect(nav.map((n) => n.yearLabel)).toEqual(['1949', '1971']);
    expect(nav[0]?.anchorId).toBe(timelineEventAnchorId('e1'));
    expect(nav[1]?.anchorId).toBe(timelineEventAnchorId('e2'));
  });

  it('lists events in global chronological order when multiple groups contribute years', () => {
    const groups = [
      makeGroup('g1', [makeEvent('late', '2001'), makeEvent('early', '1990')]),
      makeGroup('g2', [makeEvent('mid', '1995')]),
    ];
    const nav = buildTimelineNavigatorEntries(groups, false);
    expect(nav.map((n) => n.yearLabel)).toEqual(['1990', '1995', '2001']);
  });
});
