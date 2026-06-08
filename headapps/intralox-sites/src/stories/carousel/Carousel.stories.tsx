import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Default as CarouselDefault } from 'components/carousel/Carousel';
import type { CarouselFields } from 'components/carousel/Carousel.type';
import { createMockPage } from 'src/storybook/mockPage';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { storybookImage1, storybookImage2 } from 'src/storybook/storybookImageAssets';

const mediaSlide = (id: string, src: string) => ({
  id,
  displayName: id,
  fields: {
    MediaType: { fields: { Value: { value: 'Image' } } },
    Image: {
      value: { src, alt: '', width: '800', height: '500' },
    },
  },
});

const carouselBackground = {
  gray100: 'gray_100',
  white: 'white',
} as const;

const carouselContentType = {
  media: 'media',
  testimonial: 'testimonial',
} as const;

type CarouselMockBackgroundKey = keyof typeof carouselBackground;
type CarouselMockContentKey = keyof typeof carouselContentType;

/** Media carousels always use two slides in stories (matches typical XM setup). */
const defaultMediaItems = [mediaSlide('m1', storybookImage1), mediaSlide('m2', storybookImage2)];

const defaultTestimonialItems: NonNullable<CarouselFields['TestimonialItems']> = [
  {
    id: 't1',
    displayName: 'Slide 1',
    fields: { Quote: { value: 'First testimonial quote for the carousel.' } },
  },
  {
    id: 't2',
    displayName: 'Slide 2',
    fields: { Quote: { value: 'Second testimonial quote — use dots or arrows to navigate.' } },
  },
];

function buildCarouselStoryFields(options: {
  backgroundKey: CarouselMockBackgroundKey;
  contentKey: CarouselMockContentKey;
}): CarouselFields {
  const background = carouselBackground[options.backgroundKey];
  const contentType = carouselContentType[options.contentKey];
  const isMedia = contentType === carouselContentType.media;

  return {
    ContentType: { fields: { Value: { value: contentType } } },
    BackgroundColor: { fields: { Value: { value: background } } },
    MediaItems: isMedia ? [...defaultMediaItems] : [],
    TestimonialItems: isMedia ? [] : defaultTestimonialItems,
    ShowControls: { value: true },
    Autoplay: { value: false },
  };
}

type CarouselProps = ComponentProps<typeof CarouselDefault>;

type CarouselStoryArgs = CarouselProps & {
  carouselMockBackground: CarouselMockBackgroundKey;
  carouselMockContentType: CarouselMockContentKey;
};

const defaultStoryArgs: Pick<
  CarouselStoryArgs,
  'rendering' | 'params' | 'carouselMockBackground' | 'carouselMockContentType'
> = {
  rendering: createMockRendering({ componentName: 'Carousel', uid: 'story-cr' }),
  params: createMockParams({ RenderingIdentifier: 'carousel-story', styles: '' }),
  carouselMockBackground: 'gray100',
  carouselMockContentType: 'media',
};

function renderCarouselFromMockArgs(args: CarouselStoryArgs, isEditing: boolean) {
  const {
    carouselMockBackground,
    carouselMockContentType,
    rendering,
    params,
    page: _page,
    fields: _fields,
    ...rest
  } = args;

  const fields = buildCarouselStoryFields({
    backgroundKey: carouselMockBackground,
    contentKey: carouselMockContentType,
  });

  return (
    <CarouselDefault
      {...rest}
      rendering={rendering}
      params={params}
      page={createMockPage({ isEditing })}
      fields={fields}
    />
  );
}

const meta = {
  title: 'XM / Carousel',
  component: CarouselDefault,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    ...defaultStoryArgs,
  },
  argTypes: {
    fields: { table: { disable: true } },
    carouselMockBackground: {
      name: 'Background',
      description: 'Maps to `BackgroundColor`: `white` → `white`, `gray100` → `gray_100`.',
      control: 'inline-radio',
      options: Object.keys(carouselBackground) as CarouselMockBackgroundKey[],
    },
    carouselMockContentType: {
      name: 'Content type',
      description: 'Maps to `ContentType`: `media` or `testimonial`. When **media**, stories always use two slides.',
      control: 'inline-radio',
      options: Object.keys(carouselContentType) as CarouselMockContentKey[],
    },
  },
  render: (args) => renderCarouselFromMockArgs(args as CarouselStoryArgs, false),
} satisfies Meta<CarouselStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ...defaultStoryArgs,
    carouselMockBackground: 'gray100',
    carouselMockContentType: 'media',
  },
};

export const MediaWhiteBackground: Story = {
  name: 'Background: white, Content: media',
  args: {
    ...defaultStoryArgs,
    carouselMockBackground: 'white',
    carouselMockContentType: 'media',
  },
};

export const EditingWithMedia: Story = {
  name: 'Mode: Editing, Media carousel',
  args: {
    ...defaultStoryArgs,
    rendering: createMockRendering({ componentName: 'Carousel', uid: 'story-cr-ed' }),
    params: createMockParams({ RenderingIdentifier: 'carousel-ed', styles: '' }),
    carouselMockBackground: 'gray100',
    carouselMockContentType: 'media',
  },
  render: (args) => renderCarouselFromMockArgs(args as CarouselStoryArgs, true),
};

/** Testimonial — `ContentType` = `testimonial`, `BackgroundColor` = `white`. */
export const TestimonialMode: Story = {
  name: 'Background: white, Content: testimonial',
  args: {
    ...defaultStoryArgs,
    rendering: createMockRendering({ componentName: 'Carousel', uid: 'story-cr-tm' }),
    params: createMockParams({ RenderingIdentifier: 'carousel-testimonial', styles: '' }),
    carouselMockBackground: 'white',
    carouselMockContentType: 'testimonial',
  },
};

/** Testimonial — `gray_100` + `testimonial`. */
export const TestimonialGrayBackground: Story = {
  name: 'Background: gray_100, Content: testimonial',
  args: {
    ...defaultStoryArgs,
    rendering: createMockRendering({ componentName: 'Carousel', uid: 'story-cr-tm-gray' }),
    params: createMockParams({ RenderingIdentifier: 'carousel-testimonial-gray', styles: '' }),
    carouselMockBackground: 'gray100',
    carouselMockContentType: 'testimonial',
  },
};
