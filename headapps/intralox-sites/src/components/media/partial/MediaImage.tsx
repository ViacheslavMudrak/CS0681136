import type { JSX } from 'react';

import { NextImage, type ImageField } from '@sitecore-content-sdk/nextjs';
import { cn } from "lib/utils";

import type { FocalPointType } from 'components/shared/ImageView/ImageViewTypes';

import {
  mediaFocalPointToObjectPosition,
  parseMediaImageDimensionsWithFallback,
} from '../mediaUtils';

export interface MediaImageProps {
  image: ImageField;
  focalPoint: FocalPointType | undefined;
  objectFit: 'cover' | 'contain' | undefined;
  /** Unused today; kept for API parity with ImageView / future caption chrome. */
  region: 'aside' | 'default' | undefined;
  /** Extra classes on the wrapper (e.g. `rounded`). */
  wrapperClassName?: string;
  cropWidth?: number;
  /** Fill a fixed-height parent (e.g. carousel slide). */
  fillHeight?: boolean;
  /** Passed to {@link NextImage}. */
  sizes?: string;
  /** Fixed px frame using NextImage `fill` (skips intrinsic dimensions). */
  fillFrame?: { width: number; height: number };
  /** Typographic tone on the replaced element when {@link fillFrame} is set. */
  fillTone?: 'onDark' | 'onLight';
  /** `cursor: pointer` on the fill frame wrapper and image (e.g. Media Box thumbnail). */
  fillPointerCursor?: boolean;
  /** Extra classes on {@link NextImage} (`fill` and intrinsic modes; merged after base layout classes). */
  imageInteractiveClassName?: string;
}

/** Sitecore image with intrinsic or fill-frame layout and focal-point object-position. */
export function MediaImage({
  image,
  focalPoint,
  objectFit,
  wrapperClassName = '',
  cropWidth = 1200,
  fillHeight = false,
  sizes = '(max-width: 768px) 100vw, min(1200px, 100vw)',
  fillFrame,
  fillTone = 'onDark',
  fillPointerCursor = false,
  imageInteractiveClassName = '',
}: MediaImageProps): JSX.Element | null {
  const objectPosition = mediaFocalPointToObjectPosition(focalPoint);
  const fit = objectFit ?? 'cover';

  if (fillFrame) {
    const { width, height } = fillFrame;
    return (
      <div
        className={cn(
          'relative box-border max-w-full shrink-0 overflow-x-clip overflow-y-clip [overflow-clip-margin:content-box]',
          fillPointerCursor && 'cursor-pointer',
          wrapperClassName,
        )}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <NextImage
          field={image}
          fill
          sizes={sizes}
          className={cn(
            'absolute inset-0 bottom-0 left-0 right-0 top-0 box-border m-0 block h-full w-full max-w-full min-h-0 overflow-x-clip overflow-y-clip p-0 align-middle object-cover object-center font-media-tile text-font-medium leading-6 [overflow-clip-margin:content-box] [-webkit-tap-highlight-color:transparent] transition-opacity duration-150 ease-in-out motion-reduce:transition-none border-0 border-solid border-stroke-default',
            fillTone === 'onDark' ? 'text-ink-inverse' : 'text-ink-primary',
            fillPointerCursor && 'cursor-pointer',
            imageInteractiveClassName,
          )}
          style={{ objectPosition }}
        />
      </div>
    );
  }

  const dims = parseMediaImageDimensionsWithFallback(image);
  if (!dims) {
    return null;
  }

  const maxW = cropWidth;
  const w = Math.min(Math.round(dims.width), maxW);
  const h = Math.max(1, Math.round((dims.height / dims.width) * w));

  let imageClassName: string;
  if (fillHeight) {
    imageClassName =
      fit === 'contain' ?
        'h-full w-full min-h-0 max-h-none object-contain'
      : 'h-full w-full min-h-0 max-h-none object-cover';
  } else if (fit === 'contain') {
    imageClassName = 'h-auto w-full max-w-full object-contain';
  } else {
    imageClassName = 'h-auto w-full max-w-full object-cover';
  }

  return (
    <div className={cn('block min-h-0 w-full max-w-full', wrapperClassName)}>
      <NextImage
        field={image}
        width={w}
        height={h}
        sizes={sizes}
        className={cn(imageClassName, imageInteractiveClassName)}
        style={{ objectPosition }}
      />
    </div>
  );
}
