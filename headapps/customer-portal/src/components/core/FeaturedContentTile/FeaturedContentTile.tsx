"use client";

import React from "react";
import { TEST_CASE_DATA_IDS } from "src/helpers/enums";

import type { ComponentProps } from "@/lib/component-props";

import type { IFeaturedContentTileFields } from "./FeaturedContentTile.type";
import { FeaturedContentTileDefaultVariant } from "./variants/FeaturedContentTileDefault.variant";

type FeaturedContentTileComponentProps = ComponentProps & {
  fields: IFeaturedContentTileFields;
};

const FeaturedContentTileBase = ({
  fields,
  params,
  page,
}: FeaturedContentTileComponentProps): React.ReactElement | null => {
  return (
    <FeaturedContentTileDefaultVariant
      testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT_TILE}
      fields={fields}
      params={params}
      page={page}
    />
  );
};

const FeaturedContentTile = React.memo(FeaturedContentTileBase);
export default FeaturedContentTile;
