import { JSX } from "react";
import { IParams } from "src/utils/interface";
import { ILinkGridFields } from "./LinkGrid.type";
import { LinkGridClient } from "./partial/LinkGridClient";
interface ILinkGridProps extends IParams {
  fields: ILinkGridFields;
}
const DefaultBase = ({ fields, params }: ILinkGridProps): JSX.Element => {
  const size = params.CardSize?.Value?.value?.toLowerCase();
  const colorScheme = params.ColorScheme?.Value?.value?.toLowerCase();
  return (
    <LinkGridClient
      fields={fields}
      params={params}
      size={size}
      linkCardColorScheme={colorScheme}
    />
  );
};

export const Default = DefaultBase;
