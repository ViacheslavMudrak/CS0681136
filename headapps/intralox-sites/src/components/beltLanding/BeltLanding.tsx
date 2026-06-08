import { JSX } from "react";
import { IBeltLandingFields, IBeltLandingPageFields } from "./BeltLanding.type";
import {
  ComponentMap,
  ComponentRendering,
  Page,
  AppPlaceholder,
  RichText,
} from "@sitecore-content-sdk/nextjs";
import { Section } from "components/shared/section/Section";
import { Container, ContainerWidth } from "components/shared/BaseContainer";
import componentMap from ".sitecore/component-map";
import BeltLandingLinkItem from "./partial/BeltLandingLink";
import { BeltLandingLinkLabel, TemplateName } from "src/utils/enum";

interface IBeltLandingProps {
  fields: IBeltLandingFields;
  page: Page;
  rendering: ComponentRendering;
}

const DefaultBase = ({
  fields,
  page,
  rendering,
}: IBeltLandingProps): JSX.Element => {
  const { route, context } = page.layout.sitecore;
  const previousPage = context?.previousPage as
    | { title?: string; url?: string }
    | undefined;
  const routeFields = route?.fields as IBeltLandingPageFields | undefined;
  const containerWidth =
    routeFields?.ContainerWidth?.fields.Value.value.toLowerCase() as ContainerWidth;
  const BeltLandingLinks = [
    {
      label: BeltLandingLinkLabel.BELTS,
      url: fields.SeriesPageLink.value,
    },
    {
      label: BeltLandingLinkLabel.SPROCKETS,
      url: fields.SprocketsPageLink.value,
    },
    {
      label: BeltLandingLinkLabel.ACCESSORIES,
      url: fields.AccessoriesPageLink.value,
    },
    {
      label: BeltLandingLinkLabel.TOOLS,
      url: fields.ToolsPageLink.value,
    },
  ].filter(({ url }) => Boolean(url?.trim()));
  const heading =
    route?.templateName === TemplateName.ACCESSORIES ||
    route?.templateName === TemplateName.TOOLS ||
    route?.templateName === TemplateName.SPROCKETS
      ? previousPage?.title
      : routeFields?.Title?.value;
  return (
    <Section
      removeBottomPadding
      className="belt-landing [&_+section]:pb-0
    [&_.container_.container]:px-0"
    >
      <Container width={containerWidth ?? "default"}>
        {rendering && (
          <AppPlaceholder
            name="breadbrumb-{*}"
            componentMap={componentMap as ComponentMap}
            rendering={rendering}
            page={page}
            disableSuspense
          />
        )}

        <div className="belt-landing-content">
          <RichText
            className="font-bold text-3xl leading-tight mt-2 text-ink-primary w-full md:w-4/5"
            field={{ value: heading }}
            tag="h1"
          />
          <div className="mt-4">
            <ul
              className="flex ml-0! gap-4 p-0! border-stroke-default [&>.ids-tab]:border-b-3px border-b pt-3px overflow-x-auto text-sm
              [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0"
              data-analytics-region="In Pgae Nav"
              data-orientation="horizontal"
            >
              {BeltLandingLinks.map((link, index) => (
                <BeltLandingLinkItem key={index} link={link} index={index} />
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export const Default = DefaultBase;
