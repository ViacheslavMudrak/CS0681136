import { describe, it, expect } from 'vitest';

import {
  isLinkGroupRasterIconField,
  linkGroupIconImageDimensions,
  linkGroupItemHasVisitorContent,
  linkGroupRasterIconSrc,
  linkGroupTileAriaLabel,
  linkGroupTileSubtreeProvidesLinkName,
  normalizeLinkGroupColorScheme,
  resolveLinkGroupIconFa,
  resolveLinkGroupIconKey,
  LINK_GROUP_LABELS,
} from 'components/link-group/linkGroupUtils';
import type { LinkGroupItem } from 'components/link-group/LinkGroup.type';

describe('resolveLinkGroupIconKey', () => {
  it('reads nested object Class from Value.value', () => {
    const key = resolveLinkGroupIconKey({
      fields: {
        Value: {
          value: { Class: 'fas fa-heart-pulse' } as unknown as string,
        },
      },
    });
    expect(key).toBe('fas fa-heart-pulse');
  });
});

describe('raster Icon (Image field)', () => {
  it('detects Edge / Layout image shape with src', () => {
    const icon = {
      value: {
        src: 'https://edge.sitecorecloud.io/icons/icon-heartbeat.png',
        alt: '',
        width: '64',
        height: '65',
      },
    };
    expect(isLinkGroupRasterIconField(icon)).toBe(true);
    expect(linkGroupRasterIconSrc(icon)).toContain('icon-heartbeat');
  });

  it('parses width and height strings for NextImage', () => {
    const field = {
      value: { src: 'https://example.com/x.png', width: '128', height: '130' },
    };
    expect(linkGroupIconImageDimensions(field)).toEqual({ width: 128, height: 130 });
  });

  it('treats raster icon as visitor-visible content without title', () => {
    const fields = {
      Icon: { value: { src: 'https://example.com/a.png', width: 64, height: 64 } },
      Link: { value: { href: '' } },
    };
    expect(linkGroupItemHasVisitorContent(fields, false)).toBe(true);
  });
});

describe('resolveLinkGroupIconFa', () => {
  it('normalizes FA5 style class strings from CMS', () => {
    expect(resolveLinkGroupIconFa({ fields: { Value: { value: 'fas fa-stethoscope' } } })).toContain(
      'fa-solid',
    );
    expect(resolveLinkGroupIconFa({ fields: { Value: { value: 'fas fa-stethoscope' } } })).toContain(
      'fa-stethoscope',
    );
  });

  it('maps bare icon names to FA6 solid classes', () => {
    const cls = resolveLinkGroupIconFa({ fields: { Value: { value: 'piggy-bank' } } });
    expect(cls).toMatch(/fa-solid/);
    expect(cls).toContain('fa-piggy-bank');
  });

  it('returns empty string for unsafe input', () => {
    expect(resolveLinkGroupIconFa({ fields: { Value: { value: 'fa-solid fa-x" onmouseover="alert(1)' } } })).toBe(
      '',
    );
  });
});

describe('normalizeLinkGroupColorScheme', () => {
  it('maps UK spelling Grey to gray tokens', () => {
    expect(normalizeLinkGroupColorScheme('Grey')).toBe('gray');
    expect(normalizeLinkGroupColorScheme('GREY')).toBe('gray');
  });

  it('maps Gray to gray', () => {
    expect(normalizeLinkGroupColorScheme('Gray')).toBe('gray');
  });
});

const blankItem = { id: 'x', displayName: undefined, name: undefined } as unknown as LinkGroupItem;

describe('linkGroupTileAriaLabel (lines 300-304)', () => {
  it('returns title when present', () => {
    const fields = { Title: { value: 'My Tile' } };
    expect(linkGroupTileAriaLabel(fields as never, blankItem)).toBe('My Tile');
  });

  it('falls back to link text when title is absent (line 300)', () => {
    const fields = {
      Title: { value: '' },
      Link: { value: { href: '/foo', text: 'Learn more' } },
    };
    expect(linkGroupTileAriaLabel(fields as never, blankItem)).toBe('Learn more');
  });

  it('falls back to displayName when title and link text are absent (line 302)', () => {
    const item = { id: 'x', displayName: 'Tile Display Name' } as unknown as LinkGroupItem;
    const fields = { Title: { value: '' }, Link: { value: { href: '', text: '' } } };
    expect(linkGroupTileAriaLabel(fields as never, item)).toBe('Tile Display Name');
  });

  it('returns fallback constant when all sources are empty (line 304)', () => {
    const fields = { Title: { value: '' }, Link: { value: { href: '', text: '' } } };
    expect(linkGroupTileAriaLabel(fields as never, blankItem)).toBe(LINK_GROUP_LABELS.tileAriaFallback);
  });
});

describe('linkGroupTileSubtreeProvidesLinkName (WCAG 2.5.3)', () => {
  it('returns true when title, link text, or description has plain text', () => {
    expect(linkGroupTileSubtreeProvidesLinkName({ Title: { value: 'Wellness' } })).toBe(true);
    expect(
      linkGroupTileSubtreeProvidesLinkName({
        Link: { value: { href: '/', text: 'Learn more' } },
      }),
    ).toBe(true);
    expect(
      linkGroupTileSubtreeProvidesLinkName({
        Description: { value: '<p>On-site clinic</p>' },
      }),
    ).toBe(true);
  });

  it('returns false when title, link text, and description are empty', () => {
    expect(
      linkGroupTileSubtreeProvidesLinkName({
        Title: { value: '' },
        Link: { value: { href: '/', text: '' } },
        Description: { value: '' },
      }),
    ).toBe(false);
  });
});

describe('linkGroupItemHasVisitorContent edge cases', () => {
  it('returns isEditing value when fields is undefined', () => {
    expect(linkGroupItemHasVisitorContent(undefined, false)).toBe(false);
    expect(linkGroupItemHasVisitorContent(undefined, true)).toBe(true);
  });

  it('returns true in editing mode regardless of content', () => {
    expect(linkGroupItemHasVisitorContent({} as never, true)).toBe(true);
  });

  it('returns true when Link has a valid href (line 261 branch)', () => {
    const fields = {
      Title: { value: '' },
      Link: { value: { href: '/some/path' } },
    };
    expect(linkGroupItemHasVisitorContent(fields as never, false)).toBe(true);
  });

  it('returns false when no content is present', () => {
    expect(linkGroupItemHasVisitorContent({} as never, false)).toBe(false);
  });
});
