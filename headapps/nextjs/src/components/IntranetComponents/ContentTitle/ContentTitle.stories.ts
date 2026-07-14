import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Default as ContentTitle } from './ContentTitle';
import type { ContentTitleProps } from './ContentTitle.types';
import { LinkField } from '@sitecore-content-sdk/nextjs';

const meta: Meta<typeof ContentTitle> = {
  title: 'Components/Content Title',
  component: ContentTitle,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ContentTitleProps>;

export const Primary: Story = {
  args: {
    rendering: {
      componentName: 'ContentTitle',
      dataSource: 'Empty',
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
    },
  },
};
