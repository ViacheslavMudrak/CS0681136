import { sha256 } from 'js-sha256';

import type { VisibilitySettings } from 'lib/auth/page-security-service';
import { hasBaseTemplate, TEMPLATE_ID_CONSTANTS } from 'src/constants/template-ids';

/**
 * Returns a 16-char hex SHA-256 hash of a normalised email address.
 * Applied symmetrically on both the search index side (SearchSchema) and the
 * filter side (session.filteredGroupEmailHashes) so hashed values always match at query time.
 */
export function hashEmailForSearch(email: string): string {
  // 16 hex chars = 64-bit prefix; Negligible (less than .05%) collision risk at 100 million
  return sha256(email.toLowerCase().trim()).slice(0, 16);
}

export type AncestorWithVisibility = {
  template?: { baseTemplates?: Array<{ id?: string }> };
  visibleBy?: { targetItems?: VisibilitySettings[] };
};

/**
 * Extracts lowercase-trimmed group emails from a visibleBy target list,
 * filtering out any groups where disableGroup === '1'.
 * Mirrors the email-extraction logic in GatekeeperProxy.checkGroupAccess.
 */
export function extractEnabledGroupEmails(groups?: VisibilitySettings[]): string[] {
  return (groups ?? [])
    .filter((item) => item.disableGroup?.value !== '1')
    .map((item) => item.email?.value?.toLowerCase().trim())
    .filter((e): e is string => Boolean(e));
}

/**
 * Collects all enabled group emails from qualifying AscensionSite ancestors.
 * Returns a deduplicated union across all qualifying ancestors.
 * Mirrors GatekeeperProxy's ancestor walk — ancestors arrive root→leaf and
 * are reversed here so the closest parent is evaluated first.
 */
export function collectAncestorGroupEmails(ancestors?: AncestorWithVisibility[]): string[] {
  const reversed = [...(ancestors ?? [])].reverse();
  const emails = new Set<string>();

  for (const ancestor of reversed) {
    if (!hasBaseTemplate(ancestor.template?.baseTemplates, TEMPLATE_ID_CONSTANTS.ASCENSION_SITE)) {
      continue;
    }
    for (const email of extractEnabledGroupEmails(ancestor.visibleBy?.targetItems)) {
      emails.add(email);
    }
  }

  return [...emails];
}
