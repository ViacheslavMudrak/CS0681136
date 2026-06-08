import { IBrandLineFields } from './BrandingLine.type';
import { BrandingLineGeneric } from "./partial/BrandLineGeneric";
import type { IParams } from "src/utils/interface";

interface BrandingLineProps extends IParams {
  fields: IBrandLineFields;
}
const DefaultBase = ({ fields, params }: BrandingLineProps) => {
  return (
    <BrandingLineGeneric fields={fields} params={params} />
  );
};

const SlantBottomBase = ({ fields, params }: BrandingLineProps) => {
  return (
    <BrandingLineGeneric fields={fields} params={params} isSlant={true} />
  );
};

export const Default = DefaultBase;
export const SlantBottom = SlantBottomBase;
