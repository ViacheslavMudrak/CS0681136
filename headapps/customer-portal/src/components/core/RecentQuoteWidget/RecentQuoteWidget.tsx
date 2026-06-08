"use client";
import React from "react";
import { TEST_CASE_DATA_IDS } from "src/helpers/enums";

import type { ComponentProps } from "@/lib/component-props";

import type { IRecentQuoteWidgetFields } from "./RecentQuoteWidget.type";
import { RecentQuoteWidgetDefaultVariant } from "./variants/RecentQuoteWidgetDefault.variant";

type Props = ComponentProps & {
  fields: IRecentQuoteWidgetFields;
};

const RecentQuoteWidgetBase = ({ fields, params, page }: Props): React.ReactElement | null => {
  return (
    <RecentQuoteWidgetDefaultVariant
      testId={TEST_CASE_DATA_IDS.RECENT_QUOTE_WIDGET}
      fields={fields}
      params={params}
      page={page}
    />
  );
};

const RecentQuoteWidget = React.memo(RecentQuoteWidgetBase);
export default RecentQuoteWidget;
