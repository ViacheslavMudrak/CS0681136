import React from "react";
import { TEST_CASE_DATA_IDS } from "src/helpers/enums";

import type { ComponentProps } from "@/lib/component-props";

import type { IDashboardInfoBannerFields } from "./DashboardInfoBanner.type";
import { DashboardInfoBannerDefaultVariant } from "./variants/DashboardInfoBannerDefault.variant";

type DashboardInfoBannerProps = ComponentProps & {
  fields: IDashboardInfoBannerFields;
};

const DashboardInfoBannerBase = ({
  fields,
  params,
  page,
}: DashboardInfoBannerProps): React.ReactElement | null => {
  return (
    <DashboardInfoBannerDefaultVariant
      testId={TEST_CASE_DATA_IDS.DASHBOARD_INFO_BANNER}
      fields={fields}
      params={params}
      page={page}
    />
  );
};

const DashboardInfoBanner = React.memo(DashboardInfoBannerBase);
export default DashboardInfoBanner;
