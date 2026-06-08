import type { LinkField } from "@sitecore-content-sdk/nextjs";
import { toOrderManagementLinkFieldWithHref } from "@/lib/orderManagementUtils";
import type { IUtilityLinksFields } from "./UtilityLinks.type";

export function parseUtilityLinkDisplayPosition(fields: IUtilityLinksFields): number {
  const raw = fields.SortOrder?.value;
  if (raw == null || raw === "") return 1;
  const n = typeof raw === "number" ? raw : Number.parseInt(String(raw), 10);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export function resolveUtilityLinkField(fields: IUtilityLinksFields): LinkField | undefined {
  if (!fields.URL) {
    return undefined;
  }
  return toOrderManagementLinkFieldWithHref(fields.URL) ?? fields.URL;
}
