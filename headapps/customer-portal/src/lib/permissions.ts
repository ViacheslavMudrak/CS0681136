import type { DxpUserSpecificPermission } from "@/lib/apis/permissions-api";

export type PermissionMatchMode = "any" | "all";

interface SitecorePermissionCodeField {
  value?: string;
}

interface SitecorePermissionFields {
  PermissionCode?: SitecorePermissionCodeField;
}

interface SitecorePermissionItem {
  fields?: SitecorePermissionFields;
}

function normalizePermissionCode(code: string): string {
  return code.trim().toLowerCase();
}

/**
 * Extracts normalized permission codes from Sitecore PermissionSelection field data.
 * Accepts unknown input and safely returns [] on malformed payloads.
 * @param selection - Sitecore PermissionSelection value
 * @returns normalized permission codes (lowercase), unique
 */
export function extractPermissionCodesFromSelection(selection: unknown): string[] {
  if (!Array.isArray(selection)) return [];

  const codeSet = new Set<string>();

  for (const item of selection as SitecorePermissionItem[]) {
    const rawCode = item?.fields?.PermissionCode?.value;
    if (typeof rawCode !== "string") continue;
    const code = normalizePermissionCode(rawCode);
    if (code) codeSet.add(code);
  }

  return Array.from(codeSet);
}

/**
 * Builds a normalized Set of enabled user permission codes from API response rows.
 * @param permissions - API user permission rows
 * @returns set of normalized permission codes
 */
export function buildEnabledPermissionCodeSet(
  permissions: DxpUserSpecificPermission[] | null | undefined
): Set<string> {
  const result = new Set<string>();
  if (!Array.isArray(permissions)) return result;

  for (const permission of permissions) {
    if (!permission?.isEnabled) continue;
    const rawCode = permission.permissionCode;
    if (typeof rawCode !== "string") continue;
    const code = normalizePermissionCode(rawCode);
    if (code) result.add(code);
  }

  return result;
}

/**
 * Evaluates if a user permission set satisfies required permission codes.
 * Empty required codes are treated as public access.
 * @param requiredCodes - required permission codes
 * @param grantedCodes - granted code set
 * @param mode - matching mode: any or all
 * @returns true when access is allowed
 */
export function hasPermissionAccess(
  requiredCodes: string[],
  grantedCodes: Set<string>,
  mode: PermissionMatchMode = "any"
): boolean {
  if (!requiredCodes.length) return true;
  if (!grantedCodes.size) return false;

  if (mode === "all") {
    return requiredCodes.every((code) => grantedCodes.has(normalizePermissionCode(code)));
  }

  return requiredCodes.some((code) => grantedCodes.has(normalizePermissionCode(code)));
}
