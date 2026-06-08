import { describe, it, expect } from "vitest";

import {
  mergeTabFilterOptionsAppendUnknownStatuses,
  normalizeTabFilterFieldsWithLooseShape,
  readLooseFilterLabel,
  readLooseFilterOptions,
  readLooseSearchAttributes,
  readLooseSearchPlaceholder,
} from "@/components/core/OrderManagement/tabFilterLooseFields";
import type { OrderManagementTabFields } from "@/components/core/OrderManagement/OrderManagement.type";

const fallbackOption = {
  id: "fb-open",
  displayName: "Open",
  fields: { StatusValue: { value: "Open" }, Statuskey: { value: "open" } },
};

describe("tabFilterLooseFields", () => {
  it("readLooseFilterLabel prefers canonical FilterLabel", () => {
    const tabFields = { FilterLabel: { value: "  Status  " } } as OrderManagementTabFields;
    expect(readLooseFilterLabel(tabFields)?.value).toBe("  Status  ");
  });

  it("readLooseFilterLabel returns undefined when no label is configured", () => {
    expect(readLooseFilterLabel({} as OrderManagementTabFields)).toBeUndefined();
  });

  it("readLooseFilterLabel reads alternate casing when canonical is empty", () => {
    const tabFields = {
      FilterLabel: { value: "" },
      filterLabel: { value: "Loose label" },
    } as unknown as OrderManagementTabFields;
    expect(readLooseFilterLabel(tabFields)?.value).toBe("Loose label");
  });

  it("readLooseFilterOptions reads filterOptions array", () => {
    const tabFields = {
      filterOptions: [fallbackOption],
    } as unknown as OrderManagementTabFields;
    expect(readLooseFilterOptions(tabFields)).toHaveLength(1);
  });

  it("readLooseSearchPlaceholder and SearchAttribute use loose keys", () => {
    const tabFields = {
      searchPlaceholder: { value: "Find" },
      searchAttribute: [{ id: "a1", fields: { Value: { value: "PO" } } }],
    } as unknown as OrderManagementTabFields;
    expect(readLooseSearchPlaceholder(tabFields)?.value).toBe("Find");
    expect(readLooseSearchAttributes(tabFields)).toHaveLength(1);
  });

  it("normalizeTabFilterFieldsWithLooseShape returns null for null input", () => {
    expect(
      normalizeTabFilterFieldsWithLooseShape(null, {
        filterLabel: "Status",
        filterOptions: [fallbackOption],
      })
    ).toBeNull();
  });

  it("normalizeTabFilterFieldsWithLooseShape merges loose search fields when canonical search is empty", () => {
    const tabFields = {
      FilterLabel: { value: "" },
      filterLabel: { value: "Status" },
      filterOptions: [fallbackOption],
      searchPlaceholder: { value: "Find" },
      searchAttribute: [{ id: "a1", fields: { Value: { value: "PO" } } }],
    } as unknown as OrderManagementTabFields;

    const normalized = normalizeTabFilterFieldsWithLooseShape(tabFields, {
      filterLabel: "Fallback",
      filterOptions: [fallbackOption],
    });

    expect(normalized?.SearchPlaceholder?.value).toBe("Find");
    expect(normalized?.SearchAttribute).toHaveLength(1);
  });

  it("normalizeTabFilterFieldsWithLooseShape applies fallbacks when canonical fields missing", () => {
    const tabFields = {
      filterLabel: { value: "Quote status" },
      filterOptions: [fallbackOption],
    } as unknown as OrderManagementTabFields;

    const normalized = normalizeTabFilterFieldsWithLooseShape(tabFields, {
      filterLabel: "Fallback label",
      filterOptions: [fallbackOption],
    });

    expect(normalized?.FilterLabel?.value).toBe("Quote status");
    expect(normalized?.FilterOptions).toHaveLength(1);
  });

  it("normalizeTabFilterFieldsWithLooseShape returns original when fully canonical", () => {
    const tabFields: OrderManagementTabFields = {
      FilterLabel: { value: "Status" },
      FilterOptions: [fallbackOption],
      SearchPlaceholder: { value: "Search" },
      SearchAttribute: [{ id: "a1", fields: { Value: { value: "ID" } } }],
    };
    const original = normalizeTabFilterFieldsWithLooseShape(tabFields, {
      filterLabel: "Ignored",
      filterOptions: [fallbackOption],
    });
    expect(original).toBe(tabFields);
  });

  it("mergeTabFilterOptionsAppendUnknownStatuses returns early for null rows", () => {
    const tabFields: OrderManagementTabFields = { FilterOptions: [fallbackOption] };
    expect(mergeTabFilterOptionsAppendUnknownStatuses(tabFields, null, "syn")).toBe(tabFields);
  });

  it("mergeTabFilterOptionsAppendUnknownStatuses forces empty options when CMS empty and rows exist", () => {
    const tabFields: OrderManagementTabFields = { FilterOptions: [] };
    const merged = mergeTabFilterOptionsAppendUnknownStatuses(
      tabFields,
      [{ statusKey: "shipped" }],
      "syn"
    );
    expect(merged?.FilterOptions).toEqual([]);
  });

  it("mergeTabFilterOptionsAppendUnknownStatuses appends synthetic status keys", () => {
    const tabFields: OrderManagementTabFields = { FilterOptions: [fallbackOption] };
    const merged = mergeTabFilterOptionsAppendUnknownStatuses(
      tabFields,
      [{ statusKey: "shipped" }],
      "syn"
    );
    expect(merged?.FilterOptions).toHaveLength(2);
    expect(merged?.FilterOptions?.[1]?.id).toBe("syn-shipped");
  });
});
