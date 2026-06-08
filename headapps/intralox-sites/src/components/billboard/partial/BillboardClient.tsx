"use client";
import { JSX } from "react";
import {
  getDividerParams,
  getHeadingParams,
  getRatioParams,
  getTextParams,
} from "src/utils/paramsData";
import { RichText } from "@sitecore-content-sdk/nextjs";
import { Text } from "@sitecore-content-sdk/nextjs";
import { Container } from "src/components/shared/BaseContainer";
import BodyStyles from "src/components/shared/BodyStyle";
import LinkRenderer, {
  AllignmentType,
} from "src/components/shared/LinkRenderer";
import Video from "src/components/shared/video/Video";
import { IParams } from "src/utils/interface";
import {
  resolveBillboardBrightcoveId,
  resolveBillboardMediaKind,
} from "../billboardUtils";
import { BillboardFields } from "../Billboard.type";
import { cn } from "lib/utils";
import { ImageView } from "components/shared/ImageView/ImageView";
import { FocalPointType } from "components/shared/ImageView/ImageViewTypes";
import { renderingAnchorIdProps } from "src/utils/renderingAnchorProps";

interface BillboardProps extends IParams {
  fields: BillboardFields;
}

const BillboardClientBase = ({
  fields,
  params,
}: BillboardProps): JSX.Element => {
  const heading = getHeadingParams(params);
  const text = getTextParams(params);
  const divider = getDividerParams(params);
  const ratio = getRatioParams(params);
  const colorScheme = params?.ColorScheme?.Value?.value?.toLowerCase();
  const focalPoint = params?.FocalPoint?.Value?.value?.toLowerCase();
  const hasBorderDivider =
    params?.Divider?.Value?.value?.toLowerCase() === "border";

  const buttonAllignment =
    fields?.ButtonAlignment?.fields?.Value?.value?.toLowerCase() as AllignmentType;

  const mediaKind = resolveBillboardMediaKind(fields);
  const brightcoveId = resolveBillboardBrightcoveId(fields?.Video);

  const shellDivider = divider?.divider ?? "border";
  const ratioPercent = ((ratio?.ratio ?? 0) * 100).toString();
  const shellRatio =
    ratioPercent === "56.25" || ratioPercent === "28.125"
      ? (ratioPercent as "56.25" | "28.125")
      : undefined;

  return (
    <div
      className={cn(
        "w-full relative flex flex-col overflow-hidden items-center h-[100vw] md:min-h-[480px] md:max-h-[calc(100vh-147px-60px-24px)] [&_+_.link-card]:!py-12 [&_+_.link-card]:lg:!py-16",
        shellDivider === "fade" &&
          "after:block after:absolute after:content-[''] after:w-full after:h-full after:left-0 after:bottom-0 after:bg-[linear-gradient(180deg,rgba(255,255,255,0)_55.9%,rgba(255,255,255,1)_100%)]",
        shellRatio === "56.25" && "md:h-[56.25vw]",
        shellRatio === "28.125" && "md:h-[28.125vw]",
        text?.textVerticalPosition === "top" && "justify-start pt-12",
        (text?.textVerticalPosition === "middle" ||
          text?.textPosition === "center") &&
          "justify-center",
        (text?.textVerticalPosition === "bottom" ||
          text?.textPosition === "bottom") &&
          "justify-end",
        hasBorderDivider && "border-b-8",
        colorScheme === "dark" && "border-orange",
        colorScheme !== "dark" && "border-cyan",
      )}
      {...renderingAnchorIdProps(params?.RenderingIdentifier)}
    >
      {mediaKind === "video" && brightcoveId && (
        <Video
          videoId={brightcoveId}
          cover={true}
          coverImageCropWidth={1600}
          className="absolute inset-0 h-full"
          ratio={0}
          suppressCaption={true}
          autoplay={fields.Video.fields.Autoplay.value}
          loop={fields.Video.fields.Loop.value}
          muted={true}
          coverImage={fields.Video.fields.CoverImage}
          caption={fields.Video.fields.Caption.value}
          title={fields.Video.fields.Title.value}
        />
      )}
      {mediaKind === "image" && (
        <div className="absolute inset-0 h-full w-full">
          <ImageView
            image={fields.BackgroundImage}
            objectFit="cover"
            cropRatio={0.5625}
            cropWidth={1600}
            focalPoint={focalPoint as FocalPointType}
          />
        </div>
      )}
      <Container
        className="relative z-10"
        width={params?.ContainerWidth?.Value?.value.toLowerCase() ?? "default"}
      >
        <div
          className={cn("w-full", {
            "text-center mx-auto":
              text?.textPosition === `center` ||
              text?.textAlignment === `center`,
            "text-left":
              text?.textPosition === `left` || text?.textAlignment === `left`,
            "pb-12":
              text?.textPosition === `bottom` ||
              text?.textVerticalPosition === `bottom`,
          })}
        >
          <Text
            field={fields.Eyebrow}
            className={cn(
              "uppercase tracking-wide text-xs font-bold text-ink-inverse",
              {
                "border-0 border-l-4 border-solid px-2":
                  text?.textPosition !== `center` &&
                  text?.textAlignment !== `center`,
                "border-orange":
                  text?.textPosition !== `center` &&
                  text?.textAlignment !== `center` &&
                  colorScheme === "dark",
                "border-cyan":
                  text?.textPosition !== `center` &&
                  text?.textAlignment !== `center` &&
                  colorScheme !== "dark",
              },
            )}
            tag="p"
          />
          <div
            className={cn("mx-auto", {
              "md:w-4/5": heading?.width === `80`,
              "md:w-3/4": heading?.width === `75`,
              "md:w-2/3": heading?.width === `66`,
              "md:w-3/5": heading?.width === `60`,
              "md:w-3/5 xl:w-1/2": heading?.width === `50`,
            })}
          >
            <Text
              field={fields.Headline}
              tag={heading?.tag ? heading?.tag : "h1"}
              className={cn("font-bold text-ink-inverse text-3xl", {
                "mt-2 mb-0": fields.Eyebrow.value,
                "my-0": !fields.Eyebrow.value,
                "md:text-6xl lg:text-[5rem] leading-none!":
                  heading?.size === "2xl",
                "md:text-5xl lg:text-[4rem] leading-none!":
                  heading?.size === "xl",
                "md:text-4xl lg:text-[3rem] leading-none!":
                  heading?.size === "lg",
                "leading-none": heading?.size !== "xl",
                "text-center":
                  text?.textPosition === `center` ||
                  text?.textAlignment === `center`,
                "text-left":
                  text?.textPosition === `left` ||
                  text?.textAlignment === `left`,
              })}
            />
          </div>
          <div className="mt-4">
            <BodyStyles
              colorScheme={colorScheme}
              contrast={true}
              className={cn("mt-4 text-base md:text-xl leading-snug! mx-auto", {
                "text-base md:text-xl": text?.size === "xl",
                "text-sm md:text-base": text?.size === "base",
                "text-xs md:text-sm": text?.size === "xs",
                "md:w-4/5": text?.width === `80`,
                "md:w-3/4": text?.width === `75`,
                "md:w-2/3": text?.width === `66`,
                "md:w-3/5": text?.width === `60`,
                "md:w-3/5 xl:w-1/2": text?.width === `50`,
              })}
            >
              <RichText
                field={fields.Description}
                className={cn({
                  "text-center!":
                    text?.textPosition === `center` ||
                    text?.textAlignment === `center`,
                  "text-left!":
                    text?.textPosition === `left` ||
                    text?.textAlignment === `left`,
                })}
              />
            </BodyStyles>
            <RichText field={fields.Subheading} />
            <LinkRenderer
              links={fields.Links}
              contrast={true}
              className={cn(fields?.Eyebrow?.value ? "mt-4" : "mt-8")}
              alignment={buttonAllignment}
            />
          </div>
        </div>
      </Container>
    </div>
  );
};

export const BillboardClient = BillboardClientBase;
