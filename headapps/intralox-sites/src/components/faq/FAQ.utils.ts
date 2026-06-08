import type { IFAQItemFields } from "./FAQ.type";

/**
 * All distinct non-empty group labels for an FAQ, in `FaqGroup` field order (deduped).
 * Empty when the item has no groups — callers may treat that as a single ungrouped bucket.
 */
export function getFaqGroupLabels(item: IFAQItemFields): string[] {
  const groups = item.fields?.FaqGroup ?? [];
  const labels: string[] = [];
  const seen = new Set<string>();

  for (const group of groups) {
    const raw = group?.fields?.Value?.value;
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value || seen.has(value)) continue;
    seen.add(value);
    labels.push(value);
  }

  return labels;
}

/** Label from the first assigned FAQ group item, or empty when ungrouped. */
export function getFaqGroupLabel(item: IFAQItemFields): string {
  const labels = getFaqGroupLabels(item);
  return labels[0] ?? "";
}

/** True when at least one FAQ has a non-empty group — triggers per-group accordions. */
export function faqItemsUseGroupedLayout(items: IFAQItemFields[]): boolean {
  return items.some((item) => getFaqGroupLabels(item).length > 0);
}

/**
 * Buckets FAQs by group label. Group order follows first time each label appears
 * (scanning `items` in order, then each item's `FaqGroup` entries in order).
 * An FAQ assigned to multiple groups is listed under every such group.
 * Items without a group use an empty label and appear in their own bucket when mixed with grouped items.
 */
export function groupFaqItemsInOrder(items: IFAQItemFields[]): {
  label: string;
  items: IFAQItemFields[];
}[] {
  const labelToItems = new Map<string, IFAQItemFields[]>();
  const order: string[] = [];

  for (const item of items) {
    if (!item?.fields) continue;
    const labels = getFaqGroupLabels(item);
    const targetLabels = labels.length > 0 ? labels : [""];

    for (const label of targetLabels) {
      if (!labelToItems.has(label)) {
        labelToItems.set(label, []);
        order.push(label);
      }
      labelToItems.get(label)!.push(item);
    }
  }

  return order.map((label) => ({
    label,
    items: labelToItems.get(label) ?? [],
  }));
}
