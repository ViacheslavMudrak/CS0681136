import React from "react";

import { TEST_CASE_DATA_IDS } from "src/helpers/enums";
import { IParams } from "src/helpers/interface";
import type { IAuthFields } from "./Auth.type";
import { AuthDefaultVariant } from "./variants/AuthDefault.variant";

interface IAuthProps extends IParams {
  fields: IAuthFields;
  params: IParams;
}

const DefaultBase = ({ fields, params }: IAuthProps): React.ReactElement => {
  return <AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={params} />;
};

export default React.memo(DefaultBase);
