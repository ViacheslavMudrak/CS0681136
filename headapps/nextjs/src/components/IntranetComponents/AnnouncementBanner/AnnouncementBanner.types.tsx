import { ComponentProps } from 'lib/component-props';
import { Field, LinkField } from '@sitecore-content-sdk/nextjs';

export type AnnouncementBannerTheme = 'Light' | 'Dark';

export type AnnouncementBannerFields = {
  bannerContent: Field<string>;
  buttonLink: LinkField;
};

export type AnnouncementBannerProps = ComponentProps;

// Announcement Banner icon
export const NEWS_ICON = 'campaign';

export const AnnouncementBannerStatics = {
  NoDatasourceFallbackMessage:
    'No  announcement banner configured. Please add a datasource with Banner Content.',
  DictionaryKey_NoDatasource: 'AnnouncementBannerNoDatasource',
};
