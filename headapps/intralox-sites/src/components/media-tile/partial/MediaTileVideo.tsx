"use client";

import type { CSSProperties, JSX } from "react";
import type { ImageField } from "@sitecore-content-sdk/nextjs";
import Video from "../../shared/video/Video";
import type { IVideoFields } from "../../../utils/interface";

import { cn } from "lib/utils";

import type { MediaTileLayoutConfig } from "../MediaTile.type";
import {
  extractMediaTileBrightcoveId,
  isMediaTileDefaultLandscapeFrame,
  MEDIA_TILE_LANDSCAPE_FRAME_STYLE,
  MEDIA_TILE_SPLIT_MAX_PX,
} from "../mediaTileUtils";
import { mediaVideoAspectBoxStyle } from "../../media/mediaUtils";

export interface MediaTileVideoProps {
  video: IVideoFields | undefined;
  layout?: MediaTileLayoutConfig;
  mediaFrameStyle?: CSSProperties | null;
  backdropClass?: string;
  layoutVariant?: "media" | "tile";
  posterWithPlay?: boolean;
  playbackAutoplay?: boolean;
  playbackLoop?: boolean;
  hasCardChrome?: boolean;
  outerWrapperClassName?: string;
  fillCarouselSlide?: boolean;
}

export const MediaTileVideo = ({
  video,
  layout,
  mediaFrameStyle: mediaFrameStyleProp,
  backdropClass = "bg-surface-muted",
  layoutVariant = "tile",
  posterWithPlay = false,
  playbackAutoplay,
  playbackLoop,
  outerWrapperClassName,
  fillCarouselSlide = false,
  hasCardChrome: hasCardChromeProp,
}: MediaTileVideoProps): JSX.Element | null => {
  const vf = video?.fields;

  const videoId = extractMediaTileBrightcoveId(video) ?? "";
  if (!videoId) return null;

  const hasCardChrome = hasCardChromeProp ?? layout?.isCard ?? false;
  const mediaFrameStyle =
    mediaFrameStyleProp !== undefined
      ? mediaFrameStyleProp
      : layout
        ? layout.mediaFrameStyle
        : undefined;

  const effectiveMediaFrameStyle =
    mediaFrameStyle !== undefined
      ? mediaFrameStyle
      : (mediaVideoAspectBoxStyle(video) ?? undefined);

  const isMediaLayout = layoutVariant === "media";
  const useCarouselSlideFill = Boolean(
    fillCarouselSlide && isMediaLayout && outerWrapperClassName === undefined,
  );

  const mediaAspectKey = layout?.mediaAspectKey ?? "landscape";

  const inlineAspectStyle =
    effectiveMediaFrameStyle === undefined
      ? MEDIA_TILE_LANDSCAPE_FRAME_STYLE
      : effectiveMediaFrameStyle === null
        ? undefined
        : effectiveMediaFrameStyle;

  const useResponsiveLandscape = isMediaTileDefaultLandscapeFrame(
    effectiveMediaFrameStyle,
    inlineAspectStyle,
  );

  const innerFrameStyle = useCarouselSlideFill
    ? undefined
    : useResponsiveLandscape
      ? undefined
      : inlineAspectStyle;

  const autoplay =
    playbackAutoplay !== undefined
      ? playbackAutoplay
      : Boolean(vf?.Autoplay?.value);
  const loop =
    playbackLoop !== undefined ? playbackLoop : Boolean(vf?.Loop?.value);
  const coverImage = vf?.CoverImage as ImageField | undefined;
  const caption = vf?.Caption?.value;
  const title = vf?.Title?.value;

  const useCover = layoutVariant === "tile" && posterWithPlay;

  return (
    <div
      className={
        outerWrapperClassName ??
        (isMediaLayout
          ? useCarouselSlideFill
            ? "box-border flex h-full min-h-0 w-full min-w-0 max-w-full flex-col"
            : "box-border w-full min-w-0 max-w-full"
          : cn(
              "box-border w-full",
              hasCardChrome &&
                "max-sm:px-0 sm:flex sm:h-full sm:min-h-0 sm:flex-col",
            ))
      }
    >
      <div
        className={cn(
          "relative box-border min-h-0 min-w-0 w-full max-w-full overflow-x-clip overflow-y-clip",
          backdropClass,
          useCarouselSlideFill && "h-full flex-1 rounded",
          !useCarouselSlideFill &&
            useResponsiveLandscape &&
            "max-sm:[aspect-ratio:560/371.84]",
          !useCarouselSlideFill &&
            useResponsiveLandscape &&
            hasCardChrome &&
            "sm:aspect-auto sm:min-h-[506.667px] sm:h-full sm:flex-1 sm:w-full sm:max-w-full sm:shrink-0",
          !useCarouselSlideFill &&
            useResponsiveLandscape &&
            !hasCardChrome &&
            "sm:max-lg:box-border sm:max-lg:h-[436px] sm:max-lg:min-h-[436px] sm:max-lg:max-h-[436px] sm:max-lg:aspect-auto sm:max-lg:w-full sm:max-lg:max-w-full sm:max-lg:shrink-0 lg:w-full lg:max-w-full lg:h-auto lg:min-h-0 lg:max-h-none lg:[aspect-ratio:560/371.84]",
          !useCarouselSlideFill &&
            !useResponsiveLandscape &&
            (mediaAspectKey === "square"
              ? "aspect-square"
              : mediaAspectKey === "portrait"
                ? "aspect-[2/3]"
                : "w-full max-w-full"),
          !useCarouselSlideFill &&
            !useResponsiveLandscape &&
            "sm:max-lg:box-border sm:max-lg:h-[436px] sm:max-lg:min-h-[436px] sm:max-lg:max-h-[436px] sm:max-lg:aspect-auto",
          !useCarouselSlideFill && "max-sm:min-h-48",
          outerWrapperClassName === undefined &&
            isMediaLayout &&
            !useCarouselSlideFill &&
            "rounded",
        )}
        style={innerFrameStyle}
      >
        <Video
          videoId={videoId}
          cover={useCover}
          coverImageCropWidth={MEDIA_TILE_SPLIT_MAX_PX}
          className="absolute inset-0 box-border h-full w-full max-w-full overflow-x-clip overflow-y-clip"
          ratio={0}
          suppressCaption
          autoplay={autoplay}
          loop={loop}
          muted
          coverImage={coverImage}
          caption={typeof caption === "string" ? caption : undefined}
          title={typeof title === "string" ? title : undefined}
        />
      </div>
    </div>
  );
};
