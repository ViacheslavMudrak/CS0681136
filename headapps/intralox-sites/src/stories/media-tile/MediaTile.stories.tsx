import React, { type ReactNode } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { CalloutStoryPreview } from 'src/storybook/async-roots/CalloutStoryPreview';
import type { MediaTileFields } from 'components/media-tile/MediaTile.type';
import { MediaTileStoryPreview } from 'src/storybook/async-roots/MediaTileStoryPreview';
import { storyCalloutLabels } from 'src/storybook/storyLabels';
import { createMockPage } from 'src/storybook/mockPage';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { storybookImage1, storybookImage2 } from 'src/storybook/storybookImageAssets';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

const tileFieldsImage: MediaTileFields = {
  Eyebrow: { value: 'Featured' },
  Headline: { value: 'Modular plastic belting for food processing lines' },
  Description: {
    value:
      '<p>Designed for hygiene, throughput, and fast service access in demanding production environments.</p>',
  },
  MediaType: { fields: { Value: { value: 'Image' } } },
  Image: {
    value: {
      src: storybookImage1,
      width: 800,
      height: 600,
      alt: 'Sample production environment',
    },
  },
};

const tileFieldsVideo: MediaTileFields = {
  ...tileFieldsImage,
  MediaType: { fields: { Value: { value: 'Video' } } },
  Image: { value: { src: '', width: 0, height: 0, alt: '' } },
  Video: {
    fields: {
      BrightcoveId: { value: 'story-bc-placeholder' },
      Autoplay: { value: false },
      Loop: { value: false },
      Caption: { value: '' },
      CoverImage: {
        value: {
          src: storybookImage2,
          width: 800,
          height: 450,
          alt: 'Video poster',
        },
      },
      Title: { value: 'Storybook sample video' },
    },
  },
};

const tileFieldsWithLinks: MediaTileFields = {
  ...tileFieldsImage,
  Links: [
    {
      id: 'link-1',
      fields: {
        Link: {
          value: { href: '/contact', text: 'Contact sales', linktype: 'internal' },
        },
        Style: { fields: { Value: { value: 'Primary' } } },
      },
    },
    {
      id: 'link-2',
      fields: {
        Link: {
          value: { href: '/docs', text: 'Technical library', linktype: 'internal' },
        },
        Style: { fields: { Value: { value: 'Secondary' } } },
      },
    },
  ],
};

function storyArgs(overrides: {
  fields?: MediaTileFields;
  isEditing?: boolean;
  embeddedCallout?: ReactNode | null;
} = {}) {
  return {
    rendering: createMockRendering({ componentName: 'MediaTile', uid: 'story-mt' }),
    page: createMockPage({ isEditing: overrides.isEditing ?? false }),
    params: createMockParams({
      RenderingIdentifier: 'media-tile-story',
      styles: '',
    }),
    fields: overrides.fields ?? tileFieldsImage,
    embeddedCallout: overrides.embeddedCallout ?? null,
  };
}

/** Controls-only props (not forwarded to {@link MediaTileStoryPreview}). */
type MediaTileStoryKnobs = {
  /** Sitecore `Style` — card chrome vs flush tile (`resolveTileSurfaceClasses`). */
  style: 'card' | 'default';
  /**
   * Tile surface + description alignment — maps to `Color` (gray/dark band) and `ColorScheme` (RTE),
   * same tokens as CMS (see {@link components/media-tile/mediaTileUtils}).
   */
  colorScheme: 'light' | 'gray' | 'dark';
  /** Sitecore `Theme` — headline/body tokens (`normalizeMediaTileThemeKey`). */
  theme: 'base' | 'article' | 'compact' | 'landingPage';
  /** Sitecore `MediaPosition` — split column order. */
  mediaPosition: 'left' | 'right';
  /** Sitecore `MediaRatio` — passed as `1:1`, `3:2` / `0.666`, `2:3` / `1.5`. */
  mediaRatio: 1 | 0.666 | 1.5;
  /** Sitecore `StretchMedia` checkbox — forwarded on params (parity with CMS; wire in layout when supported). */
  stretchMedia: boolean;
  /** Sitecore `MediaWidth` — `n40` → 40% media column, `n50` → 50%. */
  mediaWidth: 'n40' | 'n50';
  /** Image rail vs Brightcove video rail. */
  mediaSource: 'image' | 'video' | 'imageWithLinks';
  /** Visitor site vs XM Pages editing chrome. */
  authorExperience: 'visitor' | 'editing';
  /** Optional embedded callout block under the split (in addition to per-story `embeddedCallout`). */
  callout: 'none' | 'embedded';
};

export type MediaTileStoryArgs = React.ComponentProps<typeof MediaTileStoryPreview> & MediaTileStoryKnobs;

const defaultKnobs: MediaTileStoryKnobs = {
  style: 'default',
  colorScheme: 'light',
  theme: 'base',
  mediaPosition: 'left',
  mediaRatio: 0.666,
  stretchMedia: false,
  mediaWidth: 'n50',
  mediaSource: 'image',
  authorExperience: 'visitor',
  callout: 'none',
};

function sitecoreDroplist(value: string): { Value: { value: string } } {
  return { Value: { value: value } };
}

/** Maps tile/RTE color tokens to `Color` + `ColorScheme` (see `resolveTileSurfaceClasses` / description helpers). */
function paramsForTileColorScheme(cs: MediaTileStoryKnobs['colorScheme']): Record<string, unknown> {
  const schemeTitle = cs === 'light' ? 'Light' : cs === 'gray' ? 'Gray' : 'Dark';
  const base: Record<string, unknown> = {
    ColorScheme: sitecoreDroplist(schemeTitle),
  };
  if (cs === 'light') {
    return base;
  }
  return { ...base, Color: sitecoreDroplist(schemeTitle) };
}

function themeParamLabel(t: MediaTileStoryKnobs['theme']): string {
  switch (t) {
    case 'base':
      return 'Base';
    case 'article':
      return 'Article';
    case 'compact':
      return 'Compact';
    case 'landingPage':
      return 'Landing Page';
    default:
      return 'Base';
  }
}

function mediaRatioSitecoreValue(r: MediaTileStoryKnobs['mediaRatio']): string {
  if (r === 1) return '1:1';
  if (r === 0.666) return '3:2';
  return '2:3';
}

const embeddedCalloutNode = (
  <CalloutStoryPreview
    embeddedLayout
    labels={storyCalloutLabels}
    rendering={createMockRendering({ componentName: 'Callout', uid: 'story-mt-co' })}
    page={createMockPage({ isEditing: false })}
    params={createMockParams({ RenderingIdentifier: 'media-tile-embedded-callout', styles: '' })}
    fields={{
      Callouts: [
        {
          id: 'emb-1',
          fields: { Value: { value: '24/7' }, Label: { value: 'Support coverage' } },
        },
      ],
    }}
  />
);

const storyDatasets = {
  default: {
    ...defaultKnobs,
    ...storyArgs(),
  },
  withEmbeddedCallout: {
    ...defaultKnobs,
    ...storyArgs({ embeddedCallout: embeddedCalloutNode }),
    callout: 'embedded' as const,
  },
  editing: {
    ...defaultKnobs,
    mediaSource: 'image' as const,
    authorExperience: 'editing' as const,
    ...storyArgs({
      isEditing: true,
      fields: {
        ...tileFieldsImage,
        Headline: { value: '' },
        Image: { value: { src: '', width: 0, height: 0, alt: '' } },
      },
    }),
  },
  fullWithLinksVariant: {
    ...defaultKnobs,
    mediaSource: 'imageWithLinks' as const,
    ...storyArgs({ fields: tileFieldsWithLinks }),
  },
} satisfies Record<string, Partial<MediaTileStoryArgs>>;

const datasetOrder = ['default', 'withEmbeddedCallout', 'editing', 'fullWithLinksVariant'] as const;

function fieldsForSource(source: MediaTileStoryKnobs['mediaSource'], base: MediaTileFields): MediaTileFields {
  if (source === 'video') {
    return { ...tileFieldsVideo, Headline: base.Headline, Eyebrow: base.Eyebrow, Description: base.Description };
  }
  if (source === 'imageWithLinks') {
    return { ...tileFieldsWithLinks, Headline: base.Headline, Eyebrow: base.Eyebrow, Description: base.Description };
  }
  return { ...tileFieldsImage, Headline: base.Headline, Eyebrow: base.Eyebrow, Description: base.Description };
}

function renderMediaTile(args: MediaTileStoryArgs) {
  const {
    style,
    colorScheme,
    theme,
    mediaPosition,
    mediaRatio,
    stretchMedia,
    mediaWidth,
    mediaSource,
    authorExperience,
    callout,
    fields: incomingFields,
    params: incomingParams,
    rendering,
    embeddedCallout: incomingEmbedded,
    labels,
  } = args;

  const baseFields = incomingFields ?? tileFieldsImage;
  const fields =
    incomingFields === undefined ? undefined : fieldsForSource(mediaSource, baseFields);

  const params = createMockParams({
    ...(incomingParams as Record<string, unknown>),
    MediaPosition: mediaPosition === 'left' ? 'left' : 'right',
    Style: sitecoreDroplist(style === 'card' ? 'Card' : 'Default'),
    Theme: sitecoreDroplist(themeParamLabel(theme)),
    MediaRatio: sitecoreDroplist(mediaRatioSitecoreValue(mediaRatio)),
    MediaWidth: sitecoreDroplist(mediaWidth === 'n40' ? '40%' : '50%'),
    StretchMedia: sitecoreDroplist(stretchMedia ? '1' : '0'),
    ...paramsForTileColorScheme(colorScheme),
  });

  const page = createMockPage({
    isEditing: authorExperience === 'editing',
  });

  const defaultEmbeddedCallout = (
    <CalloutStoryPreview
      embeddedLayout
      labels={storyCalloutLabels}
      rendering={createMockRendering({ componentName: 'Callout', uid: 'story-mt-co' })}
      page={createMockPage({ isEditing: false })}
      params={createMockParams({ RenderingIdentifier: 'media-tile-embedded-callout', styles: '' })}
      fields={{
        Callouts: [
          {
            id: 'emb-1',
            fields: { Value: { value: '24/7' }, Label: { value: 'Support coverage' } },
          },
        ],
      }}
    />
  );

  const embeddedCallout: ReactNode | null =
    callout === 'embedded' ? (incomingEmbedded ?? defaultEmbeddedCallout) : null;

  return (
    <MediaTileStoryPreview
      fields={fields}
      params={params}
      page={page}
      rendering={rendering}
      labels={labels}
      embeddedCallout={embeddedCallout}
    />
  );
}

const meta = {
  title: 'XM / Media Tile',
  component: MediaTileStoryPreview,
  args: {
    [STORY_DATASET]: 'default',
    ...storyDatasets.default,
  },
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
    style: {
      control: 'inline-radio',
      options: ['card', 'default'],
      description: 'Sitecore **Style** — card chrome vs default flush tile.',
    },
    colorScheme: {
      control: 'inline-radio',
      options: ['light', 'gray', 'dark'],
      description:
        '**Color** (gray/dark tile band) + **ColorScheme** (description RTE) — Light uses default strip + RTE Light; Gray/Dark set both.',
    },
    theme: {
      control: 'inline-radio',
      options: ['base', 'article', 'compact', 'landingPage'],
      description: 'Sitecore **Theme** — Base / Article / Compact / Landing Page.',
    },
    mediaPosition: {
      control: 'inline-radio',
      options: ['left', 'right'],
      description: 'Sitecore **Media Position** (split column order).',
    },
    mediaRatio: {
      control: 'inline-radio',
      options: [1, 0.666, 1.5],
      description: 'Sitecore **Media Ratio** — `1:1`, `3:2` (~0.666), `2:3` (1.5).',
    },
    stretchMedia: {
      control: 'inline-radio',
      options: [false, true],
      description:
        'Sitecore **StretchMedia** on params (`1`/`0`). Forwarded for CMS parity; layout hook-up may follow.',
    },
    mediaWidth: {
      control: 'inline-radio',
      options: ['n40', 'n50'],
      description: 'Sitecore **Media Width** — 40% vs 50% media column (`includes("40")`).',
    },
    mediaSource: {
      control: 'inline-radio',
      options: ['image', 'video', 'imageWithLinks'],
      description: 'Datasource **Media type** plus optional **Links** list.',
    },
    authorExperience: {
      control: 'inline-radio',
      options: ['visitor', 'editing'],
      description: '**Preview** vs **Pages** editing (`page.mode.isEditing`).',
    },
    callout: {
      control: 'inline-radio',
      options: ['none', 'embedded'],
      description: 'Adds embedded **Callout** under the split (unless a story supplies its own node).',
    },
    fields: { table: { disable: true } },
    params: { table: { disable: true } },
    page: { table: { disable: true } },
    rendering: { table: { disable: true } },
    embeddedCallout: { table: { disable: true } },
    labels: { table: { disable: true } },
  },
  render: (args) =>
    renderMediaTile(
      mergeStoryDataset(
        args as MediaTileStoryArgs & { storyDataset?: string },
        storyDatasets as Record<string, Partial<MediaTileStoryArgs & { storyDataset?: string }>>,
        'default',
      ) as MediaTileStoryArgs,
    ),
} satisfies Meta<MediaTileStoryArgs & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Use **Controls** to exercise style, color scheme, theme, media layout, datasource variant, editing, and embedded callout. */
export const Default: Story = {
  args: {
    [STORY_DATASET]: 'default',
  },
};

export const WithEmbeddedCallout: Story = {
  name: 'Callout: Embedded',
  args: {
    [STORY_DATASET]: 'withEmbeddedCallout',
  },
};

export const Editing: Story = {
  name: 'Mode: Editing',
  args: {
    [STORY_DATASET]: 'editing',
  },
};

export const FullWithLinksVariant: Story = {
  name: 'CTA links: Full tile',
  args: {
    [STORY_DATASET]: 'fullWithLinksVariant',
  },
};
