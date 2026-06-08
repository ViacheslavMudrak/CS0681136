import type { Meta, StoryObj } from '@storybook/react';

import { Default as DividerDefault } from 'components/divider/Divider';
import type { DividerProps } from 'components/divider/Divider.type';
import React from 'react';
import { createMockPage } from 'src/storybook/mockPage';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

function dividerStoryProps(overrides: Partial<DividerProps> = {}): DividerProps {
  const base: DividerProps = {
    rendering: createMockRendering({ componentName: 'Divider', uid: 'story-divider-uid' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({
      RenderingIdentifier: 'divider-reference',
      ShowDivider: '1',
      styles: '',
    }),
    fields: {
      Style: { value: 'line' },
      Spacing: { value: 'default' },
      ShowDivider: { value: true },
    },
  };
  return {
    ...base,
    ...overrides,
    params: { ...base.params, ...overrides.params },
    page: {
      ...base.page,
      ...overrides.page,
      mode: { ...base.page.mode, ...overrides.page?.mode },
    },
    rendering: { ...base.rendering, ...overrides.rendering } as DividerProps['rendering'],
    fields: overrides.fields !== undefined ? overrides.fields : base.fields,
  };
}

const storyDatasets = {
  default: dividerStoryProps(),
  editing: dividerStoryProps({
    page: createMockPage({ isEditing: true }),
    fields: {
      Style: { value: 'spacing' },
      Spacing: { value: 'default' },
      ShowDivider: { value: true },
    },
    params: createMockParams({
      RenderingIdentifier: 'divider-reference',
      ShowDivider: '1',
      styles: 'bg-surface',
    }),
  }),
  spacingOnly: dividerStoryProps({
    fields: {
      Style: { value: 'spacing' },
      Spacing: { value: 'small' },
      ShowDivider: { value: true },
    },
    params: createMockParams({
      RenderingIdentifier: 'divider-spacing',
      ShowDivider: '1',
      styles: '',
    }),
  }),
  paramHiddenEditing: dividerStoryProps({
    page: createMockPage({ isEditing: true }),
    fields: {
      Style: { value: 'line' },
      Spacing: { value: 'default' },
      ShowDivider: { value: true },
    },
    params: createMockParams({
      RenderingIdentifier: 'divider-param-off',
      ShowDivider: '0',
      styles: '',
    }),
  }),
} satisfies Record<string, DividerProps>;

const datasetOrder = ['default', 'editing', 'spacingOnly', 'paramHiddenEditing'] as const;

type DividerStorySpacing = 'base' | 'small';
type DividerStoryStyle = 'line' | 'spacing';

type DividerStoryArgs = DividerProps & {
  storyDataset?: (typeof datasetOrder)[number];
  /** Maps to datasource Spacing: base → default (48px), small → small (24px). Ignored when no top spacing is on. */
  spacing?: DividerStorySpacing;
  /** When true, Spacing uses Sitecore value `no top spacing` (48px bottom only). */
  noTopSpacing?: boolean;
  /** Maps to datasource Style: line (rule) or spacing (strip only). */
  style?: DividerStoryStyle;
};

function spacingValueForStory(spacing: DividerStorySpacing, noTopSpacing: boolean): string {
  if (noTopSpacing) return 'no top spacing';
  return spacing === 'base' ? 'default' : 'small';
}

function applyDividerStoryFieldControls(
  props: DividerProps,
  controls: { spacing: DividerStorySpacing; noTopSpacing: boolean; style: DividerStoryStyle },
): DividerProps {
  const prev = (props.fields ?? {}) as {
    Style?: { value?: string };
    Spacing?: { value?: string };
    ShowDivider?: { value?: boolean | string };
  };
  return {
    ...props,
    fields: {
      ...prev,
      Style: { value: controls.style },
      Spacing: { value: spacingValueForStory(controls.spacing, controls.noTopSpacing) },
      ShowDivider: prev.ShowDivider ?? { value: true },
    },
  };
}

const meta = {
  title: 'XM / Divider',
  component: DividerDefault,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'default',
    spacing: 'base' satisfies DividerStorySpacing,
    noTopSpacing: false,
    style: 'line' satisfies DividerStoryStyle,
    ...storyDatasets.default,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
    spacing: {
      name: 'Spacing',
      control: 'inline-radio',
      options: ['base', 'small'] satisfies DividerStorySpacing[],
    },
    noTopSpacing: {
      name: 'No top spacing',
      control: 'boolean',
    },
    style: {
      name: 'Style',
      control: 'inline-radio',
      options: ['line', 'spacing'] satisfies DividerStoryStyle[],
    },
    fields: { table: { disable: true } },
    rendering: { table: { disable: true } },
    page: { table: { disable: true } },
    params: { table: { disable: true } },
  },
  render: (args) => {
    const {
      spacing = 'base',
      noTopSpacing = false,
      style = 'line',
      ...mergeInput
    } = args as DividerStoryArgs;
    const merged = mergeStoryDataset(
      mergeInput as DividerProps & { storyDataset?: string },
      storyDatasets as Record<string, Partial<DividerProps & { storyDataset?: string }>>,
      'default',
    );
    return (
      <DividerDefault
        {...applyDividerStoryFieldControls(merged, { spacing, noTopSpacing, style })}
      />
    );
  },
} satisfies Meta<DividerStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Happy path — visitors see the rule; wrapper uses `component` + `component-content`. */
export const Default: Story = {
  args: {
    [STORY_DATASET]: 'default',
  },
};

/** Authors see chrome when datasource would hide the rule for visitors. */
export const Editing: Story = {
  name: 'Mode: Editing',
  args: {
    [STORY_DATASET]: 'editing',
  },
};

/** Spacing-only strip (no `hr`) for visitors when style is `spacing`. */
export const SpacingOnly: Story = {
  name: 'Style: Spacing only',
  args: {
    [STORY_DATASET]: 'spacingOnly',
  },
};

/** Rendering param `ShowDivider` off — visitors see nothing; authors still see hidden hint in editing. */
export const ParamHiddenEditing: Story = {
  name: 'Param: Hidden, Mode: Editing',
  args: {
    [STORY_DATASET]: 'paramHiddenEditing',
  },
};
