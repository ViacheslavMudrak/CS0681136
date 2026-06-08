import React from "react";
import { TEST_CASE_DATA_IDS } from "src/helpers/enums";

import type { ComponentProps } from "@/lib/component-props";

import type { IUserInfoFields } from "./UserInfo.type";
import { UserInfoDefaultVariant } from "./variants/UserInfoDefault.variant";

type UserInfoProps = ComponentProps & {
  fields: IUserInfoFields;
};

const UserInfoBase = ({ fields, params, page }: UserInfoProps): React.ReactElement => {
  return (
    <UserInfoDefaultVariant
      testId={TEST_CASE_DATA_IDS.USER_INFO}
      fields={fields}
      params={params}
      page={page}
    />
  );
};

const UserInfo = React.memo(UserInfoBase);
export default UserInfo;
