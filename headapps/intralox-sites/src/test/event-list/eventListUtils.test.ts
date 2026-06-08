import { describe, it, expect } from 'vitest';

import type { EventListEventItem } from 'components/event-list/EventList.type';
import {
  EVENT_LIST_CARD_SIZE_PARAM,
  eventListItemToLinkField,
  eventListItemHasVisitorContent,
  eventListYearGroupHasVisitorContent,
  eventListHasVisitorContent,
  eventListItemKey,
  extractEventListYearGroups,
  formatEventListFullDateRange,
  formatEventListLocationLine,
  formatEventListShortDateRange,
  readEventListParamValue,
  resolveEventListCardSizeKey,
} from 'components/event-list/eventListUtils';

describe('EventListCardSize param', () => {
  it('uses a dedicated Sitecore param name (not CardSize)', () => {
    expect(EVENT_LIST_CARD_SIZE_PARAM).toBe('EventListCardSize');
  });

  it('reads EventListCardSize from layout param shape', () => {
    const raw = readEventListParamValue(
      { EventListCardSize: { Value: { value: 'base' } } },
      EVENT_LIST_CARD_SIZE_PARAM,
    );
    expect(resolveEventListCardSizeKey(raw)).toBe('base');
  });
});

describe('extractEventListYearGroups', () => {
  it('unwraps { value: [...] }', () => {
    const groups = extractEventListYearGroups({
      value: [{ Year: '2026', EventItems: [{ EventName: 'A' }] }],
    });
    expect(groups).toHaveLength(1);
    expect(groups[0]?.Year).toBe('2026');
  });

  it('accepts a bare array', () => {
    const groups = extractEventListYearGroups([{ Year: '2027', EventItems: [] }]);
    expect(groups).toHaveLength(1);
  });
});

describe('formatEventListShortDateRange', () => {
  it('formats a single day', () => {
    const item: EventListEventItem = {
      EventStartDate: '2026-04-27T00:00:00Z',
      EventEndDate: '2026-04-27T00:00:00Z',
    };
    expect(formatEventListShortDateRange(item)).toBe('Apr 27');
  });

  it('formats same month range', () => {
    const item: EventListEventItem = {
      EventStartDate: '2026-04-27T00:00:00Z',
      EventEndDate: '2026-04-29T00:00:00Z',
    };
    expect(formatEventListShortDateRange(item)).toBe('Apr 27 - 29');
  });

  it('formats cross-month same year', () => {
    const item: EventListEventItem = {
      EventStartDate: '2026-11-29T00:00:00Z',
      EventEndDate: '2026-12-01T00:00:00Z',
    };
    expect(formatEventListShortDateRange(item)).toBe('Nov 29 - Dec 1');
  });
});

describe('formatEventListFullDateRange', () => {
  it('formats same month long form', () => {
    const item: EventListEventItem = {
      EventStartDate: '2026-04-27T00:00:00Z',
      EventEndDate: '2026-04-29T00:00:00Z',
    };
    expect(formatEventListFullDateRange(item)).toBe('April 27 - 29, 2026');
  });
});

describe('formatEventListLocationLine', () => {
  it('joins region and location', () => {
    expect(
      formatEventListLocationLine({
        Region: 'Latin America',
        Location: 'Mexico City, Mexico',
      }),
    ).toBe('Latin America, Mexico City, Mexico');
  });
});

describe('eventListItemToLinkField', () => {
  it('maps object EventUrl', () => {
    const field = eventListItemToLinkField('Summit', {
      url: 'https://example.com/',
      target: '_blank',
    });
    expect(field?.value?.href).toBe('https://example.com/');
    expect(field?.value?.text).toBe('Summit');
    expect(field?.value?.target).toBe('_blank');
  });

  it('parses JSON string EventUrl', () => {
    const json =
      '{"id":"","url":"https://interpom.be/","name":"","displayName":"","target":"_self"}';
    const field = eventListItemToLinkField('Interpom', json);
    expect(field?.value?.href).toContain('interpom.be');
  });
});

describe('formatEventListLocationLine', () => {
  it('returns region only when location is absent', () => {
    expect(formatEventListLocationLine({ Region: 'EMEA' } as EventListEventItem)).toBe('EMEA');
  });

  it('returns location only when region is absent', () => {
    expect(formatEventListLocationLine({ Location: 'Berlin, Germany' } as EventListEventItem)).toBe('Berlin, Germany');
  });

  it('returns empty string when both are absent', () => {
    expect(formatEventListLocationLine({} as EventListEventItem)).toBe('');
  });
});

describe('eventListItemToLinkField', () => {
  it('returns undefined when EventUrl is null', () => {
    expect(eventListItemToLinkField('Event', null)).toBeUndefined();
  });

  it('returns undefined when EventUrl is empty string', () => {
    expect(eventListItemToLinkField('Event', '')).toBeUndefined();
  });

  it('returns undefined for unparseable JSON string', () => {
    expect(eventListItemToLinkField('Event', 'not-json')).toBeUndefined();
  });

  it('returns undefined when parsed URL is empty', () => {
    expect(eventListItemToLinkField('Event', { url: '' })).toBeUndefined();
  });

  it('appends querystring with ? when href has none', () => {
    const field = eventListItemToLinkField('Summit', {
      url: 'https://example.com/event',
      querystring: 'ref=banner',
    });
    expect(field?.value?.href).toBe('https://example.com/event?ref=banner');
  });

  it('appends querystring with & when href already has query params', () => {
    const field = eventListItemToLinkField('Summit', {
      url: 'https://example.com/event?lang=en',
      querystring: 'ref=banner',
    });
    expect(field?.value?.href).toBe('https://example.com/event?lang=en&ref=banner');
  });

  it('uses href as text when event name is empty', () => {
    const field = eventListItemToLinkField('', { url: 'https://example.com' });
    expect(field?.value?.text).toBe('https://example.com');
  });

  it('includes displayName as title when provided', () => {
    const field = eventListItemToLinkField('Summit', {
      url: 'https://example.com',
      displayName: 'Annual Summit',
    });
    expect(field?.value?.title).toBe('Annual Summit');
  });
});

describe('eventListItemHasVisitorContent', () => {
  it('returns false when EventName is missing', () => {
    expect(eventListItemHasVisitorContent({}  as EventListEventItem)).toBe(false);
  });

  it('returns true when EventName is present', () => {
    expect(eventListItemHasVisitorContent({ EventName: 'Summit' } as EventListEventItem)).toBe(true);
  });
});

describe('eventListYearGroupHasVisitorContent', () => {
  it('returns false for group with no items', () => {
    expect(eventListYearGroupHasVisitorContent({ Year: '2026', EventItems: [] })).toBe(false);
  });

  it('returns true for group with at least one named item', () => {
    expect(
      eventListYearGroupHasVisitorContent({
        Year: '2026',
        EventItems: [{ EventName: 'Summit' }],
      }),
    ).toBe(true);
  });
});

describe('eventListHasVisitorContent', () => {
  it('returns false for empty groups array', () => {
    expect(eventListHasVisitorContent([])).toBe(false);
  });

  it('returns false when all groups have no items', () => {
    expect(eventListHasVisitorContent([{ Year: '2026', EventItems: [] }])).toBe(false);
  });

  it('returns true when at least one group has a named item', () => {
    expect(
      eventListHasVisitorContent([
        { Year: '2026', EventItems: [{ EventName: 'Summit' }] },
      ]),
    ).toBe(true);
  });
});

describe('eventListItemKey', () => {
  it('builds a key from year, start date, and event name', () => {
    const item: EventListEventItem = {
      EventName: 'Summit',
      EventStartDate: '2026-04-27',
    };
    expect(eventListItemKey('2026', item, 0)).toBe('2026::2026-04-27::Summit');
  });

  it('falls back to index-based key when all fields are empty', () => {
    const item = {} as EventListEventItem;
    expect(eventListItemKey('', item, 3)).toBe('event-list-row--3');
  });
});
