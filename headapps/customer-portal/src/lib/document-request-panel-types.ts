import type { Field, ImageField } from "@sitecore-content-sdk/nextjs";

/** Runtime line shown in the document request panel and sent to the API */
export interface DocumentRequestUiLine {
  lineId: string;
  customerPartNumber: string;
  intraloxPartNumber: string;
  description: string;
  quantity: number;
}

/** CMS repeatable row for document type tiles */
export interface DocumentRequestDocumentTypeItem {
  id: string;
  displayName?: string;
  fields?: {
    Label?: Field<string>;
    Value?: Field<string>;
    Visible?: Field<boolean>;
    SortOrder?: Field<string>;
    IsOtherType?: Field<boolean>;
  };
}

/** CMS strings for the document request panel (Order Detail + Order Management) */
export interface IDocumentRequestPanelFields {
  DocumentRequestPanelTitle?: Field<string>;
  DocumentRequestPanelSubheading?: Field<string>;
  DocumentRequestSubmittingAsLabel?: Field<string>;
  DocumentRequestSubmittingAsTooltip?: Field<string>;
  DocumentRequestSingleItemSectionLabel?: Field<string>;
  DocumentRequestMultiItemSectionLabelPattern?: Field<string>;
  DocumentRequestDocumentTypeLabel?: Field<string>;
  DocumentRequestDocumentTypeList?: DocumentRequestDocumentTypeItem[];
  DocumentRequestOtherTypeLabel?: Field<string>;
  DocumentRequestOtherTypePlaceholder?: Field<string>;
  DocumentRequestAdditionalNotesLabel?: Field<string>;
  DocumentRequestAdditionalNotesPlaceholder?: Field<string>;
  DocumentRequestCancelLabel?: Field<string>;
  DocumentRequestSubmitLabel?: Field<string>;
  DocumentRequestUnsavedDialogTitle?: Field<string>;
  DocumentRequestUnsavedDialogBody?: Field<string>;
  DocumentRequestUnsavedConfirmLabel?: Field<string>;
  DocumentRequestUnsavedCancelLabel?: Field<string>;
  DocumentRequestSuccessTitle?: Field<string>;
  DocumentRequestSuccessBody?: Field<string>;
  DocumentRequestSuccessCloseLabel?: Field<string>;
  /** Confirmation screen icon (tick, etc.); circle treatment comes from app styles. */
  DocumentRequestConfirmationIcon?: ImageField;
  /** Shown when the submission API fails (inline error). */
  DocumentRequestSubmissionErrorMessage?: Field<string>;
  /**
   * Sitecore `SubmissionRetryButtonLabel` — label for retry after a failed submit
   * (footer primary action and submission error modal; see `documentRequestCmsMapping`).
   */
  DocumentRequestRetryLabel?: Field<string>;
}
