import { describe, expect, it, vi, afterEach } from 'vitest';

import {
  normalizeFloatingIconKey,
  resolveFloatingActionIconFa,
  hasUsableLinkHref,
  buildFloatingActionAriaLabel,
  getFloatingIconLabel,
  resolveFloatingFabIcon,
  getFloatingActionViewportInsetBottomPx,
  FLOATING_ACTION_ARIA_FALLBACK,
  FLOATING_ACTION_VIEWPORT_ANCHOR_Z_INDEX,
  FLOATING_ACTION_VIEWPORT_INSET_PX,
  FLOATING_ACTION_VIEWPORT_INSET_MOBILE_PX,
} from 'components/floating-action-button/floatingActionButtonUtils';
import type { FloatingButtonIconReference } from 'components/floating-action-button/FloatingActionButton.type';

describe('normalizeFloatingIconKey', () => {
  it('returns empty string for null', () => {
    expect(normalizeFloatingIconKey(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(normalizeFloatingIconKey(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(normalizeFloatingIconKey('')).toBe('');
  });

  it('trims leading and trailing whitespace', () => {
    expect(normalizeFloatingIconKey('  Phone  ')).toBe('phone');
  });

  it('converts to lowercase', () => {
    expect(normalizeFloatingIconKey('MAIL')).toBe('mail');
  });

  it('collapses multiple spaces into a single space', () => {
    expect(normalizeFloatingIconKey('message   square')).toBe('message square');
  });

  it('returns empty string for non-string values', () => {
    expect(normalizeFloatingIconKey(123 as unknown as string)).toBe('');
  });
});

describe('resolveFloatingActionIconFa', () => {
  it('returns null for null input', () => {
    expect(resolveFloatingActionIconFa(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(resolveFloatingActionIconFa(undefined)).toBeNull();
  });

  it('returns null for empty string input', () => {
    expect(resolveFloatingActionIconFa('')).toBeNull();
  });

  it('returns fa-solid fa-phone-volume for "phone"', () => {
    expect(resolveFloatingActionIconFa('phone')).toBe('fa-solid fa-phone-volume');
  });

  it('returns fa-solid fa-phone-volume for "call" alias', () => {
    expect(resolveFloatingActionIconFa('call')).toBe('fa-solid fa-phone-volume');
  });

  it('returns fa-solid fa-phone-volume for icon-call droplink name', () => {
    expect(resolveFloatingActionIconFa('icon-call')).toBe('fa-solid fa-phone-volume');
  });

  it('returns fa-solid fa-envelope for "mail"', () => {
    expect(resolveFloatingActionIconFa('mail')).toContain('fa-envelope');
  });

  it('returns fa-solid fa-envelope for "email"', () => {
    expect(resolveFloatingActionIconFa('email')).toContain('fa-envelope');
  });

  it('returns fa-solid fa-envelope for strings ending with " mail"', () => {
    expect(resolveFloatingActionIconFa('Send mail')).toContain('fa-envelope');
  });

  it('returns fa-solid fa-envelope for strings starting with "mail "', () => {
    expect(resolveFloatingActionIconFa('mail notification')).toContain('fa-envelope');
  });

  it('returns fa-solid fa-envelope for strings containing "envelope"', () => {
    expect(resolveFloatingActionIconFa('Open envelope')).toContain('fa-envelope');
  });

  it('returns fa-solid fa-message for "message"', () => {
    expect(resolveFloatingActionIconFa('message')).toContain('fa-message');
  });

  it('returns fa-solid fa-message for "message square"', () => {
    expect(resolveFloatingActionIconFa('message square')).toContain('fa-message');
  });

  it('returns fa-solid fa-message for strings starting with "message "', () => {
    expect(resolveFloatingActionIconFa('message us')).toContain('fa-message');
  });

  it('returns fa-solid fa-message for strings containing "comment"', () => {
    expect(resolveFloatingActionIconFa('live comment')).toContain('fa-message');
  });

  it('falls back to cmsIconToFontAwesome for other CMS slugs', () => {
    expect(resolveFloatingActionIconFa('arrow-right')).toContain('fa-arrow-right');
  });

  it('is case-insensitive via normalizeFloatingIconKey', () => {
    expect(resolveFloatingActionIconFa('PHONE')).toBe('fa-solid fa-phone-volume');
    expect(resolveFloatingActionIconFa('EMAIL')).toContain('fa-envelope');
  });
});

describe('hasUsableLinkHref', () => {
  it('returns false for null', () => {
    expect(hasUsableLinkHref(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(hasUsableLinkHref(undefined)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(hasUsableLinkHref('')).toBe(false);
  });

  it('returns false for whitespace-only string', () => {
    expect(hasUsableLinkHref('   ')).toBe(false);
  });

  it('returns true for a valid href', () => {
    expect(hasUsableLinkHref('/contact')).toBe(true);
  });

  it('returns true for an external URL', () => {
    expect(hasUsableLinkHref('https://example.com')).toBe(true);
  });
});

describe('buildFloatingActionAriaLabel', () => {
  it('returns fallbackLabel when all parts are empty', () => {
    expect(buildFloatingActionAriaLabel({}, 'Action')).toBe('Action');
  });

  it('returns FLOATING_ACTION_ARIA_FALLBACK when fallback is empty and all parts are empty', () => {
    expect(buildFloatingActionAriaLabel({}, '')).toBe('Action');
  });

  it('uses heading alone when only heading is set', () => {
    expect(buildFloatingActionAriaLabel({ heading: 'Need help?' }, 'Action')).toBe('Need help?');
  });

  it('joins heading and text with ". "', () => {
    const result = buildFloatingActionAriaLabel(
      { heading: 'Need help?', text: 'Contact us' },
      'Action',
    );
    expect(result).toBe('Need help?. Contact us');
  });

  it('includes linkText in the joined string', () => {
    const result = buildFloatingActionAriaLabel(
      { heading: 'H', linkText: 'Go' },
      'Action',
    );
    expect(result).toBe('H. Go');
  });

  it('includes linkTitle in the joined string', () => {
    const result = buildFloatingActionAriaLabel(
      { heading: 'H', linkTitle: 'Submit form' },
      'Action',
    );
    expect(result).toBe('H. Submit form');
  });

  it('falls back to itemDisplayName when primary parts are all empty', () => {
    const result = buildFloatingActionAriaLabel(
      { itemDisplayName: 'FAB Item' },
      'Action',
    );
    expect(result).toBe('FAB Item');
  });

  it('falls back to itemName when displayName is also empty', () => {
    const result = buildFloatingActionAriaLabel(
      { itemName: 'fab-item' },
      'Action',
    );
    expect(result).toBe('fab-item');
  });

  it('falls back to iconLabel as last resort before fallback', () => {
    const result = buildFloatingActionAriaLabel(
      { iconLabel: 'Phone icon' },
      'Fallback',
    );
    expect(result).toBe('Phone icon');
  });

  it('skips whitespace-only parts', () => {
    const result = buildFloatingActionAriaLabel(
      { heading: '   ', text: 'Valid text' },
      'Action',
    );
    expect(result).toBe('Valid text');
  });

  it('trims whitespace from each part', () => {
    const result = buildFloatingActionAriaLabel(
      { heading: '  Help  ', text: '  Us  ' },
      'Action',
    );
    expect(result).toBe('Help. Us');
  });
});

describe('getFloatingIconLabel', () => {
  it('returns undefined when iconRef is undefined', () => {
    expect(getFloatingIconLabel(undefined)).toBeUndefined();
  });

  it('returns undefined when fields are absent', () => {
    const ref: FloatingButtonIconReference = {};
    expect(getFloatingIconLabel(ref)).toBeUndefined();
  });

  it('returns the Value text when it is not a Font Awesome class string', () => {
    const ref: FloatingButtonIconReference = {
      fields: { Value: { value: 'Phone' } },
    };
    expect(getFloatingIconLabel(ref)).toBe('Phone');
  });

  it('falls back to item name when Value is a FA class string', () => {
    const ref: FloatingButtonIconReference = {
      name: 'phone-item',
      fields: { Value: { value: 'fa-solid fa-phone' } },
    };
    expect(getFloatingIconLabel(ref)).toBe('phone-item');
  });

  it('falls back to displayName when name is missing and Value is an FA class', () => {
    const ref: FloatingButtonIconReference = {
      displayName: 'Phone Button',
      fields: { Value: { value: 'fas fa-phone' } },
    };
    expect(getFloatingIconLabel(ref)).toBe('Phone Button');
  });

  it('returns undefined when Value is an FA class and no name or displayName', () => {
    const ref: FloatingButtonIconReference = {
      fields: { Value: { value: 'fas fa-phone' } },
    };
    expect(getFloatingIconLabel(ref)).toBeUndefined();
  });

  it('returns the item name when Value field is absent', () => {
    const ref: FloatingButtonIconReference = {
      name: 'contact-btn',
      fields: {},
    };
    expect(getFloatingIconLabel(ref)).toBe('contact-btn');
  });
});

describe('resolveFloatingFabIcon', () => {
  it('returns null when iconRef is undefined', () => {
    expect(resolveFloatingFabIcon(undefined)).toBeNull();
  });

  it('returns null when fields and name/displayName are all absent', () => {
    const ref: FloatingButtonIconReference = {};
    expect(resolveFloatingFabIcon(ref)).toBeNull();
  });

  it('resolves to fa-class kind when iconRef name matches a known icon', () => {
    const ref: FloatingButtonIconReference = { name: 'phone' };
    const result = resolveFloatingFabIcon(ref);
    expect(result?.kind).toBe('fa-class');
    expect(result?.className).toBe('fa-solid fa-phone-volume');
  });

  it('resolves to fa-class kind when iconRef displayName matches a known icon', () => {
    const ref: FloatingButtonIconReference = { displayName: 'mail' };
    const result = resolveFloatingFabIcon(ref);
    expect(result?.kind).toBe('fa-class');
    expect(result?.className).toContain('fa-envelope');
  });

  it('resolves to fa-class kind from IconCssClass field', () => {
    const ref: FloatingButtonIconReference = {
      fields: { IconCssClass: { value: 'fa-solid fa-phone' } },
    };
    const result = resolveFloatingFabIcon(ref);
    expect(result?.kind).toBe('fa-class');
  });

  it('resolves CssClass from jsonValue (Edge / GraphQL shape)', () => {
    const ref: FloatingButtonIconReference = {
      fields: {
        CssClass: { jsonValue: { value: 'fa-solid fa-envelope' } },
      },
    };
    const result = resolveFloatingFabIcon(ref);
    expect(result?.className).toContain('fa-envelope');
  });

  it('resolves droplink item name icon-call when CssClass is empty', () => {
    const ref: FloatingButtonIconReference = {
      name: 'icon-call',
      fields: {},
    };
    const result = resolveFloatingFabIcon(ref);
    expect(result?.className).toBe('fa-solid fa-phone-volume');
  });

  it('resolves icon slug from Sitecore item path when name is missing', () => {
    const ref: FloatingButtonIconReference = {
      url: '/sitecore/content/Data/Icons/icon-mail',
      fields: {},
    };
    const result = resolveFloatingFabIcon(ref);
    expect(result?.className).toContain('fa-envelope');
  });

  it('resolves FAB icon from unexpanded droplink GUID (layout service)', () => {
    const ref = {
      value: '{4E8FAD49-EA87-464F-AC7D-54E924EF187D}',
    } as FloatingButtonIconReference;
    const result = resolveFloatingFabIcon(ref);
    expect(result?.className).toBe('fa-solid fa-phone-volume');
  });

  it('unwraps Icon jsonValue wrapper from layout route payload', () => {
    const ref = {
      jsonValue: {
        name: 'icon-message-square',
        fields: {
          CssClass: { jsonValue: { value: 'fa-solid fa-comment-dots' } },
        },
      },
    } as unknown as FloatingButtonIconReference;
    const result = resolveFloatingFabIcon(ref);
    expect(result?.className).toContain('fa-comment-dots');
  });

  it('resolves to fa-class kind from CssClass field when IconCssClass is absent', () => {
    const ref: FloatingButtonIconReference = {
      fields: { CssClass: { value: 'fas fa-envelope' } },
    };
    const result = resolveFloatingFabIcon(ref);
    expect(result?.kind).toBe('fa-class');
  });

  it('resolves to fa-class kind from Value field containing a known label', () => {
    const ref: FloatingButtonIconReference = {
      fields: { Value: { value: 'phone' } },
    };
    const result = resolveFloatingFabIcon(ref);
    expect(result?.kind).toBe('fa-class');
    expect(result?.className).toBe('fa-solid fa-phone-volume');
  });

  it('coerces fa-solid fa-phone CssClass to fa-phone-volume for FAB', () => {
    const ref: FloatingButtonIconReference = {
      fields: { CssClass: { value: 'fa-solid fa-phone' } },
    };
    const result = resolveFloatingFabIcon(ref);
    expect(result?.className).toBe('fa-solid fa-phone-volume');
  });

  it('resolves fa-phone-volume from expanded droplink Value (Foodsafe FAB)', () => {
    const ref: FloatingButtonIconReference = {
      id: '4e8fad49-ea87-464f-ac7d-54e924ef187d',
      name: 'Phone',
      displayName: 'Phone',
      fields: { Value: { value: 'fa-solid fa-phone-volume' } },
    };
    const result = resolveFloatingFabIcon(ref);
    expect(result?.className).toBe('fa-solid fa-phone-volume');
  });
});

describe('getFloatingActionViewportInsetBottomPx', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns FLOATING_ACTION_VIEWPORT_INSET_PX on the server (no window)', () => {
    vi.stubGlobal('window', undefined);
    expect(getFloatingActionViewportInsetBottomPx()).toBe(FLOATING_ACTION_VIEWPORT_INSET_PX);
  });

  it('returns mobile inset when innerWidth is below 600', () => {
    vi.stubGlobal('window', { innerWidth: 375 });
    expect(getFloatingActionViewportInsetBottomPx()).toBe(
      FLOATING_ACTION_VIEWPORT_INSET_MOBILE_PX,
    );
  });

  it('returns desktop inset when innerWidth is 600 or above', () => {
    vi.stubGlobal('window', { innerWidth: 1024 });
    expect(getFloatingActionViewportInsetBottomPx()).toBe(FLOATING_ACTION_VIEWPORT_INSET_PX);
  });

  it('returns desktop inset when innerWidth is exactly 600', () => {
    vi.stubGlobal('window', { innerWidth: 600 });
    expect(getFloatingActionViewportInsetBottomPx()).toBe(FLOATING_ACTION_VIEWPORT_INSET_PX);
  });
});

describe('FLOATING_ACTION_ARIA_FALLBACK', () => {
  it('is a non-empty string', () => {
    expect(typeof FLOATING_ACTION_ARIA_FALLBACK).toBe('string');
    expect(FLOATING_ACTION_ARIA_FALLBACK.length).toBeGreaterThan(0);
  });
});

describe('FAB layout constants', () => {
  it('stacks viewport anchor above header chrome and cookie banner', () => {
    expect(FLOATING_ACTION_VIEWPORT_ANCHOR_Z_INDEX).toBeGreaterThan(1000);
    expect(FLOATING_ACTION_VIEWPORT_ANCHOR_Z_INDEX).toBeGreaterThan(50);
  });
});
