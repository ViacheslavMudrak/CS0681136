import { IFAQFields } from "./FAQ.type";
import { IParams } from "src/utils/interface";
import { FAQClient } from "./partial/FAQClient";

interface IFAQProps extends IParams {
  fields: IFAQFields;
}

const DefaultBase = ({ fields, params }: IFAQProps) => {
  return <FAQClient fields={fields} params={params} />;
};

export const Default = DefaultBase;
