import { describe, expect, it } from 'vitest';

import {
  buildLocationCardAddressPlainText,
  buildLocationListIntroGroups,
  canonicalLocationSectionKey,
  formatLocationNavTitleForDisplay,
  formatLocationNavTitleForIntroNav,
  groupLocationListItemsBySection,
  locationListCardAnchorId,
  locationListNavTitleToAnchorSlug,
  locationListIntroLinkLabel,
  readLocationListColumnCount,
  readLocationListOrderNumber,
  resolveLocationTypeLabel,
  type LocationListChildItem,
} from 'components/location-list/locationListUtils';
function item(
  id: string,
  overrides: Partial<LocationListChildItem['fields']> & { order?: number },
): LocationListChildItem {
  const { order, ...fields } = overrides;
  return {
    id,
    displayName: id,
    fields: {
      ...fields,
      Order: order != null ? { value: order } : undefined,
    },
  };
}

describe('locationListUtils', () => {
  it('buildLocationCardAddressPlainText joins street, mid line with spaces, and country', () => {
    expect(
      buildLocationCardAddressPlainText({
        StreetAddress: { value: '200 Corporate Blvd' },
        Locality: { value: 'New Orleans' },
        Region: { value: 'LA' },
        PostalCode: { value: '70123' },
        Country: { value: 'USA' },
      }),
    ).toBe('200 Corporate Blvd\nNew Orleans LA 70123\nUSA');
  });

  it('buildLocationCardAddressPlainText omits empty parts and handles locality-only or region-only', () => {
    expect(buildLocationCardAddressPlainText({})).toBe('');
    expect(buildLocationCardAddressPlainText({ Locality: { value: 'Solo City' } })).toBe('Solo City');
    expect(buildLocationCardAddressPlainText({ Region: { value: 'TX' }, PostalCode: { value: '79999' } })).toBe(
      'TX 79999',
    );
    expect(buildLocationCardAddressPlainText({ Locality: { value: 'A' }, PostalCode: { value: '1' } })).toBe('A 1');
  });

  it('resolveLocationTypeLabel prefers Value field', () => {
    expect(
      resolveLocationTypeLabel({
        name: 'United States',
        fields: { Value: { value: 'United States' } },
      }),
    ).toBe('United States');
  });

  it('canonicalLocationSectionKey maps labels', () => {
    expect(canonicalLocationSectionKey('Headquarters')).toBe('Headquarters');
    expect(canonicalLocationSectionKey('United States')).toBe('United States');
    expect(canonicalLocationSectionKey('Global Assembly Centers')).toBe('Global Assembly Centers');
    expect(canonicalLocationSectionKey('Unknown')).toBe('other');
  });

  it('groups and sorts by Order within section', () => {
    const locations: LocationListChildItem[] = [
      item('a', {
        LocationType: { fields: { Value: { value: 'Headquarters' } } },
        NavTitle: { value: 'z' },
        CompanyName: { value: 'Second' },
        order: 2,
      }),
      item('b', {
        LocationType: { fields: { Value: { value: 'Headquarters' } } },
        NavTitle: { value: 'a' },
        CompanyName: { value: 'First' },
        order: 1,
      }),
    ];
    const grouped = groupLocationListItemsBySection(locations, false);
    const hq = grouped.get('Headquarters') ?? [];
    expect(hq.map((x) => x.id)).toEqual(['b', 'a']);
  });

  it('locationListIntroLinkLabel uses NavTitle for all sections', () => {
    const hq: LocationListChildItem = {
      id: '1',
      displayName: 'x',
      fields: {
        NavTitle: { value: 'Americas (New Orleans) ' },
        Country: { value: 'USA' },
      },
    };
    expect(locationListIntroLinkLabel('Headquarters', hq)).toBe('Americas (New Orleans)');

    const us: LocationListChildItem = {
      id: '2',
      displayName: 'y',
      fields: {
        NavTitle: { value: 'Grand Rapids, MI' },
        Region: { value: 'MI' },
      },
    };
    expect(locationListIntroLinkLabel('United States', us)).toBe('Grand Rapids, MI');

    const gac: LocationListChildItem = {
      id: '3',
      displayName: 'z',
      fields: {
        NavTitle: { value: 'brazil' },
      },
    };
    expect(locationListIntroLinkLabel('Global Assembly Centers', gac)).toBe('Brazil');
  });

  it('buildLocationListIntroGroups preserves section order', () => {
    const locations: LocationListChildItem[] = [
      item('g', {
        LocationType: { fields: { Value: { value: 'Global Assembly Centers' } } },
        NavTitle: { value: 'brazil' },
        order: 1,
      }),
      item('h', {
        LocationType: { fields: { Value: { value: 'Headquarters' } } },
        NavTitle: { value: 'new-orleans' },
        order: 1,
      }),
      item('u', {
        LocationType: { fields: { Value: { value: 'United States' } } },
        NavTitle: { value: 'baltimore' },
        order: 1,
      }),
    ];
    const grouped = groupLocationListItemsBySection(locations, false);
    const intro = buildLocationListIntroGroups(grouped);
    expect(intro.map((g) => g.sectionKey)).toEqual(['Headquarters', 'United States', 'Global Assembly Centers']);
  });

  it('formatLocationNavTitleForDisplay title-cases slug', () => {
    expect(formatLocationNavTitleForDisplay('grand-rapids')).toBe('Grand Rapids');
  });

  it('formatLocationNavTitleForIntroNav keeps author-style NavTitle verbatim', () => {
    expect(formatLocationNavTitleForIntroNav('Americas (New Orleans)')).toBe('Americas (New Orleans)');
    expect(formatLocationNavTitleForIntroNav('Grand Rapids, MI')).toBe('Grand Rapids, MI');
    expect(formatLocationNavTitleForIntroNav('Europe (Amsterdam)')).toBe('Europe (Amsterdam)');
  });

  it('formatLocationNavTitleForIntroNav title-cases compact NavTitle without author punctuation', () => {
    expect(formatLocationNavTitleForIntroNav('grand-rapids')).toBe('Grand Rapids');
    expect(formatLocationNavTitleForIntroNav('new-orleans')).toBe('New Orleans');
    expect(formatLocationNavTitleForIntroNav('brazil')).toBe('Brazil');
  });

  it('readLocationListOrderNumber reads flat and nested Value shapes', () => {
    expect(readLocationListOrderNumber({ value: 3 })).toBe(3);
    expect(readLocationListOrderNumber({ Value: { value: 2 } } as never)).toBe(2);
    expect(readLocationListOrderNumber(undefined)).toBeNull();
  });

  it('groups by nested Order field when flat value is absent', () => {
    const locations: LocationListChildItem[] = [
      {
        id: 'late',
        displayName: 'z',
        fields: {
          LocationType: { fields: { Value: { value: 'Headquarters' } } },
          NavTitle: { value: 'Late' },
          Order: { Value: { value: 20 } } as never,
        },
      },
      {
        id: 'early',
        displayName: 'a',
        fields: {
          LocationType: { fields: { Value: { value: 'Headquarters' } } },
          NavTitle: { value: 'Early' },
          Order: { Value: { value: 10 } } as never,
        },
      },
    ];
    const grouped = groupLocationListItemsBySection(locations, false);
    const hq = grouped.get('Headquarters') ?? [];
    expect(hq.map((x) => x.id)).toEqual(['early', 'late']);
  });

  it('locationListNavTitleToAnchorSlug preserves compact NavTitle slugs', () => {
    expect(locationListNavTitleToAnchorSlug('new-orleans')).toBe('new-orleans');
    expect(locationListNavTitleToAnchorSlug('brazil')).toBe('brazil');
  });

  it('locationListNavTitleToAnchorSlug kebab-cases author punctuation', () => {
    expect(locationListNavTitleToAnchorSlug('Grand Rapids, MI')).toBe('grand-rapids-mi');
    expect(locationListNavTitleToAnchorSlug('Americas (New Orleans)')).toBe('americas-new-orleans');
  });

  it('locationListCardAnchorId prefers NavValue for intro and card anchors', () => {
    expect(
      locationListCardAnchorId({
        id: '42b8a54b-c90d-426d-aa35-387adc7ffa95',
        fields: {
          NavTitle: { value: 'Americas (New Orleans) ' },
          NavValue: { value: 'new-orleans' },
        },
      }),
    ).toBe('new-orleans');
  });

  it('locationListCardAnchorId falls back to NavTitle slug when NavValue is empty', () => {
    expect(
      locationListCardAnchorId({
        id: '42b8a54b-c90d-426d-aa35-387adc7ffa95',
        fields: { NavTitle: { value: 'new-orleans' } },
      }),
    ).toBe('new-orleans');
  });

  it('locationListCardAnchorId falls back to location-guid when NavValue and NavTitle are empty', () => {
    expect(
      locationListCardAnchorId({
        id: 'ABC',
        fields: {},
      }),
    ).toBe('location-abc');
  });

  it('buildLocationListIntroGroups uses NavValue anchor slugs', () => {
    const locations: LocationListChildItem[] = [
      item('42b8a54b-c90d-426d-aa35-387adc7ffa95', {
        LocationType: { fields: { Value: { value: 'Headquarters' } } },
        NavTitle: { value: 'Americas (New Orleans) ' },
        NavValue: { value: 'new-orleans' },
        Country: { value: 'USA' },
        order: 1,
      }),
    ];
    const grouped = groupLocationListItemsBySection(locations, false);
    const intro = buildLocationListIntroGroups(grouped);
    expect(intro[0]?.links[0]?.anchorId).toBe('new-orleans');
    expect(intro[0]?.links[0]?.label).toBe('Americas (New Orleans)');
  });

  it('readLocationListColumnCount clamps and defaults', () => {
    expect(readLocationListColumnCount({ Columns: '2' } as never)).toBe(2);
    expect(readLocationListColumnCount({ NumberOfColumns: { Value: { value: '4' } } } as never)).toBe(4);
    expect(readLocationListColumnCount({ Columns: '99' } as never)).toBe(3);
    expect(readLocationListColumnCount({} as never)).toBe(3);
  });

  it('location list card scroll margin uses fixed header offset token', () => {
    expect('scroll-mt-[var(--headerTop)]').toContain('--headerTop');
  });
});
