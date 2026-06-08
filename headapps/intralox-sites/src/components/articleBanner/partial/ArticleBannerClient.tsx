"use client";

import { JSX } from "react";
import { IArticleBannerFields } from "../ArticleBanner.type";
import { RichText } from "@sitecore-content-sdk/nextjs";
import { ImageView } from "components/shared/ImageView/ImageView";
import Video from "components/shared/video/Video";
import { formatPostDateLongUtc } from "../ArticleBanner.utils";
import { cn } from "lib/utils";
import { ArticleType } from "src/utils/enum";

export interface IArticleBannerClientProps {
  routeFields?: IArticleBannerFields;
  postDate?: string;
  hideDate?: boolean;
}
const ArticleBannerClientBase = ({
  routeFields,
  postDate,
  hideDate,
}: IArticleBannerClientProps): JSX.Element => {
  const postDateDisplay = !postDate?.includes("0001")
    ? formatPostDateLongUtc(postDate)
    : "";
  const hideDateDisplay = hideDate ? null : <span>{postDateDisplay}</span>;
  return (
    <>
      <div className="article-banner-heading">
        <RichText
          tag="h1"
          className="font-bold !my-0 text-3xl leading-tight text-ink-primary"
          field={routeFields?.Title}
        />
        <RichText
          tag="p"
          className="!mb-0 text-ink-subtle text-2xl mt-2 leading-tight font-normal"
          field={routeFields?.SubHeadline}
        />
      </div>
      {(postDateDisplay || routeFields?.ArticleType?.fields?.Value?.value) && (
        <div className="flex items-center text-ink-primary gap-4 my-8">
          {routeFields?.Author?.fields?.Image?.value?.src && (
            <div className="shrink-0">
              <div className="rounded-full overflow-hidden w-16">
                <ImageView image={routeFields?.Author?.fields?.Image} />
              </div>
            </div>
          )}
          <div className="text-base leading-snug">
            <div className="mb-1">
              {routeFields?.Author?.fields?.Name?.value}
            </div>
            <div className="text-sm text-ink-subtle flex items-center gap-4">
              <span
                className={cn(
                  "inline-block border border-solid text-ink-primary rounded pt-0.5 pb-0.75 px-2 leading-tight ",
                  {
                    "bg-orange-medium border-orange":
                      routeFields?.ArticleType?.fields?.Value?.value ===
                      ArticleType.NEWS,
                    "border-cyan bg-cyan-medium ":
                      routeFields?.ArticleType?.fields?.Value?.value ===
                      ArticleType.INSIGHT,
                    "bg-surface-muted border-stroke-default":
                      routeFields?.ArticleType?.fields?.Value?.value ===
                      ArticleType.SPOTLIGHT,
                  },
                )}
              >
                {routeFields?.ArticleType?.fields?.Value?.value}
              </span>
              {hideDateDisplay}
            </div>
          </div>
        </div>
      )}
      {routeFields?.Image?.value?.src && (
        <ImageView className="mt-8 mb-4" image={routeFields?.Image} />
      )}
      {routeFields?.Video?.fields?.BrightcoveId?.value && (
        <Video
          videoId={routeFields?.Video?.fields?.BrightcoveId?.value}
          cover={true}
          coverImageCropWidth={1600}
          className="w-full h-full"
          suppressCaption={true}
          autoplay={false}
          loop={true}
          muted={true}
          coverImage={routeFields?.Video?.fields?.CoverImage}
        />
      )}
      <RichText
        tag="div"
        className="prose prose-article text-ink-primary"
        field={routeFields?.Content}
      />
    </>
  );
};

export const ArticleBannerClient = ArticleBannerClientBase;
