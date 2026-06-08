import type { ComponentRendering, Field, LinkField } from '@sitecore-content-sdk/nextjs';
import type { ComponentProps } from 'lib/component-props';

export interface CookieBannerDatasource {
  bannerText?: { jsonValue?: Field<string> };
  BannerText?: { jsonValue?: Field<string> };
  buttonTextWithLink?: { jsonValue?: LinkField };
  ButtonTextWithLink?: { jsonValue?: LinkField };
  link?: { jsonValue?: LinkField };
  Link?: { jsonValue?: LinkField };
}

export interface CookieBannerFields {
  BannerText?: Field<string>;
  /** Primary dismiss / continue control from many templates. */
  Link?: LinkField;
  ButtonTextWithLink?: LinkField;
  data?: {
    datasource?: CookieBannerDatasource | null;
  } | null;
}

export type CookieBannerProps = ComponentProps & {
  fields?: CookieBannerFields | null;
};

export interface CookieBannerClientProps {
  bannerText?: Field<string>;
  buttonTextWithLink?: LinkField;
  isEditing: boolean;
  rendering: ComponentRendering;
  styles?: string;
  RenderingIdentifier?: string;
}
