import { ComponentProps } from 'lib/component-props';
import { Field, LinkField } from '@sitecore-content-sdk/nextjs';

export type BannerVariant = 'Negative' | 'Warning' | 'Informational' | 'Positive';

export type NotificationBannerItem = {
  id: string;
  name: string;
  bannerText: {
    jsonValue: Field<string>;
  };
  buttonLink: {
    jsonValue: LinkField;
  };
  notificationLevel: {
    jsonValue: Field<string>;
  };
  allowUserToDismiss: {
    jsonValue: Field<boolean>;
  };
};

export type AncestorWithBanners = {
  notificationBanners?: {
    targetItems: NotificationBannerItem[];
  };
};

export type NotificationBannerRenderingFields = {
  data?: {
    matches?: {
      ancestors: AncestorWithBanners[];
    };
    current?: {
      notificationBanners?: {
        targetItems: NotificationBannerItem[];
      };
    };
  };
};

// Type for processed banner items from Sitecore GraphQL
export type ProcessedBanner = {
  id: string;
  name: string;
  bannerText: Field<string>;
  buttonLink: LinkField;
  bannerVariant: Field<string>;
  allowUserToDismiss: boolean;
};

export type NotificationBannerProps = ComponentProps;

// Banner icon mapping
export const BANNER_ICONS: Record<BannerVariant, string> = {
  Negative: 'ErrorOutlineOutlined',
  Warning: 'WarningAmberOutlined',
  Informational: 'InfoOutlined',
  Positive: 'CheckCircleOutlined',
};

// Map Sitecore notification levels to banner variants
export const NOTIFICATION_LEVEL_MAP: Record<string, BannerVariant> = {
  Alert: 'Negative',
  Warning: 'Warning',
  Informational: 'Informational',
  Positive: 'Positive',
};
