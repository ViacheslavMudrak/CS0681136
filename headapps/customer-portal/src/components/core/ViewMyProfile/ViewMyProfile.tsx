import React from "react";
import { TEST_CASE_DATA_IDS } from "src/helpers/enums";
import type { IParams } from "src/helpers/interface";
import type { IViewMyProfileFields } from "./ViewMyProfile.type";
import { ViewMyProfileDefaultVariant } from "./variants/ViewMyProfileDefault.variant";
import { ComponentProps } from "@/lib/component-props";

type ViewMyProfileProps = ComponentProps & {
  fields: IViewMyProfileFields;
  params: IParams;
};

const ViewMyProfileBase = ({ fields, params, page }: ViewMyProfileProps): React.ReactElement => {
  return (
    <ViewMyProfileDefaultVariant
      testId={TEST_CASE_DATA_IDS.VIEW_MY_PROFILE}
      fields={fields}
      params={params}
      page={page}
    />
  );
};

const ViewMyProfile = React.memo(ViewMyProfileBase);
export default ViewMyProfile;
