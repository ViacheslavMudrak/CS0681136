import { IParams } from "src/utils/interface";
import { ILinkCardsFields } from "./LinkCards.type";
import { LinkCardClient } from "./partial/LinkCardClient";
interface LinkCardsProps extends IParams {
  fields: ILinkCardsFields;
}
const DefaultBase = ({ fields, params }: LinkCardsProps) => {
  const size = params.CardSize?.Value?.value?.toLowerCase();
  const colorScheme = params.ColorScheme?.Value?.value?.toLowerCase();
  const headingSize = params.HeadlineSize?.Value?.value?.toLowerCase();
  const headingAlgin = params.TextAlignment?.Value?.value?.toLowerCase();
  const headingWidth = params.Width?.Value?.value?.toLowerCase();
  const containerWidth = params?.ContainerWidth?.Value?.value?.toLowerCase();
  return (
    <LinkCardClient
      fields={fields}
      className={"w-full"}
      params={params}
      size={size}
      linkCardColorScheme={colorScheme}
      headingSize={headingSize}
      headingAlgin={headingAlgin}
      headingWidth={headingWidth}
      containerWidth={containerWidth}
    />
  );
};

export const Default = DefaultBase;
