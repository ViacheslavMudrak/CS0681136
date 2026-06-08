import React from "react";

import { TEST_CASE_DATA_IDS } from "src/helpers/enums";

import type { ComponentProps } from "@/lib/component-props";

import type { IOrderDetailFields } from "./OrderDetail.type";
import { OrderDetailDefaultVariant } from "./variants/OrderDetailDefault.variant";

type OrderDetailProps = ComponentProps & {
  fields: IOrderDetailFields;
};

const OrderDetailBase = ({ fields, params, page }: OrderDetailProps): React.ReactElement => {
  return (
    <OrderDetailDefaultVariant
      testId={TEST_CASE_DATA_IDS.ORDER_DETAIL}
      fields={fields}
      params={params}
      page={page}
    />
  );
};

const OrderDetail = React.memo(OrderDetailBase);
export default OrderDetail;
