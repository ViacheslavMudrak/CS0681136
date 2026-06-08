import { JSX } from "react";
import { ICaseStudyBannerFields } from "../CaseStudyBanner.type";
import {
  AppPlaceholder,
  ComponentMap,
  ComponentRendering,
  NextImage,
  Page,
  RichText,
} from "@sitecore-content-sdk/nextjs";
import { ImageView } from "components/shared/ImageView/ImageView";
import Video from "components/shared/video/Video";
import { ComponentType } from "src/utils/enum";
import { I18N } from "lib/dictionary-keys";
import { useTranslations } from "next-intl";

export interface ICaseStudyBannerClientProps {
  routeFields?: ICaseStudyBannerFields;
  rendering: ComponentRendering;
  page: Page;
  componentMap: ComponentMap;
}
const CaseStudyBannerClientBase = ({
  routeFields,
  rendering,
  page,
  componentMap,
}: ICaseStudyBannerClientProps): JSX.Element => {
  const t = useTranslations();
  const CompanyList = [
    {
      name: ComponentType.PRODUCTS,
      list: routeFields?.Products,
    },
    {
      name: ComponentType.INDUSTRIES,
      list: routeFields?.Industries,
    },
    {
      name: ComponentType.SOLUTIONS,
      list: routeFields?.Solutions,
    },
  ];
  return (
    <>
      <div className="sm:px-4 lg:px-16">
        <RichText
          tag="h1"
          field={routeFields?.Headline}
          className="page-title !my-0 font-bold text-3xl leading-tight [*+.page-title]:mt-2 text-inherit max-w-[750px]"
        />
        <span className="inline-block border border-solid text-ink-primary rounded pt-0.5 pb-0.75 px-2 bg-surface-muted border-stroke-default my-6 text-xs leading-normal">
          {t(I18N.CASESTUDY)}
        </span>
      </div>
      <div className="lg:px-8">
        {CompanyList?.length > 0 && (
          <div
            className="flex flex-col md:flex-row flex-wrap sm:flex-nowrap
        rounded-xl -mx-4 overflow-visible sm:mx-0 sm:overflow-hidden"
          >
            <div
              className="pt-4 pb-6 md:pt-12 md:pb-12 px-4 lg:px-8
           bg-cyan overflow-hidden w-full md:w-60 lg:w-72 shrink-0"
            >
              <RichText
                tag="h2"
                field={routeFields?.Company?.fields?.Name}
                className="text-xl font-bold leading-tight text-ink-inverse !my-0"
              />
              {CompanyList.map(
                ({ name, list }) =>
                  list &&
                  list?.length > 0 && (
                    <div key={name} className="mt-4 md:mt-6">
                      <RichText
                        className="mb-1 text-sm font-bold uppercase tracking-wide text-cyan-light"
                        field={{ value: name }}
                      />

                      {list.map((item, index) => (
                        <RichText
                          key={`${name}-${index}`}
                          field={item.fields?.Title}
                          className="text-base font-bold leading-5 text-ink-inverse"
                        />
                      ))}
                    </div>
                  ),
              )}
            </div>
            <div className="relative w-full overflow-hidden">
              {routeFields?.Image?.value?.src && (
                <ImageView image={routeFields?.Image} className="!h-full" />
              )}
              {routeFields?.Video?.fields?.BrightcoveId?.value && (
                <Video
                  videoId={routeFields?.Video?.fields?.BrightcoveId?.value}
                  cover={true}
                  coverImageCropWidth={1600}
                  className="w-full h-full"
                  suppressCaption={true}
                  autoplay={true}
                  loop={true}
                  muted={true}
                  coverImage={routeFields?.Video?.fields?.CoverImage}
                  playInModal={true}
                />
              )}
            </div>
          </div>
        )}

        <div className="mt-12 flex flex-row flex-wrap sm:px-4 lg:flex-nowrap lg:px-8">
          <div className=" w-full lg:w-3/4 lg:pr-8">
            <RichText
              field={routeFields?.Content}
              className="prose text-ink-primary [&_h2]:!mb-0"
            />
            <AppPlaceholder
              name="case-study-content-{*}"
              componentMap={componentMap}
              rendering={rendering}
              page={page}
              disableSuspense
            />
          </div>
          <div className="mt-8 w-full border-t border-stroke-default pt-8 lg:mt-0 lg:w-1/4 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <div className="space-y-4">
              {routeFields?.Callouts?.fields?.Callouts?.map(
                (callout, index) => (
                  <div key={`${callout.fields?.Label?.value}-${index}`}>
                    <div className="flex flex-wrap gap-x-1 ">
                      <RichText
                        tag="span"
                        field={callout.fields?.Value}
                        className="text-cyan text-3xl lg:text-4xl block font-bold leading-none shrink-0"
                      />
                      <RichText
                        tag="span"
                        field={callout.fields?.AppendValue}
                        className="font-bold inline-block uppercase tracking-wide text-base/none text-ink-primary self-end leading-none pb-0.5"
                      />
                    </div>
                    <RichText
                      tag="span"
                      field={callout.fields?.Label}
                      className="text-sm font-bold leading-tight uppercase text-ink-secondary block"
                    />
                  </div>
                ),
              )}
            </div>
            {routeFields?.AdditionalMedia?.value?.src && (
              <div className="mt-8 w-48 rounded-xs border border-stroke-default p-3">
                <NextImage field={routeFields?.AdditionalMedia} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export const CaseStudyBannerClient = CaseStudyBannerClientBase;
