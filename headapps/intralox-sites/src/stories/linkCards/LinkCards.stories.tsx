import React, { type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Default as LinkCardsDefault } from 'components/linkCards/LinkCards';
import type { ILinkCardsFields } from 'components/linkCards/LinkCards.type';
import { createMockParams } from 'src/storybook/mockParams';
import { storybookImage1, storybookImage2, storybookImage3 } from 'src/storybook/storybookImageAssets';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

type LinkCardsProps = ComponentProps<typeof LinkCardsDefault>;

/** Controls-only — mapped in `render` to `params.CardSize` and `fields.TileCount`. */
type LinkCardsStoryKnobs = {
  size: 'base' | 'compact';
  columns: 2 | 3 | 4 | 5;
};

type LinkCardsStoryArgs = LinkCardsProps & LinkCardsStoryKnobs;

const defaultKnobs: LinkCardsStoryKnobs = {
  size: 'compact',
  columns: 3,
};

const card = {
  fields: {
    ColorScheme: { fields: { Value: { value: 'light' } } },
    Heading: { value: 'Card title' },
    Description: { value: '<p>Card body.</p>' },
    FocalPoint: { fields: { Value: { value: 'center' } } },
    Image: { value: { src: storybookImage1, width: 200, height: 200, alt: '' } },
    Link: { value: { href: '/', text: 'Go' } },
  },
};

const fieldsOne: ILinkCardsFields = {
  Cards: [card],
  TileCount: { fields: { Value: { value: '3' } } },
};

const fieldsThree: ILinkCardsFields = {
  Cards: [
    card,
    {
      ...card,
      fields: {
        ...card.fields,
        Heading: { value: 'Second card' },
        Image: {
          value: { src: storybookImage2, width: 200, height: 200, alt: '' },
        },
      },
    },
    {
      ...card,
      fields: {
        ...card.fields,
        Heading: { value: 'Third card' },
        Image: {
          value: { src: storybookImage3, width: 200, height: 200, alt: '' },
        },
      },
    },
  ],
  TileCount: { fields: { Value: { value: '3' } } },
};

const baseParams = createMockParams({
  RenderingIdentifier: 'link-cards-1',
  styles: '',
  CardSize: { Value: { value: 'Compact' } },
  ColorScheme: { Value: { value: 'Dark' } },
}) as LinkCardsProps['params'];

const storyDatasets = {
  default: {
    ...defaultKnobs,
    fields: fieldsOne,
    params: baseParams,
  },
  threeCards: {
    ...defaultKnobs,
    fields: fieldsThree,
    params: createMockParams({
      RenderingIdentifier: 'link-cards-3',
      styles: '',
      CardSize: { Value: { value: 'Compact' } },
      ColorScheme: { Value: { value: 'Dark' } },
    }) as LinkCardsProps['params'],
  },
} satisfies Record<string, Partial<LinkCardsStoryArgs>>;

const datasetOrder = ['default', 'threeCards'] as const;

const meta = {
  title: 'XM / Link Cards',
  component: LinkCardsDefault,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'default',
    ...storyDatasets.default,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
    size: {
      name: 'Size',
      control: 'inline-radio',
      options: ['base', 'compact'],
      description: 'Rendering param **Card size** (`params.CardSize`) — `Base` vs `Compact` in Sitecore.',
    },
    columns: {
      name: 'Columns',
      control: 'inline-radio',
      options: [2, 3, 4, 5],
      description: 'Datasource **Tile count** — column layout (`fields.TileCount`).',
    },
    fields: { table: { disable: true } },
    params: { table: { disable: true } },
  },
  render: (args) => {
    const merged = mergeStoryDataset(
      args as LinkCardsStoryArgs & { storyDataset?: string },
      storyDatasets as Record<string, Partial<LinkCardsStoryArgs & { storyDataset?: string }>>,
      'default',
    );
    const { size, columns, fields, params, ...rest } = merged;
    const cardSizeValue = size === 'compact' ? 'Compact' : 'Base';
    return (
      <LinkCardsDefault
        {...rest}
        params={{
          ...params,
          CardSize: { Value: { value: cardSizeValue } },
        }}
        fields={{
          ...fields,
          TileCount: {
            fields: { Value: { value: String(columns) } },
          },
        }}
      />
    );
  },
} satisfies Meta<LinkCardsStoryArgs & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'default',
  },
};

export const ThreeCards: Story = {
  name: 'Cards: Three',
  args: {
    [STORY_DATASET]: 'threeCards',
  },
};
