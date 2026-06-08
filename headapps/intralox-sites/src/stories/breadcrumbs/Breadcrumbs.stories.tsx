import type { Meta, StoryObj } from '@storybook/react';

import { Default as BreadcrumbsDefault } from 'components/breadcrumbs/Breadcrumbs';
import type { IBreadcrumbsFields } from 'components/breadcrumbs/Breadcrumbs.type';
import React from 'react';
import { createMockParams } from 'src/storybook/mockParams';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

const trailFields: IBreadcrumbsFields = {
  data: {
    currentPage: {
      Title: { data: { value: 'Current Page' } },
      BreadcrumbData: [
        {
          Title: { data: { value: 'Parent' } },
          Link: { url: '/parent' },
          IsPageSearchable: { value: true },
        },
      ],
    },
  },
};

const emptyTrail: IBreadcrumbsFields = {
  data: {
    currentPage: {
      Title: { data: { value: 'Orphan page' } },
      BreadcrumbData: [],
    },
  },
};

type BreadcrumbsProps = React.ComponentProps<typeof BreadcrumbsDefault>;

const datasetOrder = ['default', 'noAncestors'] as const;

type BreadcrumbsStoryControls = {
  border: boolean;
  colorScheme: 'dark' | 'light';
  contrast: boolean;
  textAlign: 'left' | 'center';
};

type BreadcrumbsStoryArgs = BreadcrumbsProps &
  BreadcrumbsStoryControls & {
    [STORY_DATASET]?: (typeof datasetOrder)[number];
  };

const storyDatasets = {
  default: {
    fields: trailFields,
    params: createMockParams({ RenderingIdentifier: 'breadcrumbs-1', styles: '' }),
  },
  noAncestors: {
    fields: emptyTrail,
    params: createMockParams({ RenderingIdentifier: 'breadcrumbs-empty', styles: '' }),
  },
} satisfies Record<string, Partial<BreadcrumbsProps>>;

const defaultDisplayControls: BreadcrumbsStoryControls = {
  border: false,
  colorScheme: 'light',
  contrast: false,
  textAlign: 'left',
};

function applyBreadcrumbsDisplayParams<P extends Record<string, unknown>>(
  baseParams: P,
  controls: BreadcrumbsStoryControls,
): P {
  return {
    ...baseParams,
    HasBorder: controls.border ? '1' : '',
    HasContrast: controls.contrast,
    ColorScheme: { Value: { value: controls.colorScheme } },
    TextAlign: { Value: { value: controls.textAlign } },
  } as P;
}

const meta = {
  title: 'XM / Breadcrumbs',
  component: BreadcrumbsDefault,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'default',
    ...defaultDisplayControls,
    ...storyDatasets.default,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
    border: {
      name: 'Border',
      description: 'Rendering param `HasBorder`: left accent bar when **true**.',
      control: 'boolean',
    },
    colorScheme: {
      name: 'Color scheme',
      description: 'Rendering param `ColorScheme`: accent bar token when border is enabled.',
      control: 'inline-radio',
      options: ['dark', 'light'],
    },
    contrast: {
      name: 'Contrast',
      description: 'Rendering param `HasContrast`: high-contrast (inverted) trail styling.',
      control: 'boolean',
    },
    textAlign: {
      name: 'Text align',
      description: 'Rendering param `TextAlign`: flex alignment of the trail.',
      control: 'inline-radio',
      options: ['left', 'center'],
    },
    fields: { table: { disable: true } },
    params: { table: { disable: true } },
  },
  render: (args) => {
    const merged = mergeStoryDataset(
      args as BreadcrumbsStoryArgs,
      storyDatasets as Record<string, Partial<BreadcrumbsStoryArgs>>,
      'default',
    );
    const { border, colorScheme, contrast, textAlign, fields, params } =
      merged as BreadcrumbsStoryArgs;
    return (
      <BreadcrumbsDefault
        fields={fields}
        params={applyBreadcrumbsDisplayParams(params as Record<string, unknown>, {
          border,
          colorScheme,
          contrast,
          textAlign,
        })}
      />
    );
  },
} satisfies Meta<BreadcrumbsStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'default',
    ...defaultDisplayControls,
  },
};

export const NoAncestors: Story = {
  name: 'Trail: No ancestors',
  args: {
    [STORY_DATASET]: 'noAncestors',
    ...defaultDisplayControls,
  },
};
