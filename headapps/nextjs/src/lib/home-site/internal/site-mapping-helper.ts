/**
 * Resolves a Sitecore item ID from site mapping rules using the user's org context.
 * Returns the matched SiteMappingItem.id, or a sentinel for Unknown / None.
 */

import type { SiteMappingItem } from 'lib/sitecore-search/types/discover';
import type { GoogleProfileData } from 'ts/google';

import { ASCENSION_SITE_NONE, ASCENSION_SITE_UNKNOWN } from '../types';

const RULE_TWO_MOSTL = 'MOSTL';

export function resolveHomeSiteIdFromMapping(
  mappings: SiteMappingItem[],
  googleProfile: GoogleProfileData
): string {
  if (!googleProfile.userInfo?.companyCode && googleProfile.userInfo?.businessUnit == null) {
    return ASCENSION_SITE_UNKNOWN.itemId;
  }

  const ruleOneMatch = mappings.find((m) =>
    m.rule_one_company_codes?.some(
      (code) => code?.toUpperCase() === googleProfile.userInfo?.companyCode?.toUpperCase()
    )
  );
  if (ruleOneMatch) {
    return ruleOneMatch.site_id ?? ASCENSION_SITE_UNKNOWN.itemId;
  }

  const businessUnit =
    googleProfile.userInfo?.businessUnit != null
      ? String(googleProfile.userInfo?.businessUnit)
      : undefined;
  if (businessUnit) {
    const ruleTwoMatch = mappings.find(
      (m) =>
        m.rule_two_company_codes?.includes(RULE_TWO_MOSTL) &&
        m.rule_two_business_unit_codes?.includes(businessUnit)
    );
    if (ruleTwoMatch) {
      return ruleTwoMatch.site_id ?? ASCENSION_SITE_UNKNOWN.itemId;
    }
  }

  return ASCENSION_SITE_NONE.itemId;
}
