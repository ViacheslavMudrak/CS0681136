import { Section } from "components/shared/section/Section";
import { Container, ContainerWidth } from "components/shared/BaseContainer";
import { JSX } from "react";
import {
  AppPlaceholder,
  ComponentMap,
  ComponentRendering,
  RichText,
} from "@sitecore-content-sdk/nextjs";
import componentMap from ".sitecore/component-map";
import { Page } from "@sitecore-content-sdk/nextjs";
import { IBeltFields, IBeltPageFields } from "../Belt.type";
import { IParams } from "src/utils/interface";
import SharedButton from "../partial/SharedButton";
import ImageCarousel from "../partial/ImageCarousel";
import Specification from "../partial/Specification";
import BeltData from "../partial/BeltData";
import Download from "../partial/Download";
import Tools from "../partial/Tools";
import BeltDetailComponent from "./BeltDetailComponent";

interface IBeltProps extends IParams {
  fields: IBeltFields;
  page: Page;
  rendering: ComponentRendering;
}

const BeltClientBase = ({
  fields,
  page,
  rendering,
  params,
}: IBeltProps): JSX.Element => {
  const { route, context } = page.layout.sitecore;
  const previousPage = context?.previousPage as
    | { title?: string; url?: string }
    | undefined;
  const routeFields = route?.fields as IBeltPageFields | undefined;
  const containerWidth =
    routeFields?.ContainerWidth?.fields.Value.value.toLowerCase() as ContainerWidth;
  const ShowDownloads = Boolean(params?.ShowDownloads);
  const ShowTools = Boolean(params?.ShowTools);
  return (
    <>
      <Section
        removeBottomPadding
        className="belt-landing [&_+section]:pb-0
      [&_.container_.container]:px-0"
      >
        <Container width={containerWidth ?? "default"}>
          <div className="flex-row md:flex justify-between items-center">
            <div className="w-full md:pr-4">
              {rendering && (
                <AppPlaceholder
                  name="breadbrumb-{*}"
                  componentMap={componentMap as ComponentMap}
                  rendering={rendering}
                  page={page}
                  disableSuspense
                />
              )}
              <RichText
                className="font-bold text-3xl leading-tight mt-2 mb-4 text-ink-primary w-full md:w-4/5"
                field={routeFields?.Title}
                tag="h1"
              />
              <span className="inline-block border border-solid text-ink-primary rounded pt-0.5 pb-0.75 px-2 bg-surface-muted border-stroke-default mb-4 text-sm">
                {previousPage?.title}
              </span>
            </div>
            <div className="flex self-start gap-3">
              {routeFields?.QuickLinkItem && (
                <SharedButton quickLinkItems={routeFields?.QuickLinkItem} />
              )}
            </div>
          </div>
          <div className="grid items-start grid-cols-1 lg:grid-cols-12 gap-x-16 gap-y-6 mt-4 md:mt-0">
            {routeFields?.ModularPlasticBeltSpecifications && (
              <div className="col-span-full lg:col-span-7">
                <Specification
                  fields={routeFields?.ModularPlasticBeltSpecifications}
                  content={routeFields?.Content}
                />
              </div>
            )}
            <div className="col-span-full lg:col-span-5 flex flex-col items-end gap-8">
              <div className="relative w-full">
                <ImageCarousel
                  imagesList={routeFields?.Images ?? []}
                  defaultImage={routeFields?.DefaultImage}
                />
              </div>
              {rendering && (
                <AppPlaceholder
                  name="belt-left-content-{*}"
                  componentMap={componentMap as ComponentMap}
                  rendering={rendering}
                  page={page}
                  disableSuspense
                />
              )}
            </div>
          </div>
          <div className="mt-12 text-ink-primary">
            {(routeFields?.BeltData ||
              routeFields?.ProductSpecificationMarkup) && (
              <BeltData
                fields={routeFields?.BeltData}
                productSpecificationMarkup={
                  routeFields?.ProductSpecificationMarkup
                }
              />
            )}
            {ShowDownloads &&
              routeFields?.Files &&
              routeFields?.Files?.length > 0 && (
                <Download files={routeFields?.Files ?? []} />
              )}
            {fields?.BeltComponents?.value?.length > 0 && (
              <BeltDetailComponent
                beltComponent={fields?.BeltComponents?.value}
                sprocketsViewAllLink={fields?.ViewAllSprocketsLink?.value}
                otherComponentsViewAllLink={
                  fields?.ViewAllAccessoriesLink?.value
                }
                pageTitle={previousPage?.title}
                defaultImage={routeFields?.DefaultImage}
              />
            )}
            {fields?.BeltTools?.value?.length > 0 && ShowTools && (
              <Tools
                tools={fields?.BeltTools?.value}
                ViewAllToolsLink={fields?.ViewAllToolsLink?.value}
                pageTitle={previousPage?.title}
              />
            )}
          </div>
        </Container>
      </Section>
    </>
  );
};

export const BeltClient = BeltClientBase;
