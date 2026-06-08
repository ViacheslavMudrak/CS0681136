import type { Field, ImageField, TextField } from "@sitecore-content-sdk/nextjs";

import type { ComponentProps } from "@/lib/component-props";

/**
 * Dashboard information panel (top banner). Field names follow Sitecore datasource;
 * `Banner Icon` may be exposed with a space from some serializers — see {@link resolveDashboardBannerIconField}.
 */
export interface IDashboardInfoBannerFields {
  /** When `false`, the panel is not rendered for visitors (no empty gap). */
  PanelVisible?: Field<boolean>;
  BannerTitle?: TextField;
  BannerDescription?: Field<string>;
  BannerIcon?: ImageField;
}

export type DashboardInfoBannerProps = ComponentProps & {
  fields: IDashboardInfoBannerFields;
};
