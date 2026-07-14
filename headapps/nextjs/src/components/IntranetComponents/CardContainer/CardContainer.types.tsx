import { ComponentProps } from 'lib/component-props';

import { Field } from '@sitecore-content-sdk/nextjs';

type CardContainerFields = {
  headline: Field<string>;
  eyebrow: Field<string>;
};

export type CardContainerProps = ComponentProps & {
  fields: CardContainerFields;
};

export type CardContainerVariant = 'LightTheme' | 'DarkTheme' | 'ReflectionResources';
