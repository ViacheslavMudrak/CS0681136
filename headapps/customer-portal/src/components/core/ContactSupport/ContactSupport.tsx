import React from "react";

import { TEST_CASE_DATA_IDS } from "src/helpers/enums";
import { IParams } from "src/helpers/interface";
import type { IContactSupportFields } from "./ContactSupport.type";
import { ContactSupportDefaultVariant } from "./variants/ContactSupportDefault.variant";

interface IContactSupportProps extends IParams {
  fields: IContactSupportFields;
  params: IParams;
}

const DefaultBase = ({
  fields,
  params,
}: IContactSupportProps): React.ReactElement => {
  return (
    <ContactSupportDefaultVariant
      testId={TEST_CASE_DATA_IDS.CONTACT_SUPPORT}
      fields={fields}
      params={params}
    />
  );
};

const Default = React.memo(DefaultBase);
export default Default;
