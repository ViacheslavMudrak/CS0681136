import dynamic from "next/dynamic";
import React from "react";
import LoadingSkeleton from "@/components/shared/loading-skeleton/LoadingSkeleton";
import { TEST_CASE_DATA_IDS } from "src/helpers/enums";

import type { ComponentProps } from "@/lib/component-props";

import type { IOrderManagementFields } from "./OrderManagement.type";

const OrderManagementDefaultVariant = dynamic(
  () =>
    import("./variants/OrderManagementDefault.variant").then(
      (module) => module.OrderManagementDefaultVariant
    ),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8" aria-busy="true">
        <LoadingSkeleton variant="spinner" size="medium" />
      </div>
    ),
  }
);

type OrderManagementProps = ComponentProps & {
  fields: IOrderManagementFields;
};

const OrderManagementBase = ({ fields, params, page }: OrderManagementProps): React.ReactElement => {
  return (
    <OrderManagementDefaultVariant
      testId={TEST_CASE_DATA_IDS.ORDER_MANAGEMENT}
      fields={fields}
      params={params}
      page={page}
    />
  );
};

const OrderManagement = React.memo(OrderManagementBase);
export default OrderManagement;
