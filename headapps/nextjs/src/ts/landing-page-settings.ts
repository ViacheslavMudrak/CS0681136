import { Field, Item } from '@sitecore-content-sdk/nextjs';

export type LandingPage = Item & {
  fields: {
    title?: Field<string>;
    url?: Field<string>;
  };
};

export type LandingPageSettings = {
  newsLandingPage?: LandingPage;
  reflectionLandingPage?: LandingPage;
};

export type UserDefaultSettings = LandingPageSettings;
