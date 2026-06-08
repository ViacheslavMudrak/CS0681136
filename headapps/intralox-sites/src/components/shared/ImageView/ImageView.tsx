import React, { HTMLAttributes } from "react";
import CaptionContent from "./CaptionContent";
import type { ImageOptimProps, MediaBoxProps } from "./ImageViewTypes";
import Caption from "./Caption";
import { NextImage } from "@sitecore-content-sdk/nextjs";
import { cn } from "lib/utils";

/**
 * Builds a query string from params, preserving commas in values (e.g. for rect parameter).
 */
function buildQueryString(
  params: Record<string, string | number | undefined>,
): string {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
    )
    .join("&")
    .replace(/%2C/g, ",");
}

const MediaBox = ({
  imageWidth,
  imageHeight,
  cropRatio,
  objectFit,
  className,
  children,
  ...rest
}: MediaBoxProps &
  HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => {
  const paddingBottom =
    objectFit === "cover" || objectFit === "contain"
      ? undefined
      : cropRatio
        ? `${cropRatio * 100}%`
        : `${(imageHeight / imageWidth) * 100}%`;

  const isFill = objectFit === "cover" || objectFit === "contain";

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        isFill ? "w-full h-full" : "w-full",
        className,
      )}
      style={
        !isFill && paddingBottom ? { paddingBottom, height: 0 } : undefined
      }
      {...rest}
    >
      {children}
    </div>
  );
};

/**
 * Used to display images from Sitecore. This component will optimize the image
 * for various screen sizes and resolutions. It will also lazy load the image to improve performance.
 */
export const ImageViewBase = ({
  alt = ``,
  caption,
  captionLinkedItems,
  captionLinks,
  className,
  cover,
  cropRatio,
  cropWidth = 750,
  focalPoint,
  lazy = true,
  objectFit,
  region,
  suppressCaption = false,
  image,
  theme,
  mediaBoxProps,
  imageClass,
  ...otherProps
}: ImageOptimProps) => {
  /**
   * Determines aspect ratio image should be cropped to based on `cropRatio`
   * prop and compares it to the aspect ratio of the original image.
   * `cropWidthCalc` and `cropHeightCalc` are then set to the largest possible
   * dimensions based on the width and height of the source image. Those values
   * are used draw the crop rectangle using the image transformation API
   * based on the set focal point.
   */
  const width = image?.value?.width as number;
  const height = image?.value?.height as number;
  if (!width || !height) {
    return null;
  }
  const newAspectRatio = 1 / (cropRatio ?? 1);
  const oldAspectRatio = width / height;
  let cropWidthCalc = width;
  let cropHeightCalc = height;
  if (oldAspectRatio > newAspectRatio) {
    cropWidthCalc = Math.round(height * newAspectRatio);
  } else if (oldAspectRatio < newAspectRatio) {
    cropHeightCalc = Math.round(width / newAspectRatio);
  }

  const resolvedObjectFit = objectFit ?? (cover ? "cover" : undefined);

  const rectFocalPoint = () => {
    switch (focalPoint) {
      case "left-top":
        return `0,0,${cropWidthCalc},${cropHeightCalc}`;
      case "right-top":
        return `${width - cropWidthCalc},0,${cropWidthCalc},${cropHeightCalc}`;
      case "top":
        return `${(width - cropWidthCalc) / 2},0,${cropWidthCalc},${cropHeightCalc}`;
      case "left-bottom":
        return `0,${height - cropHeightCalc},${cropWidthCalc},${cropHeightCalc}`;
      case "right-bottom":
        return `${width - cropWidthCalc},${height - cropHeightCalc},${cropWidthCalc},${cropHeightCalc}`;
      case "bottom":
        return `${(width - cropWidthCalc) / 2},${height - cropHeightCalc},${cropWidthCalc},${cropHeightCalc}`;
      case "left":
        return `0,${(height - cropHeightCalc) / 2},${cropWidthCalc},${cropHeightCalc}`;
      case "right":
        return `${width - cropWidthCalc},${(height - cropHeightCalc) / 2},${cropWidthCalc},${cropHeightCalc}`;
      case "center":
      default:
        return `${(width - cropWidthCalc) / 2},${(height - cropHeightCalc) / 2},${cropWidthCalc},${cropHeightCalc}`;
    }
  };

  const params = {
    w: cropWidth || ``,
    h: cropWidth && cropRatio ? cropWidth * cropRatio : ``,
    rect: focalPoint ? rectFocalPoint() : ``,
    fit: !focalPoint && cropRatio ? "crop" : ``,
    q: 85,
    auto: "format",
  };
  const paramsString = buildQueryString(params);

  const objectPositionMap = {
    "left-top": "left top",
    top: "top",
    "right-top": "right top",
    left: "left",
    center: "center",
    right: "right",
    "left-bottom": "left bottom",
    bottom: "bottom",
    "right-bottom": "right bottom",
  } as const;

  const objectPosition = objectPositionMap[focalPoint ?? "center"];

  return (
    <>
      <MediaBox
        imageWidth={width}
        imageHeight={height}
        className={className}
        cropRatio={cropRatio}
        objectFit={resolvedObjectFit}
        {...mediaBoxProps}
      >
        <NextImage
          field={image}
          alt={image?.value?.alt as string}
          className={cn(
            'block absolute inset-0 w-full h-full',
            resolvedObjectFit === 'contain' ? 'object-contain' : 'object-cover',
            imageClass,
          )}
          style={resolvedObjectFit ? { objectPosition } : undefined}
        />
      </MediaBox>
      {caption && !suppressCaption ? (
        <Caption
          className="text-left"
          border={region === "aside" ? "left" : undefined}
        >
          <CaptionContent
            content={caption}
            linkedItems={captionLinkedItems}
            links={captionLinks}
            spacing="xs"
            theme={theme}
          />
        </Caption>
      ) : null}
    </>
  );
};

export const ImageView = ImageViewBase;
export type { ImageOptimProps, MediaBoxProps } from "./ImageViewTypes";
