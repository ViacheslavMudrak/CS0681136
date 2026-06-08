import type { Meta, StoryObj } from '@storybook/react';
import type { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

import { Default as PromoDefault, WithText as PromoWithText } from 'components/promo/Promo';
import { createMockPage } from 'src/storybook/mockPage';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { storybookImage3 } from 'src/storybook/storybookImageAssets';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

const promoIcon: ImageField = {
  value: {
    src: storybookImage3,
    width: 120,
    height: 120,
    alt: 'Promo icon',
  },
};

const promoFields = {
  PromoIcon: promoIcon,
  PromoText: { value: '<p>Primary <strong>promo</strong> copy.</p>' } as Field<string>,
  PromoLink: { value: { href: '/learn-more', text: 'Learn more' } } as LinkField,
  PromoText2: { value: '<p>Secondary line.</p>' } as Field<string>,
};

type PromoProps = React.ComponentProps<typeof PromoDefault>;

const storyDatasets = {
  default: {
    rendering: createMockRendering({ componentName: 'Promo', uid: 'story-promo' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({ RenderingIdentifier: 'promo-1', styles: '' }),
    fields: promoFields,
  },
  withSecondaryRichText: {
    rendering: createMockRendering({ componentName: 'Promo', uid: 'story-promo-wt' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({ RenderingIdentifier: 'promo-wt', styles: '' }),
    fields: promoFields,
  },
  fullPromoAlternateId: {
    rendering: createMockRendering({ componentName: 'Promo', uid: 'story-promo-empty' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({ RenderingIdentifier: 'promo-full-alt', styles: '' }),
    fields: promoFields,
  },
  editing: {
    rendering: createMockRendering({ componentName: 'Promo', uid: 'story-promo-ed' }),
    page: createMockPage({ isEditing: true }),
    params: createMockParams({ RenderingIdentifier: 'promo-ed', styles: '' }),
    fields: promoFields,
  },
} satisfies Record<string, Partial<PromoProps>>;

const datasetOrder = ['default', 'withSecondaryRichText', 'fullPromoAlternateId', 'editing'] as const;

const meta = {
  title: 'XM / Promo',
  component: PromoDefault,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'default',
    ...storyDatasets.default,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
    fields: { table: { disable: true } },
  },
  render: (args) => {
    const key = (args as Record<string, unknown>)[STORY_DATASET] ?? 'default';
    const merged = mergeStoryDataset(
      args as PromoProps & { storyDataset?: string },
      storyDatasets as Record<string, Partial<PromoProps & { storyDataset?: string }>>,
      'default',
    );
    if (key === 'withSecondaryRichText') {
      return <PromoWithText {...merged} />;
    }
    return <PromoDefault {...merged} />;
  },
} satisfies Meta<PromoProps & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'default',
  },
};

export const WithSecondaryRichText: Story = {
  name: 'Variant: With secondary rich text',
  args: {
    [STORY_DATASET]: 'withSecondaryRichText',
  },
};

export const FullPromoSecondInstance: Story = {
  name: 'Full fields (second rendering id)',
  args: {
    [STORY_DATASET]: 'fullPromoAlternateId',
  },
};

export const Editing: Story = {
  name: 'Mode: Editing',
  args: {
    [STORY_DATASET]: 'editing',
  },
};
