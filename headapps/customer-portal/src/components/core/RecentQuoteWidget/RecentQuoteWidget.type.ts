import type { Field, ImageField, LinkField, RichTextField, TextField } from "@sitecore-content-sdk/nextjs";

import type { QuoteSelectionFieldSource } from "@/components/core/OrderManagement/OrderManagement.type";
import type { ComponentProps } from "@/lib/component-props";
import type { RecentWidgetDateRangeFields } from "@/lib/dashboard-recent-widgets.util";

export interface IRecentQuoteWidgetFields extends QuoteSelectionFieldSource, RecentWidgetDateRangeFields {
  SectionTitle?: TextField;
  ViewAllLabel?: TextField;
  ViewAllURL?: LinkField;
  EmptyStateIcon?: ImageField;
  EmptyStateMessage?: RichTextField;
  ErrorMessage?: RichTextField;
  RetryButtonLabel?: TextField;
  MaxItemsDisplayed?: Field<number>;
  ReadyIcon?: ImageField;
  ExpiredIcon?: ImageField;
}

export type RecentQuoteWidgetProps = ComponentProps & {
  fields: IRecentQuoteWidgetFields;
};
