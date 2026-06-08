import { describe, expect, it } from 'vitest';

import {
  readGlobalLocationsBackgroundColorParam,
  readGlobalLocationsSectionSurface,
} from 'components/global-locations/globalLocationsUtils';

describe('readGlobalLocationsBackgroundColorParam', () => {
  it('reads BackgroundColor.Value.value (Sitecore droplist shape)', () => {
    expect(
      readGlobalLocationsBackgroundColorParam({
        BackgroundColor: { Value: { value: 'Light Blue' } },
      }),
    ).toBe('Light Blue');
  });

  it('reads droplink item fields.Value.value', () => {
    expect(
      readGlobalLocationsBackgroundColorParam({
        BackgroundColor: {
          id: 'abc',
          fields: { Value: { value: 'Gray' } },
        },
      }),
    ).toBe('Gray');
  });

  it('prefers BackgroundColor over backgroundColor when both set', () => {
    expect(
      readGlobalLocationsBackgroundColorParam({
        BackgroundColor: { Value: { value: 'White' } },
        backgroundColor: { Value: { value: 'Gray' } },
      }),
    ).toBe('White');
  });
});

describe('readGlobalLocationsSectionSurface', () => {
  it('maps White to surface', () => {
    expect(readGlobalLocationsSectionSurface(undefined, 'White')).toEqual({
      surface: 'surface',
      isDarkSection: false,
    });
  });

  it('maps Gray to surface-muted', () => {
    expect(readGlobalLocationsSectionSurface(undefined, 'Gray')).toEqual({
      surface: 'surface-muted',
      isDarkSection: false,
    });
    expect(readGlobalLocationsSectionSurface(undefined, 'Grey')).toEqual({
      surface: 'surface-muted',
      isDarkSection: false,
    });
  });

  it('maps Light Blue to accent-teal (same token as Text and Aside)', () => {
    expect(readGlobalLocationsSectionSurface(undefined, 'Light Blue')).toEqual({
      surface: 'accent-teal',
      isDarkSection: false,
    });
    expect(readGlobalLocationsSectionSurface(undefined, 'lightblue')).toEqual({
      surface: 'accent-teal',
      isDarkSection: false,
    });
  });

  it('falls back to ColorScheme when BackgroundColor is absent', () => {
    expect(readGlobalLocationsSectionSurface('gray', undefined)).toEqual({
      surface: 'surface-muted',
      isDarkSection: false,
    });
    expect(readGlobalLocationsSectionSurface('dark', undefined)).toEqual({
      surface: 'surface-inverse',
      isDarkSection: true,
    });
  });
});
