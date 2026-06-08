import { describe, it, expect } from "vitest";

import type { DocumentRequestDocumentTypeItem } from "@/lib/document-request-panel-types";
import {
  getVisibleSortedDocumentTypes,
  resolveMultiItemSectionLabel,
  sitecoreRichTextFieldHasRenderableContent,
  truncateDescription,
} from "@/lib/documentRequestPanelUtils";

describe("getVisibleSortedDocumentTypes", () => {
  it("filters Visible=false and sorts by SortOrder", () => {
    const items: DocumentRequestDocumentTypeItem[] = [
      {
        id: "b",
        fields: {
          Label: { value: "B" },
          Value: { value: "b" },
          Visible: { value: true },
          SortOrder: { value: "20" },
        },
      },
      {
        id: "a",
        fields: {
          Label: { value: "A" },
          Value: { value: "a" },
          Visible: { value: true },
          SortOrder: { value: "5" },
        },
      },
      {
        id: "hidden",
        fields: {
          Label: { value: "H" },
          Value: { value: "h" },
          Visible: { value: false },
          SortOrder: { value: "1" },
        },
      },
    ];
    const sorted = getVisibleSortedDocumentTypes(items);
    expect(sorted.map((x) => x.id)).toEqual(["a", "b"]);
  });
});

describe("resolveMultiItemSectionLabel", () => {
  it("replaces PO and order tokens", () => {
    expect(
      resolveMultiItemSectionLabel("PO {PO_NUMBER} / {ORDER_NUMBER}", "P1", "O9")
    ).toBe("PO P1 / O9");
  });
});

describe("sitecoreRichTextFieldHasRenderableContent", () => {
  it("is false for undefined / empty markup", () => {
    expect(sitecoreRichTextFieldHasRenderableContent(undefined)).toBe(false);
    expect(sitecoreRichTextFieldHasRenderableContent({ value: "" })).toBe(false);
    expect(sitecoreRichTextFieldHasRenderableContent({ value: "   " })).toBe(false);
    expect(sitecoreRichTextFieldHasRenderableContent({ value: "<p></p>" })).toBe(false);
    expect(sitecoreRichTextFieldHasRenderableContent({ value: "<p>&nbsp;</p>" })).toBe(false);
  });

  it("detects plain and HTML-backed values", () => {
    expect(sitecoreRichTextFieldHasRenderableContent({ value: "Tip" })).toBe(true);
    expect(
      sitecoreRichTextFieldHasRenderableContent({
        value: "<p>Use <strong>this</strong> account.</p>",
      })
    ).toBe(true);
  });

  it("reads editable when present (Sitecore authoring / SDK)", () => {
    expect(
      sitecoreRichTextFieldHasRenderableContent({
        value: "",
        editable: "<p>Shown in Experience Editor.</p>",
      })
    ).toBe(true);
  });
});

describe("truncateDescription", () => {
  it("leaves short text unchanged", () => {
    expect(truncateDescription("short", 20)).toBe("short");
  });

  it("truncates long text with ellipsis marker", () => {
    const long = "a".repeat(50);
    const out = truncateDescription(long, 20);
    expect(out.length).toBeLessThanOrEqual(20);
    expect(out.endsWith("…")).toBe(true);
  });
});
