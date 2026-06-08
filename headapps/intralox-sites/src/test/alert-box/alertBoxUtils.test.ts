import { describe, expect, it } from 'vitest';

import {
  ALERT_BOX_ARIA_FALLBACK,
  buildAlertAriaLabel,
  hasUsableLinkHref,
} from 'components/alert-box/alertBoxUtils';

describe('alertBoxUtils', () => {
  describe('hasUsableLinkHref', () => {
    it('returns false for null, undefined, and empty strings', () => {
      expect(hasUsableLinkHref(null)).toBe(false);
      expect(hasUsableLinkHref(undefined)).toBe(false);
      expect(hasUsableLinkHref('')).toBe(false);
      expect(hasUsableLinkHref('   ')).toBe(false);
    });

    it('returns true when href has non-whitespace content', () => {
      expect(hasUsableLinkHref('/alerts')).toBe(true);
      expect(hasUsableLinkHref('  https://example.com  ')).toBe(true);
    });
  });

  describe('buildAlertAriaLabel', () => {
    it('returns fallback when no parts are usable', () => {
      expect(buildAlertAriaLabel({}, ALERT_BOX_ARIA_FALLBACK)).toBe(ALERT_BOX_ARIA_FALLBACK);
      expect(
        buildAlertAriaLabel({ text: '   ', linkText: '' }, ALERT_BOX_ARIA_FALLBACK),
      ).toBe(ALERT_BOX_ARIA_FALLBACK);
    });

    it('joins non-empty segments with ". "', () => {
      expect(
        buildAlertAriaLabel(
          {
            text: 'Maintenance tonight',
            linkText: 'Details',
            itemDisplayName: 'Site Alert',
          },
          ALERT_BOX_ARIA_FALLBACK,
        ),
      ).toBe('Maintenance tonight. Details. Site Alert');
    });
  });
});
