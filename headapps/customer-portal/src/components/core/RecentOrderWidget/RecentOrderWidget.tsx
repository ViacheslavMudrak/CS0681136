"use client";
import React from "react";
import { TEST_CASE_DATA_IDS } from "src/helpers/enums";

import type { ComponentProps } from "@/lib/component-props";

import type { IRecentOrderWidgetFields } from "./RecentOrderWidget.type";
import { RecentOrderWidgetDefaultVariant } from "./variants/RecentOrderWidgetDefault.variant";

type Props = ComponentProps & {
  fields: IRecentOrderWidgetFields;
};

const RecentOrderWidgetBase = ({ fields, params, page }: Props): React.ReactElement | null => {
  return (
    <RecentOrderWidgetDefaultVariant
      testId={TEST_CASE_DATA_IDS.RECENT_ORDER_WIDGET}
      fields={fields}
      params={params}
      page={page}
    />
  );
};

const RecentOrderWidget = React.memo(RecentOrderWidgetBase);
export default RecentOrderWidget;
