import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SeventyThirty } from './FeaturedContentBlock';
import type { FeaturedContentBlockProps } from './FeaturedContentBlock.types';
import { LinkField } from '@sitecore-content-sdk/nextjs';

const meta: Meta<typeof SeventyThirty> = {
  title: 'Components/Featured Content Block',
  component: SeventyThirty,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<FeaturedContentBlockProps>;

export const Primary: Story = {
  args: {
    rendering: {
      uid: 'mock-uid',
      componentName: 'FeaturedContentBlock',
      dataSource: 'mock-datasource',
      params: {
        imageOnLeft: '0',
        fullWidth: '0',
      },
      placeholders: {},
      fields: {},
    },
    params: {},
    fields: {
      optionalTag: { value: 'Featured Section' },
      headlineText: { value: 'Featured Content Block Headline' },
      publishedDate: { value: 'November 14, 2025' },
      blockContent: {
        value:
          '<p>Lorem ipsum dolor sit amet, mentitum reprimique et eum. Ne eam affert congue. Ius vide accumsan suscipit an, at legendos persequeris mel. Usu ei nihil timeam. Nec an iudico essent necessitatibus. Cum errem graecis ex. Mel in nulla omnium volumus. An unum primis quaeque quo.</p>',
      },
      buttonLink: {
        value: {
          href: 'https://www.google.com',
          text: 'Button',
          target: '_blank',
        },
      } as LinkField,
      desktopImage: {
        value: {
          src: '/images/photo-gallery-image-1.jpg',
          alt: 'Desktop Featured Image',
        },
      },
      mobileImage: {
        value: {
          src: '/images/photo-gallery-image-1.jpg',
          alt: 'Mobile Featured Image',
        },
      },
    },
  },
};
