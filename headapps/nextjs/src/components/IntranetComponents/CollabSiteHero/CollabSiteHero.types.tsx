import type { ComponentWithContextProps } from 'lib/component-props';
import type { Field, ImageField } from '@sitecore-content-sdk/nextjs';

/** Page-level fields from the Collab Space Site Home template (via route fields) */
export type CollabSpacePageFields = {
  collabSpaceName: Field<string>;
  collabSpaceDescription: Field<string>;
  collabSpaceThumbnail: ImageField;
  collabSpaceLogo: ImageField;
};

export type CollabSiteHeroProps = ComponentWithContextProps & {
  fields: Record<string, unknown>;
};
