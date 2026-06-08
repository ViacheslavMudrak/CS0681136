import type { Field, ImageField } from "@sitecore-content-sdk/nextjs";

/**
 * One row under `DocumentTypeSelector` / repeatable document type list on the
 * Sitecore “Request Quote” item reused for document request (until `DocumentSelection` replaces `QuoteSelection`).
 */
export interface SitecoreDocumentRequestTypeRow {
  id: string;
  displayName?: string;
  fields?: {
    SelectorTitle?: Field<string>;
    SelectorValue?: Field<string>;
    IsVisible?: Field<boolean>;
    IsOtherType?: Field<boolean>;
    SortOrder?: Field<string>;
  };
}

/**
 * Referenced item shape from tab `QuoteSelection` or `DocumentSelection` (droplink / item reference expanded in layout JSON).
 */
export interface SitecoreDocumentRequestSelectionRef {
  id?: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: {
    PanelTitle?: Field<string>;
    PanelSubheading?: Field<string>;
    SubmittingAsLabel?: Field<string>;
    SubmittingAsTooltipDescription?: Field<string>;
    RequestHeading?: Field<string>;
    RequestTitle?: Field<string>;
    DocumentTypeTitle?: Field<string>;
    DocumentTypeSelector?: SitecoreDocumentRequestTypeRow[];
    OtherDocumentLabel?: Field<string>;
    OtherDocumentPlaceholder?: Field<string>;
    AdditionalNotesLabel?: Field<string>;
    AdditionalNotesPlaceholder?: Field<string>;
    CancelButtonLabel?: Field<string>;
    SubmitButtonLabel?: Field<string>;
    DialogTitle?: Field<string>;
    DialogDescription?: Field<string>;
    DialogConfirmButtonLabel?: Field<string>;
    DialogCancelButtonLabel?: Field<string>;
    ConfirmationTitle?: Field<string>;
    ConfirmationDescription?: Field<string>;
    ConfirmationButtonText?: Field<string>;
    ConfirmationIcon?: ImageField;
    SubmissionErrorMessage?: Field<string>;
    /** Sitecore template field name on Document Request item */
    SubmissionRetryButtonLabel?: Field<string>;
    /** Legacy / alternate JSON key */
    RetryButtonLabel?: Field<string>;
    SubmittingAsIcon?: ImageField;
  };
}

/** Sitecore can return the selection as a single linked item or a one-item array. */
export type SitecoreDocumentRequestSelectionFieldValue =
  | SitecoreDocumentRequestSelectionRef
  | SitecoreDocumentRequestSelectionRef[];
