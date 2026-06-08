import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('lib/media-tile-i18n', () => ({
  getMediaTileLabels: vi.fn(async () => ({
    emptyHint: 'Media Tile',
    noLinksConfigured: 'No links configured',
    linkFallback: 'Link',
  })),
  MEDIA_TILE_LABELS_FALLBACK: {
    emptyHint: 'Media Tile',
    noLinksConfigured: 'No links configured',
    linkFallback: 'Link',
  },
}));

vi.mock('lib/callout-i18n', () => ({
  getCalloutLabels: vi.fn(async () => ({ emptyHint: 'Callout' })),
}));

import type {
  MediaTileFields,
  MediaTileLayoutConfig,
  MediaTileProps,
} from 'components/media-tile/MediaTile.type';
import { Default } from 'components/media-tile/MediaTile';
import {
  focalPointToCssObjectPosition,
  isMediaTileDarkColorScheme,
  isMediaTileGrayColorScheme,
  MEDIA_TILE_LANDSCAPE_FRAME_STYLE,
  resolveMediaTileFields,
  resolveMediaTileHeadingTag,
  resolveMediaTileLayoutConfig,
  normalizeMediaTileThemeKey,
  mergeMediaTileRenderingParams,
  omitColorSchemeParamForEmbeddedCallout,
  resolveMediaTileImageSizes,
  resolveMediaTileMediaAspect,
  resolveMediaTileHasWhiteBackground,
  extractMediaTileBrightcoveId,
  mediaTileHasPreviewContent,
  mediaTileShouldRenderEmbeddedCallout,
  mergeMediaTileButtonAlignmentIntoCalloutParams,
  mapMediaTilePrefixedCalloutParamsForEmbeddedCallout,
  MEDIA_TILE_CALLOUT_PARAM_TO_CALLOUT_PARAM,
} from 'components/media-tile/mediaTileUtils';

function baseLayoutConfig(overrides: Partial<MediaTileLayoutConfig> = {}): MediaTileLayoutConfig {
  return {
    mediaOnRight: true,
    mediaWidthPercent: 50,
    mediaAspectKey: 'landscape',
    mediaFrameStyle: MEDIA_TILE_LANDSCAPE_FRAME_STYLE,
    headingTag: 'h2',
    themeKey: 'base',
    headlineSizeKey: 'base',
    headlineWidthFull: true,
    surfaceColor: 'default',
    isCard: false,
    hasWhiteBackground: false,
    colorSchemeRaw: undefined,
    ...overrides,
  };
}
vi.mock('components/shared/video/Video', async () => {
  const { mediaTileVideoMock } = await import('src/test/mocks/viteSafeMocks');
  return mediaTileVideoMock();
});

vi.mock('@sitecore-content-sdk/nextjs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sitecore-content-sdk/nextjs')>();
  const { mediaTileSitecoreSdkMock } = await import('src/test/mocks/viteSafeMocks');
  return { ...actual, ...mediaTileSitecoreSdkMock() };
});

const basePage = { mode: { isEditing: false } } as MediaTileProps['page'];
const baseParams = {
  styles: '',
  RenderingIdentifier: 'media-tile-test',
} as MediaTileProps['params'];
const baseRendering = {} as MediaTileProps['rendering'];

describe('MediaTile Default', () => {
  it('renders empty hint when fields are missing', async () => {
    const ui = await Default({
      fields: undefined,
      params: baseParams,
      page: basePage,
      rendering: baseRendering,
    });
    render(ui);
    expect(screen.getByText(/media tile/i)).toBeInTheDocument();
  });

  it('returns null when no preview content and not editing', async () => {
    const ui = await Default({
      fields: {},
      params: baseParams,
      page: basePage,
      rendering: baseRendering,
    });
    const { container } = render(ui);
    expect(container.firstChild).toBeNull();
  });

  it('appends Callout under the split when Callouts have preview content', async () => {
    const ui = await Default({
      fields: {
        Headline: { value: 'Tile' },
        Callouts: [
          {
            id: 'co-1',
            fields: {
              Value: { value: '99%' },
              Label: { value: 'Efficiency' },
            },
          },
        ],
      },
      params: baseParams,
      page: basePage,
      rendering: baseRendering,
    });
    const { container } = render(ui);
    expect(
      container.querySelector('section.component.media-tile section.component.callout'),
    ).toBeTruthy();
  });

  it('appends Callout when only CalloutItems are set (layout service field name)', async () => {
    const ui = await Default({
      fields: {
        Headline: { value: 'Tile' },
        CalloutItems: [
          {
            id: 'ce0d708a-4917-49d7-a085-b9f5b8ba780d',
            fields: {
              PrependValue: { value: '' },
              Label: { value: 'Languages supported' },
              Value: { value: '18' },
              AppendValue: { value: '' },
              Link: { value: { href: '' } },
            },
          },
        ],
      },
      params: baseParams,
      page: basePage,
      rendering: baseRendering,
    });
    const { container, getByText } = render(ui);
    expect(
      container.querySelector('section.component.media-tile section.component.callout'),
    ).toBeTruthy();
    expect(getByText('18')).toBeInTheDocument();
    expect(getByText('Languages supported')).toBeInTheDocument();
  });

  it('appends Callout when callout rows only exist on data.datasource.children.results', async () => {
    const ui = await Default({
      fields: {
        Headline: { value: 'Tile' },
        Image: {
          value: { src: 'https://example.com/a.jpg', width: 400, height: 300, alt: '' },
        },
        data: {
          datasource: {
            children: {
              results: [
                {
                  id: 'ds-co-1',
                  fields: {
                    value: { jsonValue: { value: '10' } },
                    label: { jsonValue: { value: 'Years' } },
                  },
                },
              ],
            },
          },
        },
      },
      params: baseParams,
      page: basePage,
      rendering: baseRendering,
    });
    const { container } = render(ui);
    expect(
      container.querySelector('section.component.media-tile section.component.callout'),
    ).toBeTruthy();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Years')).toBeInTheDocument();
  });

  it('renders Brightcove video when MediaType is video and Brightcove id is set', async () => {
    const ui = await Default({
      fields: {
        Headline: { value: 'With video' },
        MediaType: { fields: { Value: { value: 'video' } } },
        Video: {
          fields: {
            BrightcoveId: { value: 'ref:brightcove-99' },
            Autoplay: { value: false },
            Loop: { value: false },
            CoverImage: { value: { src: '', width: 1, height: 1, alt: '' } },
            Caption: { value: '' },
            Title: { value: 'Clip title' },
          },
        },
      },
      params: baseParams,
      page: basePage,
      rendering: baseRendering,
    });
    render(ui);
    expect(screen.getByText('With video')).toBeInTheDocument();
    const mock = screen.getByTestId('media-tile-video-mock');
    expect(mock).toHaveAttribute('data-video-id', 'ref:brightcove-99');
    expect(mock).toHaveTextContent('Clip title');
  });

  it('renders headline and image when populated', async () => {
    const ui = await Default({
      fields: {
        Headline: { value: 'Test Headline' },
        Image: {
          value: { src: 'https://example.com/a.jpg', width: 400, height: 300, alt: '' },
        },
      },
      params: baseParams,
      page: basePage,
      rendering: baseRendering,
    });
    render(ui);
    expect(screen.getByText('Test Headline')).toBeInTheDocument();
    expect(screen.getByTestId('next-image')).toBeInTheDocument();
  });

  it('does not render empty description in preview', async () => {
    const ui = await Default({
      fields: {
        Headline: { value: 'Only title' },
        Description: { value: '' },
        Image: {
          value: { src: 'https://example.com/a.jpg', width: 400, height: 300, alt: '' },
        },
      },
      params: baseParams,
      page: basePage,
      rendering: baseRendering,
    });
    render(ui);
    expect(screen.queryByTestId('rich-text')).not.toBeInTheDocument();
  });

  it('renders Body field as description when Description is empty', async () => {
    const ui = await Default({
      fields: {
        Headline: { value: 'Title' },
        Description: { value: '' },
        Body: {
          value:
            '<p>With industry-leading service levels and guarantees, we help you eliminate downtime.</p>',
        },
        Image: {
          value: { src: 'https://example.com/a.jpg', width: 400, height: 300, alt: '' },
        },
      },
      params: baseParams,
      page: basePage,
      rendering: baseRendering,
    });
    render(ui);
    expect(screen.getByTestId('rich-text').textContent).toContain('industry-leading');
  });

  it('applies flex-row-reverse when MediaPosition is Left', async () => {
    const ui = await Default({
      fields: {
        Headline: { value: 'H' },
        Image: {
          value: { src: 'https://example.com/a.jpg', width: 400, height: 300, alt: '' },
        },
      },
      params:
        {
          ...baseParams,
          MediaPosition: { Value: { value: 'Left' } },
        } as unknown as MediaTileProps['params'],
      page: basePage,
      rendering: baseRendering,
    });
    const { container } = render(ui);
    const row = container.querySelector('.sm\\:flex-row-reverse');
    expect(row).toBeTruthy();
  });

  it('uses sm:pl-6 gutter on copy column when media is on the left', async () => {
    const ui = await Default({
      fields: {
        Headline: { value: 'H' },
        Image: {
          value: { src: 'https://example.com/a.jpg', width: 400, height: 300, alt: '' },
        },
      },
      params:
        {
          ...baseParams,
          MediaPosition: { Value: { value: 'Left' } },
        } as unknown as MediaTileProps['params'],
      page: basePage,
      rendering: baseRendering,
    });
    const { container } = render(ui);
    const textCol = container.querySelector('.sm\\:pl-6.sm\\:pr-0');
    expect(textCol).toBeTruthy();
  });

  it('renders links with stable keys from items', async () => {
    const ui = await Default({
      fields: {
        Headline: { value: 'T' },
        Image: {
          value: { src: 'https://example.com/a.jpg', width: 400, height: 300, alt: '' },
        },
        Links: [
          {
            id: 'link-1',
            displayName: 'One',
            fields: {
              Link: { value: { href: '/a', text: 'Alpha' } },
              Style: { fields: { Value: { value: 'Button' } } },
            },
          },
          {
            id: 'link-2',
            displayName: 'Two',
            fields: {
              Link: { value: { href: '/b', text: 'Beta' } },
              Style: { fields: { Value: { value: 'Link' } } },
            },
          },
        ],
      },
      params: baseParams,
      page: basePage,
      rendering: baseRendering,
    });
    render(ui);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('uses vertical dividers between CTA links for text style, not for card style', async () => {
    const fields = {
      Headline: { value: 'T' },
      Image: {
        value: { src: 'https://example.com/a.jpg', width: 400, height: 300, alt: '' },
      },
      Links: [
        {
          id: 'link-1',
          fields: {
            Link: { value: { href: '/a', text: 'Alpha' } },
            Style: { fields: { Value: { value: 'Button' } } },
          },
        },
        {
          id: 'link-2',
          fields: {
            Link: { value: { href: '/b', text: 'Beta' } },
            Style: { fields: { Value: { value: 'Link' } } },
          },
        },
      ],
    };

    const textStyleUi = await Default({
      fields,
      params: { ...baseParams, Style: { Value: { value: 'Text' } } } as unknown as MediaTileProps['params'],
      page: basePage,
      rendering: baseRendering,
    });
    const { container: textContainer } = render(textStyleUi);
    const textList = textContainer.querySelector('[role="list"]');
    expect(textList?.className).toMatch(/divide-x/);

    const cardUi = await Default({
      fields,
      params: { ...baseParams, Style: { Value: { value: 'Card' } } } as unknown as MediaTileProps['params'],
      page: basePage,
      rendering: baseRendering,
    });
    const { container: cardContainer } = render(cardUi);
    const cardList = cardContainer.querySelector('[role="list"]');
    expect(cardList?.className).not.toMatch(/divide-x/);
    expect(cardList?.className).toMatch(/gap-x-4/);
  });

  it('names the CTA wrapper from Sitecore rendering.componentName when links exist', async () => {
    const ui = await Default({
      fields: {
        Headline: { value: 'T' },
        Image: {
          value: { src: 'https://example.com/a.jpg', width: 400, height: 300, alt: '' },
        },
        Links: [
          {
            id: 'link-1',
            fields: {
              Link: { value: { href: '/a', text: 'Alpha' } },
              Style: { fields: { Value: { value: 'Button' } } },
            },
          },
        ],
      },
      params: baseParams,
      page: basePage,
      rendering: { componentName: 'MediaTile' } as MediaTileProps['rendering'],
    });
    render(ui);
    expect(screen.getByRole('group', { name: 'MediaTile' })).toBeInTheDocument();
  });
});

describe('extractMediaTileBrightcoveId', () => {
  it('returns trimmed string from nested BrightcoveId', () => {
    expect(
      extractMediaTileBrightcoveId({
        fields: {
          BrightcoveId: { value: '  vid1  ' },
          Autoplay: { value: false },
          Loop: { value: false },
          CoverImage: { value: { src: '', width: 1, height: 1, alt: '' } },
          Caption: { value: '' },
          Title: { value: '' },
        },
      }),
    ).toBe('vid1');
  });

  it('returns undefined when missing or empty', () => {
    expect(extractMediaTileBrightcoveId(undefined)).toBeUndefined();
    expect(extractMediaTileBrightcoveId({ fields: {} as never })).toBeUndefined();
  });

  it('unwraps jsonValue envelope (GraphQL / Content SDK)', () => {
    expect(
      extractMediaTileBrightcoveId({
        jsonValue: {
          fields: {
            BrightcoveId: { value: 'nested-vid' },
            Autoplay: { value: false },
            Loop: { value: false },
            CoverImage: { value: { src: '', width: 1, height: 1, alt: '' } },
            Caption: { value: '' },
            Title: { value: '' },
          },
        },
      }),
    ).toBe('nested-vid');
  });

  it('reads camelCase brightcoveId (Edge / GraphQL)', () => {
    expect(
      extractMediaTileBrightcoveId({
        fields: {
          brightcoveId: { value: 'camel-case-id' },
          autoplay: { value: false },
          loop: { value: false },
          coverImage: { value: { src: '', width: 1, height: 1, alt: '' } },
          caption: { value: '' },
          title: { value: '' },
        },
      } as unknown as Parameters<typeof extractMediaTileBrightcoveId>[0]),
    ).toBe('camel-case-id');
  });

  it('unwraps layout value envelope around fields', () => {
    expect(
      extractMediaTileBrightcoveId({
        value: {
          fields: {
            BrightcoveId: { value: 'wrapped-id' },
            Autoplay: { value: false },
            Loop: { value: false },
            CoverImage: { value: { src: '', width: 1, height: 1, alt: '' } },
            Caption: { value: '' },
            Title: { value: '' },
          },
        },
      } as unknown as Parameters<typeof extractMediaTileBrightcoveId>[0]),
    ).toBe('wrapped-id');
  });
});

describe('mediaTileHasPreviewContent', () => {
  it('is true for video media type with Brightcove id only', () => {
    expect(
      mediaTileHasPreviewContent({
        MediaType: { fields: { Value: { value: 'video' } } },
        Video: {
          fields: {
            BrightcoveId: { value: 'x' },
            Autoplay: { value: false },
            Loop: { value: false },
            CoverImage: { value: { src: '', width: 1, height: 1, alt: '' } },
            Caption: { value: '' },
            Title: { value: '' },
          },
        },
      }),
    ).toBe(true);
  });

  it('is true when only embedded callouts have visitor-visible content', () => {
    expect(
      mediaTileHasPreviewContent({
        Callouts: [
          {
            id: 'c1',
            fields: {
              Value: { value: '10' },
              Label: { value: 'Units' },
            },
          },
        ],
      }),
    ).toBe(true);
  });
});

describe('mediaTileShouldRenderEmbeddedCallout', () => {
  it('is false when no callout fields', () => {
    expect(mediaTileShouldRenderEmbeddedCallout({}, false)).toBe(false);
    expect(mediaTileShouldRenderEmbeddedCallout({}, true)).toBe(false);
  });

  it('is true in preview when a callout item has stat content', () => {
    expect(
      mediaTileShouldRenderEmbeddedCallout(
        {
          Callouts: [
            { id: 'x', fields: { Value: { value: '1' }, Label: { value: 'A' } } },
          ],
        },
        false,
      ),
    ).toBe(true);
  });

  it('is false in preview when callout children are empty', () => {
    expect(
      mediaTileShouldRenderEmbeddedCallout(
        {
          Callouts: [{ id: 'x', fields: {} }],
        },
        false,
      ),
    ).toBe(false);
  });

  it('is true in editing when callout rows exist even if values are empty', () => {
    expect(
      mediaTileShouldRenderEmbeddedCallout(
        {
          Callouts: [{ id: 'x', fields: {} }],
        },
        true,
      ),
    ).toBe(true);
  });
});

describe('mergeMediaTileButtonAlignmentIntoCalloutParams', () => {
  it('maps ButtonAlignment Center to TextAlign when param is absent', () => {
    const out = mergeMediaTileButtonAlignmentIntoCalloutParams(
      {},
      {
        ButtonAlignment: { fields: { Value: { value: 'Center' } } },
      } as MediaTileFields,
    );
    expect(out.TextAlign).toEqual({ Value: { value: 'Center' } });
  });

  it('maps ButtonAlignment Left to TextAlign', () => {
    const out = mergeMediaTileButtonAlignmentIntoCalloutParams(
      {},
      {
        ButtonAlignment: { fields: { Value: { value: 'Left' } } },
      } as MediaTileFields,
    );
    expect(out.TextAlign).toEqual({ Value: { value: 'Left' } });
  });

  it('does not override existing TextAlign on params', () => {
    const out = mergeMediaTileButtonAlignmentIntoCalloutParams(
      { TextAlign: { Value: { value: 'Left' } } },
      {
        ButtonAlignment: { fields: { Value: { value: 'Center' } } },
      } as MediaTileFields,
    );
    expect((out.TextAlign as { Value?: { value?: string } }).Value?.value).toBe('Left');
  });

  it('does not map ButtonAlignment when CalloutTextAlign is set (author wins over CTA alignment)', () => {
    const out = mergeMediaTileButtonAlignmentIntoCalloutParams(
      { CalloutTextAlign: { Value: { value: 'Left' } } },
      {
        ButtonAlignment: { fields: { Value: { value: 'Center' } } },
      } as MediaTileFields,
    );
    expect(out.TextAlign).toBeUndefined();
  });
});

describe('MEDIA_TILE_CALLOUT_PARAM_TO_CALLOUT_PARAM', () => {
  it('documents Media Tile CMS keys vs shared Callout param keys', () => {
    expect(MEDIA_TILE_CALLOUT_PARAM_TO_CALLOUT_PARAM).toEqual({
      CalloutStyle: 'Style',
      CalloutDirection: 'Direction',
      CalloutTextSize: 'TextSize',
      CalloutTextAlign: 'TextAlign',
      CalloutColorScheme: 'ColorScheme',
    });
  });
});

describe('mapMediaTilePrefixedCalloutParamsForEmbeddedCallout', () => {
  it('maps layout-service Callout* shape { Value: { value } } (all five keys)', () => {
    const layout = {
      ColorScheme: { Value: { value: 'Light' } },
      CalloutStyle: { Value: { value: 'Text' } },
      CalloutDirection: { Value: { value: 'Column' } },
      CalloutColorScheme: { Value: { value: 'Dark' } },
      CalloutTextAlign: { Value: { value: 'Left' } },
      CalloutTextSize: { Value: { value: 'SM' } },
    };
    const stripped = omitColorSchemeParamForEmbeddedCallout({ ...layout });
    const out = mapMediaTilePrefixedCalloutParamsForEmbeddedCallout(stripped, layout);
    expect((out.Style as { Value?: { value?: string } }).Value?.value).toBe('Text');
    expect((out.Direction as { Value?: { value?: string } }).Value?.value).toBe('Column');
    expect((out.ColorScheme as { Value?: { value?: string } }).Value?.value).toBe('Dark');
    expect((out.TextAlign as { Value?: { value?: string } }).Value?.value).toBe('Left');
    expect((out.TextSize as { Value?: { value?: string } }).Value?.value).toBe('SM');
  });

  it('maps Callout* keys to Callout resolveCalloutConfig keys and restores ColorScheme after tile strip', () => {
    const layout = {
      Style: { Value: { value: 'Default' } },
      ColorScheme: { Value: { value: 'Light' } },
      CalloutStyle: { Value: { value: 'Text' } },
      CalloutDirection: { Value: { value: 'Column' } },
      CalloutTextSize: { Value: { value: 'SM' } },
      CalloutTextAlign: { Value: { value: 'Left' } },
      CalloutColorScheme: { Value: { value: 'Dark' } },
    };
    const stripped = omitColorSchemeParamForEmbeddedCallout({ ...layout });
    const out = mapMediaTilePrefixedCalloutParamsForEmbeddedCallout(stripped, layout);
    expect((out.Style as { Value?: { value?: string } }).Value?.value).toBe('Text');
    expect((out.Direction as { Value?: { value?: string } }).Value?.value).toBe('Column');
    expect((out.TextSize as { Value?: { value?: string } }).Value?.value).toBe('SM');
    expect((out.TextAlign as { Value?: { value?: string } }).Value?.value).toBe('Left');
    expect((out.ColorScheme as { Value?: { value?: string } }).Value?.value).toBe('Dark');
  });

  it('removes Style when CalloutStyle is absent so tile chrome does not drive Callout variant', () => {
    const layout = { Style: { Value: { value: 'Card' } } };
    const out = mapMediaTilePrefixedCalloutParamsForEmbeddedCallout({ ...layout }, layout);
    expect(out.Style).toBeUndefined();
  });

  it('reads CalloutDirection from kebab-case param key', () => {
    const layout = {
      'callout-direction': { Value: { value: 'Column' } },
    };
    const out = mapMediaTilePrefixedCalloutParamsForEmbeddedCallout(
      omitColorSchemeParamForEmbeddedCallout({ ...layout }),
      layout,
    );
    expect((out.Direction as { Value?: { value?: string } }).Value?.value).toBe('Column');
  });

  it('reads Callout* from flat { value } param shape and camelCase keys', () => {
    const layout = {
      calloutDirection: { value: 'Column' },
      calloutTextSize: { value: 'SM' },
      CalloutColorScheme: { value: 'Dark' },
    };
    const stripped = omitColorSchemeParamForEmbeddedCallout({ ...layout });
    const out = mapMediaTilePrefixedCalloutParamsForEmbeddedCallout(stripped, layout);
    expect((out.Direction as { Value?: { value?: string } }).Value?.value).toBe('Column');
    expect((out.TextSize as { Value?: { value?: string } }).Value?.value).toBe('SM');
    expect((out.ColorScheme as { Value?: { value?: string } }).Value?.value).toBe('Dark');
  });
});

describe('resolveMediaTileFields', () => {
  it('maps Body to Description in preview when Description has no visible HTML', () => {
    const raw: MediaTileFields = {
      Headline: { value: 'H' },
      Description: { value: '' },
      Body: { value: '<p>Hello from body</p>' },
    };
    const out = resolveMediaTileFields(raw, false);
    expect(out?.Description?.value).toContain('Hello from body');
  });

  it('reads rich text from data.datasource jsonValue shape', () => {
    const raw: MediaTileFields = {
      Headline: { value: 'H' },
      Description: { value: '' },
      data: {
        datasource: {
          Body: { jsonValue: { value: '<p>From GraphQL</p>' } },
        },
      },
    };
    const out = resolveMediaTileFields(raw, false);
    expect(out?.Description?.value).toContain('From GraphQL');
  });

  it('maps root CalloutItems onto Callouts when Callouts is missing', () => {
    const raw: MediaTileFields = {
      Headline: { value: 'H' },
      CalloutItems: [{ id: 'item-1', fields: { Value: { value: '7' }, Label: { value: 'Days' } } }],
    };
    const out = resolveMediaTileFields(raw, false);
    expect(out?.Callouts?.[0]?.id).toBe('item-1');
    expect(out?.Callouts?.[0]?.fields?.Value?.value).toBe('7');
    expect(mediaTileShouldRenderEmbeddedCallout(out, false)).toBe(true);
  });

  it('hoists Callouts from data.datasource when root Callouts is missing', () => {
    const raw: MediaTileFields = {
      Headline: { value: 'H' },
      data: {
        datasource: {
          Callouts: [{ id: 'g-1', fields: { Value: { value: '42' }, Label: { value: 'Meaning' } } }],
        },
      },
    };
    const out = resolveMediaTileFields(raw, false);
    expect(out?.Callouts?.[0]?.fields?.Value?.value).toBe('42');
    expect(out?.Callouts?.[0]?.fields?.Label?.value).toBe('Meaning');
  });

  it('hoists callout children from data.datasource.children.results (GraphQL shape)', () => {
    const raw: MediaTileFields = {
      Headline: { value: 'H' },
      data: {
        datasource: {
          children: {
            results: [
              {
                id: 'child-1',
                fields: {
                  value: { jsonValue: { value: '99%' } },
                  label: { jsonValue: { value: 'Uptime' } },
                },
              },
            ],
          },
        },
      },
    };
    const out = resolveMediaTileFields(raw, false);
    expect(out?.Callouts?.[0]?.id).toBe('child-1');
    expect(out?.Callouts?.[0]?.fields?.Value?.value).toBe('99%');
    expect(out?.Callouts?.[0]?.fields?.Label?.value).toBe('Uptime');
  });
});

describe('MediaTile layout (render-based)', () => {
  it('applies viewport full-bleed on the section root', async () => {
    const ui = await Default({
      fields: {
        Headline: { value: 'H' },
        Image: {
          value: { src: 'https://example.com/a.jpg', width: 400, height: 300, alt: '' },
        },
      },
      params: baseParams,
      page: basePage,
      rendering: baseRendering,
    });
    const { container } = render(ui);
    const root = container.querySelector('section.component.media-tile');
    expect(root?.className).toContain('ml-[calc(50%-50vw)]');
    expect(root?.className).toContain('max-w-[100vw]');
  });

  it('applies sm:pl-6 on copy column when media is on the left', async () => {
    const ui = await Default({
      fields: {
        Headline: { value: 'H' },
        Image: {
          value: { src: 'https://example.com/a.jpg', width: 400, height: 300, alt: '' },
        },
      },
      params:
        {
          ...baseParams,
          MediaPosition: { Value: { value: 'Left' } },
        } as unknown as MediaTileProps['params'],
      page: basePage,
      rendering: baseRendering,
    });
    const { container } = render(ui);
    expect(container.querySelector('.sm\\:pl-6.sm\\:pr-0')).toBeTruthy();
  });

  it('orders media column after copy on the row', async () => {
    const ui = await Default({
      fields: {
        Headline: { value: 'H' },
        Image: {
          value: { src: 'https://example.com/a.jpg', width: 400, height: 300, alt: '' },
        },
      },
      params: baseParams,
      page: basePage,
      rendering: baseRendering,
    });
    const { container } = render(ui);
    expect(container.querySelector('.order-\\[9999\\]')).toBeTruthy();
  });

  it('does not double mobile gutter on card split chrome when Style is card', async () => {
    const ui = await Default({
      fields: {
        Headline: { value: 'H' },
        Image: {
          value: { src: 'https://example.com/a.jpg', width: 400, height: 300, alt: '' },
        },
      },
      params: { ...baseParams, Style: { Value: { value: 'Card' } } } as unknown as MediaTileProps['params'],
      page: basePage,
      rendering: baseRendering,
    });
    const { container } = render(ui);
    const chrome = container.querySelector('.rounded-lg.border');
    expect(chrome?.className).not.toContain('max-sm:mx-4');
  });
});

describe('MediaTile section chrome (render-based)', () => {
  it('uses live strip background and typography base for default transparent tile', async () => {
    const ui = await Default({
      fields: {
        Headline: { value: 'H' },
        Image: {
          value: { src: 'https://example.com/a.jpg', width: 400, height: 300, alt: '' },
        },
      },
      params: baseParams,
      page: basePage,
      rendering: baseRendering,
    });
    const { container } = render(ui);
    const chrome = container.querySelector('.isolate.overflow-x-clip');
    expect(chrome?.className).toContain('bg-surface-subtle');
    expect(chrome?.className).toContain('py-16');
    expect(chrome?.className).toContain('text-ink-primary');
  });

  it('uses basic white when HasWhiteBackground resolves true on default color tile', async () => {
    const ui = await Default({
      fields: {
        Headline: { value: 'H' },
        Image: {
          value: { src: 'https://example.com/a.jpg', width: 400, height: 300, alt: '' },
        },
      },
      params: {
        ...baseParams,
        HasWhiteBackground: '1',
      } as unknown as MediaTileProps['params'],
      page: basePage,
      rendering: baseRendering,
    });
    const { container } = render(ui);
    const chrome = container.querySelector('.isolate.overflow-x-clip');
    expect(chrome?.className).toContain('bg-surface');
    expect(chrome?.className).not.toContain('bg-surface-subtle');
  });
});

describe('resolveMediaTileMediaAspect', () => {
  it('uses exact 560/371.84 for default and 3:2', () => {
    expect(resolveMediaTileMediaAspect(undefined)).toEqual({
      aspectKey: 'landscape',
      frameStyle: MEDIA_TILE_LANDSCAPE_FRAME_STYLE,
    });
    expect(resolveMediaTileMediaAspect('3:2')).toEqual({
      aspectKey: 'landscape',
      frameStyle: MEDIA_TILE_LANDSCAPE_FRAME_STYLE,
    });
  });

  it('uses Tailwind aspect only for square and portrait', () => {
    expect(resolveMediaTileMediaAspect('1:1')).toEqual({
      aspectKey: 'square',
      frameStyle: null,
    });
    expect(resolveMediaTileMediaAspect('2:3')).toEqual({
      aspectKey: 'portrait',
      frameStyle: null,
    });
  });
});

describe('MediaTileMedia frame (render-based)', () => {
  it('uses responsive landscape frame classes for default ratio', async () => {
    const ui = await Default({
      fields: {
        Headline: { value: 'H' },
        Image: {
          value: { src: 'https://example.com/a.jpg', width: 400, height: 300, alt: '' },
        },
      },
      params: baseParams,
      page: basePage,
      rendering: baseRendering,
    });
    const { container } = render(ui);
    const frame = container.querySelector('.sm\\:max-lg\\:h-\\[436px\\]');
    expect(frame).toBeTruthy();
    expect(frame?.className).toContain('lg:[aspect-ratio:560/371.84]');
  });

  it('uses card md min-height when Style is card', async () => {
    const ui = await Default({
      fields: {
        Headline: { value: 'H' },
        Image: {
          value: { src: 'https://example.com/a.jpg', width: 400, height: 300, alt: '' },
        },
      },
      params: { ...baseParams, Style: { Value: { value: 'Card' } } } as unknown as MediaTileProps['params'],
      page: basePage,
      rendering: baseRendering,
    });
    const { container } = render(ui);
    const frame = container.querySelector('.sm\\:min-h-\\[506\\.667px\\]');
    expect(frame).toBeTruthy();
  });
});

describe('resolveMediaTileImageSizes', () => {
  it('uses full width when stacked and column vw from md up', () => {
    expect(resolveMediaTileImageSizes(50)).toBe('(max-width: 599px) 100vw, 50vw');
    expect(resolveMediaTileImageSizes(40)).toBe('(max-width: 599px) 100vw, 40vw');
  });
});

describe('focalPointToCssObjectPosition', () => {
  it('defaults to 50% 50%', () => {
    expect(focalPointToCssObjectPosition(undefined)).toBe('50% 50%');
    expect(focalPointToCssObjectPosition('')).toBe('50% 50%');
  });

  it('maps corner and edge focal strings', () => {
    expect(focalPointToCssObjectPosition('Top Left')).toBe('left top');
    expect(focalPointToCssObjectPosition('bottom right')).toBe('right bottom');
    expect(focalPointToCssObjectPosition('left')).toBe('left');
  });
});

describe('MediaTile media backdrop (render-based)', () => {
  it('matches section strip for default transparent tile', async () => {
    const ui = await Default({
      fields: {
        Headline: { value: 'H' },
        Image: {
          value: { src: 'https://example.com/a.jpg', width: 400, height: 300, alt: '' },
        },
      },
      params: baseParams,
      page: basePage,
      rendering: baseRendering,
    });
    const { container } = render(ui);
    const backdrop = container.querySelector('.bg-surface-subtle');
    expect(backdrop).toBeTruthy();
  });

  it('uses basic white when HasWhiteBackground is true', async () => {
    const ui = await Default({
      fields: {
        Headline: { value: 'H' },
        Image: {
          value: { src: 'https://example.com/a.jpg', width: 400, height: 300, alt: '' },
        },
      },
      params: { ...baseParams, HasWhiteBackground: '1' } as unknown as MediaTileProps['params'],
      page: basePage,
      rendering: baseRendering,
    });
    const { container } = render(ui);
    expect(container.querySelector('.bg-surface')).toBeTruthy();
  });
});

describe('resolveMediaTileHasWhiteBackground', () => {
  it('is false when the param key is omitted', () => {
    expect(resolveMediaTileHasWhiteBackground({})).toBe(false);
    expect(resolveMediaTileHasWhiteBackground({ Color: { Value: { value: 'Default' } } })).toBe(false);
  });

  it('is true for checked checkbox shapes including plain string "1" from layout JSON', () => {
    expect(resolveMediaTileHasWhiteBackground({ HasWhiteBackground: '1' })).toBe(true);
    expect(resolveMediaTileHasWhiteBackground({ hasWhiteBackground: '1' })).toBe(true);
    expect(resolveMediaTileHasWhiteBackground({ HASWHITEBACKGROUND: true })).toBe(true);
    expect(resolveMediaTileHasWhiteBackground({ HasWhiteBackground: { Value: { value: '1' } } })).toBe(
      true,
    );
  });

  it('is false when key is present but unchecked or empty', () => {
    expect(resolveMediaTileHasWhiteBackground({ HasWhiteBackground: '0' })).toBe(false);
    expect(resolveMediaTileHasWhiteBackground({ HasWhiteBackground: '' })).toBe(false);
    expect(resolveMediaTileHasWhiteBackground({ HasWhiteBackground: { Value: { value: '0' } } })).toBe(
      false,
    );
  });

  it('is reflected on resolveMediaTileLayoutConfig for merged authoring params', () => {
    expect(resolveMediaTileLayoutConfig({}).hasWhiteBackground).toBe(false);
    expect(resolveMediaTileLayoutConfig({ HasWhiteBackground: '1' }).hasWhiteBackground).toBe(true);
  });
});

describe('resolveMediaTileHeadingTag', () => {
  it('defaults to h2', () => {
    expect(resolveMediaTileHeadingTag({})).toBe('h2');
  });

  it('maps H3 param', () => {
    expect(
      resolveMediaTileHeadingTag({
        HeadingLevel: { Value: { value: 'H3' } },
      }),
    ).toBe('h3');
  });
});

describe('normalizeMediaTileThemeKey', () => {
  it('maps CMS labels to theme keys', () => {
    expect(normalizeMediaTileThemeKey(undefined)).toBe('base');
    expect(normalizeMediaTileThemeKey('')).toBe('base');
    expect(normalizeMediaTileThemeKey('Base')).toBe('base');
    expect(normalizeMediaTileThemeKey('Article')).toBe('article');
    expect(normalizeMediaTileThemeKey('article theme')).toBe('article');
    expect(normalizeMediaTileThemeKey('Compact')).toBe('compact');
    expect(normalizeMediaTileThemeKey('Landing Page')).toBe('landing');
    expect(normalizeMediaTileThemeKey('landingpage')).toBe('landing');
  });
});

describe('resolveMediaTileLayoutConfig Theme param', () => {
  it('sets article theme key from Theme param', () => {
    const layout = resolveMediaTileLayoutConfig({
      Theme: { Value: { value: 'Article' } },
    });
    expect(layout.themeKey).toBe('article');
  });

  it('sets landing theme key from Theme param', () => {
    const layout = resolveMediaTileLayoutConfig({
      Theme: { Value: { value: 'Landing Page' } },
    });
    expect(layout.themeKey).toBe('landing');
  });
});

describe('MediaTile headline and description (render-based)', () => {
  it('applies article accent headline color', async () => {
    const ui = await Default({
      fields: {
        Headline: { value: 'Article headline' },
        Image: {
          value: { src: 'https://example.com/a.jpg', width: 400, height: 300, alt: '' },
        },
      },
      params: { ...baseParams, Theme: { Value: { value: 'Article' } } } as unknown as MediaTileProps['params'],
      page: basePage,
      rendering: baseRendering,
    });
    const { container } = render(ui);
    const headline = container.querySelector('h2');
    expect(headline?.className).toContain('text-accent-cyan');
    expect(headline?.className).toContain('uppercase');
  });

  it('applies landing description size on rich text', async () => {
    const ui = await Default({
      fields: {
        Headline: { value: 'H' },
        Description: { value: '<p>Landing body</p>' },
        Image: {
          value: { src: 'https://example.com/a.jpg', width: 400, height: 300, alt: '' },
        },
      },
      params: { ...baseParams, Theme: { Value: { value: 'Landing Page' } } } as unknown as MediaTileProps['params'],
      page: basePage,
      rendering: baseRendering,
    });
    const { container } = render(ui);
    const rte = container.querySelector('.media-tile-description');
    expect(rte?.className).toContain('!text-font-big');
    expect(rte?.className).toContain(
      '!leading-[length:var(--leading-font-media-tile-description-landing)]',
    );
  });

  it('applies gray ColorScheme on description', async () => {
    const ui = await Default({
      fields: {
        Headline: { value: 'H' },
        Description: { value: '<p>Gray copy</p>' },
        Image: {
          value: { src: 'https://example.com/a.jpg', width: 400, height: 300, alt: '' },
        },
      },
      params: { ...baseParams, ColorScheme: { Value: { value: 'Gray' } } } as unknown as MediaTileProps['params'],
      page: basePage,
      rendering: baseRendering,
    });
    const { container } = render(ui);
    const rte = container.querySelector('.media-tile-description');
    expect(rte?.className).toContain('!text-ink-muted');
  });

  it('uses white headline on dark tile', async () => {
    const ui = await Default({
      fields: {
        Headline: { value: 'Dark headline' },
        Image: {
          value: { src: 'https://example.com/a.jpg', width: 400, height: 300, alt: '' },
        },
      },
      params: { ...baseParams, Color: { Value: { value: 'Dark' } } } as unknown as MediaTileProps['params'],
      page: basePage,
      rendering: baseRendering,
    });
    const { container } = render(ui);
    expect(container.querySelector('h2')?.className).toContain('text-ink-inverse');
  });
});

describe('isMediaTileColorScheme helpers', () => {
  it('detects gray and dark scheme labels', () => {
    expect(isMediaTileGrayColorScheme('Gray')).toBe(true);
    expect(isMediaTileDarkColorScheme('Dark band')).toBe(true);
    expect(isMediaTileGrayColorScheme('Light')).toBe(false);
  });
});

describe('resolveMediaTileLayoutConfig ColorScheme param', () => {
  it('stores colorSchemeRaw from CMS', () => {
    const layout = resolveMediaTileLayoutConfig({
      ColorScheme: { Value: { value: 'Gray' } },
    });
    expect(layout.colorSchemeRaw).toBe('Gray');
  });

  it('uses dark surface when Color is Dark', () => {
    const layout = resolveMediaTileLayoutConfig({
      Color: { Value: { value: 'Dark' } },
      ColorScheme: { Value: { value: 'Dark' } },
    });
    expect(layout.surfaceColor).toBe('dark');
    expect(layout.colorSchemeRaw).toBe('Dark');
  });
});

describe('omitColorSchemeParamForEmbeddedCallout', () => {
  it('removes ColorScheme so embedded Callout uses default light stat colors', () => {
    const stripped = omitColorSchemeParamForEmbeddedCallout({
      ColorScheme: { Value: { value: 'Dark' } },
      Theme: { Value: { value: 'Base' } },
    });
    expect(stripped.ColorScheme).toBeUndefined();
    expect(stripped.Theme).toBeDefined();
  });
});

describe('mergeMediaTileRenderingParams', () => {
  it('fills ColorScheme from rendering.params when placeholder params are partial', () => {
    const merged = mergeMediaTileRenderingParams(
      { params: { ColorScheme: { Value: { value: 'Gray' } } } },
      { styles: '', RenderingIdentifier: 'x' } as Record<string, unknown>,
    );
    const layout = resolveMediaTileLayoutConfig(merged);
    expect(layout.colorSchemeRaw).toBe('Gray');
  });

  it('lets props params override rendering.params on key collisions', () => {
    const merged = mergeMediaTileRenderingParams(
      { params: { ColorScheme: { Value: { value: 'Gray' } } } },
      { ColorScheme: { Value: { value: 'Light' } } },
    );
    expect(resolveMediaTileLayoutConfig(merged).colorSchemeRaw).toBe('Light');
  });

  it('does not let undefined props erase Callout* keys that only exist on rendering.params', () => {
    const layout = mergeMediaTileRenderingParams(
      {
        params: {
          CalloutDirection: { Value: { value: 'Column' } },
          CalloutStyle: { Value: { value: 'Text' } },
        },
      },
      {
        styles: '',
        RenderingIdentifier: 'x',
        CalloutDirection: undefined,
        CalloutStyle: undefined,
      } as Record<string, unknown>,
    );
    const stripped = omitColorSchemeParamForEmbeddedCallout(
      mergeMediaTileButtonAlignmentIntoCalloutParams(layout, undefined),
    );
    const out = mapMediaTilePrefixedCalloutParamsForEmbeddedCallout(stripped, layout);
    expect((out.Direction as { Value?: { value?: string } }).Value?.value).toBe('Column');
    expect((out.Style as { Value?: { value?: string } }).Value?.value).toBe('Text');
  });

  it('merges rendering.parameters when params omits Callout droplists', () => {
    const layout = mergeMediaTileRenderingParams(
      {
        parameters: {
          CalloutTextSize: { Value: { value: 'SM' } },
        },
      },
      { styles: '', RenderingIdentifier: 'x' } as Record<string, unknown>,
    );
    const stripped = omitColorSchemeParamForEmbeddedCallout(
      mergeMediaTileButtonAlignmentIntoCalloutParams(layout, undefined),
    );
    const out = mapMediaTilePrefixedCalloutParamsForEmbeddedCallout(stripped, layout);
    expect((out.TextSize as { Value?: { value?: string } }).Value?.value).toBe('SM');
  });
});
