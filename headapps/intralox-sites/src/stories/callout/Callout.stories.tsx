import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import type {
  CalloutColorScheme,
  CalloutDirection,
  CalloutFields,
  CalloutStyle,
  CalloutTextAlignment,
  CalloutTitleSize,
} from 'components/callout/Callout.type';
import { CalloutStoryPreview } from 'src/storybook/async-roots/CalloutStoryPreview';
import { storyCalloutLabels } from 'src/storybook/storyLabels';
import { createMockPage } from 'src/storybook/mockPage';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

const statFields: CalloutFields = {
  Heading: { value: 'By the numbers' },
  Callouts: [
    {
      id: 'co-1',
      fields: {
        Value: { value: '99%' },
        Label: { value: 'Uptime target' },
      },
    },
    {
      id: 'co-2',
      fields: {
        Value: { value: '120+' },
        Label: { value: 'Countries served' },
      },
    },
  ],
  Footnote: { value: '*Representative figures for illustration.' },
  Link: {
    value: { href: '/contact', text: 'Talk to an expert', linktype: 'internal' },
  },
};

function storyArgs(overrides: {
  fields?: CalloutFields;
  isEditing?: boolean;
} = {}) {
  return {
    rendering: createMockRendering({ componentName: 'Callout', uid: 'story-callout' }),
    page: createMockPage({ isEditing: overrides.isEditing ?? false }),
    params: createMockParams({
      RenderingIdentifier: 'callout-story',
      styles: '',
    }),
    fields: overrides.fields ?? statFields,
    labels: storyCalloutLabels,
    embeddedLayout: false,
    contentSwitcherLayout: false,
    textAsideAsideLayout: false,
  };
}

type CalloutStoryProps = ComponentProps<typeof CalloutStoryPreview>;

const storyDatasets = {
  default: storyArgs(),
  editing: storyArgs({
    isEditing: true,
    fields: {
      ...statFields,
      Callouts: [
        {
          id: 'co-edit',
          fields: {
            Value: { value: '' },
            Label: { value: '' },
          },
        },
      ],
    },
  }),
  fullFieldsSecondInstance: storyArgs({
    fields: {
      ...statFields,
      Heading: { value: 'Snapshot metrics' },
    },
  }),
} satisfies Record<string, CalloutStoryProps>;

const datasetOrder = ['default', 'editing', 'fullFieldsSecondInstance'] as const;

type CalloutStoryArgs = CalloutStoryProps & {
  storyDataset?: (typeof datasetOrder)[number];
  colorScheme?: CalloutColorScheme;
  direction?: CalloutDirection;
  textAlign?: CalloutTextAlignment;
  textSize?: CalloutTitleSize;
  /** Maps to rendering param `Style` (`text` | `base` | `card`). */
  calloutStyle?: CalloutStyle;
};

function sitecoreParamValue(value: string): { Value: { value: string } } {
  return { Value: { value } };
}

const meta = {
  title: 'XM / Callout',
  component: CalloutStoryPreview,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'default',
    colorScheme: 'light' satisfies CalloutColorScheme,
    direction: 'row' satisfies CalloutDirection,
    textAlign: 'left' satisfies CalloutTextAlignment,
    textSize: 'base' satisfies CalloutTitleSize,
    calloutStyle: 'text' satisfies CalloutStyle,
    ...storyDatasets.default,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
    colorScheme: {
      name: 'Color scheme',
      control: 'inline-radio',
      options: ['light', 'dark'] satisfies CalloutColorScheme[],
    },
    direction: {
      control: 'inline-radio',
      options: ['row', 'column'] satisfies CalloutDirection[],
    },
    textAlign: {
      name: 'Text align',
      control: 'inline-radio',
      options: ['left', 'center'] satisfies CalloutTextAlignment[],
    },
    textSize: {
      name: 'Text size',
      control: 'inline-radio',
      options: ['xs', 'sm', 'base'] satisfies CalloutTitleSize[],
    },
    calloutStyle: {
      name: 'Style',
      control: 'inline-radio',
      options: ['text', 'base', 'card'] satisfies CalloutStyle[],
    },
    fields: { table: { disable: true } },
    labels: { table: { disable: true } },
    params: { table: { disable: true } },
  },
  render: (args) => {
    const {
      colorScheme = 'light',
      direction = 'row',
      textAlign = 'left',
      textSize = 'base',
      calloutStyle = 'text',
      ...mergeInput
    } = args as CalloutStoryArgs;
    const merged = mergeStoryDataset(
      mergeInput as CalloutStoryProps & { storyDataset?: string },
      storyDatasets as Record<string, Partial<CalloutStoryProps & { storyDataset?: string }>>,
      'default',
    );
    return (
      <CalloutStoryPreview
        {...merged}
        params={{
          ...merged.params,
          ColorScheme: sitecoreParamValue(colorScheme),
          Direction: sitecoreParamValue(direction),
          TextAlign: sitecoreParamValue(textAlign),
          TextSize: sitecoreParamValue(textSize),
          Style: sitecoreParamValue(calloutStyle),
        }}
      />
    );
  },
} satisfies Meta<CalloutStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'default',
  },
};

export const Editing: Story = {
  name: 'Mode: Editing',
  args: {
    [STORY_DATASET]: 'editing',
  },
};

export const FullFieldsSecondInstance: Story = {
  name: 'Full fields (alternate heading)',
  args: {
    [STORY_DATASET]: 'fullFieldsSecondInstance',
  },
};
