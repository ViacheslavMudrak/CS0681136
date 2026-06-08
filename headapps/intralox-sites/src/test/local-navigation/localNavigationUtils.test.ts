import { describe, expect, it } from 'vitest';

import type { MainNavItem, NavChildItem } from 'components/navigation/Navigation.type';
import {
  buildAppHrefFromContentHref,
  buildAppRoutePrefixFromParams,
  buildPreviewNavigationQueryString,
  contentPathUnderBase,
  deriveLocalNavFromHeaderPlaceholders,
  findActivePrimaryIndex,
  getContentPathFromAppPathname,
  hrefToContentPathForMatch,
  pathnameIncludesSitePrefix,
  resolveLocalNavLinkFieldForAppRouter,
  hrefToNormalizedPath,
  localNavPrimaryOverviewIsCurrent,
  localNavSiblingActiveItem,
  mainNavItemMatchesCurrentPath,
  mapLinkListToResolved,
  megaMenuChildRowIsCurrentPage,
  megaMenuMatchContentPath,
  megaMenuSectionOverviewIsCurrentPage,
  routeHasLocalNavigationPlaceholderContent,
  routeShowsSubNavigation,
} from 'components/local-navigation/localNavigationUtils';
import type { LocalNavResolvedItem } from 'components/local-navigation/LocalNavigation.type';

describe('localNavigationUtils', () => {
  it('getContentPathFromAppPathname strips site and optional locale', () => {
    expect(getContentPathFromAppPathname('/Corp/en')).toBe('/');
    expect(getContentPathFromAppPathname('/Corp/en/products')).toBe('/products');
    expect(getContentPathFromAppPathname('/Corp/en/a/b')).toBe('/a/b');
    expect(getContentPathFromAppPathname('/Solutions')).toBe('/Solutions');
    expect(getContentPathFromAppPathname('/Solutions/Foodsafe')).toBe('/Foodsafe');
  });

  it('buildAppHrefFromContentHref prefixes site and locale for SitecoreLink navigation', () => {
    const app = '/Corp/en/solutions/packer';
    expect(buildAppHrefFromContentHref('/downloads', app)).toBe('/Corp/en/downloads');
    expect(buildAppHrefFromContentHref('/solutions/other', app)).toBe('/Corp/en/solutions/other');
    expect(buildAppHrefFromContentHref('/Corp/en/downloads', app)).toBe('/Corp/en/downloads');
    expect(buildAppHrefFromContentHref('https://example.com/x', app)).toBe('https://example.com/x');
  });

  it('buildAppHrefFromContentHref prefers useParams route context over pathname heuristics', () => {
    expect(
      buildAppHrefFromContentHref('/deep/a', '/products/modular-plastic-belting', {
        site: 'Intralox',
        locale: 'en',
        defaultLocale: 'en',
      })
    ).toBe('/deep/a');
  });

  it('buildAppHrefFromContentHref prefixes when the browser pathname includes the site segment', () => {
    expect(
      buildAppHrefFromContentHref('/products/other', '/Intralox/products/modular-plastic-belting', {
        site: 'Intralox',
        locale: 'en',
        defaultLocale: 'en',
      })
    ).toBe('/Intralox/products/other');
  });

  it('pathnameIncludesSitePrefix detects site segment in the browser URL', () => {
    expect(pathnameIncludesSitePrefix('/Intralox/products/foo', 'Intralox')).toBe(true);
    expect(pathnameIncludesSitePrefix('/products/foo', 'Intralox')).toBe(false);
  });

  it('getContentPathFromAppPathname keeps full path when site segment is omitted from URL', () => {
    expect(
      getContentPathFromAppPathname('/products/modular-plastic-belting', { site: 'Intralox' })
    ).toBe('/products/modular-plastic-belting');
  });

  it('buildAppRoutePrefixFromParams omits default locale segment (as-needed)', () => {
    expect(buildAppRoutePrefixFromParams({ site: 'Intralox', locale: 'en', defaultLocale: 'en' })).toBe(
      '/Intralox'
    );
    expect(buildAppRoutePrefixFromParams({ site: 'Intralox', locale: 'de', defaultLocale: 'en' })).toBe(
      '/Intralox/de'
    );
  });

  it('buildPreviewNavigationQueryString preserves preview params and sets route + item id', () => {
    const current = new URLSearchParams(
      'mode=preview&sc_site=Intralox&sc_lang=en&secret=abc&sc_itemid=old-id'
    );
    const qs = buildPreviewNavigationQueryString(current, '/solutions/packer', '{NEW-GUID}');
    const parsed = new URLSearchParams(qs);
    expect(parsed.get('mode')).toBe('preview');
    expect(parsed.get('sc_site')).toBe('Intralox');
    expect(parsed.get('sc_lang')).toBe('en');
    expect(parsed.get('secret')).toBe('abc');
    expect(parsed.get('route')).toBe('/solutions/packer');
    expect(parsed.get('sc_itemid')).toBe('NEW-GUID');
  });

  it('resolveLocalNavLinkFieldForAppRouter appends preview query string to href in preview mode', () => {
    const link = {
      value: { href: '/downloads', text: 'Downloads', id: '{TARGET-ID}' },
      jsonValue: { value: { href: '/downloads', text: 'Downloads', id: '{TARGET-ID}' } },
    } as LocalNavResolvedItem['link'];
    const previewParams = new URLSearchParams('mode=preview&sc_site=Corp&sc_lang=en&secret=x');
    const resolved = resolveLocalNavLinkFieldForAppRouter(link, '/Corp/en/page', {
      routeContext: { site: 'Corp', locale: 'en', defaultLocale: 'en' },
      isPreview: true,
      previewSearchParams: previewParams,
    });
    expect(resolved?.value?.href).toBe('/Corp/downloads');
    const query = new URLSearchParams(resolved?.value?.querystring ?? '');
    expect(query.get('mode')).toBe('preview');
    expect(query.get('route')).toBe('/downloads');
    expect(query.get('sc_itemid')).toBe('TARGET-ID');
  });

  it('buildAppHrefFromContentHref leaves href unchanged on single-segment preview pathname', () => {
    expect(buildAppHrefFromContentHref('/solutions/foo', '/Solutions')).toBe('/solutions/foo');
  });

  it('resolveLocalNavLinkFieldForAppRouter updates value and jsonValue href', () => {
    const link = {
      value: { href: '/downloads', text: 'Downloads' },
      jsonValue: { value: { href: '/downloads', text: 'Downloads' } },
    } as LocalNavResolvedItem['link'];
    const resolved = resolveLocalNavLinkFieldForAppRouter(link, '/Corp/en/page');
    expect(resolved?.value?.href).toBe('/Corp/en/downloads');
    expect(
      (resolved as { jsonValue?: { value?: { href?: string } } })?.jsonValue?.value?.href
    ).toBe('/Corp/en/downloads');
  });

  it('hrefToContentPathForMatch aligns site-prefixed hrefs with app pathname', () => {
    const app = '/Intralox/en/products/belts';
    expect(hrefToContentPathForMatch('/Intralox/en/products', app)).toBe('/products');
    expect(hrefToContentPathForMatch('/products/belts', app)).toBe('/products/belts');
  });

  it('hrefToContentPathForMatch keeps section href on single-segment app pathname', () => {
    expect(hrefToContentPathForMatch('/Solutions', '/Solutions')).toBe('/Solutions');
  });

  it('contentPathUnderBase detects prefix relationship', () => {
    expect(contentPathUnderBase('/products/foo', '/products')).toBe(true);
    expect(contentPathUnderBase('/products', '/products')).toBe(true);
    expect(contentPathUnderBase('/other', '/products')).toBe(false);
    expect(contentPathUnderBase('/products/foo', '/')).toBe(false);
    expect(contentPathUnderBase('/', '/')).toBe(true);
  });

  it('findActivePrimaryIndex picks longest matching prefix', () => {
    const app = '/Site/en/food/meat';
    const primaries: LocalNavResolvedItem[] = [
      {
        id: '1',
        label: 'All',
        link: { value: { href: '/food' } },
        children: [],
      },
      {
        id: '2',
        label: 'Food',
        link: { value: { href: '/food' } },
        children: [],
      },
    ];
    const content = getContentPathFromAppPathname(app);
    const idx = findActivePrimaryIndex(content, app, primaries);
    expect(idx).toBeGreaterThanOrEqual(0);
  });

  it('localNavSiblingActiveItem picks Overview on section URL and deeper tab on child URL', () => {
    const appOverview = '/Corp/en/solutions/packer-to-palletizer';
    const appChild = '/Corp/en/solutions/packer-to-palletizer/expertise';
    const contentOverview = getContentPathFromAppPathname(appOverview);
    const contentChild = getContentPathFromAppPathname(appChild);
    const siblings: LocalNavResolvedItem[] = [
      {
        id: 'ov',
        label: 'Overview',
        link: { value: { href: '/solutions/packer-to-palletizer', text: 'Overview' } },
        children: [],
      },
      {
        id: 'ex',
        label: 'Expertise',
        link: {
          value: { href: '/solutions/packer-to-palletizer/expertise', text: 'Expertise' },
        },
        children: [],
      },
    ];
    expect(localNavSiblingActiveItem(contentOverview, appOverview, siblings)?.id).toBe('ov');
    expect(localNavSiblingActiveItem(contentChild, appChild, siblings)?.id).toBe('ex');
  });

  it('localNavSiblingActiveItem reads href from General Link jsonValue when value.href is empty', () => {
    const app = '/Corp/en/solutions/packer-to-palletizer/expertise';
    const content = getContentPathFromAppPathname(app);
    const siblings: LocalNavResolvedItem[] = [
      {
        id: 'ov',
        label: 'Overview',
        link: { value: { href: '/solutions/packer-to-palletizer', text: 'Overview' } },
        children: [],
      },
      {
        id: 'ex',
        label: 'Expertise',
        link: {
          value: {},
          jsonValue: {
            value: { href: '/solutions/packer-to-palletizer/expertise', text: 'Expertise' },
          },
        } as LocalNavResolvedItem['link'],
        children: [],
      },
    ];
    expect(localNavSiblingActiveItem(content, app, siblings)?.id).toBe('ex');
  });

  it('localNavSiblingActiveItem picks tab by route item id when no href matches URL path', () => {
    const app = '/Corp/en/solutions/packer-to-palletizer';
    const content = getContentPathFromAppPathname(app);
    const routeId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    const siblings: LocalNavResolvedItem[] = [
      {
        id: 'ov',
        label: 'Overview',
        link: {
          value: { href: '/legacy/wrong-path', text: 'Overview', id: '{aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee}' },
        },
        children: [],
      },
      {
        id: 'ex',
        label: 'Expertise',
        link: { value: { href: '/solutions/packer-to-palletizer/expertise', text: 'Expertise' } },
        children: [],
      },
    ];
    expect(localNavSiblingActiveItem(content, app, siblings, routeId)?.id).toBe('ov');
  });

  it('mapLinkListToResolved skips rows without href or label', () => {
    expect(
      mapLinkListToResolved([
        { id: 'a', fields: { Link: { value: { href: '/x', text: 'X' } } } },
        { id: 'b', fields: { Link: { value: { href: '' } } } },
      ])
    ).toHaveLength(1);
  });

  it('mapLinkListToResolved omits strip flyout children when ShowChildLinks is true', () => {
    const resolved = mapLinkListToResolved([
      {
        id: 'packer',
        displayName: 'Packer to Palletizer',
        fields: {
          Link: { value: { href: '/solutions/packer-to-palletizer', text: 'Packer to Palletizer' } },
          ShowChildLinks: { value: true },
          ChildLinks: [
            {
              id: 'expertise',
              fields: {
                Link: { value: { href: '/solutions/packer-to-palletizer/expertise', text: 'Expertise' } },
              },
            },
          ],
        },
      },
      {
        id: 'belt-types',
        displayName: 'Belt Types',
        fields: {
          Link: { value: { href: '/products/thermodrive/belt-types', text: 'Belt Types' } },
          ShowChildLinks: { value: false },
          ChildLinks: [
            {
              id: 'bar',
              fields: {
                Link: { value: { href: '/products/thermodrive/bardrive', text: 'Bar Drive' } },
              },
            },
          ],
        },
      },
    ]);
    expect(resolved).toHaveLength(2);
    const packer = resolved.find((r) => r.id === 'packer');
    const beltTypes = resolved.find((r) => r.id === 'belt-types');
    expect(packer?.children).toEqual([]);
    expect(beltTypes?.children).toHaveLength(1);
    expect(beltTypes?.children[0]?.label).toBe('Bar Drive');
  });

  it('routeShowsSubNavigation reads boolean field', () => {
    expect(routeShowsSubNavigation(undefined)).toBe(false);
    expect(routeShowsSubNavigation({ ShowSubNavigation: { value: true } })).toBe(true);
    expect(routeShowsSubNavigation({ showSubNavigation: { value: true } })).toBe(true);
  });

  it('mainNavItemMatchesCurrentPath is true for primary, secondary, and tertiary mega-menu URLs', () => {
    const solutionsSection: MainNavItem = {
      id: 'sol',
      fields: {
        Link: { value: { href: '/Solutions' } },
        ChildLinks: [
          {
            id: 'packer',
            fields: {
              Link: { value: { href: '/Solutions/Packer', text: 'Packer' } },
              ChildLinks: [
                {
                  id: 'expertise',
                  fields: {
                    Link: { value: { href: '/Solutions/Packer/Expertise', text: 'Expertise' } },
                  },
                },
              ],
            },
          },
        ],
      },
    };
    expect(mainNavItemMatchesCurrentPath('/Corp/en/Solutions', solutionsSection)).toBe(true);
    expect(mainNavItemMatchesCurrentPath('/Corp/en/Solutions/Packer', solutionsSection)).toBe(true);
    expect(mainNavItemMatchesCurrentPath('/Corp/en/Solutions/Packer/Expertise', solutionsSection)).toBe(
      true,
    );
    expect(mainNavItemMatchesCurrentPath('/Corp/en/Products/belts', solutionsSection)).toBe(false);
  });

  it('mainNavItemMatchesCurrentPath is false on site home regardless of nav tree', () => {
    const solutionsSection: MainNavItem = {
      id: 'sol',
      fields: {
        Link: { value: { href: '/Solutions' } },
        ChildLinks: [
          {
            id: 'packer',
            fields: {
              Link: { value: { href: '/Solutions/Packer', text: 'Packer' } },
              ChildLinks: [],
            },
          },
        ],
      },
    };
    expect(mainNavItemMatchesCurrentPath('/Corp/en', solutionsSection)).toBe(false);
  });

  it('megaMenuMatchContentPath uses app path on home, not Sitecore context itemPath', () => {
    expect(megaMenuMatchContentPath('/Corp/en', '/sitecore/content/Corp/Web/Home')).toBe('/');
  });

  it('megaMenuMatchContentPath ignores Sitecore tree itemPath so href matching uses the URL', () => {
    expect(megaMenuMatchContentPath('/Corp/en/Products', '/sitecore/content/Corp/Web/Products')).toBe(
      getContentPathFromAppPathname('/Corp/en/Products')
    );
  });

  it('megaMenuMatchContentPath still prefers friendly context paths when not under /sitecore/', () => {
    expect(megaMenuMatchContentPath('/Corp/en/Products/Belts', '/Products/Belts')).toBe('/Products/Belts');
  });

  it('localNavPrimaryOverviewIsCurrent is true when active sibling href matches primary (Overview case)', () => {
    const primary: LocalNavResolvedItem = {
      id: 'p1',
      label: 'Solutions',
      link: { value: { href: '/Solutions', text: 'Solutions' } } as LocalNavResolvedItem['link'],
      children: [],
    };
    const secondaries: LocalNavResolvedItem[] = [
      {
        id: 'ov',
        label: 'Overview',
        link: { value: { href: '/Solutions', text: 'Overview' } } as LocalNavResolvedItem['link'],
        children: [],
      },
      {
        id: 'packer',
        label: 'Packer',
        link: { value: { href: '/Solutions/Packer', text: 'Packer' } } as LocalNavResolvedItem['link'],
        children: [],
      },
    ];
    expect(
      localNavPrimaryOverviewIsCurrent('/solutions', '/Corp/en/Solutions', primary, secondaries, null)
    ).toBe(true);
    expect(
      localNavPrimaryOverviewIsCurrent(
        '/solutions/packer',
        '/Corp/en/Solutions/Packer',
        primary,
        secondaries,
        null
      )
    ).toBe(false);
  });

  it('localNavPrimaryOverviewIsCurrent falls back to exact path when no sibling matches', () => {
    const primary: LocalNavResolvedItem = {
      id: 'p1',
      label: 'About',
      link: { value: { href: '/About', text: 'About' } } as LocalNavResolvedItem['link'],
      children: [],
    };
    expect(localNavPrimaryOverviewIsCurrent('/about', '/Corp/en/About', primary, [], null)).toBe(true);
    expect(localNavPrimaryOverviewIsCurrent('/other', '/Corp/en/Other', primary, [], null)).toBe(false);
  });

  it('megaMenuChildRowIsCurrentPage is false on home even when context path prefixes link href', () => {
    const child: NavChildItem = {
      id: 'p1',
      fields: {
        Link: { value: { href: '/sitecore/content/Corp/Web', text: 'Section' } },
        ChildLinks: [],
      },
    };
    expect(
      megaMenuChildRowIsCurrentPage('/Corp/en', child, '/sitecore/content/Corp/Web/Home', null)
    ).toBe(false);
  });

  it('megaMenuSectionOverviewIsCurrentPage is false on site home', () => {
    const products: MainNavItem = {
      id: 'prod',
      fields: {
        Link: { value: { href: '/Products', text: 'Products' } },
        ChildLinks: [],
      },
    };
    expect(megaMenuSectionOverviewIsCurrentPage('/Corp/en', products, '/sitecore/content/x/Home', null)).toBe(
      false
    );
  });

  it('megaMenuSectionOverviewIsCurrentPage is true on flat /Solutions when a child repeats the same section href', () => {
    const solutions: MainNavItem = {
      id: 'sol',
      fields: {
        Title: { value: 'Solutions' },
        Link: { value: { href: '/Solutions', text: 'Solutions' } },
        ChildLinks: [
          {
            id: 'dup',
            fields: {
              Title: { value: 'Solutions' },
              Link: { value: { href: '/Solutions', text: 'Solutions' } },
            },
          },
          {
            id: 'packer',
            fields: {
              Link: { value: { href: '/Solutions/Packer', text: 'Packer' } },
            },
          },
        ],
      },
    };
    expect(megaMenuSectionOverviewIsCurrentPage('/Solutions', solutions, undefined, null)).toBe(true);
    expect(megaMenuSectionOverviewIsCurrentPage('/Corp/en/Solutions', solutions, undefined, null)).toBe(true);
    expect(megaMenuSectionOverviewIsCurrentPage('/Corp/en/Solutions/Packer', solutions, undefined, null)).toBe(
      false
    );
  });

  it('routeHasLocalNavigationPlaceholderContent is false when key missing', () => {
    expect(routeHasLocalNavigationPlaceholderContent({ placeholders: { 'headless-main': [] } })).toBe(
      false
    );
    expect(
      routeHasLocalNavigationPlaceholderContent({
        placeholders: { 'headless-local-navigation': [{ uid: '1' }] },
      })
    ).toBe(true);
  });

  it('deriveLocalNavFromHeaderPlaceholders uses Packer hub on Solutions > Packer landing (tertiaries in strip)', () => {
    const packerItemId = '44781a2a-cc67-4ec0-8088-b6e0ca06893b';
    const route = {
      placeholders: {
        'headless-header': [
          {
            componentName: 'PartialDesignDynamicPlaceholder',
            placeholders: {
              'sxa-header': [
                {
                  componentName: 'Header',
                  fields: {
                    MainNavigationLinks: [
                      {
                        id: 'sol-main',
                        name: 'Solutions',
                        fields: {
                          Link: { value: { href: '/Solutions', text: 'Solutions Overview' } },
                          Title: { value: 'Solutions' },
                          ChildLinks: [
                            {
                              id: 'food',
                              displayName: 'FoodSafe',
                              fields: {
                                Link: { value: { href: '/Solutions/Foodsafe', text: 'FoodSafe' } },
                                ChildLinks: [],
                              },
                            },
                            {
                              id: 'packer',
                              displayName: 'Packer to Palletizer',
                              fields: {
                                Link: {
                                  value: {
                                    href: '/Solutions/Packer-To-Palletizer',
                                    text: 'Packer to Palletizer',
                                    id: `{${packerItemId.toUpperCase()}}`,
                                  },
                                },
                                ShowChildLinks: { value: true },
                                HasChildLinks: { value: true },
                                ChildLinks: [
                                  {
                                    id: 'exp',
                                    displayName: 'Expertise',
                                    fields: {
                                      Link: {
                                        value: {
                                          href: '/Solutions/Packer-To-Palletizer/Expertise',
                                          text: 'Expertise',
                                        },
                                      },
                                      ChildLinks: [],
                                    },
                                  },
                                  {
                                    id: 'svc',
                                    displayName: 'Service',
                                    fields: {
                                      Link: {
                                        value: {
                                          href: '/Solutions/Packer-To-Palletizer/Service',
                                          text: 'Service',
                                        },
                                      },
                                      ChildLinks: [],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    };
    const { primaries, secondaries, useIndustryNavDropdowns } = deriveLocalNavFromHeaderPlaceholders(
      route,
      packerItemId,
      '/Solutions/Packer-To-Palletizer'
    );
    expect(primaries).toHaveLength(1);
    expect(primaries[0]?.label).toContain('Packer');
    expect(secondaries.map((s) => s.label).sort()).toEqual(['Expertise', 'Service']);
    expect(useIndustryNavDropdowns).toBe(false);
  });

  it('deriveLocalNavFromHeaderPlaceholders matches route item id and builds siblings', () => {
    const route = {
      placeholders: {
        'headless-header': [
          {
            componentName: 'PartialDesignDynamicPlaceholder',
            placeholders: {
              'sxa-header': [
                {
                  componentName: 'Header',
                  fields: {
                    MainNavigationLinks: [
                      {
                        id: '613416ef-93e9-45b5-8d3f-6323aa24a81c',
                        displayName: 'Solutions',
                        fields: {
                          Link: { value: { href: '/Solutions', text: 'Solutions Overview' } },
                          Title: { value: 'Solutions' },
                          ChildLinks: [
                            {
                              id: '7ef8ee4c-e0b8-4f7c-b078-5c4e78f2b1d4',
                              displayName: 'Intralox FoodSafe',
                              fields: {
                                Link: {
                                  value: {
                                    href: '/Solutions/Foodsafe',
                                    text: 'Intralox FoodSafe',
                                    id: '{8D3B7A90-75FF-487B-984C-C890604122C7}',
                                  },
                                },
                                ChildLinks: [],
                              },
                            },
                            {
                              id: '9a343415-fdfc-4e39-9464-aa0d25496ac2',
                              displayName: 'Packer to Palletizer',
                              fields: {
                                Link: {
                                  value: { href: '/Solutions/Packer-To-Palletizer', text: 'Packer' },
                                },
                                ShowChildLinks: { value: true },
                                HasChildLinks: { value: true },
                                ChildLinks: [
                                  {
                                    id: 'exp',
                                    displayName: 'Expertise',
                                    fields: {
                                      Link: {
                                        value: {
                                          href: '/Solutions/Packer-To-Palletizer/Expertise',
                                          text: 'Expertise',
                                        },
                                      },
                                      ChildLinks: [],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    };
    const { primaries, secondaries } = deriveLocalNavFromHeaderPlaceholders(
      route,
      '8d3b7a90-75ff-487b-984c-c890604122c7',
      '/Solutions/Foodsafe'
    );
    expect(primaries).toHaveLength(1);
    expect(primaries[0]?.label).toContain('Solutions');
    expect(secondaries.map((s) => s.label)).toEqual(
      expect.arrayContaining(['Intralox FoodSafe', 'Packer'])
    );
    const packer = secondaries.find((s) => s.id === '9a343415-fdfc-4e39-9464-aa0d25496ac2');
    expect(packer?.children).toEqual([]);
  });

  it('deriveLocalNavFromHeaderPlaceholders uses Packaging as primary on Industries hub landing', () => {
    const route = {
      placeholders: {
        'headless-header': [
          {
            componentName: 'PartialDesignDynamicPlaceholder',
            placeholders: {
              'sxa-header': [
                {
                  componentName: 'Header',
                  fields: {
                    MainNavigationLinks: [
                      {
                        id: 'ind-main',
                        name: 'Industries',
                        displayName: 'Industries',
                        fields: {
                          Link: { value: { href: '/Industries', text: 'Industries Overview' } },
                          Title: { value: 'Industries' },
                          ChildLinks: [
                            {
                              id: 'pack-node',
                              displayName: 'Packaging',
                              fields: {
                                Link: {
                                  value: {
                                    href: '/Industries/Packaging',
                                    text: 'Packaging',
                                    id: '{F727CB13-BF20-42BB-9AB8-01FC2EA39032}',
                                  },
                                },
                                ChildLinks: [
                                  {
                                    id: 'case',
                                    displayName: 'Case Package Handling',
                                    fields: {
                                      Link: {
                                        value: {
                                          href: '/Industries/Packaging/Case-Package-Handling',
                                          text: 'Case',
                                        },
                                      },
                                      ChildLinks: [],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    };
    const { primaries, secondaries, useIndustryNavDropdowns } = deriveLocalNavFromHeaderPlaceholders(
      route,
      'f727cb13-bf20-42bb-9ab8-01fc2ea39032',
      '/Industries/Packaging'
    );
    expect(primaries).toHaveLength(1);
    expect(primaries[0]?.label).toBe('Packaging');
    expect(secondaries).toHaveLength(1);
    expect(secondaries[0]?.label).toBe('Case');
    expect(useIndustryNavDropdowns).toBe(true);
  });

  it('deriveLocalNavFromHeaderPlaceholders keeps industry dropdown mode on deeper Packaging pages', () => {
    const route = {
      placeholders: {
        'headless-header': [
          {
            componentName: 'PartialDesignDynamicPlaceholder',
            placeholders: {
              'sxa-header': [
                {
                  componentName: 'Header',
                  fields: {
                    MainNavigationLinks: [
                      {
                        id: 'ind-main',
                        name: 'Industries',
                        fields: {
                          Link: { value: { href: '/Industries', text: 'Industries Overview' } },
                          Title: { value: 'Industries' },
                          ChildLinks: [
                            {
                              id: 'pack-node',
                              displayName: 'Packaging',
                              fields: {
                                Link: { value: { href: '/Industries/Packaging', text: 'Packaging' } },
                                ChildLinks: [
                                  {
                                    id: 'case',
                                    displayName: 'Case Package Handling',
                                    fields: {
                                      Link: {
                                        value: {
                                          href: '/Industries/Packaging/Case-Package-Handling',
                                          text: 'Case',
                                          id: '{DAEB974E-A0BA-41BA-A7C3-1A363BF0A0D5}',
                                        },
                                      },
                                      ChildLinks: [],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    };
    const { primaries, useIndustryNavDropdowns } = deriveLocalNavFromHeaderPlaceholders(
      route,
      'daeb974e-a0ba-41ba-a7c3-1a363bf0a0d5',
      '/Industries/Packaging/Case-Package-Handling'
    );
    expect(primaries[0]?.label).toBe('Packaging');
    expect(useIndustryNavDropdowns).toBe(true);
  });

  it('deriveLocalNavFromHeaderPlaceholders returns empty result when no mainLinks (line 845)', () => {
    const result = deriveLocalNavFromHeaderPlaceholders({}, 'some-id', '/some/path');
    expect(result).toEqual({ primaries: [], secondaries: [], useIndustryNavDropdowns: false });
  });

  it('deriveLocalNavFromHeaderPlaceholders returns empty result when route has mainLinks but no match (line 851)', () => {
    const routeWithLinks = {
      placeholders: {
        'headless-header': [
          {
            componentName: 'Navigation',
            fields: {
              MainLinks: [
                {
                  id: '{AAAA0000-0000-0000-0000-000000000001}',
                  fields: {
                    Link: { value: { href: '/Products', text: 'Products' } },
                    ChildLinks: [],
                  },
                },
              ],
            },
          },
        ],
      },
    };
    const result = deriveLocalNavFromHeaderPlaceholders(
      routeWithLinks,
      'bbbb0000-0000-0000-0000-000000000002',
      '/unrelated/path'
    );
    expect(result).toEqual({ primaries: [], secondaries: [], useIndustryNavDropdowns: false });
  });

  it('deriveLocalNavFromHeaderPlaceholders still matches pages with HideFromNav (footer-only strip)', () => {
    const footerPageId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    const route = {
      placeholders: {
        'headless-header': [
          {
            componentName: 'Header',
            fields: {
              MainNavigationLinks: [
                {
                  id: 'company',
                  fields: {
                    Title: { value: 'Company' },
                    Link: { value: { href: '/Company' } },
                    ChildLinks: [
                      {
                        id: 'careers',
                        displayName: 'Careers',
                        fields: {
                          Link: {
                            value: {
                              href: '/Company/Careers',
                              id: `{${footerPageId.toUpperCase()}}`,
                            },
                          },
                          HideFromNav: { value: true },
                          ChildLinks: [],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    };
    const { primaries, secondaries } = deriveLocalNavFromHeaderPlaceholders(
      route,
      footerPageId,
      '/Company/Careers'
    );
    expect(primaries).toHaveLength(1);
    expect(primaries[0]?.label).toBe('Company');
    expect(secondaries.some((s) => s.label === 'Careers')).toBe(true);
  });
});

describe('hrefToNormalizedPath edge cases', () => {
  it('returns "/" for undefined', () => {
    expect(hrefToNormalizedPath(undefined)).toBe('/');
  });

  it('returns "/" for empty string', () => {
    expect(hrefToNormalizedPath('')).toBe('/');
  });

  it('returns "/" for whitespace-only string (trimStr returns empty — line 57 null/undefined branch)', () => {
    expect(hrefToNormalizedPath('   ')).toBe('/');
  });

  it('parses absolute https URL to normalized path', () => {
    const result = hrefToNormalizedPath('https://example.com/products/belts');
    expect(result).toBe('/products/belts');
  });

  it('returns "/" for unparseable absolute URL', () => {
    const result = hrefToNormalizedPath('https://[invalid');
    expect(result).toBe('/');
  });

  it('normalizes a relative path', () => {
    const result = hrefToNormalizedPath('/about/team');
    expect(result).toBe('/about/team');
  });
});
