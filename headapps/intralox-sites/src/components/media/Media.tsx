import { JSX } from 'react';

import { Link as ContentSdkLink, Text } from '@sitecore-content-sdk/nextjs';

import { Container } from 'components/shared/BaseContainer';
import {
  extractMediaTileBrightcoveId,
  mergeMediaTileRenderingParams,
} from '../media-tile/mediaTileUtils';
import {
  type MediaProps,
  getCmsLinkAnchorProps,
  hasNonEmptyText,
  isVideoMediaType,
  MEDIA_LABELS,
  mediaHasVisitorContent,
  normalizeMediaFocalPoint,
  normalizeMediaObjectFit,
  normalizeMediaRegion,
  readHasDarkBackground,
  readMediaParamString,
  readPlayInModal,
  resolveMediaLayoutFields,
  resolveMediaPlaybackOptions,
  resolveMediaVideoCoverImage,
  resolveMediaVideoPresentation,
} from './mediaUtils';
import { MediaClient } from './partial/MediaClient';
import { MediaImage } from './partial/MediaImage';
import { getRouteContainerWidth } from 'src/utils/routeContainerWidth';
import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';
import { cn } from 'lib/utils';

/** Media image or Brightcove video with caption/link; video modals sync `?video=` from the item title. */
export function Default({
  fields,
  params,
  page,
  rendering,
}: MediaProps): JSX.Element | null {
  const { isEditing } = page.mode;
  const { styles } = params;
  const anchorId = renderingAnchorIdProps(params.RenderingIdentifier);
  const routeContainerWidth = getRouteContainerWidth(page);

  if (!fields) {
    return (
      <section
        className={cn('component media w-full min-w-0 max-w-full', styles)}
        {...anchorId}
      >
        <div className="component-content flex w-full min-w-0 max-w-full flex-col items-stretch overflow-x-clip">
          {routeContainerWidth ? (
            <Container width={routeContainerWidth}>
              <span className="is-empty-hint">{MEDIA_LABELS.emptyHint}</span>
            </Container>
          ) : (
            <span className="is-empty-hint">{MEDIA_LABELS.emptyHint}</span>
          )}
        </div>
      </section>
    );
  }

  const resolvedFields = resolveMediaLayoutFields(fields);

  if (!mediaHasVisitorContent(resolvedFields, isEditing)) {
    return null;
  }

  const mergedParams = mergeMediaTileRenderingParams(
    rendering,
    params as Record<string, unknown>,
  );

  const isVideo = isVideoMediaType(resolvedFields.MediaType);
  const format = readMediaParamString(mergedParams.Format);
  const playInModal =
    readPlayInModal(mergedParams.PlayInModel) || readPlayInModal(mergedParams.PlayInModal);
  const presentation = resolveMediaVideoPresentation(format, playInModal);
  const focalPoint = normalizeMediaFocalPoint(readMediaParamString(mergedParams.FocalPoint));
  const objectFit = normalizeMediaObjectFit(readMediaParamString(mergedParams.ObjectFit));
  const region = normalizeMediaRegion(readMediaParamString(mergedParams.Region));
  const darkBg = readHasDarkBackground(mergedParams.HasDarkBackground);

  const captionField = resolvedFields.MediaCaption;
  const showCaption =
    hasNonEmptyText(captionField?.value) || (isEditing && captionField !== undefined);

  const darkPanel = (body: JSX.Element) =>
    darkBg ? (
      <div className="box-border flex w-full min-w-0 max-w-full flex-col items-stretch overflow-x-clip bg-surface-strong p-4 text-ink-inverse font-media-tile leading-6 [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]">
        {body}
      </div>
    ) : (
      body
    );

  const layoutShell = (body: JSX.Element) => (
    <div
      className={cn(
        'box-border flex w-full min-w-0 max-w-full flex-col items-stretch overflow-x-clip',
        darkBg && 'bg-surface',
      )}
    >
      {darkPanel(body)}
    </div>
  );

  if (isVideo) {
    const video = resolvedFields.Video;
    if (!video && isEditing) {
      return (
        <section
          className={cn('component media w-full min-w-0 max-w-full', styles)}
          {...anchorId}
        >
          <div className="component-content flex w-full min-w-0 max-w-full flex-col items-stretch overflow-x-clip">
            {routeContainerWidth ? (
              <Container width={routeContainerWidth}>
                <span className="is-empty-hint">{MEDIA_LABELS.videoEmptyHint}</span>
              </Container>
            ) : (
              <span className="is-empty-hint">{MEDIA_LABELS.videoEmptyHint}</span>
            )}
          </div>
        </section>
      );
    }

    if (!video) {
      return null;
    }

    const brightcoveId = extractMediaTileBrightcoveId(video);
    if (!brightcoveId && !isEditing) {
      return null;
    }

    const vf = video.fields;
    const playback = resolveMediaPlaybackOptions(
      readMediaParamString(mergedParams.Playback) ??
        readMediaParamString(mergedParams.playback),
      Boolean(vf?.Autoplay?.value),
      Boolean(vf?.Loop?.value),
    );

    const mediaVideoClient = (
      <MediaClient
        isEditing={isEditing}
        video={video}
        coverImage={resolveMediaVideoCoverImage(resolvedFields.Image, video)}
        presentation={presentation}
        playback={playback}
        mediaCaption={resolvedFields.MediaCaption}
        link={resolvedFields.Link}
        focalPoint={focalPoint}
        objectFit={objectFit}
        region={region}
        hasDarkBackground={darkBg}
      />
    );

    return (
      <section
        className={cn(
          'component media w-full min-w-0 max-w-full',
          darkBg && 'overflow-x-clip',
          styles,
        )}
        {...anchorId}
      >
        <div className="component-content flex w-full min-w-0 max-w-full flex-col items-stretch overflow-x-clip">
          {routeContainerWidth ? (
            <Container width={routeContainerWidth} className="max-w-full">
              {layoutShell(mediaVideoClient)}
            </Container>
          ) : (
            layoutShell(mediaVideoClient)
          )}
        </div>
      </section>
    );
  }

  const image = resolvedFields.Image;
  const hasImageSrc = Boolean(image?.value?.src);
  const showImage = hasImageSrc || isEditing;

  const linkField = resolvedFields.Link;
  const href = linkField?.value?.href;
  const showLink =
    (typeof href === 'string' && href.trim() !== '') ||
    (isEditing && linkField !== undefined);

  const linkAnchorProps = linkField
    ? getCmsLinkAnchorProps(linkField, MEDIA_LABELS.linkAriaFallback)
    : null;

  const imageMediaBody = (
    <>
      {showImage && image && hasImageSrc ? (
        <MediaImage
          image={image}
          focalPoint={focalPoint}
          objectFit={objectFit ?? 'cover'}
          region={region}
          wrapperClassName="rounded"
          cropWidth={1200}
        />
      ) : null}
      {showImage && isEditing && !hasImageSrc ? (
        <div className="flex min-h-[10rem] items-center justify-center rounded bg-surface-muted">
          <span className="is-empty-hint">{MEDIA_LABELS.imageEmptyHint}</span>
        </div>
      ) : null}
      {showCaption && captionField ? (
        <Text
          field={captionField}
          tag="p"
          className={cn(
            'box-border m-0 mt-2 block w-full max-w-full text-left font-normal not-italic text-font-media-tile-eyebrow leading-[19.25px] font-media-tile [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]',
            darkBg ? 'text-ink-inverse' : 'text-ink-muted',
            'border-0',
            region === 'aside'
              ? 'border-l-4 border-solid border-stroke-default px-2 py-0'
              : 'p-0',
          )}
        />
      ) : null}
      {showLink && linkField ? (
        <div className="mt-3">
          <ContentSdkLink
            field={linkField}
            className={cn(
              'font-roboto text-font-medium underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-teal',
              darkBg ? 'text-ink-inverse' : 'text-nav-link-hover',
            )}
            aria-label={linkAnchorProps?.['aria-label']}
            target={linkAnchorProps?.target}
            rel={linkAnchorProps?.rel}
          />
        </div>
      ) : null}
    </>
  );

  return (
    <section
      className={cn(
        'component media w-full min-w-0 max-w-full',
        darkBg && 'overflow-x-clip',
        styles,
      )}
      {...anchorId}
    >
      <div className="component-content flex w-full min-w-0 max-w-full flex-col items-stretch overflow-x-clip">
        {routeContainerWidth ? (
          <Container width={routeContainerWidth} className="max-w-full">
            {layoutShell(imageMediaBody)}
          </Container>
        ) : (
          layoutShell(imageMediaBody)
        )}
      </div>
    </section>
  );
}
