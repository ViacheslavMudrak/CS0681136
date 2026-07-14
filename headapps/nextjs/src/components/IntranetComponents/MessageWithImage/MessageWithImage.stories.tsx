import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import MessageWithImage from './MessageWithImage';
import type { MessageWithImageProps } from './MessageWithImage.types';
import { STORYBOOK_IMAGES, createStorybookImageField } from 'storybook/storybook-images';

const meta: Meta<typeof MessageWithImage> = {
  title: 'Components/Message With Image',
  component: MessageWithImage,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MessageWithImageProps>;

export const WithAscensionGraphic: Story = {
  args: {
    rendering: {
      componentName: 'MessageWithImage',
      dataSource: 'Message With Image',
      fields: {
        optionalEyebrow: { value: 'OUR VISION' },
        headline: { value: "Answering God's call to bring health, healing and hope to all." },
        backgroundImage: createStorybookImageField(
          STORYBOOK_IMAGES.content.news1,
          'Sample message image',
          800,
          600
        ),
        enableAscensionGraphic: { value: true },
      },
    },
    params: {},
  },
  render: (args) => <MessageWithImage {...args} />,
};

export const WithoutAscensionGraphic: Story = {
  args: {
    rendering: {
      componentName: 'MessageWithImage',
      dataSource: 'Message With Image',
      fields: {
        optionalEyebrow: { value: 'OUR VISION' },
        headline: { value: "Answering God's call to bring health, healing and hope to all." },
        backgroundImage: createStorybookImageField(
          STORYBOOK_IMAGES.content.news2,
          'Sample message image',
          800,
          600
        ),
        enableAscensionGraphic: { value: false },
      },
    },
    params: {},
  },
  render: (args) => <MessageWithImage {...args} />,
};

export const WithoutEyebrow: Story = {
  args: {
    rendering: {
      componentName: 'MessageWithImage',
      dataSource: 'Message With Image',
      fields: {
        optionalEyebrow: { value: '' },
        headline: { value: 'Message Without Eyebrow' },
        backgroundImage: createStorybookImageField(
          STORYBOOK_IMAGES.profiles.group,
          'Sample image',
          800,
          600
        ),
        enableAscensionGraphic: { value: true },
      },
    },
    params: {},
  },
  render: (args) => <MessageWithImage {...args} />,
};

export const MinimalContent: Story = {
  args: {
    rendering: {
      componentName: 'MessageWithImage',
      dataSource: 'Message With Image',
      fields: {
        optionalEyebrow: { value: '' },
        headline: { value: 'Simple Message' },
        backgroundImage: createStorybookImageField(
          STORYBOOK_IMAGES.content.sampledoctor1,
          'Sample image',
          800,
          600
        ),
        enableAscensionGraphic: { value: false },
      },
    },
    params: {},
  },
  render: (args) => <MessageWithImage {...args} />,
};
