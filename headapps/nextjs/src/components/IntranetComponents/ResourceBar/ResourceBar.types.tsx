import { Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { CustomLinkItem } from 'ts/custom-link';

type ResourceTileFields = {
  tileName: Field<string>;
  tileDescription: Field<string>;
  tileLinkReference: CustomLinkItem[];
};

type ResourceTileItem = {
  fields: ResourceTileFields;
};

export type ResourceBarProps = ComponentProps & {
  fields: {
    items?: ResourceTileItem[];
  };
};
