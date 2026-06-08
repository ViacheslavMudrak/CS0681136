import type { OrderFacetSsmcRow } from "@/lib/apis/orders-api";
import { buildBeltOptionsFromSsmc } from "@/lib/apis/orders-api";
import type { BeltSelections } from "@/lib/orderManagementUtils";

export type BeltFacetDimension = keyof BeltSelections;

export type BeltFacetOptionLists = {
  series: string[];
  style: string[];
  material: string[];
  color: string[];
};

function ssmcCellLabel(cell: OrderFacetSsmcRow["series"]): string {
  return cell?.displayValue?.trim() || cell?.value?.trim() || "";
}

/** True when a facet row satisfies all non-empty draft dimension sets (OR within dimension, AND across dimensions). */
export function ssmcRowMatchesBeltDraft(row: OrderFacetSsmcRow, draft: BeltSelections): boolean {
  if (draft.series.size > 0) {
    const label = ssmcCellLabel(row.series);
    if (!label || !draft.series.has(label)) return false;
  }
  if (draft.style.size > 0) {
    const label = ssmcCellLabel(row.style);
    if (!label || !draft.style.has(label)) return false;
  }
  if (draft.material.size > 0) {
    const label = ssmcCellLabel(row.material);
    if (!label || !draft.material.has(label)) return false;
  }
  if (draft.color.size > 0) {
    const label = ssmcCellLabel(row.color);
    if (!label || !draft.color.has(label)) return false;
  }
  return true;
}

export function filterSsmcByBeltDraft(
  rows: OrderFacetSsmcRow[] | undefined | null,
  draft: BeltSelections
): OrderFacetSsmcRow[] {
  const list = rows ?? [];
  if (list.length === 0) return [];
  const anySelected =
    draft.series.size > 0 ||
    draft.style.size > 0 ||
    draft.material.size > 0 ||
    draft.color.size > 0;
  if (!anySelected) return list;
  return list.filter((row) => ssmcRowMatchesBeltDraft(row, draft));
}

/** Draft copy with one dimension cleared (used to compute options for that dimension). */
export function draftWithoutDimension(
  draft: BeltSelections,
  dimension: BeltFacetDimension
): BeltSelections {
  return {
    ...draft,
    [dimension]: new Set<string>(),
  };
}

/**
 * Cascading facet options: each dimension lists values still valid given selections in the other dimensions.
 */
export function buildCascadingBeltOptions(
  rows: OrderFacetSsmcRow[] | undefined | null,
  draft: BeltSelections
): BeltFacetOptionLists {
  return {
    series: buildBeltOptionsFromSsmc(
      filterSsmcByBeltDraft(rows, draftWithoutDimension(draft, "series"))
    ).series,
    style: buildBeltOptionsFromSsmc(
      filterSsmcByBeltDraft(rows, draftWithoutDimension(draft, "style"))
    ).style,
    material: buildBeltOptionsFromSsmc(
      filterSsmcByBeltDraft(rows, draftWithoutDimension(draft, "material"))
    ).material,
    color: buildBeltOptionsFromSsmc(
      filterSsmcByBeltDraft(rows, draftWithoutDimension(draft, "color"))
    ).color,
  };
}

const BELT_DIMENSIONS: BeltFacetDimension[] = ["series", "style", "material", "color"];

/** Removes draft values that are not present in the corresponding option list. */
export function pruneBeltDraft(draft: BeltSelections, options: BeltFacetOptionLists): BeltSelections {
  return {
    series: new Set([...draft.series].filter((v) => options.series.includes(v))),
    style: new Set([...draft.style].filter((v) => options.style.includes(v))),
    material: new Set([...draft.material].filter((v) => options.material.includes(v))),
    color: new Set([...draft.color].filter((v) => options.color.includes(v))),
  };
}

/**
 * Prunes all dimensions except `except` (used after toggling one group so the user's latest choice is kept).
 */
export function pruneBeltDraftExceptDimension(
  draft: BeltSelections,
  options: BeltFacetOptionLists,
  except: BeltFacetDimension
): BeltSelections {
  const pruned = copyBeltSelections(draft);
  for (const key of BELT_DIMENSIONS) {
    if (key === except) continue;
    pruned[key] = new Set([...draft[key]].filter((v) => options[key].includes(v)));
  }
  return pruned;
}

export function copyBeltSelections(source: BeltSelections): BeltSelections {
  return {
    series: new Set(source.series),
    style: new Set(source.style),
    material: new Set(source.material),
    color: new Set(source.color),
  };
}
