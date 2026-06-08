import type { Field, ImageField, LinkField, TextField } from "@sitecore-content-sdk/nextjs";

import type { ComponentProps } from "@/lib/component-props";
import type { QuoteSelectionFieldSource } from "@/components/core/OrderManagement/OrderManagement.type";

/**
 * Dashboard user header: CMS greeting prefix plus authenticated user’s first name,
 * and optional request-quote CTA wired like Order Management.
 */
export interface IUserInfoFields extends QuoteSelectionFieldSource {
  /** Greeting prefix (e.g. “Welcome,”); first name is appended in code. */
  UserTitle?: TextField;
  RequestQuoteLabelMobile?: Field<string>;
  RequestQuoteIcon?: ImageField;
  RequestQuoteURL?: LinkField;
  HideButton?: Field<boolean>;
  RequestQuoteLabelDesktop?: TextField;
  ModifyPendingQuoteTitle?: Field<string>;
  ModifyPendingQuoteIcon?: ImageField;
}

export type UserInfoProps = ComponentProps & {
  fields: IUserInfoFields;
};
