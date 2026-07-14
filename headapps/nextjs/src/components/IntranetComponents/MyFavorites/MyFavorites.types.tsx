import { ComponentProps } from 'lib/component-props';
import { FavoritesModel } from 'ts/user-default-settings';

import { Field } from '@sitecore-content-sdk/nextjs';

type MyFavoritesFields = {
  title: Field<string>;
  seeAllFavoritesLinkText: Field<string>;
  addFavoriteIcon: Field<string>;
  addFavoriteIcon_hover: Field<string>;
  addFavoriteText: Field<string>;
  defaultFavorites: FavoritesModel;
};

export type MyFavoritesProps = ComponentProps & {
  fields: MyFavoritesFields;
};
