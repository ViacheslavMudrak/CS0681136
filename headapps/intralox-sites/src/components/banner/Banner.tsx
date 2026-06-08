import { JSX, type CSSProperties } from 'react';
import { NextImage } from '@sitecore-content-sdk/nextjs';
import { cn } from 'lib/utils';

import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';

import type { BannerFields, BannerProps } from './Banner.type';
import { BannerTitleChrome } from './partial/BannerTitleChrome';
import {
  BANNER_EMPTY_HINT,
  BANNER_IMAGE_HEIGHT_PX,
  BANNER_SECTION_ARIA_FALLBACK,
  imageFieldHasSrc,
  isShowImageParamOn,
  parseBannerImageDimensions,
  resolveImageField,
  resolveTitleField,
  trimmedTitleHasContent,
  visitorBannerHasContent,
} from './bannerUtils';

/**
 * Page banner: route `Title` and `Image`, optional image via `ShowImage` param.
 */
export const Default = ({ fields, params, page }: BannerProps): JSX.Element | null => {
  const { isEditing } = page.mode;
  const { styles } = params;
  const anchorId = renderingAnchorIdProps(params.RenderingIdentifier);
  const routeFields = page.layout.sitecore.route?.fields as BannerFields | undefined;

  const titleField = resolveTitleField(fields, routeFields);
  const imageField = resolveImageField(fields, routeFields);

  const showImageParam = isShowImageParamOn(params as Record<string, unknown>);
  const hasTitle = trimmedTitleHasContent(titleField);
  const hasImageSrc = imageFieldHasSrc(imageField);

  const showVisitorContent = visitorBannerHasContent(showImageParam, hasImageSrc, hasTitle);

  if (!showVisitorContent && !isEditing) {
    return null;
  }

  if (!showVisitorContent && isEditing) {
    return (
      <section
        className={cn(
          'component banner w-full min-w-0 max-w-full overflow-hidden p-0! px-0!',
          styles,
        )}
        {...anchorId}
        aria-label={BANNER_SECTION_ARIA_FALLBACK}
      >
        <div className="component-content box-border m-0 min-w-0 w-full max-w-none p-0! px-0!">
          <span className="is-empty-hint">{BANNER_EMPTY_HINT}</span>
        </div>
      </section>
    );
  }

  const showImageLayer = showImageParam && hasImageSrc && imageField !== undefined;
  const showImageOnly = showImageLayer && !hasTitle && !isEditing;
  const showImageWithScrim = showImageLayer && (hasTitle || isEditing);
  const showSolidTitle =
    (hasTitle || isEditing) && (!showImageLayer || (showImageParam && !hasImageSrc));

  const ariaLabel = hasTitle
    ? String(titleField?.value ?? BANNER_SECTION_ARIA_FALLBACK).trim() ||
      BANNER_SECTION_ARIA_FALLBACK
    : BANNER_SECTION_ARIA_FALLBACK;

  const { width: imgW, height: imgH } = parseBannerImageDimensions(imageField, 1920, 1080);

  const imageHostStyle: CSSProperties = { height: BANNER_IMAGE_HEIGHT_PX };

  if (showImageOnly) {
    return (
      <section
        className={cn(
          'component banner w-full min-w-0 max-w-full overflow-hidden p-0! px-0!',
          styles,
        )}
        {...anchorId}
        aria-label={ariaLabel}
      >
        <div className="component-content box-border m-0 min-w-0 w-full max-w-none p-0! px-0!">
          <div className="relative w-full overflow-hidden bg-surface-muted" style={imageHostStyle}>
            <NextImage
              field={imageField}
              width={imgW}
              height={imgH}
              sizes="100vw"
              className="absolute inset-0 h-full w-full object-cover object-center"
              priority
            />
          </div>
        </div>
      </section>
    );
  }

  if (showImageWithScrim) {
    return (
      <section
        className={cn(
          'component banner w-full min-w-0 max-w-full overflow-hidden p-0! px-0!',
          styles,
        )}
        {...anchorId}
        aria-label={ariaLabel}
      >
        <div className="component-content box-border m-0 min-w-0 w-full max-w-none p-0! px-0!">
          <div className="relative w-full overflow-hidden bg-surface-muted" style={imageHostStyle}>
            <NextImage
              field={imageField}
              width={imgW}
              height={imgH}
              sizes="100vw"
              className="absolute inset-0 h-full w-full object-cover object-center"
              priority
            />
            <BannerTitleChrome variant="overlay" titleField={titleField} />
          </div>
        </div>
      </section>
    );
  }

  if (showSolidTitle && titleField !== undefined) {
    return (
      <section
        className={cn(
          'component banner banner--title-strip w-full min-w-0 max-w-full overflow-hidden p-0! px-0!',
          styles,
        )}
        {...anchorId}
        aria-label={ariaLabel}
      >
        <div className="component-content box-border m-0 min-w-0 w-full max-w-none bg-transparent p-0! px-0!">
          <BannerTitleChrome variant="titleStrip" titleField={titleField} />
        </div>
      </section>
    );
  }

  return null;
};
