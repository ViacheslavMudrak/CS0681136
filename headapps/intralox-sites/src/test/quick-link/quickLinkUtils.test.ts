import { describe, it, expect } from 'vitest';

import {
  quickLinkHasIconVisual,
  resolveQuickLinkCardType,
  resolveQuickLinkIconKey,
} from 'components/quick-link/quickLinkUtils';
import type { QuickLinkFields } from 'components/quick-link/QuickLink.type';

describe('quickLinkHasIconVisual', () => {
  it('returns false when fields is undefined (line 374)', () => {
    expect(quickLinkHasIconVisual(undefined, undefined, false)).toBe(false);
  });

  it('returns false when no Image and no valid icon key (line 378)', () => {
    const fields = {} as QuickLinkFields;
    expect(quickLinkHasIconVisual(fields, undefined, false)).toBe(false);
  });

  it('returns false when icon key exists but is not a valid FA class (line 378 false branch)', () => {
    const fields = {
      Icon: { value: 'not-a-fa-class' },
    } as unknown as QuickLinkFields;
    expect(quickLinkHasIconVisual(fields, undefined, false)).toBe(false);
  });
});

describe('resolveQuickLinkIconKey edge cases', () => {
  it('returns undefined when fields is empty', () => {
    const result = resolveQuickLinkIconKey({} as QuickLinkFields, undefined);
    expect(result).toBeUndefined();
  });

  it('returns key from Icon.fields.Value.value when set', () => {
    const fields = {
      Icon: { fields: { Value: { value: 'fa-solid fa-star' } } },
    } as unknown as QuickLinkFields;
    const result = resolveQuickLinkIconKey(fields, undefined);
    expect(result).toBe('fa-solid fa-star');
  });

  it('returns key from Icon.displayName when fields.Value is not set', () => {
    const fields = {
      Icon: { displayName: 'fa-solid fa-circle' },
    } as unknown as QuickLinkFields;
    const result = resolveQuickLinkIconKey(fields, undefined);
    expect(result).toBe('fa-solid fa-circle');
  });

  it('maps Sitecore quick-link icon item Image to award for live ribbon parity', () => {
    const fields = {
      Icon: {
        displayName: 'Image',
        fields: { Value: { value: 'Image' } },
      },
    } as unknown as QuickLinkFields;
    expect(resolveQuickLinkIconKey(fields, undefined)).toBe('award');
  });
});

describe('resolveQuickLinkCardType — Compact alias', () => {
  it('maps "Compact" to base card type', () => {
    const result = resolveQuickLinkCardType({ CardType: { Value: { value: 'Compact' } } });
    expect(result).toBe('base');
  });

  it('maps "base" to base card type', () => {
    const result = resolveQuickLinkCardType({ CardType: { Value: { value: 'base' } } });
    expect(result).toBe('base');
  });

  it('maps "card" to card type', () => {
    const result = resolveQuickLinkCardType({ CardType: { Value: { value: 'card' } } });
    expect(result).toBe('card');
  });

  it('defaults to base when param is missing', () => {
    expect(resolveQuickLinkCardType(undefined)).toBe('base');
    expect(resolveQuickLinkCardType({})).toBe('base');
  });
});
