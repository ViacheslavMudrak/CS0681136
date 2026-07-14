// FeebackForm.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';

import FeedbackForm from './FeedbackForm';
import type { FeedbackFormProps } from './FeedbackForm.types';

const meta: Meta<typeof FeedbackForm> = {
  title: 'Components/FeedbackForm',
  component: FeedbackForm,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<FeedbackFormProps>;

export const Default: Story = {
  args: {
    rendering: {
      uid: 'feedback-form-1',
      componentName: 'FeedbackForm',
      dataSource: 'feedback-form-datasource',
    },
    fields: {
      optionalEyebrow: {
        value: 'Give Feedback',
      },
      title: {
        value: 'Let us know how we can improve this page',
      },
      description: {
        value:
          "If the application you need isn't listed, let us know and we will do our best to add it. Simply provide the name, link or description of the requested application.",
      },
      buttonText: {
        value: 'Submit',
      },
      recipientEmails: {
        value: 'feedback@ascension.org',
      },
      webhookUrl: {
        value: 'https://example.com/api/feedback',
      },
      includePageUrl: {
        value: true,
      },
    },
  },
};
