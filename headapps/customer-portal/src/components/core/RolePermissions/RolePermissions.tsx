import dynamic from "next/dynamic";
import React from "react";
import LoadingSkeleton from "@/components/shared/loading-skeleton/LoadingSkeleton";

import type { ComponentProps } from "lib/component-props";
import { TEST_CASE_DATA_IDS } from "src/helpers/enums";

import type { IRolePermissionsFields } from "./RolePermissions.type";

const RolePermissionsDefaultVariant = dynamic(
  () =>
    import("./variants/RolePermissionsDefault.variant").then(
      (module) => module.RolePermissionsDefaultVariant
    ),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8" aria-busy="true">
        <LoadingSkeleton variant="spinner" size="medium" />
      </div>
    ),
  }
);

export type IRolePermissionsProps = ComponentProps & {
  fields: IRolePermissionsFields;
};

const RolePermissionsBase = ({
  fields,
  params,
  page,
}: IRolePermissionsProps): React.ReactElement => {
  return (
    <RolePermissionsDefaultVariant
      testId={TEST_CASE_DATA_IDS.ROLE_PERMISSIONS}
      fields={fields}
      params={params}
      page={page}
    />
  );
};

const RolePermissions = React.memo(RolePermissionsBase);
export default RolePermissions;
