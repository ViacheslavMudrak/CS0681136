import { Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type AccordionItemFields = {
  header: Field<string>;
  secondaryContent: Field<string>;
  content: Field<string>;
};

export type AccordionItemProps = ComponentProps & {
  fields: AccordionItemFields;
};
