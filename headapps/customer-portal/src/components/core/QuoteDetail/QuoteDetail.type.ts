import type { Field, ImageField, LinkField, RichTextField } from "@sitecore-content-sdk/nextjs";

import type {
  OrderManagementStatusPhraseItem,
  OrderManagementValueItem,
  QuoteSelectionFieldSource,
} from "@/components/core/OrderManagement/OrderManagement.type";
import type { OrderDetailActiveColumnItem } from "@/components/core/OrderDetail/OrderDetail.type";
import type { ComponentProps } from "@/lib/component-props";
import type { SitecoreDocumentRequestSelectionFieldValue } from "@/lib/document-request-cms.types";

/** Sitecore datasource for Quote Detail (subset until full template is authored). */
export interface IQuoteDetailFields extends QuoteSelectionFieldSource {
  DocumentSelection?: SitecoreDocumentRequestSelectionFieldValue;

  BackLinkLabel?: Field<string>;
  QuoteNumberPrefix?: Field<string>;
  CreatedDatePrefix?: Field<string>;
  CreatedByPrefix?: Field<string>;
  ExpiresLabel?: Field<string>;
  ExpiredLabel?: Field<string>;
  /** Status pill text for active (Ready) quotes. */
  ReadyStatusLabel?: Field<string>;
  /** Status pill text for expired quotes. */
  ExpiredStatusLabel?: Field<string>;
  /** Status pill text when the quote id is invalid or missing (red badge). */
  NotFoundStatusLabel?: Field<string>;
  /** Same status options used by the Quotes List status column (StatusIcon + StatusValue). */
  FilterOptions?: OrderManagementValueItem[];
  StatusItemsSelection?: OrderManagementStatusPhraseItem[];

  RequestDocumentsButtonLabel?: Field<string>;
  RequestDocumentsButtonIcon?: ImageField;
  RequestUpdatedQuoteButtonLabel?: Field<string>;
  RequestUpdatedQuoteButtonIcon?: ImageField;

  SectionTitlePattern?: Field<string>;
  ExpandAllLabel?: Field<string>;
  CollapseAllLabel?: Field<string>;
  ColumnHeader?: Field<string>;
  ActiveColumnsSelection?: OrderDetailActiveColumnItem[];
  CustomerPartLabel?: Field<string>;
  IntraloxPartLabel?: Field<string>;

  PricingSectionTitle?: Field<string>;
  SubTotalLabel?: Field<string>;
  TaxLabel?: Field<string>;
  TotalLabel?: Field<string>;

  CostExpiredPanelIcon?: ImageField;
  CostExpiredPanelHeading?: Field<string>;
  CostExpiredPanelBody?: RichTextField;
  CostExpiredPanelLinkLabel?: Field<string>;
  CostExpiredPanelPostLinkText?: RichTextField;

  SupportInfoIcon?: ImageField;
  SupportInfoMessage?: RichTextField;
  /** Optional Sitecore General Link (text + href); label falls back to {@link SupportInfoLinkLabel}. */
  SupportInfoLink?: LinkField;
  SupportInfoLinkLabel?: Field<string>;

  KebabRequestQuoteLabel?: Field<string>;
  KebabRequestQuoteIcon?: ImageField;
  KebabRequestDocumentLabel?: Field<string>;
  KebabRequestDocumentIcon?: ImageField;

  ApiErrorMessage?: Field<string>;
  QuoteNotFoundMessage?: Field<string>;

  EmptyStateImage?: ImageField;
  EmptyStateHeading?: Field<string>;
  EmptyStateBody?: Field<string>;
  /** Label for the retry control on the load-error empty state. */
  EmptyStateRetryButtonLabel?: Field<string>;
}

export type QuoteDetailProps = ComponentProps & {
  fields: IQuoteDetailFields;
};
