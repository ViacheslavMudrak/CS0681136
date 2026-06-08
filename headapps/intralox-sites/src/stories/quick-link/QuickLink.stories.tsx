import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import type { QuickLinkFields } from 'components/quick-link/QuickLink.type';
import { QuickLinkStoryPreview } from 'src/storybook/async-roots/QuickLinkStoryPreview';
import { createMockPage } from 'src/storybook/mockPage';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { storybookImage1 } from 'src/storybook/storybookImageAssets';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

const happyFields: QuickLinkFields = {
  Title: { value: 'Solutions overview' },
  Description: { value: 'Explore modular belting and automation options.' },
  Link: {
    value: { href: '/solutions', text: 'View solutions', linktype: 'internal' },
  },
};

function storyArgs(overrides: {
  fields?: QuickLinkFields;
  isEditing?: boolean;
  params?: Record<string, unknown>;
} = {}) {
  return {
    rendering: createMockRendering({ componentName: 'QuickLink', uid: 'story-ql' }),
    page: createMockPage({ isEditing: overrides.isEditing ?? false }),
    params: createMockParams({
      RenderingIdentifier: 'quick-link-story',
      styles: '',
      ...(overrides.params ?? {}),
    }),
    fields: overrides.fields ?? happyFields,
  };
}

type QuickLinkStoryProps = React.ComponentProps<typeof QuickLinkStoryPreview>;
type QuickLinkIconControl = 'image' | 'mail' | 'message-square' | 'phone';
type QuickLinkTextSizeControl = 'sm' | 'base';
type QuickLinkThemeControl = 'default' | 'cyan';
type QuickLinkIconPositionControl = 'left' | 'top' | 'center';
type QuickLinkVariantControl = 'base' | 'card';

type QuickLinkControlArgs = {
  icon: QuickLinkIconControl;
  textSize: QuickLinkTextSizeControl;
  theme: QuickLinkThemeControl;
  iconPosition: QuickLinkIconPositionControl;
  variant: QuickLinkVariantControl;
};

const quickLinkControlDefaults: QuickLinkControlArgs = {
  icon: 'mail',
  textSize: 'base',
  theme: 'default',
  iconPosition: 'top',
  variant: 'base',
};

const quickLinkIconImage = {
  value: {
    src: storybookImage1,
    width: 96,
    height: 96,
    alt: 'Quick link visual',
  },
};

function applyQuickLinkControls(
  args: QuickLinkStoryProps,
  controls: QuickLinkControlArgs,
): QuickLinkStoryProps {
  return {
    ...args,
    params: createMockParams({
      ...(args.params ?? {}),
      CardType: { Value: { value: controls.variant } },
      IconPosition: { Value: { value: controls.iconPosition } },
      TextSize: { Value: { value: controls.textSize } },
      Theme: { Value: { value: controls.theme } },
      ...(controls.icon === 'image' ? {} : { Icon: { Value: { value: controls.icon } } }),
    }),
    fields: {
      ...(args.fields ?? {}),
      ...(controls.icon === 'image' ?
        { Image: quickLinkIconImage, Icon: undefined }
      : {
          Icon: { fields: { Value: { value: controls.icon } } },
          Image: undefined,
        }),
    },
  };
}

const storyDatasets = {
  default: storyArgs(),
  editing: storyArgs({
    isEditing: true,
    fields: {
      Title: { value: '' },
      Description: { value: '' },
    },
  }),
  fullFieldsSecondInstance: storyArgs({
    fields: {
      ...happyFields,
      Title: { value: 'Documentation library' },
      Description: { value: 'Specs, drawings, and maintenance guides.' },
      Link: {
        value: { href: '/docs', text: 'Browse docs', linktype: 'internal' },
      },
    },
  }),
} satisfies Record<string, QuickLinkStoryProps>;

const datasetOrder = ['default', 'editing', 'fullFieldsSecondInstance'] as const;

const meta = {
  title: 'XM / Quick Link',
  component: QuickLinkStoryPreview,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'default',
    ...storyDatasets.default,
    ...quickLinkControlDefaults,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
    icon: {
      control: 'inline-radio',
      options: ['image', 'mail', 'message-square', 'phone'],
      description: 'Quick Link icon source (image or Font Awesome key).',
    },
    textSize: {
      control: 'inline-radio',
      options: ['sm', 'base'],
      description: 'Maps to Sitecore `TextSize` rendering parameter.',
    },
    theme: {
      control: 'inline-radio',
      options: ['default', 'cyan'],
      description: 'Maps to Sitecore `Theme` rendering parameter.',
    },
    iconPosition: {
      control: 'inline-radio',
      options: ['left', 'top', 'center'],
      description: 'Maps to Sitecore `IconPosition` rendering parameter.',
    },
    variant: {
      control: 'inline-radio',
      options: ['base', 'card'],
      description: 'Maps to Sitecore `CardType` rendering parameter.',
    },
    fields: { table: { disable: true } },
    params: { table: { disable: true } },
    page: { table: { disable: true } },
    rendering: { table: { disable: true } },
  },
  render: (args) => {
    const mergedArgs = mergeStoryDataset(
      args as QuickLinkStoryProps & QuickLinkControlArgs & { storyDataset?: string },
      storyDatasets as Record<string, Partial<QuickLinkStoryProps & { storyDataset?: string }>>,
      'default',
    ) as QuickLinkStoryProps & QuickLinkControlArgs & { storyDataset?: string };

    const { storyDataset, icon, textSize, theme, iconPosition, variant, ...storyArgs } = mergedArgs;
    const previewArgs = applyQuickLinkControls(storyArgs, {
      icon,
      textSize,
      theme,
      iconPosition,
      variant,
    });

    return <QuickLinkStoryPreview {...previewArgs} />;
  },
} satisfies Meta<QuickLinkStoryProps & QuickLinkControlArgs & { storyDataset?: (typeof datasetOrder)[number] }>;

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
  name: 'Full fields (documentation variant)',
  args: {
    [STORY_DATASET]: 'fullFieldsSecondInstance',
  },
};
