import React from "react";

import { TEST_CASE_DATA_IDS } from "src/helpers/enums";
import { IParams } from "src/helpers/interface";
import type { ILanguageSwitcherFields } from "./LanguageSwitcher.type";
import { LanguageSwitcherDefaultVariant } from "./variants/LanguageSwitcherDefault.variant";

interface ILanguageSwitcherProps extends IParams {
  fields: ILanguageSwitcherFields;
  params: IParams;
}

const DefaultBase = ({
  fields,
  params
}: ILanguageSwitcherProps): React.ReactElement => {
  return (
    <LanguageSwitcherDefaultVariant
      testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER}
      fields={fields}
      params={params}
    />
  );
};

const Default = React.memo(DefaultBase);
export default Default;
