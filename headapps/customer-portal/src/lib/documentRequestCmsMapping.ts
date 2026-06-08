import type {
  IOrderManagementFields,
  OrderManagementTabFields,
} from "@/components/core/OrderManagement/OrderManagement.type";
import type { IDocumentRequestPanelFields, DocumentRequestDocumentTypeItem } from "@/lib/document-request-panel-types";
import type {
  SitecoreDocumentRequestSelectionFieldValue,
  SitecoreDocumentRequestSelectionRef,
  SitecoreDocumentRequestTypeRow,
} from "@/lib/document-request-cms.types";

function resolveDocumentRequestSelectionRef(
  refOrList: SitecoreDocumentRequestSelectionFieldValue | null | undefined
): SitecoreDocumentRequestSelectionRef | undefined {
  if (!Array.isArray(refOrList)) {
    return refOrList ?? undefined;
  }

  const hasDocumentRequestIdentity = (row: SitecoreDocumentRequestSelectionRef): boolean => {
    const idText = `${row.name ?? ""} ${row.displayName ?? ""} ${row.url ?? ""}`.toLowerCase();
    return idText.includes("document request") || idText.includes("document-request");
  };
  const hasSelector = (row: SitecoreDocumentRequestSelectionRef): boolean =>
    (row.fields?.DocumentTypeSelector?.length ?? 0) > 0;

  return (
    refOrList.find((row) => hasDocumentRequestIdentity(row) && hasSelector(row)) ??
    refOrList.find((row) => hasSelector(row)) ??
    refOrList.find((row) => hasDocumentRequestIdentity(row) && row?.fields != null) ??
    refOrList.find((row) => row.fields?.DocumentTypeTitle?.value) ??
    refOrList.find((row) => row?.fields != null)
  );
}

function mapDocumentTypeRow(row: SitecoreDocumentRequestTypeRow, index: number): DocumentRequestDocumentTypeItem {
  const isVisible = row.fields?.IsVisible?.value;
  return {
    id: row.id,
    displayName: row.displayName,
    fields: {
      Label: row.fields?.SelectorTitle,
      Value: row.fields?.SelectorValue,
      /** Sitecore `IsVisible`; when omitted, treat as visible (see {@link getVisibleSortedDocumentTypes}). */
      Visible: { value: isVisible !== false },
      IsOtherType: row.fields?.IsOtherType,
      SortOrder: row.fields?.SortOrder ?? { value: String((index + 1) * 10) },
    },
  };
}

/**
 * Maps Sitecore tab fields `QuoteSelection` or `DocumentSelection` (same item template) into
 * {@link IDocumentRequestPanelFields} consumed by {@link DocumentRequestPanel}.
 */
export function mapQuoteSelectionToDocumentRequestPanelFields(
  refOrList: SitecoreDocumentRequestSelectionFieldValue | null | undefined
): Partial<IDocumentRequestPanelFields> {
  const ref = resolveDocumentRequestSelectionRef(refOrList);
  const f = ref?.fields;
  if (!f) {
    return {};
  }

  const rows = f.DocumentTypeSelector ?? [];
  const documentTypeList: DocumentRequestDocumentTypeItem[] = rows.map((row, index) =>
    mapDocumentTypeRow(row, index)
  );

  return {
    DocumentRequestPanelTitle: f.PanelTitle,
    DocumentRequestPanelSubheading: f.PanelSubheading,
    DocumentRequestSubmittingAsLabel: f.SubmittingAsLabel,
    DocumentRequestSubmittingAsTooltip: f.SubmittingAsTooltipDescription,
    DocumentRequestSingleItemSectionLabel: f.RequestHeading,
    DocumentRequestMultiItemSectionLabelPattern: f.RequestTitle,
    DocumentRequestDocumentTypeLabel: f.DocumentTypeTitle,
    DocumentRequestDocumentTypeList: documentTypeList.length > 0 ? documentTypeList : undefined,
    DocumentRequestOtherTypeLabel: f.OtherDocumentLabel,
    DocumentRequestOtherTypePlaceholder: f.OtherDocumentPlaceholder,
    DocumentRequestAdditionalNotesLabel: f.AdditionalNotesLabel,
    DocumentRequestAdditionalNotesPlaceholder: f.AdditionalNotesPlaceholder,
    DocumentRequestCancelLabel: f.CancelButtonLabel,
    DocumentRequestSubmitLabel: f.SubmitButtonLabel,
    DocumentRequestUnsavedDialogTitle: f.DialogTitle,
    DocumentRequestUnsavedDialogBody: f.DialogDescription,
    DocumentRequestUnsavedConfirmLabel: f.DialogConfirmButtonLabel,
    DocumentRequestUnsavedCancelLabel: f.DialogCancelButtonLabel,
    DocumentRequestSuccessTitle: f.ConfirmationTitle,
    DocumentRequestSuccessBody: f.ConfirmationDescription,
    DocumentRequestSuccessCloseLabel: f.ConfirmationButtonText,
    DocumentRequestConfirmationIcon: f.ConfirmationIcon,
    DocumentRequestSubmissionErrorMessage: f.SubmissionErrorMessage,
    /** Sitecore `SubmissionRetryButtonLabel` (template); `RetryButtonLabel` is legacy JSON only. */
    DocumentRequestRetryLabel: f.SubmissionRetryButtonLabel ?? f.RetryButtonLabel,
  };
}

/**
 * Order List (EP1): map document-request CMS from OM root, then overlay the Orders tab.
 * Tab overrides root when both define the same {@link IDocumentRequestPanelFields} keys.
 * Use when the Orders tab item omits `QuoteSelection`/`DocumentSelection` but the OM datasource includes them.
 */
export function mergeOrderManagementDocumentRequestCms(
  tabKind: string,
  tabFields: Pick<OrderManagementTabFields, "DocumentSelection" | "QuoteSelection"> | null | undefined,
  rootFields: Pick<IOrderManagementFields, "DocumentSelection" | "QuoteSelection">
): Partial<IDocumentRequestPanelFields> {
  if (tabKind !== "orders") {
    return {};
  }
  const fromRoot = mapQuoteSelectionToDocumentRequestPanelFields(
    (rootFields.DocumentSelection ?? rootFields.QuoteSelection) as
      | SitecoreDocumentRequestSelectionFieldValue
      | undefined
  );
  const fromTab =
    tabFields != null
      ? mapQuoteSelectionToDocumentRequestPanelFields(
          tabFields.DocumentSelection ?? tabFields.QuoteSelection
        )
      : {};
  return { ...fromRoot, ...fromTab };
}
