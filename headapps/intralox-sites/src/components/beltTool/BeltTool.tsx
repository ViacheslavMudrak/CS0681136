import { JSX } from "react";
import { ComponentRendering } from "@sitecore-content-sdk/nextjs";

import { Page } from "@sitecore-content-sdk/nextjs";
import { IBeltFields } from "../belt/Belt.type";
import { IParams } from "src/utils/interface";
import { BeltClient } from "../belt/partial/BeltClient";

interface IBeltProps extends IParams {
  fields: IBeltFields;
  page: Page;
  rendering: ComponentRendering;
}

const DefaultBase = ({
  fields,
  page,
  rendering,
  params,
}: IBeltProps): JSX.Element => {
  return (
    <BeltClient
      fields={fields}
      page={page}
      rendering={rendering}
      params={params}
    />
  );
};

export const Default = DefaultBase;
