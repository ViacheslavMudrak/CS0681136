import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Default as RichTextBlock } from './RichTextBlock';
import { RichTextBlockProps } from './RichTextBlock.types';

const meta: Meta<typeof RichTextBlock> = {
  title: 'Components/Rich Text Block',
  component: RichTextBlock,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<
  RichTextBlockProps & {
    variant?: 'Default' | 'IntroductionBlueGradient' | 'IntroductionYellowGradient';
  }
>;

export const Default: Story = {
  args: {
    variant: 'Default',
    rendering: {
      uid: 'Empty',
      componentName: 'RichTextBlock',
      dataSource: 'RichTextBlock',
    },
    params: {},
    fields: {
      richContent: {
        value:
          '<h1>This is a rich text control</h1><h2>Unordered List</h2><ul><li>List one</li><li>List two</li></ul><h3>Ordered List</h3><ol><li>List one</li><li>List two</li></ol>',
      },
    },
  },
};

export const Blue: Story = {
  args: {
    variant: 'IntroductionBlueGradient',
    rendering: {
      uid: 'Empty',
      componentName: 'IntroductionBlueGradient',
      dataSource: 'Empty',
    },
    params: {},
    fields: {
      richContent: {
        value:
          '<h1>This is a rich text control</h1><h2>Unordered List</h2><ul><li>List one</li><li>List two</li></ul><h3>Ordered List</h3><ol><li>List one</li><li>List two</li></ol>',
      },
    },
  },
};

export const Yellow: Story = {
  args: {
    variant: 'IntroductionYellowGradient',
    rendering: {
      uid: 'Empty',
      componentName: 'IntroductionYellowGradient',
      dataSource: 'Empty',
    },
    params: {},
    fields: {
      richContent: {
        value:
          '<h1>This is a rich text control</h1><h2>Unordered List</h2><ul><li>List one</li><li>List two</li></ul><h3>Ordered List</h3><ol><li>List one</li><li>List two</li></ol>',
      },
    },
  },
};
