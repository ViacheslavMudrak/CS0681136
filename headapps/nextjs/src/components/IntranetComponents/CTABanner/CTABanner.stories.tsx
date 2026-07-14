import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Pencil as PencilCTABanner, Detailed as DetailedCTABanner } from './CTABanner';
import type { CTABannerProps } from './CTABanner.types';
import { LinkField } from '@sitecore-content-sdk/nextjs';
import { STORYBOOK_IMAGES, createStorybookImageReference } from 'storybook/storybook-images';

const meta: Meta<typeof PencilCTABanner> = {
  title: 'Components/CTA Banner',
  component: PencilCTABanner,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<CTABannerProps>;

export const Pencil: Story = {
  args: {
    rendering: {
      componentName: 'CTABanner',
      dataSource: 'CTA Banner',
    },
    params: {},
    fields: {
      eyebrow: { value: 'Optional Eyebrow' },
      headline: { value: 'Page/Content Title' },
      subtext: {
        value: '',
      },
      buttonLink: {
        value: {
          href: 'https://www.google.com',
          text: 'Button',
          target: '_blank',
        },
      } as LinkField,
      backgroundImage: createStorybookImageReference(
        STORYBOOK_IMAGES.bannerBackgrounds.default,
        'Default hero background',
        1920,
        1080
      ),
    },
  },
  render: (args) => <PencilCTABanner {...args} />,
};
export const Detailed: Story = {
  args: {
    rendering: {
      componentName: 'CTABanner',
      dataSource: 'CTA Banner',
    },
    params: {},
    fields: {
      eyebrow: { value: 'Optional Eyebrow' },
      headline: { value: 'Page/Content Title' },
      subtext: {
        value:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin accumsan interdum. In ligula est, porttitor eget convallis nec, mattis a magna.',
      },
      buttonLink: {
        value: {
          href: 'https://www.google.com',
          text: 'Button',
          target: '_blank',
        },
      } as LinkField,
      backgroundImage: createStorybookImageReference(
        STORYBOOK_IMAGES.bannerBackgrounds.default,
        'Default hero background',
        1920,
        1080
      ),
    },
  },
  render: (args) => <DetailedCTABanner {...args} />,
};
