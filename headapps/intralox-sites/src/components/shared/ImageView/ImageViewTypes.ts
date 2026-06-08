import { HTMLAttributes } from "react";
import { ImageField } from "@sitecore-content-sdk/nextjs";

export type FocalPointType =
  | "center"
  | "left-top"
  | "right-top"
  | "top"
  | "left-bottom"
  | "right-bottom"
  | "bottom"
  | "left"
  | "right";
export interface MediaBoxProps {
  objectFit?: "cover" | "contain";

  /**
   * The aspect ratio of the image. This is used to set the `padding-bottom`
   * property to maintain the aspect ratio of the image and avoid layout shift.
   * If `cover` is set to `true` this property will be ignored.
   */
  cropRatio?: number;

  /**
   * The height of the original image. This is used if `cropRatio` is not set
   * to calculate the aspect ratio of the image.
   */
  imageHeight: number;

  /**
   * The width of the original image. This is used if `cropRatio` is not set
   * to calculate the aspect ratio of the image.
   */
  imageWidth: number;
}

export interface ImageOptimProps extends HTMLAttributes<HTMLImageElement> {
  /**
   * The alt text for the image. This is required for accessibility. Alt text
   * may only be omitted if the image is purely decorative. In that case, you
   * should add an empty alt attribute (alt="") so that assistive technologies
   * know that the image is purely decorative and does not contain any
   * meaningful content.
   */
  alt?: string;

  /**
   * The caption for the image. This will be displayed below the image.
   */
  caption?: string;

  /**
   * The linked items for the caption. This is used to provided data needed
   * to render modular content added in Sitecore.
   */
  captionLinkedItems?: unknown[];

  /**
   * The link data for items linked in Sitecore, used to resolve links.
   */
  captionLinks?: unknown[];

  /**
   * Optional classes for the image. This is used to apply custom styles to the
   * image.
   */
  className?: string;

  /**
   * @deprecated This prop is deprecated and will be removed in future versions. Please use the `objectFit` prop instead.
   * Whether the image should cover the entire container or not.
   */
  cover?: boolean;

  /**
   * The desired aspect ratio of the image represented as a decimal
   * (e.g. 16:9 = 9/16 = 0.5625). This is used to crop and resize the image. If
   * no cropRatio is set, the image will be displayed at its original aspect
   * ratio.
   */
  cropRatio?: number;

  /**
   * The desired width of the image. This is used to optimize the image so the
   * image is not larger than it needs to be.
   */
  cropWidth?: number;

  /**
   * The focal point of the image. This is used to ensure the most important
   * part of the image is not cropped out.
   */
  focalPoint?: FocalPointType;

  /**
   * Whether the image should be lazy loaded or not.
   */
  lazy?: boolean;

  /**
   * How the image should fill the container. Cover scales the image up to fill the entire container,
   * contain scales the image down and centers it to maintain its aspect ratio.
   */
  objectFit?: "cover" | "contain";

  /**
   * The region the image is being displayed in. This is used to determine whether
   * captions should have a border or not.
   */
  region?: "aside" | "default";

  /**
   * Whether the caption should be omitted regardless of whether it is set or not.
   * This is used to prevent captions from being displayed in layouts where they
   * don't make sense, like backgrounds.
   */
  suppressCaption?: boolean;

  /**
   *  The URL of the image. This is required.
   */
  image: ImageField;

  /**
   * Passes the current theme value to the rich text component used to display
   * captions
   */
  theme?: unknown;

  mediaBoxProps?: HTMLAttributes<HTMLDivElement>;

  imageClass?:string;
}
