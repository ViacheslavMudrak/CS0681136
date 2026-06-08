import React from "react";
import { TEST_CASE_DATA_IDS } from "src/helpers/enums";

import type { ComponentProps } from "@/lib/component-props";

import type { IUserActionTilesFields } from "./UserActionTiles.type";
import { UserActionTilesDefaultVariant } from "./variants/UserActionTilesDefault.variant";

type UserActionTilesProps = ComponentProps & {
  fields: IUserActionTilesFields;
};

const UserActionTilesBase = ({
  fields,
  params,
  page,
}: UserActionTilesProps): React.ReactElement | null => {
  return (
    <UserActionTilesDefaultVariant
      testId={TEST_CASE_DATA_IDS.USER_ACTION_TILES}
      fields={fields}
      params={params}
      page={page}
    />
  );
};

const UserActionTiles = React.memo(UserActionTilesBase);
export default UserActionTiles;
