import type { DocumentRequestDocumentTypeItem } from "@/lib/document-request-panel-types";

function sortOrderValue(fields: DocumentRequestDocumentTypeItem["fields"]): number {
  const raw = fields?.SortOrder?.value;
  if (raw == null || raw === "") return 0;
  const n = Number.parseInt(String(raw).trim(), 10);
  return Number.isFinite(n) ? n : 0;
}

export function getVisibleSortedDocumentTypes(
  items: DocumentRequestDocumentTypeItem[] | undefined
): DocumentRequestDocumentTypeItem[] {
  const list = items ?? [];
  return list
    .filter((row) => row.fields?.Visible?.value !== false)
    .sort((a, b) => sortOrderValue(a.fields) - sortOrderValue(b.fields));
}

export function resolveMultiItemSectionLabel(
  pattern: string | undefined,
  poNumber: string,
  orderNumber: string
): string {
  const p = (pattern ?? "").trim();
  if (!p) {
    return `Select the document requested for all items in PO: ${poNumber} | Order: ${orderNumber}`;
  }
  return p
    .replace(/\{PO_NUMBER\}/gi, poNumber)
    .replace(/\{ORDER_NUMBER\}/gi, orderNumber);
}

export function truncateDescription(text: string, maxLen: number): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, Math.max(0, maxLen - 1)).trim()}…`;
}

/** Whether a Sitecore rich text shape has visible text after stripping markup and nbsp entities. */
export function sitecoreRichTextFieldHasRenderableContent(
  field: { value?: unknown; editable?: unknown } | undefined
): boolean {
  if (!field) return false;
  const chunks: string[] = [];
  if (typeof field.value === "string") chunks.push(field.value);
  if (typeof field.editable === "string") chunks.push(field.editable);
  const raw = chunks.join("");
  const text = raw
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;|&#xa0;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 0;
}
