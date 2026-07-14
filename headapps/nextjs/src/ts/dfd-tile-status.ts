import { Field, Item } from '@sitecore-content-sdk/nextjs';

type TileStatusFields = {
  title?: Field<string>;
  apiKey?: Field<string>;
  iconName?: Field<string>;
};

export type DfdTileStatus = Item & {
  fields: TileStatusFields;
};
