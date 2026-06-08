import React from "react";

import type { ComponentProps } from "@/lib/component-props";
import { TEST_CASE_DATA_IDS } from "src/helpers/enums";
import type { IUserProfileMenuFields } from "./UserProfileMenu.type";
import { UserProfileMenuDefaultVariant } from "./variants/UserProfileMenuDefault.variant";

type UserProfileMenuProps = ComponentProps & {
  fields: IUserProfileMenuFields;
};

const DefaultBase = ({
  fields,
  params,
  page,
}: UserProfileMenuProps): React.ReactElement => {
  return (
    <UserProfileMenuDefaultVariant
      testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU}
      fields={fields}
      params={params}
      page={page}
    />
  );
};

const Default = React.memo(DefaultBase);
export default Default;

