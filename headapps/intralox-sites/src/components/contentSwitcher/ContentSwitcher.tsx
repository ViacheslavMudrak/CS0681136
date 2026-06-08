import { IContentSwitcherFields } from "./ContentSwitcher.type";
import { JSX } from "react";
import { IParams } from "src/utils/interface";
import { ContentSwitcherClient } from "./partial/ContentSwitcherClient";
import { ComponentRendering, Page } from "@sitecore-content-sdk/nextjs";

export interface IContentSwitcherProps extends IParams {
  fields: IContentSwitcherFields;
  rendering: ComponentRendering;
  page: Page;
}

const DefaultBase = ({
  fields,
  params,
  rendering,
  page,
}: IContentSwitcherProps): JSX.Element => {
  return (
    <ContentSwitcherClient
      fields={fields}
      params={params}
      rendering={rendering}
      page={page}
    />
  );
};

export const Default = DefaultBase;
