import { ImageField, Item } from '@sitecore-content-sdk/nextjs';

export type ResponsiveImageFields = {
  MobileImage: ImageField | GraphQLImageField;
  TabletImage: ImageField | GraphQLImageField;
  DesktopImage: ImageField | GraphQLImageField;
  ImageType?: Item | null;
  ImageAreaBackgroundColor?: Item | null;
};

type GraphQLImageField = {
  jsonValue: ImageField;
};
