import type { Meta, StoryObj } from '@storybook/react';
import NewsArticleBlockQuote from './NewsArticleBlockQuote';
import type { NewsArticleBlockQuoteProps } from './NewsArticleBlockQuote.types';

const meta: Meta<NewsArticleBlockQuoteProps> = {
  title: 'Components/NewsArticleBlockQuote',
  component: NewsArticleBlockQuote,
  parameters: {},
  args: {
    fields: {
      quoteText: {
        value:
          'Our Sterile Processing professionals are an integral part of our patient care team. Their attention to detail ensures every instrument is perfectly prepared for each procedure, allowing clinical teams to deliver the highest quality care. This week, we honor their crucial contributions and express our gratitude for their dedication and expertise.',
      },
      quoteCaption: { value: 'ROB ROSE, SENIOR VICE PRESIDENT OF NURSING' },
    },
    rendering: {
      componentName: 'NewsArticleBlockQuote',
      dataSource: 'mock',
      params: {},
    },
    stylesSXA: '',
  },
};

export default meta;

type Story = StoryObj<NewsArticleBlockQuoteProps>;

export const Default: Story = {};

export const WithoutCaption: Story = {
  args: {
    fields: {
      quoteText: {
        value:
          'Our Sterile Processing professionals are an integral part of our patient care team. Their attention to detail ensures every instrument is perfectly prepared for each procedure, allowing clinical teams to deliver the highest quality care.',
      },
      quoteCaption: { value: '' },
    },
  },
};

export const LongQuote: Story = {
  args: {
    fields: {
      quoteText: {
        value:
          'Our Sterile Processing professionals are an integral part of our patient care team. Their attention to detail ensures every instrument is perfectly prepared for each procedure, allowing clinical teams to deliver the highest quality care. This week, we honor their crucial contributions and express our gratitude for their dedication and expertise. Their work behind the scenes is vital to patient safety and outcomes. We recognize the skilled professionals who work tirelessly to maintain the highest standards of sterile processing, ensuring that every surgical instrument meets exacting specifications. Their commitment to excellence reflects our organizational values and dedication to patient care.',
      },
      quoteCaption: { value: 'ROB ROSE, SENIOR VICE PRESIDENT OF NURSING' },
    },
  },
};
