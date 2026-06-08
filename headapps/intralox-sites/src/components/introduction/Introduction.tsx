import type { JSX } from 'react';

import { extractMediaTileBrightcoveId } from 'components/media-tile/mediaTileUtils';
import {
  isVideoMediaType,
  MEDIA_LABELS,
  resolveMediaPlaybackOptions,
} from 'components/media/mediaUtils';
import { MediaImage } from 'components/media/partial/MediaImage';
import { getRichTextRegionAriaLabel } from 'components/rich-text/richTextUtils';
import { cn } from 'lib/utils';

import type { IntroductionProps } from './Introduction.type';
import {
  INTRODUCTION_LABELS,
  introductionMediaColumnVisible,
  introductionShouldRenderSection,
  resolveIntroductionLayoutFields,
  resolveIntroductionVideoCoverImage,
} from './introductionUtils';
import { IntroductionClient } from './partial/IntroductionClient';
import { IntroductionTextStack } from './partial/IntroductionTextStack';
import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';

/** Introduction block: headline, rich text, side media (image or Brightcove modal), optional link. */
export function Default({
  fields,
  params,
  page,
  rendering,
}: IntroductionProps): JSX.Element | null {
  const { isEditing } = page.mode;
  const { styles } = params;
  const anchorId = renderingAnchorIdProps(params.RenderingIdentifier);

  if (!fields) {
    return (
      <section
        className={cn(
          'component introduction isolate box-border m-0 block w-full min-w-0 max-w-full overflow-x-clip border-0 border-x-0 border-t border-b border-solid border-stroke-default bg-surface-subtle py-10! px-0! text-base leading-6 text-ink-primary font-media-tile antialiased [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]',
          styles,
        )}
        {...anchorId}
      >
        <div className="component-content box-border mx-auto w-full min-w-0 max-w-[1200px] px-4 py-0 md:tablet-only:mx-[72px] md:tablet-only:w-[calc(100%-144px)] md:tablet-only:max-w-[768px] lg:mx-auto lg:w-full lg:max-w-[1200px]">
          <span className="is-empty-hint">{INTRODUCTION_LABELS.emptyHint}</span>
        </div>
      </section>
    );
  }

  const resolved = resolveIntroductionLayoutFields(fields);

  if (!introductionShouldRenderSection(resolved, isEditing)) {
    return null;
  }

  const isVideo = isVideoMediaType(resolved.MediaType);
  const video = resolved.Video ?? undefined;
  const brightcoveId = video ? extractMediaTileBrightcoveId(video) : '';
  const playback = video
    ? resolveMediaPlaybackOptions(
      undefined,
      Boolean(video.fields?.Autoplay?.value),
      Boolean(video.fields?.Loop?.value),
    )
    : { autoplay: false, loop: false };

  const regionFallback = getRichTextRegionAriaLabel(rendering, INTRODUCTION_LABELS.emptyHint);
  const ariaLabel =
    typeof resolved.Headline?.value === 'string' && resolved.Headline.value.trim() !== ''
      ? resolved.Headline.value.trim()
      : regionFallback;

  const linkField = resolved.Link;

  const showMediaColumn = introductionMediaColumnVisible(resolved, isEditing);
  const image = resolved.Image;
  const hasImageSrc = Boolean(image?.value?.src);

  const hasSideMedia =
    (showMediaColumn && !isVideo) || Boolean(isVideo && isEditing && !video);

  const textStack = (
    <IntroductionTextStack
      headline={resolved.Headline}
      isEditing={isEditing}
      text={resolved.Text}
    />
  );

  if (isVideo && video && (brightcoveId || isEditing)) {
    const cover = resolveIntroductionVideoCoverImage(resolved.Image, video);
    return (
      <section
        aria-label={ariaLabel}
        className={cn(
          'component introduction isolate box-border m-0 block w-full min-w-0 max-w-full overflow-x-clip border-0 border-x-0 border-t border-b border-solid border-stroke-default bg-surface-subtle py-10! px-0! text-base leading-6 text-ink-primary font-media-tile antialiased [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]',
          styles,
        )}
        {...anchorId}
      >
        <div className="component-content box-border mx-auto w-full min-w-0 max-w-[1200px] px-10 py-0 md:tablet-only:px-4 md:tablet-only:mx-[22px] lg:px-10 xl:px-4 md:tablet-only:w-[calc(100%-60px)] md:tablet-only:max-w-full lg:mx-auto lg:w-full lg:max-w-[1200px]">
          <IntroductionClient
            coverImage={cover}
            isEditing={isEditing}
            link={linkField}
            playback={playback}
            video={video}
          >
            {textStack}
          </IntroductionClient>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label={ariaLabel}
      className={cn(
        'component introduction isolate box-border m-0 block w-full min-w-0 max-w-full overflow-x-clip border-0 border-x-0 border-t border-b border-solid border-stroke-default bg-surface-subtle py-10! px-0! text-base leading-6 text-ink-primary font-media-tile antialiased [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]',
        styles,
      )}
      {...anchorId}
    >
      <div className="component-content box-border mx-auto w-full min-w-0 max-w-[1200px] px-10 py-0 md:tablet-only:px-4 md:tablet-only:mx-[22px] lg:px-10 xl:px-4 md:tablet-only:w-[calc(100%-60px)] md:tablet-only:max-w-full lg:mx-auto lg:w-full lg:max-w-[1200px]">
        <div className="flex w-full min-w-0 flex-col items-start gap-4 md:flex-row md:items-start md:gap-0">
          {isVideo && isEditing && !video ? (
            <div className="relative box-border flex h-[220px] w-[220px] max-w-full shrink-0 items-center justify-center overflow-x-clip overflow-y-clip bg-surface align-middle">
              <span className="is-empty-hint">{MEDIA_LABELS.videoEmptyHint}</span>
            </div>
          ) : null}

          {showMediaColumn && !isVideo ? (
            <div className="relative box-border block h-[220px] w-[220px] max-w-full shrink-0 overflow-x-clip overflow-y-clip align-middle">
              {hasImageSrc && image ? (
                <div className="absolute inset-0 box-border overflow-x-clip overflow-y-clip">
                  <MediaImage
                    cropWidth={1200}
                    focalPoint={undefined}
                    image={image}
                    objectFit="cover"
                    region={undefined}
                    wrapperClassName="pointer-events-none h-full w-full min-h-0 min-w-0 [&_img]:h-full [&_img]:w-full [&_img]:max-h-none [&_img]:max-w-none [&_img]:object-cover [&_img]:object-center"
                  />
                </div>
              ) : isEditing ? (
                <div className="flex h-full w-full items-center justify-center bg-surface">
                  <span className="is-empty-hint">{MEDIA_LABELS.imageEmptyHint}</span>
                </div>
              ) : null}
            </div>
          ) : null}

          <div
            className={cn(
              'box-border flex w-full min-w-0 flex-1 flex-col gap-0 break-words isolate [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]',
              hasSideMedia ? 'pl-0 md:mt-4 md:pl-12' : '',
            )}
          >
            {textStack}
          </div>
        </div>
      </div>
    </section>
  );
}
