import { JSX, useMemo } from "react";
import type { BillboardFields } from "./Billboard.type";
import { IParams } from "../../utils/interface";
import { BillboardClient } from "./partial/BillboardClient";

interface BillboardProps extends IParams {
  fields: BillboardFields;
}

const DefaultBase = ({ fields, params }: BillboardProps): JSX.Element => {
  return <BillboardClient fields={fields} params={params} />;
};

export const Default = DefaultBase;
