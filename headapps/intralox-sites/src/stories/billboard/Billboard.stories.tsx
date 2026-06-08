import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Default as BillboardDefault } from 'components/billboard/Billboard';
import type { BillboardFields } from 'components/billboard/Billboard.type';
import { MediaType } from 'src/utils/enum';
import { createMockParams } from 'src/storybook/mockParams';
import { storybookImage1, storybookImage2 } from 'src/storybook/storybookImageAssets';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';
import React from 'react';

const videoFields = {
  fields: {
    BrightcoveId: { value: '' },
    Autoplay: { value: false },
    Loop: { value: false },
    Caption: { value: '' },
    CoverImage: { value: { src: '', width: 1, height: 1, alt: '' } },
    Title: { value: '' },
  },
};

const imageFields = (): BillboardFields => ({
  BackgroundImage: {
    value: { src: storybookImage1, width: 1600, height: 900, alt: '' },
  },
  ButtonAlignment: { fields: { Value: { value: 'center' } } },
  Description: { value: '<p>Supporting description.</p>' },
  Eyebrow: { value: 'Eyebrow' },
  Headline: { value: 'Billboard headline' },
  Links: [],
  Subheading: { value: '' },
  MediaType: { fields: { Value: { value: MediaType.IMAGE } } },
  Video: videoFields,
  FocalPoint: { fields: { Value: { value: 'center' } } },
});

const videoBillboardFields = (() => {
  const f = imageFields();
  f.MediaType = { fields: { Value: { value: MediaType.VIDEO } } };
  f.Video = {
    fields: {
      BrightcoveId: { value: 'story-bc-placeholder' },
      Autoplay: { value: false },
      Loop: { value: false },
      Caption: { value: '' },
      CoverImage: {
        value: {
          src: storybookImage2,
          width: 1600,
          height: 900,
          alt: '',
        },
      },
      Title: { value: 'Story video' },
    },
  };
  return f;
})();

type BillboardProps = ComponentProps<typeof BillboardDefault>;

const storyDatasets = {
  imageMedia: {
    fields: imageFields(),
    params: createMockParams({
      styles: '',
      RenderingIdentifier: 'billboard-1',
      ContainerWidth: { Value: { value: 'default' } },
    }) as BillboardProps['params'],
  },
  videoMedia: {
    fields: videoBillboardFields,
    params: createMockParams({
      styles: '',
      RenderingIdentifier: 'billboard-video',
      ContainerWidth: { Value: { value: 'default' } },
    }) as BillboardProps['params'],
  },
} satisfies Record<string, Partial<BillboardProps>>;

const datasetOrder = ['imageMedia', 'videoMedia'] as const;

type BillboardStoryMediaType = 'image_element' | 'video';
type BillboardStoryPreferredRatio = '56.25vw' | '28.125vw';
type BillboardStoryTextAlignment = 'left' | 'center';
type BillboardStoryTextVerticalPosition = 'top' | 'middle' | 'bottom';
type BillboardStoryContainerWidth = 'sm' | 'md' | 'lg' | 'default';
type BillboardStoryColorScheme = 'light' | 'dark';
type BillboardStoryDivider = 'border' | 'fade';
type BillboardStoryHeadlineSize = 'base' | 'xl';
type BillboardStoryTextPosition = 'left' | 'center' | 'bottom';
type BillboardStoryTextWidth = '4/5' | '3/4' | '2/3' | '3/5' | '1/2';

/** Story labels — `getRatioParams` parses `w:h` (see `paramsData.parseAspectRatioToDecimal`). */
const PREFERRED_RATIO_TO_PARAM: Record<BillboardStoryPreferredRatio, string> = {
  '56.25vw': '16:9',
  '28.125vw': '32:9',
};

const TEXT_WIDTH_TO_HEADLINE_WIDTH: Record<BillboardStoryTextWidth, string> = {
  '4/5': '80',
  '3/4': '75',
  '2/3': '66',
  '3/5': '60',
  '1/2': '50',
};

type BillboardStoryControls = {
  mediaType: BillboardStoryMediaType;
  preferredRatio: BillboardStoryPreferredRatio;
  textAlignment: BillboardStoryTextAlignment;
  textVerticalPosition: BillboardStoryTextVerticalPosition;
  containerWidth: BillboardStoryContainerWidth;
  colorScheme: BillboardStoryColorScheme;
  divider: BillboardStoryDivider;
  headlineSize: BillboardStoryHeadlineSize;
  textPosition: BillboardStoryTextPosition;
  textWidth: BillboardStoryTextWidth;
};

type BillboardStoryArgs = BillboardProps & {
  storyDataset?: (typeof datasetOrder)[number];
} & BillboardStoryControls;

function applyBillboardStoryControls(
  props: BillboardProps,
  controls: BillboardStoryControls,
): BillboardProps {
  const ratioRaw = PREFERRED_RATIO_TO_PARAM[controls.preferredRatio];
  const headlineWidth = TEXT_WIDTH_TO_HEADLINE_WIDTH[controls.textWidth];

  const params = {
    ...props.params,
    PreferredRatio: { Value: { value: ratioRaw } },
    TextAlignment: { Value: { value: controls.textAlignment } },
    VerticalPosition: { Value: { value: controls.textVerticalPosition } },
    TextPosition: { Value: { value: controls.textPosition } },
    TextWidth: { Value: { value: controls.textWidth } },
    HeadlineWidth: { Value: { value: headlineWidth } },
    HeadlineSize: { Value: { value: controls.headlineSize } },
    ContainerWidth: { Value: { value: controls.containerWidth } },
    ColorScheme: { Value: { value: controls.colorScheme } },
    Divider: { Value: { value: controls.divider } },
  } as BillboardProps['params'];

  const baseFields = { ...props.fields };

  if (controls.mediaType === 'video') {
    return {
      ...props,
      params,
      fields: {
        ...baseFields,
        MediaType: { fields: { Value: { value: MediaType.VIDEO } } },
        Video: videoBillboardFields.Video,
      },
    };
  }

  return {
    ...props,
    params,
    fields: {
      ...baseFields,
      MediaType: { fields: { Value: { value: MediaType.IMAGE } } },
    },
  };
}

const defaultStoryControls = {
  mediaType: 'image_element' satisfies BillboardStoryMediaType,
  preferredRatio: '56.25vw' satisfies BillboardStoryPreferredRatio,
  textAlignment: 'left' satisfies BillboardStoryTextAlignment,
  textVerticalPosition: 'middle' satisfies BillboardStoryTextVerticalPosition,
  containerWidth: 'default' satisfies BillboardStoryContainerWidth,
  colorScheme: 'light' satisfies BillboardStoryColorScheme,
  divider: 'border' satisfies BillboardStoryDivider,
  headlineSize: 'xl' satisfies BillboardStoryHeadlineSize,
  textPosition: 'left' satisfies BillboardStoryTextPosition,
  textWidth: '2/3' satisfies BillboardStoryTextWidth,
} satisfies BillboardStoryControls;

const meta = {
  title: 'XM / Billboard',
  component: BillboardDefault,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'imageMedia',
    ...defaultStoryControls,
    ...storyDatasets.imageMedia,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
    mediaType: {
      name: 'Media type',
      control: 'inline-radio',
      options: ['image_element', 'video'] satisfies BillboardStoryMediaType[],
    },
    preferredRatio: {
      name: 'Preferred ratio',
      control: 'inline-radio',
      options: ['56.25vw', '28.125vw'] satisfies BillboardStoryPreferredRatio[],
    },
    textAlignment: {
      name: 'Text alignment',
      control: 'inline-radio',
      options: ['left', 'center'] satisfies BillboardStoryTextAlignment[],
    },
    textVerticalPosition: {
      name: 'Text vertical position',
      control: 'inline-radio',
      options: ['top', 'middle', 'bottom'] satisfies BillboardStoryTextVerticalPosition[],
    },
    containerWidth: {
      name: 'Container width',
      control: 'inline-radio',
      options: ['sm', 'md', 'lg', 'default'] satisfies BillboardStoryContainerWidth[],
    },
    colorScheme: {
      name: 'Color scheme',
      control: 'inline-radio',
      options: ['light', 'dark'] satisfies BillboardStoryColorScheme[],
    },
    divider: {
      name: 'Divider',
      control: 'inline-radio',
      options: ['border', 'fade'] satisfies BillboardStoryDivider[],
    },
    headlineSize: {
      name: 'Headline size',
      control: 'inline-radio',
      options: ['base', 'xl'] satisfies BillboardStoryHeadlineSize[],
    },
    textPosition: {
      name: 'Text position',
      control: 'inline-radio',
      options: ['left', 'center', 'bottom'] satisfies BillboardStoryTextPosition[],
    },
    textWidth: {
      name: 'Text width',
      control: 'inline-radio',
      options: ['4/5', '3/4', '2/3', '3/5', '1/2'] satisfies BillboardStoryTextWidth[],
    },
    fields: { table: { disable: true } },
    params: { table: { disable: true } },
  },
  render: (args) => {
    const {
      mediaType,
      preferredRatio,
      textAlignment,
      textVerticalPosition,
      containerWidth,
      colorScheme,
      divider,
      headlineSize,
      textPosition,
      textWidth,
      ...mergeInput
    } = args as BillboardStoryArgs;
    const merged = mergeStoryDataset(
      mergeInput as BillboardProps & { storyDataset?: string },
      storyDatasets as Record<string, Partial<BillboardProps & { storyDataset?: string }>>,
      'imageMedia',
    );
    return (
      <BillboardDefault
        {...applyBillboardStoryControls(merged, {
          mediaType,
          preferredRatio,
          textAlignment,
          textVerticalPosition,
          containerWidth,
          colorScheme,
          divider,
          headlineSize,
          textPosition,
          textWidth,
        })}
      />
    );
  },
} satisfies Meta<BillboardStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'imageMedia',
  },
};

export const VideoMedia: Story = {
  name: 'Media: Video',
  args: {
    [STORY_DATASET]: 'videoMedia',
    mediaType: 'video',
  },
};
