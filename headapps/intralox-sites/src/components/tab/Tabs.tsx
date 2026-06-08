import { JSX } from "react";
import { ITabFields } from "./Tabs.type";
import { IParams } from "src/utils/interface";
import { TabsClient } from "./partial/TabsClient";
import { Page } from "@sitecore-content-sdk/nextjs";

interface ITabProps extends IParams {
  fields: ITabFields;
  page: Page;
}
const DefaultBase = ({ fields, params, page }: ITabProps): JSX.Element => {
  const { isEditing } = page.mode;
  return <TabsClient fields={fields} params={params} isEditing={isEditing} />;
};

export const Default = DefaultBase;
