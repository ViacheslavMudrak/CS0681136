import type { JSX } from "react";
import { TEST_CASE_DATA_IDS } from "src/helpers/enums";

import type { ComponentProps } from "@/lib/component-props";

import type { IUtilityLinksFields } from "./UtilityLinks.type";
import { UtilityLinksDefaultVariant } from "./variants/UtilityLinksDefault.variant";

type UtilityLinksComponentProps = ComponentProps & {
  fields: IUtilityLinksFields;
};

/**
 * Sitecore rendering for a single dashboard utility link card.
 */
export default function UtilityLinks({
  fields,
  params,
  page,
}: UtilityLinksComponentProps): JSX.Element | null {
  return (
    <UtilityLinksDefaultVariant
      testId={TEST_CASE_DATA_IDS.UTILITY_LINKS}
      fields={fields}
      params={params}
      page={page}
    />
  );
}
