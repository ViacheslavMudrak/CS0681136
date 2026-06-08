import type { JSX, ReactNode } from 'react';
import type { Field, ImageField, TextField } from '@sitecore-content-sdk/nextjs';
import { Link as ContentSdkLink, RichText, Text } from '@sitecore-content-sdk/nextjs';
import { cn } from 'lib/utils';

import { resolveMediaVideoCoverImage } from 'components/media/mediaUtils';
import { MediaImage } from 'components/media/partial/MediaImage';

import { MediaBoxImageModalProvider, MediaBoxImageModalTrigger } from './MediaBoxImageModal.client';
import {
  MediaBoxTextColumnCta,
  MediaBoxVideoCoverClient,
  MediaBoxVideoPlayProvider,
} from './MediaBoxVideo.client';

import type { MediaBoxFields } from '../MediaBox.type';
import { MEDIA_BOX_MEDIA_IMAGE_CROP_WIDTH, MEDIA_BOX_MEDIA_IMAGE_SIZES, MEDIA_BOX_MEDIA_PLACEHOLDER, MEDIA_BOX_MEDIA_THUMB_CROP_WIDTH, MEDIA_BOX_MEDIA_THUMB_SIZES, MEDIA_BOX_THUMB_FRAME_HEIGHT, MEDIA_BOX_THUMB_FRAME_WIDTH, MEDIA_BOX_VIDEO_EMPTY_HINT, mediaBoxContentOptionsIsModal, mediaBoxThumbnailIsPrimaryOnly, normalizeMediaBoxMediaType, resolveMediaBoxImageModalAriaLabel, resolveMediaBoxLinkAriaLabel, resolveMediaBoxPrimaryImageField } from '../mediaBoxUtils';
import { hasVisibleImageField, hasVisibleTextField } from 'components/text-aside/textAsideUtils';

/** Wraps rail image with Link or modal trigger; `omitLinkForModalInteraction` skips Link when Content Options opens a modal. */
function wrapMediaBoxRailImageWithLink(
  fields: MediaBoxFields,
  isEditing: boolean,
  imageEl: ReactNode,
  omitLinkForModalInteraction?: boolean,
): ReactNode {
  const { Link } = fields;
  const hasHref =
    typeof Link?.value?.href === 'string' && Link.value.href.trim() !== '';
  if (isEditing || !hasHref || !Link || omitLinkForModalInteraction) {
    return imageEl;
  }
  const linkTargetRaw = Link.value?.target;
  const linkTarget =
    typeof linkTargetRaw === 'string' && linkTargetRaw !== '' ? linkTargetRaw : undefined;
  return (
    <ContentSdkLink
      field={Link}
      editable={false}
      className='block w-full max-w-full cursor-pointer no-underline outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2'
      target={linkTarget}
      rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
      aria-label={resolveMediaBoxLinkAriaLabel(fields)}
    >
      {imageEl}
    </ContentSdkLink>
  );
}

function wrapMediaBoxRailImageWithOptionalModal(
  fields: MediaBoxFields,
  isEditing: boolean,
  imageField: ImageField | undefined,
  imageModalEnabled: boolean,
  imageEl: ReactNode,
): ReactNode {
  const omitLink = Boolean(imageModalEnabled && !isEditing);
  const linked = wrapMediaBoxRailImageWithLink(fields, isEditing, imageEl, omitLink);
  if (!imageModalEnabled || !imageField) {
    return linked;
  }
  return (
    <MediaBoxImageModalTrigger
      ariaLabel={resolveMediaBoxImageModalAriaLabel(fields, imageField)}
      enabled={!isEditing}
      image={imageField}
      isEditing={isEditing}
    >
      {linked}
    </MediaBoxImageModalTrigger>
  );
}

export interface MediaBoxLayoutProps {
  fields: MediaBoxFields;
  isEditing: boolean;
  isDarkTheme: boolean;
  /** Merged rendering params (e.g. `Format` when `MediaType` field is empty). */
  mergedParams?: Record<string, unknown>;
}

export function MediaBoxTextColumn({
  fields,
  isEditing,
  isDarkTheme,
  mergedParams,
}: Pick<MediaBoxLayoutProps, 'fields' | 'isEditing' | 'isDarkTheme' | 'mergedParams'>): JSX.Element | null {
  const { Heading, Description, Link } = fields;
  const descVal = Description?.value?.toString();
  const hasDesc = descVal != null && descVal.trim() !== '';
  const showDesc = hasDesc || isEditing;
  const showHeading = hasVisibleTextField(Heading) || isEditing;
  const hasHref = typeof Link?.value?.href === 'string' && Link.value.href.trim() !== '';
  const showLink = hasHref || isEditing;

  if (!showHeading && !showDesc && !showLink) {
    return null;
  }

  return (
    <div className='box-border min-w-0 w-full max-w-full min-[600px]:flex-1 min-[600px]:min-w-0'>
      <div className='media-box-text-stack box-border mb-0 ml-0 mr-0 mt-2 min-[600px]:mt-0 block min-h-0 w-full max-w-full border-0 border-solid border-stroke-default pb-0 pl-0 pr-0 pt-0 min-[600px]:pl-6 text-left text-font-media-tile-eyebrow font-normal font-media-tile leading-[21px] antialiased [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]' data-slot="media-box-text-stack">
        <div className="flex min-w-0 w-full max-w-full flex-col">
          {showHeading ?
            <Text
              field={(Heading ?? ({ value: '' } as TextField))}
              tag="h2"
              className={cn(
                'box-border !m-0 block min-h-0 w-full min-w-0 max-w-full p-0 text-left text-font-medium font-bold uppercase leading-[16px] border-0 border-solid border-stroke-default font-media-tile [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]',
                isDarkTheme ? 'text-ink-inverse' : 'text-ink-primary',
              )}
            />
          : null}
          {showDesc ?
            <RichText
              field={(Description ?? { value: '' }) as Field<string>}
              className={cn(
                'box-border m-0 block w-full min-w-0 max-w-full p-0 text-left text-sm font-normal leading-normal font-media-tile [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]',
                isDarkTheme
                  ? 'text-ink-inverse [&_strong]:font-bold [&_strong]:text-ink-inverse [&_a]:text-nav-link-hover [&_a]:underline [&_a:hover]:text-link-strong [&_a:hover]:no-underline [&_a]:focus-visible:outline-none [&_a]:focus-visible:ring-2 [&_a]:focus-visible:ring-nav-link-hover [&_a]:focus-visible:ring-offset-2 [&_a]:focus-visible:ring-offset-[var(--color-chrome-stripe)]'
                  : 'text-ink-secondary [&_strong]:font-bold [&_strong]:text-ink-primary [&_a]:text-nav-link-hover [&_a]:underline [&_a:hover]:text-link-strong [&_a:hover]:no-underline [&_a]:focus-visible:outline-none [&_a]:focus-visible:ring-2 [&_a]:focus-visible:ring-nav-link-hover [&_a]:focus-visible:ring-offset-2 [&_a]:focus-visible:ring-offset-surface',
                showHeading && 'mt-2',
              )}
            />
          : null}
          {showLink && Link ?
            <MediaBoxTextColumnCta
              fields={fields}
              isEditing={isEditing}
              mergedParams={mergedParams}
              isDarkTheme={isDarkTheme}
              showHeading={Boolean(showHeading)}
              showDesc={Boolean(showDesc)}
            />
          : null}
        </div>
      </div>
    </div>
  );
}

export function MediaBoxMediaColumn({
  fields,
  isEditing,
  mergedParams,
}: Omit<MediaBoxLayoutProps, 'isDarkTheme' | 'renderingId'>): JSX.Element | null {
  const kind = normalizeMediaBoxMediaType(fields, mergedParams);
  const primaryImage = resolveMediaBoxPrimaryImageField(fields);
  const thumbPrimaryOnly = mediaBoxThumbnailIsPrimaryOnly(fields);
  const hasThumb = hasVisibleImageField(fields.Thumbnail) || isEditing;
  /** Image mode only: small strip under primary. */
  const showSecondaryThumb =
    kind === 'image' && hasThumb && !!primaryImage && !thumbPrimaryOnly;

  const showPrimaryThumbAsHero = kind === 'image' && thumbPrimaryOnly;

  const videoCoverResolved = resolveMediaVideoCoverImage(
    primaryImage,
    fields.Video ?? undefined,
  );
  const videoRailImageField =
    hasVisibleImageField(videoCoverResolved) ? videoCoverResolved
    : hasVisibleImageField(fields.Thumbnail) ? fields.Thumbnail
    : undefined;
  const showVideoColumn =
    kind === 'video' && (isEditing || videoRailImageField !== undefined);

  const showPrimaryImage =
    kind === 'image' && !!primaryImage && !thumbPrimaryOnly && (hasVisibleImageField(primaryImage) || isEditing);

  const imageModalEnabled = kind === 'image' && mediaBoxContentOptionsIsModal(mergedParams ?? {});

  if (
    !showVideoColumn &&
    !showPrimaryImage &&
    !showPrimaryThumbAsHero &&
    !showSecondaryThumb
  ) {
    if (isEditing) {
      return (
        <div className="box-border min-w-0 shrink-0 self-start w-full max-w-[124px] min-[600px]:w-auto min-[600px]:max-w-[124px]">
          <span className="is-empty-hint">{MEDIA_BOX_MEDIA_PLACEHOLDER}</span>
        </div>
      );
    }
    return null;
  }

  const thumbField = fields.Thumbnail;
  const primaryImageUsesThumbFrame = !showSecondaryThumb;

  return (
    <div className="box-border min-w-0 shrink-0 self-start w-full max-w-[124px] min-[600px]:w-auto min-[600px]:max-w-[124px]">
      <div
        className="media-box-media-container box-border m-0 block min-h-0 w-full min-w-0 max-w-full shrink-0 border-0 border-solid border-stroke-default p-0 font-media-tile leading-6 text-ink-inverse [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]"
        data-slot="media-box-media-container"
      >
        <div className="flex min-w-0 flex-col gap-4">
        {showVideoColumn ?
          !fields.Video && isEditing ?
            <span className="is-empty-hint">{MEDIA_BOX_VIDEO_EMPTY_HINT}</span>
          : videoRailImageField && hasVisibleImageField(videoRailImageField) ?
            <MediaBoxVideoCoverClient
              video={fields.Video ?? undefined}
              coverImage={videoRailImageField}
              isEditing={isEditing}
            />
          : isEditing ?
            <div
              className="media-box-thumb-outer box-border m-0 block h-[77.25px] w-[100px] shrink-0 border-0 border-solid border-stroke-default p-0"
              data-slot="media-box-video-cover-placeholder"
            >
              <div className="media-box-thumb-inner box-border m-0 shrink-0 border-0 border-solid border-stroke-default p-0 flex items-center justify-center bg-surface-muted">
                <span className="is-empty-hint text-center text-xs">{MEDIA_BOX_MEDIA_PLACEHOLDER}</span>
              </div>
            </div>
          : null
        : null}

        {showPrimaryImage && primaryImage ?
          <div className="box-border w-full min-w-0">
            {hasVisibleImageField(primaryImage) ?
              <div className="w-full max-w-full" data-slot="media-box-primary-image">
                {wrapMediaBoxRailImageWithOptionalModal(
                  fields,
                  isEditing,
                  primaryImage,
                  imageModalEnabled,
                  <MediaImage
                    image={primaryImage}
                    focalPoint={undefined}
                    objectFit="cover"
                    region="default"
                    wrapperClassName={
                      primaryImageUsesThumbFrame ?
                        'cursor-pointer shadow-media-box-thumb'
                      : 'cursor-pointer'
                    }
                    imageInteractiveClassName="opacity-100 transition-[opacity,filter] duration-150 [transition-timing-function:ease] motion-reduce:transition-none hover:opacity-90 hover:brightness-90"
                    cropWidth={
                      primaryImageUsesThumbFrame ?
                        MEDIA_BOX_MEDIA_THUMB_CROP_WIDTH
                      : MEDIA_BOX_MEDIA_IMAGE_CROP_WIDTH
                    }
                    sizes={
                      primaryImageUsesThumbFrame ? MEDIA_BOX_MEDIA_THUMB_SIZES : MEDIA_BOX_MEDIA_IMAGE_SIZES
                    }
                    {...(primaryImageUsesThumbFrame ?
                      {
                        fillFrame: {
                          width: MEDIA_BOX_THUMB_FRAME_WIDTH,
                          height: MEDIA_BOX_THUMB_FRAME_HEIGHT,
                        },
                        fillTone: 'onDark' as const,
                        fillPointerCursor: true,
                      }
                    : {})}
                  />,
                )}
              </div>
            : isEditing ?
              <div
                className="flex min-h-[10rem] w-full max-w-full items-center justify-center bg-surface-muted"
                data-slot="media-box-primary-image"
              >
                <span className="is-empty-hint">{MEDIA_BOX_MEDIA_PLACEHOLDER}</span>
              </div>
            : null}
          </div>
        : null}

        {showPrimaryThumbAsHero && thumbField ?
          <div className="box-border w-full min-w-0">
            {hasVisibleImageField(thumbField) ?
              <div className="w-full max-w-full" data-slot="media-box-primary-image">
                {wrapMediaBoxRailImageWithOptionalModal(
                  fields,
                  isEditing,
                  thumbField,
                  imageModalEnabled,
                  <MediaImage
                    image={thumbField}
                    focalPoint={undefined}
                    objectFit="cover"
                    region="default"
                    wrapperClassName="cursor-pointer shadow-media-box-thumb"
                    imageInteractiveClassName="opacity-100 transition-[opacity,filter] duration-150 [transition-timing-function:ease] motion-reduce:transition-none hover:opacity-90 hover:brightness-90"
                    cropWidth={MEDIA_BOX_MEDIA_THUMB_CROP_WIDTH}
                    sizes={MEDIA_BOX_MEDIA_THUMB_SIZES}
                    fillFrame={{
                      width: MEDIA_BOX_THUMB_FRAME_WIDTH,
                      height: MEDIA_BOX_THUMB_FRAME_HEIGHT,
                    }}
                    fillTone="onDark"
                    fillPointerCursor
                  />,
                )}
              </div>
            : isEditing ?
              <div
                className="flex min-h-[10rem] w-full max-w-full items-center justify-center bg-surface-muted"
                data-slot="media-box-primary-image"
              >
                <span className="is-empty-hint">{MEDIA_BOX_MEDIA_PLACEHOLDER}</span>
              </div>
            : null}
          </div>
        : null}

        {showSecondaryThumb && thumbField && !showPrimaryThumbAsHero ?
          <div
            className="media-box-thumb-outer box-border m-0 block h-[77.25px] w-[100px] shrink-0 border-0 border-solid border-stroke-default p-0"
            data-slot="media-box-thumbnail-container"
          >
            <div
              className="media-box-thumb-inner box-border m-0 shrink-0 border-0 border-solid border-stroke-default p-0"
              data-slot="media-box-thumbnail-image"
            >
              {hasVisibleImageField(thumbField) ?
                wrapMediaBoxRailImageWithOptionalModal(
                  fields,
                  isEditing,
                  thumbField,
                  imageModalEnabled,
                  <MediaImage
                    image={thumbField}
                    focalPoint={undefined}
                    objectFit="cover"
                    region="default"
                    wrapperClassName="shadow-media-box-thumb"
                    cropWidth={MEDIA_BOX_MEDIA_THUMB_CROP_WIDTH}
                    sizes={MEDIA_BOX_MEDIA_THUMB_SIZES}
                    fillFrame={{
                      width: MEDIA_BOX_THUMB_FRAME_WIDTH,
                      height: MEDIA_BOX_THUMB_FRAME_HEIGHT,
                    }}
                    fillTone="onDark"
                    fillPointerCursor
                    imageInteractiveClassName="opacity-100 transition-[opacity,filter] duration-150 [transition-timing-function:ease] motion-reduce:transition-none hover:opacity-90 hover:brightness-90"
                  />,
                )
              : isEditing ?
                <span className="is-empty-hint text-center text-xs">{MEDIA_BOX_MEDIA_PLACEHOLDER}</span>
              : null}
            </div>
          </div>
        : null}
        </div>
      </div>
    </div>
  );
}

export function MediaBoxLayout({
  fields,
  isEditing,
  isDarkTheme,
  mergedParams,
}: MediaBoxLayoutProps): JSX.Element {
  const kind = normalizeMediaBoxMediaType(fields, mergedParams);
  const row = (
    <div className='flex w-full min-w-0 flex-col gap-0 min-[600px]:flex-row min-[600px]:items-start min-[600px]:gap-0'>
      <MediaBoxMediaColumn
        fields={fields}
        isEditing={isEditing}
        mergedParams={mergedParams}
      />
      <MediaBoxTextColumn
        fields={fields}
        isEditing={isEditing}
        mergedParams={mergedParams}
        isDarkTheme={isDarkTheme}
      />
    </div>
  );

  if (kind === 'video') {
    return (
      <MediaBoxVideoPlayProvider video={fields.Video} isEditing={isEditing}>
        {row}
      </MediaBoxVideoPlayProvider>
    );
  }

  const imageModalParamActive =
    kind === 'image' && mediaBoxContentOptionsIsModal(mergedParams ?? {});

  if (imageModalParamActive) {
    return (
      <MediaBoxImageModalProvider
        fields={fields}
        isEditing={isEditing}
        modalParamActive={imageModalParamActive}
      >
        {row}
      </MediaBoxImageModalProvider>
    );
  }

  return row;
}
