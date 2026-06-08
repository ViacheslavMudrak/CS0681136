import { describe, it, expect } from "vitest";

import {
  mapQuoteSelectionToDocumentRequestPanelFields,
  mergeOrderManagementDocumentRequestCms,
} from "@/lib/documentRequestCmsMapping";
import { getVisibleSortedDocumentTypes } from "@/lib/documentRequestPanelUtils";
import type { SitecoreDocumentRequestSelectionRef } from "@/lib/document-request-cms.types";

describe("mapQuoteSelectionToDocumentRequestPanelFields", () => {
  it("maps Sitecore QuoteSelection / Request Quote item JSON to panel fields", () => {
    const ref: SitecoreDocumentRequestSelectionRef = {
      id: "89838e01-1fd8-4eb9-ae2e-01f872026522",
      fields: {
        PanelTitle: { value: "Request Document" },
        PanelSubheading: { value: "Optional subheading" },
        SubmittingAsLabel: { value: "SUBMITTING AS" },
        SubmittingAsTooltipDescription: { value: "Tooltip text" },
        RequestHeading: { value: "Add request details" },
        RequestTitle: { value: "PO: {PO_NUMBER} | {ORDER_NUMBER}" },
        DocumentTypeTitle: { value: "Document Type" },
        DocumentTypeSelector: [
          {
            id: "a",
            fields: {
              SelectorTitle: { value: "Compliance Letter" },
              SelectorValue: { value: "compliance_letter" },
              IsVisible: { value: true },
              IsOtherType: { value: false },
            },
          },
          {
            id: "b",
            fields: {
              SelectorTitle: { value: "Other" },
              SelectorValue: { value: "other" },
              IsVisible: { value: true },
              IsOtherType: { value: true },
            },
          },
          {
            id: "hidden",
            fields: {
              SelectorTitle: { value: "Hidden" },
              SelectorValue: { value: "hidden" },
              IsVisible: { value: false },
              IsOtherType: { value: false },
            },
          },
        ],
        OtherDocumentLabel: { value: "Other Document Type" },
        OtherDocumentPlaceholder: { value: "Enter other" },
        AdditionalNotesLabel: { value: "Additional Notes" },
        AdditionalNotesPlaceholder: { value: "Notes ph" },
        CancelButtonLabel: { value: "Cancel" },
        SubmitButtonLabel: { value: "Submit Request" },
        DialogTitle: { value: "Discard?" },
        DialogDescription: { value: "Unsaved body" },
        DialogConfirmButtonLabel: { value: "Yes" },
        DialogCancelButtonLabel: { value: "Back" },
        ConfirmationTitle: { value: "Done" },
        ConfirmationDescription: { value: "Success body" },
        ConfirmationButtonText: { value: "Close Window" },
        ConfirmationIcon: {
          value: { src: "https://example.com/tick.svg", alt: "Tick" },
        },
        SubmissionRetryButtonLabel: { value: "Try again" },
      },
    };

    const mapped = mapQuoteSelectionToDocumentRequestPanelFields(ref);
    expect(mapped.DocumentRequestPanelTitle?.value).toBe("Request Document");
    expect(mapped.DocumentRequestConfirmationIcon?.value?.src).toBe("https://example.com/tick.svg");
    expect(mapped.DocumentRequestRetryLabel?.value).toBe("Try again");
    expect(mapped.DocumentRequestMultiItemSectionLabelPattern?.value).toBe(
      "PO: {PO_NUMBER} | {ORDER_NUMBER}"
    );
    expect(mapped.DocumentRequestDocumentTypeLabel?.value).toBe("Document Type");

    const list = getVisibleSortedDocumentTypes(mapped.DocumentRequestDocumentTypeList);
    expect(list.map((x) => x.id)).toEqual(["a", "b"]);
    expect(list[0].fields?.Label?.value).toBe("Compliance Letter");
    expect(list[0].fields?.Value?.value).toBe("compliance_letter");
    expect(list[1].fields?.IsOtherType?.value).toBe(true);
  });

  it("returns empty partial when reference has no fields", () => {
    expect(mapQuoteSelectionToDocumentRequestPanelFields(undefined)).toEqual({});
    expect(mapQuoteSelectionToDocumentRequestPanelFields({ id: "x" })).toEqual({});
  });

  it("maps when Sitecore returns QuoteSelection as an array", () => {
    const mapped = mapQuoteSelectionToDocumentRequestPanelFields([
      {
        id: "89838e01-1fd8-4eb9-ae2e-01f872026522",
        fields: {
          DocumentTypeTitle: { value: "Document Type" },
          DocumentTypeSelector: [
            {
              id: "letter",
              fields: {
                SelectorTitle: { value: "Compliance Letter" },
                SelectorValue: { value: "compliance_letter" },
                IsVisible: { value: true },
                IsOtherType: { value: false },
              },
            },
          ],
        },
      },
    ]);

    expect(mapped.DocumentRequestDocumentTypeLabel?.value).toBe("Document Type");
    expect(mapped.DocumentRequestDocumentTypeList?.[0]?.fields?.Value?.value).toBe(
      "compliance_letter"
    );
  });

  it("prefers the array entry that actually contains DocumentTypeSelector", () => {
    const mapped = mapQuoteSelectionToDocumentRequestPanelFields([
      {
        id: "quote-request",
        fields: {
          // Intentional: no DocumentTypeSelector on this row.
          PanelTitle: { value: "Request Quote" },
        },
      },
      {
        id: "document-request",
        fields: {
          PanelTitle: { value: "Request Document" },
          DocumentTypeTitle: { value: "Document Type" },
          DocumentTypeSelector: [
            {
              id: "other",
              fields: {
                SelectorTitle: { value: "Other" },
                SelectorValue: { value: "other" },
                IsVisible: { value: true },
                IsOtherType: { value: true },
              },
            },
          ],
        },
      },
    ]);

    expect(mapped.DocumentRequestPanelTitle?.value).toBe("Request Document");
    expect(mapped.DocumentRequestDocumentTypeList?.[0]?.id).toBe("other");
  });

  it("prefers document-request entry when multiple rows contain selectors", () => {
    const mapped = mapQuoteSelectionToDocumentRequestPanelFields([
      {
        id: "quote-request",
        displayName: "Quote Request",
        fields: {
          PanelTitle: { value: "Request Quote" },
          DocumentTypeTitle: { value: "Quote Type" },
          DocumentTypeSelector: [
            {
              id: "quote-only",
              fields: {
                SelectorTitle: { value: "Quote only" },
                SelectorValue: { value: "quote_only" },
                IsVisible: { value: true },
              },
            },
          ],
        },
      },
      {
        id: "document-request",
        displayName: "Document Request",
        url: "/en/data/order-detail/available-documents/document-request",
        fields: {
          PanelTitle: { value: "Request Document" },
          DocumentTypeTitle: { value: "Document Type" },
          DocumentTypeSelector: [
            {
              id: "doc-only",
              fields: {
                SelectorTitle: { value: "Compliance Letter" },
                SelectorValue: { value: "compliance_letter" },
                IsVisible: { value: true },
              },
            },
          ],
        },
      },
    ]);

    expect(mapped.DocumentRequestPanelTitle?.value).toBe("Request Document");
    expect(mapped.DocumentRequestDocumentTypeLabel?.value).toBe("Document Type");
    expect(mapped.DocumentRequestDocumentTypeList?.[0]?.id).toBe("doc-only");
  });
});

describe("mergeOrderManagementDocumentRequestCms", () => {
  const rootDocOnly = [
    {
      id: "document-request",
      displayName: "Document Request",
      fields: {
        PanelTitle: { value: "From Root" },
        DocumentTypeTitle: { value: "Root Types" },
        DocumentTypeSelector: [
          {
            id: "root-a",
            fields: {
              SelectorTitle: { value: "Root Letter" },
              SelectorValue: { value: "root_letter" },
              IsVisible: { value: true },
            },
          },
        ],
      },
    },
  ];

  it("returns empty partial when tab kind is not orders", () => {
    expect(
      mergeOrderManagementDocumentRequestCms(
        "shipments",
        { QuoteSelection: rootDocOnly },
        { QuoteSelection: rootDocOnly }
      )
    ).toEqual({});
  });

  it("uses root QuoteSelection when Orders tab has no selection", () => {
    const merged = mergeOrderManagementDocumentRequestCms("orders", undefined, {
      QuoteSelection: rootDocOnly,
    });
    expect(merged.DocumentRequestPanelTitle?.value).toBe("From Root");
    expect(merged.DocumentRequestDocumentTypeLabel?.value).toBe("Root Types");
    expect(merged.DocumentRequestDocumentTypeList?.[0]?.id).toBe("root-a");
  });

  it("overlays tab selection over root (tab wins)", () => {
    const tabOnly = [
      {
        id: "document-request-tab",
        displayName: "Document Request",
        fields: {
          PanelTitle: { value: "From Tab" },
          DocumentTypeTitle: { value: "Tab Types" },
          DocumentTypeSelector: [
            {
              id: "tab-z",
              fields: {
                SelectorTitle: { value: "Tab Manual" },
                SelectorValue: { value: "tab_manual" },
                IsVisible: { value: true },
              },
            },
          ],
        },
      },
    ];

    const merged = mergeOrderManagementDocumentRequestCms(
      "orders",
      { QuoteSelection: tabOnly },
      { QuoteSelection: rootDocOnly }
    );
    expect(merged.DocumentRequestPanelTitle?.value).toBe("From Tab");
    expect(merged.DocumentRequestDocumentTypeLabel?.value).toBe("Tab Types");
    expect(merged.DocumentRequestDocumentTypeList?.map((x) => x.id)).toEqual(["tab-z"]);
  });
});
