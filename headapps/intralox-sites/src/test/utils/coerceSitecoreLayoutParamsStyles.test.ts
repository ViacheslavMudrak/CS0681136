import { describe, expect, it } from 'vitest';

import type { LayoutServiceData } from '@sitecore-content-sdk/nextjs';

import { coerceSitecoreLayoutParamsStylesForHeadLinks } from 'src/utils/coerceSitecoreLayoutParamsStyles';

function minimalLayout(params: Record<string, unknown>): LayoutServiceData {
  return {
    sitecore: {
      route: {
        placeholders: {
          main: [
            {
              uid: 'r1',
              componentName: 'QuickLinkGroup',
              params,
            },
          ],
        },
      },
    },
  } as unknown as LayoutServiceData;
}

describe('coerceSitecoreLayoutParamsStylesForHeadLinks', () => {
  it('flattens droplist params.Styles to a string token for SDK .match (themes.js)', () => {
    const stylesObj = {
      Value: { value: 'indent-bottom' },
      Icon: { value: 'add-spacing-bottom' },
    };
    const layout = minimalLayout({
      Styles: stylesObj,
      styles: stylesObj,
    });
    coerceSitecoreLayoutParamsStylesForHeadLinks(layout);
    const p = (layout.sitecore.route!.placeholders!.main[0] as { params: Record<string, unknown> }).params;
    expect(p.styles).toBe('');
    expect(p.Styles).toBe('indent-bottom');
  });

  it('leaves string params.styles unchanged', () => {
    const layout = minimalLayout({ styles: 'bg-red' });
    coerceSitecoreLayoutParamsStylesForHeadLinks(layout);
    const p = (layout.sitecore.route!.placeholders!.main[0] as { params: Record<string, unknown> }).params;
    expect(p.styles).toBe('bg-red');
  });

  it('coerces fields.Styles.value when it is a nested droplink object', () => {
    const layout = {
      sitecore: {
        route: {
          placeholders: {
            main: [
              {
                uid: 'r1',
                componentName: 'X',
                params: {},
                fields: {
                  Styles: {
                    value: {
                      fields: { Value: { value: 'some-token' } },
                    },
                  },
                },
              },
            ],
          },
        },
      },
    } as unknown as LayoutServiceData;
    coerceSitecoreLayoutParamsStylesForHeadLinks(layout);
    const f = (layout.sitecore.route!.placeholders!.main[0] as { fields: { Styles: { value: string } } }).fields;
    expect(f.Styles.value).toBe('some-token');
  });

  it('walks nested placeholders', () => {
    const layout = {
      sitecore: {
        route: {
          placeholders: {
            outer: [
              {
                uid: 'outer',
                componentName: 'Row',
                params: { styles: { o: 1 }, Styles: { Value: { value: 'lib-a' } } },
                placeholders: {
                  inner: [
                    {
                      uid: 'in',
                      componentName: 'X',
                      params: { styles: { nested: true }, CSSStyles: { Value: { value: 'x' } } },
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    } as unknown as LayoutServiceData;
    coerceSitecoreLayoutParamsStylesForHeadLinks(layout);
    const outer = layout.sitecore.route.placeholders.outer[0] as {
      params: Record<string, unknown>;
      placeholders: { inner: { params: Record<string, unknown> }[] };
    };
    expect(outer.params.styles).toBe('');
    expect(outer.params.Styles).toBe('lib-a');
    expect(outer.placeholders.inner[0].params.styles).toBe('');
    expect(outer.placeholders.inner[0].params.CSSStyles).toBe('x');
  });

  it('coerces numeric params.styles to string', () => {
    const layout = minimalLayout({ styles: 42 as never });
    coerceSitecoreLayoutParamsStylesForHeadLinks(layout);
    const p = (layout.sitecore.route!.placeholders!.main[0] as { params: Record<string, unknown> }).params;
    expect(p.styles).toBe('42');
  });

  it('coerces fields.Styles.value from nested fields with numeric Value.value', () => {
    const layout = {
      sitecore: {
        route: {
          placeholders: {
            main: [
              {
                uid: 'r1',
                componentName: 'X',
                params: {},
                fields: {
                  Styles: {
                    value: { fields: { Value: { value: 99 } } },
                  },
                },
              },
            ],
          },
        },
      },
    } as unknown as LayoutServiceData;
    coerceSitecoreLayoutParamsStylesForHeadLinks(layout);
    const f = (layout.sitecore.route!.placeholders!.main[0] as { fields: { Styles: { value: string } } }).fields;
    expect(f.Styles.value).toBe('99');
  });

  it('no-ops when route has no placeholders object', () => {
    const layout = { sitecore: { route: {} } } as unknown as LayoutServiceData;
    expect(() => coerceSitecoreLayoutParamsStylesForHeadLinks(layout)).not.toThrow();
  });

  it('skips walk when placeholder value is not an array', () => {
    const layout = {
      sitecore: {
        route: {
          placeholders: {
            main: { notAnArray: true } as unknown as [],
          },
        },
      },
    } as unknown as LayoutServiceData;
    expect(() => coerceSitecoreLayoutParamsStylesForHeadLinks(layout)).not.toThrow();
  });
});
