"use client";
import type { JSX } from "react";
import { IParams } from "src/utils/interface";
import { ISolutionsGroupFields } from "../SolutionsGroup.type";
import { Container } from "components/shared/BaseContainer";
import type { Field } from "@sitecore-content-sdk/nextjs";
import { Link, RichText } from "@sitecore-content-sdk/nextjs";
import BodyStyles, { ColorScheme } from "components/shared/BodyStyle";
import { ImageView } from "components/shared/ImageView/ImageView";
import Video from "components/shared/video/Video";
import { ChromeIconFromCms } from "lib/chrome-icons";
import { cmsIconToFontAwesome } from "src/lib/cms-icon-to-fontawesome";
import { cn } from "lib/utils";
import { FocalPointType } from "components/shared/ImageView/ImageViewTypes";
import { getRatioParams } from "src/utils/paramsData";
import { renderingAnchorIdProps } from "src/utils/renderingAnchorProps";

const EMPTY_RICH_TEXT_FIELD = { value: "" } as Field<string>;

interface ISolutionsGroupClientProps extends IParams {
  fields?: ISolutionsGroupFields;
}

const SolutionsGroupClientBase = ({
  fields,
  params,
}: ISolutionsGroupClientProps): JSX.Element => {
  if (!fields) {
    return (
      <div
        className="component solutions-group relative w-full"
        {...renderingAnchorIdProps(params?.RenderingIdentifier)}
      >
        <div className="component-content">
          <span className="is-empty-hint">Solutions Group</span>
        </div>
      </div>
    );
  }

  const colorScheme = params?.ColorScheme?.Value?.value?.toLowerCase();
  const theme = params?.Theme?.Value?.value?.toLowerCase();
  const ratio = getRatioParams(params);
  const style = params?.Style?.Value?.value?.toLowerCase();
  const mediaPosition = params?.MediaPosition?.Value?.value?.toLowerCase();
  const mediaWidth = params?.MediaWidth?.Value?.value?.toLowerCase();
  const isMediaLeft = mediaPosition === "left";
  const isHalfWidth = mediaWidth === "50%";

  const mediaTypeRaw = fields.MediaType?.fields?.Value?.value;
  const mediaTypeLower =
    typeof mediaTypeRaw === "string" ? mediaTypeRaw.toLowerCase() : "";
  const brightcoveId = fields.Video?.fields?.BrightcoveId?.value;
  const videoId = typeof brightcoveId === "string" ? brightcoveId.trim() : "";
  const videoFields = fields.Video?.fields;
  const showImageRail = mediaTypeLower === "image" && Boolean(fields.Image);
  const showVideoRail = mediaTypeLower === "video" && videoId.length > 0;

  return (
    <div
      className="relative solutions-group w-full bg-surface text-left md:pt-8 pb-12 md:pb-20"
      {...renderingAnchorIdProps(params?.RenderingIdentifier)}
    >
      <Container width="lg">
        <BodyStyles
          contrast={false}
          theme={theme}
          colorScheme={colorScheme}
          textSize="xl"
        >
          <div className="columns flex flex-wrap items-start">
            <div
              className={cn(
                "w-full mt-10 md:border-stroke-default md:w-1/2 lg:w-3/5",
                isMediaLeft ? "md:pl-6 order-1" : "md:pr-6 order-0",
                isHalfWidth && "lg:w-1/2",
              )}
            >
              <BodyStyles
                contrast={false}
                theme={theme}
                colorScheme={colorScheme}
                className=" normal"
              >
                <RichText
                  className={cn(
                    "prose",
                    colorScheme
                      ? {
                          light: "prose-light",
                          gray: "prose-gray",
                          dark: "prose-dark",
                        }[colorScheme as ColorScheme]
                      : "",
                  )}
                  field={fields.Text ?? EMPTY_RICH_TEXT_FIELD}
                />
              </BodyStyles>
            </div>
            <div
              className={cn(
                "w-full md:border-stroke-default mt-12 md:w-1/2 lg:w-2/5",
                isMediaLeft ? "md:pr-6 order-0" : "md:pl-6 order-1",
                isHalfWidth && "lg:w-1/2",
              )}
            >
              {showImageRail && (
                <ImageView
                  image={fields.Image}
                  cropRatio={ratio?.ratio ?? 0.5625}
                  focalPoint={
                    params?.FocalPoint?.Value?.value?.toLowerCase() as FocalPointType
                  }
                />
              )}
              {showVideoRail && (
                <Video
                  videoId={videoId}
                  cover={Boolean(videoFields?.Autoplay?.value)}
                  coverImageCropWidth={1600}
                  className="w-full h-full"
                  suppressCaption={true}
                  autoplay={Boolean(videoFields?.Autoplay?.value)}
                  loop={Boolean(videoFields?.Loop?.value)}
                  coverImage={videoFields?.CoverImage}
                  caption={
                    typeof videoFields?.Caption?.value === "string"
                      ? videoFields.Caption.value
                      : ""
                  }
                  playInModal={true}
                  title={
                    typeof videoFields?.Title?.value === "string"
                      ? videoFields.Title.value
                      : ""
                  }
                />
              )}
            </div>
          </div>
        </BodyStyles>
      </Container>
      <div className="pt-0 md:pt-8">
        <Container>
          <BodyStyles
            contrast={false}
            theme={theme}
            colorScheme={colorScheme}
            textSize="xl"
          >
            <div className="columns flex flex-wrap">
              {(fields.QuickLinks ?? []).map((link, index) => {
                const lf = link?.fields;
                if (!lf) {
                  return null;
                }
                const iconRaw = lf.Icon?.fields?.Value?.value;
                const iconKind =
                  typeof iconRaw === "string" ? iconRaw.toLowerCase() : "";
                const iconClass = cmsIconToFontAwesome(iconKind);
                const linkHref = lf.Link?.value?.href;
                return (
                  <div
                    key={index}
                    className={cn(
                      "w-full md:border-stroke-default md:w-1/2 lg:w-1/3 lg:px-6 mt-12 ",
                      index === 0 ? "md:pr-6 lg:pl-0" : "",
                      index === 1 ? "md:pl-6 lg:px-6" : "",
                      index === 2 ? "md:pl-0 md:pr-6 lg:px-6" : "",
                    )}
                  >
                    {linkHref ? (
                      <Link
                        field={lf.Link}
                        aria-label={lf.Link?.value?.text}
                        className="text-left group w-full h-full block rounded-lg"
                      >
                        <div className="flex flex-nowrap md:flex-col">
                          {(iconClass || lf.Image?.value?.src) && (
                            <div className="mr-4 flex h-8 w-8 shrink-0 items-center justify-center md:h-12 md:w-12">
                              {iconKind === "image" ? (
                                <ImageView image={lf.Image} />
                              ) : (
                                <ChromeIconFromCms
                                  cssClass={iconClass}
                                  className="size-4 md:size-6"
                                />
                              )}
                            </div>
                          )}
                          <div className="w-full md:mt-2">
                            <RichText
                              field={lf.Title ?? EMPTY_RICH_TEXT_FIELD}
                              tag="h3"
                              className="my-0 text-base font-bold leading-tight text-ink-primary"
                            />
                            <RichText
                              field={lf.Description ?? EMPTY_RICH_TEXT_FIELD}
                              className="mt-1 mb-0 text-base/snug"
                            />
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div className="text-left group w-full h-full block rounded-lg">
                        <div className="flex flex-nowrap md:flex-col">
                          {(iconClass || lf.Image?.value?.src) && (
                            <div className="mr-4 flex h-8 w-8 bg-neutral-300 rounded-full shrink-0 items-center justify-center md:h-12 md:w-12">
                              {iconKind === "image" ? (
                                <ImageView image={lf.Image} />
                              ) : (
                                <ChromeIconFromCms
                                  cssClass={iconClass}
                                  className="size-4 md:size-6"
                                />
                              )}
                            </div>
                          )}
                          <div className="w-full md:mt-2">
                            <RichText
                              field={lf.Title ?? EMPTY_RICH_TEXT_FIELD}
                              tag="h3"
                              className="text-base !my-0 font-bold leading-tight text-ink-primary"
                            />
                            <RichText
                              field={lf.Description ?? EMPTY_RICH_TEXT_FIELD}
                              className="mt-1 mb-0 text-base/snug"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </BodyStyles>
        </Container>
      </div>
    </div>
  );
};

export const SolutionsGroupClient = SolutionsGroupClientBase;
