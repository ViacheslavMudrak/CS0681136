import { ComponentProps } from 'lib/component-props';

import { Field } from '@sitecore-content-sdk/nextjs';

export type FeedbackFormFields = {
  optionalEyebrow: Field<string>;
  title: Field<string>;
  description: Field<string>;
  buttonText: Field<string>;
  recipientEmails: Field<string>;
  webhookUrl: Field<string>;
  includePageUrl: Field<boolean>;
};

export type FeedbackFormProps = ComponentProps & {
  fields: FeedbackFormFields;
};

export const FeedbackFormStatics = {
  successMessage: 'Submitted',
  subjectPlaceholderText: 'Subject',
  messagePlaceholderText: 'Message',
  pageUrlLabel: 'Page URL',
};
