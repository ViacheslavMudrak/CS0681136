import React, { useMemo } from "react";

import { TEST_CASE_DATA_IDS } from "src/helpers/enums";

import type { ComponentProps } from "@/lib/component-props";
import { resolveQuoteDetailFields } from "@/lib/quote-detail-blank-data";

import type { IQuoteDetailFields } from "./QuoteDetail.type";
import { QuoteDetailDefaultVariant } from "./variants/QuoteDetailDefault.variant";

type QuoteDetailProps = ComponentProps & {
  fields: IQuoteDetailFields;
};

const QuoteDetailBase = ({ fields, params, page }: QuoteDetailProps): React.ReactElement => {
  const resolvedFields = useMemo(
    () => resolveQuoteDetailFields(fields, Boolean(page.mode?.isEditing)),
    [fields, page.mode?.isEditing]
  );

  return (
    <QuoteDetailDefaultVariant
      testId={TEST_CASE_DATA_IDS.QUOTE_DETAIL}
      fields={resolvedFields}
      params={params}
      page={page}
    />
  );
};

const QuoteDetail = React.memo(QuoteDetailBase);
export default QuoteDetail;
