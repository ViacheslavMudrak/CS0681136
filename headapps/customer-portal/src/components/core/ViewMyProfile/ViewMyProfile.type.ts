import type { Field, ImageField, LinkField } from "@sitecore-content-sdk/nextjs";
import type { ProfileAccount } from "@/lib/types/user-profile";

/**
 * Sitecore field definitions for ViewMyProfile component.
 */
export interface IViewMyProfileFields {
  ProfileTitle?: Field<string>;
  Icon?: ImageField;
  BannerText?: Field<string>;
  BannerLink?: LinkField;
  ProfileSectionTitle?: Field<string>;
  CompanySectionTitle?: Field<string>;
  ActiveLocationIcon?: ImageField;
  InactiveLocationIcon?: ImageField;
  NoAccountIcon?: ImageField;
  NoAccountText?: Field<string>;
  NoAccountCTA?: LinkField;
  HideCTA?: Field<boolean>;
}

/** Company account row for View My Profile cards (same shape as profile context accounts). */
export type ICompanyAccount = ProfileAccount;
