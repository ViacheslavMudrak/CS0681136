import dynamic from "next/dynamic";
import React from "react";
import LoadingSkeleton from "@/components/shared/loading-skeleton/LoadingSkeleton";

import { TEST_CASE_DATA_IDS } from "src/helpers/enums";
import { IParams } from "src/helpers/interface";
import type { IGlobalSearchFields } from "./GlobalSearch.type";

const GlobalSearchDefaultVariant = dynamic(
  () =>
    import("./variants/GlobalSearchDefault.variant").then(
      (module) => module.GlobalSearchDefaultVariant
    ),
  {
    loading: () => (
      <div className="flex items-center justify-center p-4" aria-busy="true">
        <LoadingSkeleton variant="spinner" size="small" />
      </div>
    ),
  }
);

interface IGlobalSearchProps extends IParams {
  fields: IGlobalSearchFields;
  params: IParams;
}

const DefaultBase = ({ fields, params }: IGlobalSearchProps): React.ReactElement => {
  return (
    <GlobalSearchDefaultVariant
      testId={TEST_CASE_DATA_IDS.GLOBAL_SEARCH}
      fields={fields}
      params={params}
    />
  );
};

const Default = React.memo(DefaultBase);
export default Default;
