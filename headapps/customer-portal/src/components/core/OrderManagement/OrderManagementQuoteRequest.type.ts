import type { Field, ImageField, TextField } from "@sitecore-content-sdk/nextjs";

/** Validation messages for the general quote step (aligned with application / product / comments fields). */
export type QuoteRequestGeneralFieldErrors = {
  application?: string;
  productDetails?: string;
  comments?: string;
};

/**
 * Request Quote `QuoteSelection` item fields from Sitecore (field API names as authored in CM).
 * Populated from the matching `QuoteSelection` multilist item (see `getQuoteRequestCmsFields`).
 */
export interface QuoteRequestCmsFields {
  DrawerTitle?: TextField;
  DrawerSubheading?: TextField;
  SubmittingAsIcon?: ImageField;
  SubmittingAsLabel?: TextField;
  SubmittingAsTooltipDescription?: Field<string>;
  BannerHeading?: TextField;
  BannerLinkLabel?: TextField;
  BannerIcon?: ImageField;
  HideBanner?: Field<boolean>;
  BannerText?: TextField;
  ApplicationPlaceholder?: TextField;
  ApplicationRequiredIndicator?: Field<boolean>;
  ProductDetailsLabel?: TextField;
  ProductDetailsPlaceholder?: TextField;
  GeneralEntryCommentsFieldPlaceholder?: TextField;
  GeneralEntryCommentsRequiredIndicator?: Field<boolean>;
  GeneralEntryCancelButtonLabel?: TextField;
  GeneralEntrySubmitButtonLabel?: TextField;
  FormIntroText?: TextField;
  ApplicationLabel?: TextField;
  ProductDetailsIndicator?: Field<boolean>;
  GeneralEntryCommentsFieldLabel?: TextField;
  AddItemTitle?: TextField;
  LineItemContinueButtonLabel?: TextField;
  LineItemSaveChangesButtonLabel?: TextField;
  OrderHeaderReviewIntroPattern?: TextField;
  LineItemCommentPlaceholder?: TextField;
  LineItemComment?: TextField;
  LineItemCancelButtonLabel?: TextField;
  ReviewTitle?: TextField;
  DiscardRequestLabel?: TextField;
  SubmitRequestButtonLabel?: TextField;
  AddReviewItemLinkLabel?: TextField;
  AdditionalQuoteInformationLabel?: TextField;
  AdditionalQuoteInformationPlaceholder?: TextField;
  DiscardRequestIcon?: ImageField;
  DialogTitle?: TextField;
  ConfirmDiscardButtonLabel?: TextField;
  DialogeCancelButtonLabel?: TextField;
  DialogeBodyText?: TextField;
  DraftToastIcon?: ImageField;
  DraftToastBody?: TextField;
  DraftToastTitle?: TextField;
  ConfirmationIcon?: ImageField;
  ConfirmationTitle?: TextField;
  ConfirmationDescription?: TextField;
  RequestIDLabel?: TextField;
  ConfirmationButtonText?: TextField;
  SubmissionErrorMessage?: TextField;
  SubmitRequestRetryButtonLabel?: TextField;
  RequestQuoteForOrderLine?: TextField;
  ModifyQuoteForOrderLine?: TextField;
}
