import type { ImageField } from '@sitecore-content-sdk/nextjs';

import { extractMediaTileBrightcoveId } from 'components/media-tile/mediaTileUtils';
import type { IVideoFields } from 'src/utils/interface';

import type { BillboardFields, IField } from './Billboard.type';

export type BillboardMediaKind = 'image' | 'video';

interface ParamValue<T = string> {
  Value?: {
    value?: T;
  };
}

export interface BillboardParams {
  TextAlignment?: ParamValue;
  VerticalPosition?: ParamValue;
  TextPosition?: ParamValue;
  TextSize?: ParamValue;
  TextWidth?: ParamValue;
  HeadlineSize?: ParamValue;
  HeadlineWidth?: ParamValue;
  [key: string]: ParamValue | string | undefined;
}

/**
 * Extracts the string value from a param field
 */
function getParamValue<T = string>(
  param: ParamValue<T> | undefined,
): T | undefined {
  return param?.Value?.value;
}

function resolveBillboardMediaTypeLabel(
  mediaType: IField | null | undefined,
): string {
  const value = mediaType?.fields?.Value?.value;
  if (value === undefined || value === null) return '';
  return String(value).trim().toLowerCase();
}

function billboardBackgroundImageHasSrc(
  image: ImageField | undefined,
): boolean {
  const src = image?.value?.src;
  return typeof src === 'string' && src.trim().length > 0;
}

/**
 * Resolves which billboard background to render from CMS MediaType and field content.
 * When MediaType is unset, prefers BackgroundImage over Video (matches image-first billboards).
 */
export function resolveBillboardMediaKind(
  fields: Pick<BillboardFields, 'MediaType' | 'BackgroundImage' | 'Video'> | undefined,
): BillboardMediaKind | null {
  if (!fields) return null;

  const hasImage = billboardBackgroundImageHasSrc(fields.BackgroundImage);
  const hasVideo = Boolean(extractMediaTileBrightcoveId(fields.Video));
  const mediaTypeLabel = resolveBillboardMediaTypeLabel(fields.MediaType);

  if (mediaTypeLabel.includes('video')) {
    return hasVideo ? 'video' : null;
  }
  if (mediaTypeLabel.includes('image')) {
    return hasImage ? 'image' : null;
  }

  if (hasImage) return 'image';
  if (hasVideo) return 'video';
  return null;
}

/** Brightcove id when {@link resolveBillboardMediaKind} is `video`. */
export function resolveBillboardBrightcoveId(
  video: IVideoFields | undefined,
): string | undefined {
  return extractMediaTileBrightcoveId(video);
}

