import { describe, expect, it } from "vitest";

import type { OrderFacetSsmcRow } from "@/lib/apis/orders-api";
import {
  buildCascadingBeltOptions,
  filterSsmcByBeltDraft,
  pruneBeltDraft,
  pruneBeltDraftExceptDimension,
  ssmcRowMatchesBeltDraft,
} from "@/lib/beltFacetCascade";
import { createEmptyBeltSelections } from "@/lib/orderManagementUtils";

const row = (
  series: string,
  style: string,
  material: string,
  color: string
): OrderFacetSsmcRow => ({
  series: { value: series, displayValue: series },
  style: { value: style, displayValue: style },
  material: { value: material, displayValue: material },
  color: { value: color, displayValue: color },
});

const SAMPLE: OrderFacetSsmcRow[] = [
  row("8050", "FLAT TOP E", "POLYURETHANE A23", "BLUE"),
  row("1400", "FLAT TOP", "ACETAL", "GREY"),
  row("800", "OPEN HINGE FLAT TOP", "ACETAL", "WHITE"),
  row("800", "FLAT TOP", "POLYPROPYLENE", "GREY"),
  row("800", "FLAT TOP", "POLYPROPYLENE", "BLUE"),
];

describe("beltFacetCascade", () => {
  it("returns all rows when draft has no selections", () => {
    expect(filterSsmcByBeltDraft(SAMPLE, createEmptyBeltSelections())).toHaveLength(SAMPLE.length);
  });

  it("filters rows by series selection", () => {
    const draft = createEmptyBeltSelections();
    draft.series.add("800");
    const filtered = filterSsmcByBeltDraft(SAMPLE, draft);
    expect(filtered).toHaveLength(3);
    expect(filtered.every((r) => r.series.value === "800")).toBe(true);
  });

  it("matches rows with AND across dimensions", () => {
    const draft = createEmptyBeltSelections();
    draft.series.add("800");
    draft.color.add("GREY");
    expect(ssmcRowMatchesBeltDraft(SAMPLE[3], draft)).toBe(true);
    expect(ssmcRowMatchesBeltDraft(SAMPLE[2], draft)).toBe(false);
  });

  it("cascades style options when series is selected", () => {
    const draft = createEmptyBeltSelections();
    draft.series.add("800");
    const options = buildCascadingBeltOptions(SAMPLE, draft);
    expect(options.series).toContain("800");
    expect(options.series).toContain("8050");
    expect(options.style).toEqual(["FLAT TOP", "OPEN HINGE FLAT TOP"]);
    expect(options.style).not.toContain("FLAT TOP E");
  });

  it("cascades series options when style is selected", () => {
    const draft = createEmptyBeltSelections();
    draft.style.add("FLAT TOP");
    const options = buildCascadingBeltOptions(SAMPLE, draft);
    expect(options.series.sort()).toEqual(["1400", "800"]);
    expect(options.material).toContain("ACETAL");
    expect(options.material).toContain("POLYPROPYLENE");
  });

  it("prunes all incompatible draft values on apply", () => {
    const draft = createEmptyBeltSelections();
    draft.series.add("8050");
    draft.style.add("FLAT TOP");
    const options = buildCascadingBeltOptions(SAMPLE, draft);
    const pruned = pruneBeltDraft(draft, options);
    expect([...pruned.series]).toEqual([]);
    expect([...pruned.style]).toEqual([]);
  });

  it("keeps the toggled dimension when pruning after cascade", () => {
    const draft = createEmptyBeltSelections();
    draft.series.add("800");
    draft.style.add("FLAT TOP E");
    const options = buildCascadingBeltOptions(SAMPLE, draft);
    const pruned = pruneBeltDraftExceptDimension(draft, options, "style");
    expect([...pruned.series]).toEqual([]);
    expect([...pruned.style]).toEqual(["FLAT TOP E"]);
  });
});
