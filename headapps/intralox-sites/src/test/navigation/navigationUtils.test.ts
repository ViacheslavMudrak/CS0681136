import { describe, expect, it, vi, afterEach } from 'vitest';

import {
  firstNonEmptyTextField,
  filterMainNavItemsForHeaderDisplay,
  getFieldsTextByKey,
  getTextFieldString,
  getTopNavLinksFromTopBar,
  getLanguagesFromTopBar,
  getTopNavLinkFieldFromItem,
  isNavItemHiddenFromNav,
  itemHasChildren,
  normalizeAppPathname,
  getLogoHomeHref,
  isLogoOnHomePage,
  getResolvedMegaMenuPromoLinkKey,
  resolveChildLinksForHeaderDisplay,
  resolveMegaMenuPromoLink,
} from 'components/navigation/navigationUtils';
import type { MainNavItem, NavChildItem, TopBarFields } from 'components/navigation/Navigation.type';

describe('getTextFieldString', () => {
  it('returns empty string for null/undefined', () => {
    expect(getTextFieldString(null)).toBe('');
    expect(getTextFieldString(undefined)).toBe('');
  });

  it('returns raw string as-is', () => {
    expect(getTextFieldString('fa-solid fa-magnifying-glass')).toBe(
      'fa-solid fa-magnifying-glass',
    );
  });

  it('reads Field.value wrapper', () => {
    expect(getTextFieldString({ value: 'fa-solid fa-globe' })).toBe('fa-solid fa-globe');
  });

  it('reads jsonValue.value (GraphQL shape)', () => {
    expect(
      getTextFieldString({ jsonValue: { value: 'fa-solid fa-phone' } }),
    ).toBe('fa-solid fa-phone');
  });

  it('returns empty for non-string value shapes', () => {
    expect(getTextFieldString({ value: 1 })).toBe('');
    expect(getTextFieldString({})).toBe('');
  });
});

describe('firstNonEmptyTextField', () => {
  it('returns empty when no candidates', () => {
    expect(firstNonEmptyTextField()).toBe('');
  });

  it('returns first trimmed non-empty string', () => {
    expect(firstNonEmptyTextField('', '  ', 'fa-solid fa-magnifying-glass')).toBe(
      'fa-solid fa-magnifying-glass',
    );
  });

  it('skips whitespace-only values', () => {
    expect(firstNonEmptyTextField('   ', '\t', 'fa-solid fa-globe')).toBe('fa-solid fa-globe');
  });

  it('unwraps Sitecore fields in order (first wins)', () => {
    expect(
      firstNonEmptyTextField(
        { value: 'fa-solid fa-magnifying-glass' },
        { value: 'fa-solid fa-search' },
      ),
    ).toBe('fa-solid fa-magnifying-glass');
  });

  it('falls back to second field when first is empty (SearchIconCssClass then IconCssClass)', () => {
    const searchIcon = { value: '' };
    const iconCssClass = { value: 'fa-solid fa-magnifying-glass' };
    expect(firstNonEmptyTextField(searchIcon, iconCssClass)).toBe(
      'fa-solid fa-magnifying-glass',
    );
  });

  it('prefers SearchIconCssClass-style field when both populated', () => {
    const searchIcon = { jsonValue: { value: 'fa-solid fa-magnifying-glass' } };
    const iconCssClass = { value: 'fas fa-phone' };
    expect(firstNonEmptyTextField(searchIcon, iconCssClass)).toBe(
      'fa-solid fa-magnifying-glass',
    );
  });

  it('uses IconCssClass when SearchIconCssClass missing (footer parity)', () => {
    const iconCssClass = { value: 'fa-solid fa-magnifying-glass' };
    expect(firstNonEmptyTextField(undefined, iconCssClass)).toBe(
      'fa-solid fa-magnifying-glass',
    );
  });
});

describe('getFieldsTextByKey', () => {
  it('returns empty when fields bag is null/undefined', () => {
    expect(getFieldsTextByKey(null, 'LanguageIconCssClass', 'languageIconCssClass')).toBe('');
    expect(getFieldsTextByKey(undefined, 'CssClass', 'cssClass')).toBe('');
  });

  it('reads PascalCase key from Top Bar–style fields', () => {
    const fields = { LanguageIconCssClass: { value: 'fa-solid fa-globe' } };
    expect(getFieldsTextByKey(fields, 'LanguageIconCssClass', 'languageIconCssClass')).toBe(
      'fa-solid fa-globe',
    );
  });

  it('reads camelCase key when PascalCase absent (GraphQL)', () => {
    const fields = { languageIconCssClass: { jsonValue: { value: 'far fa-globe' } } };
    expect(getFieldsTextByKey(fields, 'LanguageIconCssClass', 'languageIconCssClass')).toBe(
      'far fa-globe',
    );
  });
});

describe('normalizeAppPathname', () => {
  it('returns "/" for empty string', () => {
    expect(normalizeAppPathname('')).toBe('/');
  });

  it('returns "/" for "/"', () => {
    expect(normalizeAppPathname('/')).toBe('/');
  });

  it('strips trailing slashes', () => {
    expect(normalizeAppPathname('/about/')).toBe('/about');
  });

  it('prepends leading slash when missing', () => {
    expect(normalizeAppPathname('about')).toBe('/about');
  });

  it('preserves nested paths', () => {
    expect(normalizeAppPathname('/solutions/conveyor-belts/')).toBe('/solutions/conveyor-belts');
  });

  it('collapses multiple trailing slashes', () => {
    expect(normalizeAppPathname('/about///')).toBe('/about');
  });
});

describe('getLogoHomeHref', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns "/" when NEXT_PUBLIC_HOME_PATH is not set', () => {
    vi.stubEnv('NEXT_PUBLIC_HOME_PATH', '');
    expect(getLogoHomeHref()).toBe('/');
  });

  it('returns the normalised path when env var is a plain path', () => {
    vi.stubEnv('NEXT_PUBLIC_HOME_PATH', '/home/');
    expect(getLogoHomeHref()).toBe('/home');
  });

  it('extracts the pathname from a full http URL', () => {
    vi.stubEnv('NEXT_PUBLIC_HOME_PATH', 'https://www.intralox.com/en-us');
    expect(getLogoHomeHref()).toBe('/en-us');
  });

  it('returns "/" for an invalid URL when env var looks like a URL', () => {
    vi.stubEnv('NEXT_PUBLIC_HOME_PATH', 'https://:::invalid');
    expect(getLogoHomeHref()).toBe('/');
  });
});

describe('isLogoOnHomePage', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns true when current pathname matches home href', () => {
    vi.stubEnv('NEXT_PUBLIC_HOME_PATH', '');
    expect(isLogoOnHomePage('/')).toBe(true);
  });

  it('returns false when current pathname does not match home href', () => {
    vi.stubEnv('NEXT_PUBLIC_HOME_PATH', '');
    expect(isLogoOnHomePage('/about')).toBe(false);
  });

  it('returns true when pathname and home path normalise to the same value', () => {
    vi.stubEnv('NEXT_PUBLIC_HOME_PATH', '/home/');
    expect(isLogoOnHomePage('/home')).toBe(true);
  });
});

describe('getTopNavLinksFromTopBar', () => {
  it('returns empty array for undefined topBar', () => {
    expect(getTopNavLinksFromTopBar(undefined)).toEqual([]);
  });

  it('returns empty array when fields are absent', () => {
    expect(getTopNavLinksFromTopBar({} as TopBarFields)).toEqual([]);
  });

  it('reads TopNavLinks (PascalCase)', () => {
    const topBar = {
      fields: { TopNavLinks: [{ id: 'link-1' }] },
    } as unknown as TopBarFields;
    expect(getTopNavLinksFromTopBar(topBar)).toHaveLength(1);
  });

  it('reads topNavLinks (camelCase fallback)', () => {
    const topBar = {
      fields: { topNavLinks: [{ id: 'link-1' }, { id: 'link-2' }] },
    } as unknown as TopBarFields;
    expect(getTopNavLinksFromTopBar(topBar)).toHaveLength(2);
  });

  it('returns empty array when TopNavLinks is not an array', () => {
    const topBar = { fields: { TopNavLinks: 'not-an-array' } } as unknown as TopBarFields;
    expect(getTopNavLinksFromTopBar(topBar)).toEqual([]);
  });
});

describe('getLanguagesFromTopBar', () => {
  it('returns empty array for undefined topBar', () => {
    expect(getLanguagesFromTopBar(undefined)).toEqual([]);
  });

  it('reads Languages (PascalCase)', () => {
    const topBar = {
      fields: { Languages: [{ id: 'lang-1' }] },
    } as unknown as TopBarFields;
    expect(getLanguagesFromTopBar(topBar)).toHaveLength(1);
  });

  it('reads languages (camelCase fallback)', () => {
    const topBar = {
      fields: { languages: [{ id: 'lang-1' }] },
    } as unknown as TopBarFields;
    expect(getLanguagesFromTopBar(topBar)).toHaveLength(1);
  });

  it('returns empty array when Languages is not an array', () => {
    const topBar = { fields: { Languages: null } } as unknown as TopBarFields;
    expect(getLanguagesFromTopBar(topBar)).toEqual([]);
  });
});

describe('getTopNavLinkFieldFromItem', () => {
  it('returns undefined for undefined fields', () => {
    expect(getTopNavLinkFieldFromItem(undefined)).toBeUndefined();
  });

  it('reads Link (PascalCase) when present', () => {
    const fields = { Link: { value: { href: '/products' } } };
    const result = getTopNavLinkFieldFromItem(fields as never);
    expect(result?.value?.href).toBe('/products');
  });

  it('reads link (camelCase fallback)', () => {
    const fields = { link: { value: { href: '/solutions' } } };
    const result = getTopNavLinkFieldFromItem(fields as never);
    expect(result?.value?.href).toBe('/solutions');
  });

  it('returns undefined when Link value does not have "value" property', () => {
    const fields = { Link: 'not-a-field' };
    expect(getTopNavLinkFieldFromItem(fields as never)).toBeUndefined();
  });
});

describe('itemHasChildren', () => {
  it('returns false when item has no relevant fields', () => {
    const item = { fields: {} } as NavChildItem;
    expect(itemHasChildren(item)).toBe(false);
  });

  it('returns true when HasChildLinks is true', () => {
    const item = {
      fields: { HasChildLinks: { value: true } },
    } as unknown as NavChildItem;
    expect(itemHasChildren(item)).toBe(true);
  });

  it('returns true when ShowChildLinks is true', () => {
    const item = {
      fields: { ShowChildLinks: { value: true } },
    } as unknown as NavChildItem;
    expect(itemHasChildren(item)).toBe(true);
  });

  it('returns true when ChildLinks is a non-empty array', () => {
    const item = {
      fields: { ChildLinks: [{ id: 'child-1' }] },
    } as unknown as NavChildItem;
    expect(itemHasChildren(item)).toBe(true);
  });

  it('returns false when ChildLinks is an empty array', () => {
    const item = {
      fields: { ChildLinks: [] },
    } as unknown as NavChildItem;
    expect(itemHasChildren(item)).toBe(false);
  });

  it('returns true when ChildLinks is a non-empty GUID string', () => {
    const item = {
      fields: { ChildLinks: '{SOME-GUID-VALUE}' },
    } as unknown as NavChildItem;
    expect(itemHasChildren(item)).toBe(true);
  });

  it('returns false when ChildLinks is an empty string', () => {
    const item = { fields: { ChildLinks: '' } } as unknown as NavChildItem;
    expect(itemHasChildren(item)).toBe(false);
  });
});

describe('getResolvedMegaMenuPromoLinkKey', () => {
  it('returns undefined when item has no fields', () => {
    const item = { id: '1' } as never;
    expect(getResolvedMegaMenuPromoLinkKey(item)).toBeUndefined();
  });

  it('returns "PromoLink" when PromoLink has a valid href', () => {
    const item = {
      id: '1',
      fields: {
        PromoLink: { value: { href: '/products' } },
      },
    } as never;
    expect(getResolvedMegaMenuPromoLinkKey(item)).toBe('PromoLink');
  });

  it('returns "FeaturedLink" when FeaturedLink has a valid href', () => {
    const item = {
      id: '1',
      fields: {
        FeaturedLink: { value: { href: '/featured' } },
      },
    } as never;
    expect(getResolvedMegaMenuPromoLinkKey(item)).toBe('FeaturedLink');
  });

  it('returns undefined when no link fields are present', () => {
    const item = {
      id: '1',
      fields: {
        Title: { value: 'Products' },
      },
    } as never;
    expect(getResolvedMegaMenuPromoLinkKey(item)).toBeUndefined();
  });

  it('returns the key for a PromoLink field even without href (editing mode fallback)', () => {
    const item = {
      id: '1',
      fields: {
        PromoLink: { value: { href: '' } },
      },
    } as never;
    expect(getResolvedMegaMenuPromoLinkKey(item)).toBe('PromoLink');
  });

  it('ignores "Link" and "ChildLinks" keys (excluded keys)', () => {
    const item = {
      id: '1',
      fields: {
        Link: { value: { href: '/main-link' } },
        ChildLinks: [{ id: 'child' }],
      },
    } as never;
    expect(getResolvedMegaMenuPromoLinkKey(item)).toBeUndefined();
  });

  it('resolves a custom *Link key via fallback scan', () => {
    const item = {
      id: '1',
      fields: {
        CustomPromoLink: { value: { href: '/custom' } },
      },
    } as never;
    expect(getResolvedMegaMenuPromoLinkKey(item)).toBe('CustomPromoLink');
  });
});

describe('resolveMegaMenuPromoLink', () => {
  it('returns hasHref:false when item has no fields', () => {
    const item = { id: '1' } as never;
    const result = resolveMegaMenuPromoLink(item);
    expect(result.hasHref).toBe(false);
    expect(result.field).toBeUndefined();
  });

  it('returns the PromoLink field with hasHref:true when href is set', () => {
    const item = {
      id: '1',
      fields: {
        PromoLink: { value: { href: '/products' } },
      },
    } as never;
    const result = resolveMegaMenuPromoLink(item);
    expect(result.hasHref).toBe(true);
    expect(result.field?.value?.href).toBe('/products');
    expect(result.resolvedKey).toBe('PromoLink');
  });

  it('returns the PromoLink field with hasHref:false when href is empty (editing)', () => {
    const item = {
      id: '1',
      fields: {
        PromoLink: { value: { href: '' } },
      },
    } as never;
    const result = resolveMegaMenuPromoLink(item);
    expect(result.hasHref).toBe(false);
    expect(result.resolvedKey).toBe('PromoLink');
  });

  it('returns hasHref:false with no field when no promo link exists', () => {
    const item = {
      id: '1',
      fields: { Title: { value: 'Products' } },
    } as never;
    const result = resolveMegaMenuPromoLink(item);
    expect(result.field).toBeUndefined();
    expect(result.hasHref).toBe(false);
  });

  it('resolves a custom non-excluded *Link key via scan', () => {
    const item = {
      id: '1',
      fields: {
        MyCustomLink: { value: { href: '/custom-promo' } },
      },
    } as never;
    const result = resolveMegaMenuPromoLink(item);
    expect(result.hasHref).toBe(true);
    expect(result.resolvedKey).toBe('MyCustomLink');
  });
});

describe('HideFromNav header display filters', () => {
  it('isNavItemHiddenFromNav is true only when value is explicitly true', () => {
    expect(isNavItemHiddenFromNav(undefined)).toBe(false);
    expect(isNavItemHiddenFromNav({ HideFromNav: { value: false } })).toBe(false);
    expect(isNavItemHiddenFromNav({ HideFromNav: { value: true } })).toBe(true);
  });

  it('filterMainNavItemsForHeaderDisplay omits hidden top-level items', () => {
    const visible: MainNavItem = {
      id: 'a',
      fields: { Title: { value: 'Products' }, HideFromNav: { value: false } },
    };
    const hidden: MainNavItem = {
      id: 'b',
      fields: { Title: { value: 'Footer only' }, HideFromNav: { value: true } },
    };
    expect(filterMainNavItemsForHeaderDisplay([visible, hidden])).toEqual([visible]);
  });

  it('resolveChildLinksForHeaderDisplay omits hidden children', () => {
    const children: NavChildItem[] = [
      { id: 'show', fields: { Link: { value: { href: '/a' } } } },
      {
        id: 'hide',
        fields: { Link: { value: { href: '/b' } }, HideFromNav: { value: true } },
      },
    ];
    expect(resolveChildLinksForHeaderDisplay(children)).toHaveLength(1);
    expect(resolveChildLinksForHeaderDisplay(children)[0]?.id).toBe('show');
  });
});
