import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Default as PhotoGallery } from './PhotoGallery';
import type { PhotoGalleryProps } from './PhotoGallery.types';

const meta: Meta<typeof PhotoGallery> = {
  title: 'Components/Photo Gallery',
  component: PhotoGallery,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<
  PhotoGalleryProps & {
    variant?: 'SingleImageDisplay' | 'CarouselDisplay' | 'FourImageDisplay';
  }
>;

const mockImages = Array.from({ length: 8 }).map((_, i) => ({
  value: {
    src: `/images/photo-gallery-image-${i + 1}.jpg`,
    alt: `Sample Image ${i + 1}`,
    width: '600px',
    height: '400px',
  },
  description: {
    value: `This is the description for image ${i + 1}.`,
  },
}));

// -----------------------------------------------------------------------------
// 📸 Stories
// -----------------------------------------------------------------------------

export const SingleImageDisplay: Story = {
  args: {
    variant: 'SingleImageDisplay',
    rendering: {
      uid: 'Empty',
      componentName: 'PhotoGallery',
      dataSource: 'PhotoGallery',
      params: {
        hideCaptions: '0',
      },
    },
    params: {},
    fields: {
      datasource: {
        optionalEyebrow: { value: 'Gallery Eyebrow' },
        headlineText: { value: 'Page Content Headline' },
        subtext: {
          value: '<p>This layout displays 1 image in the main carousel.</p>',
        },
        buttonLinkOne: {
          value: {
            href: '#',
            text: 'Button',
          },
        },
        buttonLinkTwo: {
          value: {
            href: '#',
            text: 'Button',
          },
        },
      },
      mediaItems: mockImages,
    },
  },
};

export const CarouselDisplay: Story = {
  args: {
    variant: 'CarouselDisplay',
    rendering: {
      uid: 'Empty',
      componentName: 'PhotoGallery',
      dataSource: 'PhotoGallery',
      params: {
        hideCaptions: '0',
      },
    },
    params: {},
    fields: {
      datasource: {
        optionalEyebrow: { value: 'Gallery Eyebrow' },
        headlineText: { value: 'Our Image Carousel' },
        subtext: {
          value:
            '<p>This layout displays 1 image in the main carousel, as well as a thumbnails carousel.</p>',
        },
        buttonLinkOne: {
          value: {
            href: '#',
            text: 'View Gallery',
          },
        },
        buttonLinkTwo: {
          value: {
            href: '#',
            text: 'Contact Us',
          },
        },
      },
      mediaItems: mockImages,
    },
  },
};

export const FourImageDisplay: Story = {
  args: {
    variant: 'FourImageDisplay',
    rendering: {
      uid: 'Empty',
      componentName: 'PhotoGallery',
      dataSource: 'PhotoGallery',
      params: {
        hideCaptions: '0',
      },
    },
    params: {},
    fields: {
      datasource: {
        optionalEyebrow: { value: 'Gallery Eyebrow' },
        headlineText: { value: 'Four Image Grid Layout' },
        subtext: {
          value: '<p>This layout displays 4 images in the main carousel</p>',
        },
        buttonLinkOne: {
          value: {
            href: '#',
            text: 'Button',
          },
        },
        buttonLinkTwo: {
          value: {
            href: '#',
            text: 'BUtton',
          },
        },
      },
      mediaItems: mockImages,
    },
  },
};
