import type { Field, TextField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from 'lib/component-props';

/**
 * Sitecore droplink/reference for heading level (`H1`–`H6` in `fields.Value.value`).
 */
export type HeadingLevelField = {
  fields?: {
    Value?: Field<string>;
  };
};

/**
 * Datasource fields for Heading Component / Heading Atom (flat layout shape).
 */
export interface HeadingComponentFields {
  HeadingLevel?: HeadingLevelField;
  Text?: TextField;
  IncludeDivider?: Field<boolean>;
  Eyebrow?: TextField;
  UpperCase?: Field<boolean>;
}

export type HeadingComponentProps = ComponentProps & {
  fields: HeadingComponentFields | undefined;
};
