'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type JSX,
  type KeyboardEvent,
} from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  Link as ContentSdkLink,
  Text,
  type Field,
  type ImageField,
  type LinkField,
  type TextField,
} from '@sitecore-content-sdk/nextjs';

import {
  CirclePlayIcon,
  ICON_PLAY_CIRCLE,
  ICON_PLAY_OVERLAY_LG,
  ICON_PLAY_STROKED_LG,
} from 'lib/chrome-icons';
import { MediaCaptionText } from './MediaCaptionAtoms';
import { MediaTileVideo } from 'components/media-tile/partial/MediaTileVideo';
import type { FocalPointType } from 'components/shared/ImageView/ImageViewTypes';
import Modal from 'components/shared/Modal';
import { BrightcoveModalPlayer } from 'components/shared/video/BrightcoveModalPlayer';
import type { BrightcovePlayer } from 'components/shared/video/Video.type';
import type { IVideoFields } from 'src/utils/interface';

import type { MediaPlaybackOptions, MediaVideoPresentation } from '../mediaUtils';
import {
  getCmsLinkAnchorProps,
  hasNonEmptyText,
  MEDIA_LABELS,
  MEDIA_VIDEO_QUERY_KEY,
  mediaVideoAspectBoxStyle,
  parseMediaImageDimensionsWithFallback,
  titleToVideoSlug,
} from '../mediaUtils';
import { MediaImage } from './MediaImage';
import { cn } from 'lib/utils';

const ALLOW_VIDEO_AUTOPLAY =
  process.env.NEXT_PUBLIC_DISABLE_VIDEO_AUTOPLAY !== '1';

export interface MediaClientProps {
  isEditing: boolean;
  video: IVideoFields;
  coverImage: ImageField | undefined;
  presentation: MediaVideoPresentation;
  /** From `Playback` param + video item Autoplay/Loop. */
  playback: MediaPlaybackOptions;
  mediaCaption?: Field<string> | TextField;
  link: LinkField | undefined;
  focalPoint: FocalPointType | undefined;
  objectFit: 'cover' | 'contain' | undefined;
  region: 'aside' | 'default' | undefined;
  /** From rendering param `HasDarkBackground` — adjusts CTA and caption colors on dark chrome. */
  hasDarkBackground?: boolean;
  /** When true, video fills the carousel slide (exact desktop frame from parent layout). */
  embeddedInCarousel?: boolean;
}

/** Client Media video subtree: inline Brightcove or cover + modal with `?video=` sync. */
export function MediaClient({
  isEditing,
  video,
  coverImage,
  presentation,
  playback,
  mediaCaption,
  link,
  focalPoint,
  objectFit,
  region,
  hasDarkBackground = false,
  embeddedInCarousel = false,
}: MediaClientProps): JSX.Element | null {
  const vf = video.fields;
  const videoIdRaw = vf?.BrightcoveId?.value;
  const videoId =
    videoIdRaw === undefined || videoIdRaw === null ? '' : String(videoIdRaw).trim();

  const titleVal = vf?.Title?.value;
  const titleStr = typeof titleVal === 'string' ? titleVal : titleVal != null ? String(titleVal) : '';
  const slug = titleToVideoSlug(titleStr);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const videoQueryKey = MEDIA_VIDEO_QUERY_KEY;

  const [showModal, setShowModal] = useState(false);
  const pendingOpenRef = useRef(false);
  const playerRef = useRef<BrightcovePlayer | null>(null);
  const [playerMounted, setPlayerMounted] = useState(false);

  useEffect(() => {
    setPlayerMounted(true);
  }, []);

  const syncUrlForOpen = useCallback(() => {
    if (!slug || isEditing) return;
    const u = new URLSearchParams(searchParams.toString());
    u.set(videoQueryKey, slug);
    const next = u.toString();
    if (next === searchParams.toString()) return;
    router.replace(`${pathname}?${next}`, { scroll: false });
  }, [isEditing, pathname, router, searchParams, slug, videoQueryKey]);

  const syncUrlForClose = useCallback(() => {
    if (isEditing) return;
    const u = new URLSearchParams(searchParams.toString());
    u.delete(videoQueryKey);
    const q = u.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }, [isEditing, pathname, router, searchParams, videoQueryKey]);

  useEffect(() => {
    if (isEditing || !slug) return;
    const q = searchParams.get(videoQueryKey);
    if (q === slug) {
      setShowModal(true);
      pendingOpenRef.current = false;
    } else if (!pendingOpenRef.current) {
      setShowModal(false);
    }
  }, [isEditing, searchParams, slug, videoQueryKey]);

  const openModal = () => {
    pendingOpenRef.current = true;
    setShowModal(true);
    syncUrlForOpen();
  };

  const handleModalChange = (open: boolean) => {
    if (!open) {
      pendingOpenRef.current = false;
      setShowModal(false);
      syncUrlForClose();
      playerRef.current = null;
    }
  };

  const handleCoverKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal();
    }
  };

  const linkText =
    typeof link?.value?.text === 'string' && link.value.text.trim() !== ''
      ? link.value.text.trim()
      : typeof link?.value?.description === 'string' && link.value.description.trim() !== ''
        ? link.value.description.trim()
        : '';

  const linkAnchorProps = link ? getCmsLinkAnchorProps(link, MEDIA_LABELS.linkAriaFallback) : null;

  const isPoster = presentation === 'modal-poster';
  const isButtonKind =
    presentation === 'modal-button' || presentation === 'modal-button-contrast';
  const isContrastBtn = presentation === 'modal-button-contrast';
  const isLinkStyle = presentation === 'modal-link';
  /** Format **Video** (inline player or poster → modal): captions render only for this, not for Link/Button. */
  const isVideoFormatLayout = presentation === 'inline' || presentation === 'modal-poster';

  const captionFromVideo = vf?.Caption;
  const mediaCap = mediaCaption?.value;
  const showDatasourceCaption =
    isVideoFormatLayout &&
    (hasNonEmptyText(mediaCap) || (isEditing && mediaCaption !== undefined));
  const showVideoItemCaption =
    isVideoFormatLayout &&
    !hasNonEmptyText(mediaCap) &&
    !(isEditing && mediaCaption !== undefined) &&
    !isEditing &&
    hasNonEmptyText(captionFromVideo?.value);

  const coverDims = parseMediaImageDimensionsWithFallback(coverImage);
  const coverLooksSquare =
    coverDims != null && Math.abs(coverDims.width - coverDims.height) <= 1;
  const coverAspectStyle =
    coverLooksSquare || coverDims == null
      ? undefined
      : { aspectRatio: `${coverDims.width} / ${coverDims.height}` };

  const inlineVideoFrameStyle: CSSProperties =
    mediaVideoAspectBoxStyle(video) ??
    coverAspectStyle ??
    { aspectRatio: '16 / 9' };

  const modalPosterFrameStyle = inlineVideoFrameStyle;

  if (!videoId) {
    return isEditing ? (
      <div className="rounded border border-stroke-default bg-surface-muted p-4">
        <span className="is-empty-hint">{MEDIA_LABELS.videoEmptyHint}</span>
      </div>
    ) : null;
  }

  const videoFormatPosterWithPlay = !playback.autoplay;

  if (presentation === 'inline') {
    return (
      <div
        className={cn(
          'flex w-full min-w-0 max-w-full flex-col items-stretch',
          hasDarkBackground && 'overflow-x-clip',
          embeddedInCarousel && 'h-full min-h-0',
        )}
      >
        <MediaTileVideo
          video={video}
          mediaFrameStyle={inlineVideoFrameStyle}
          layoutVariant="media"
          posterWithPlay={videoFormatPosterWithPlay}
          playbackAutoplay={playback.autoplay}
          playbackLoop={playback.loop}
          fillCarouselSlide={embeddedInCarousel}
        />
        {!embeddedInCarousel && showDatasourceCaption && mediaCaption ?
          <MediaCaptionText
            field={mediaCaption}
            hasDarkBackground={hasDarkBackground}
            region={region}
          />
        : null}
        {!embeddedInCarousel && showVideoItemCaption && captionFromVideo ?
          <MediaCaptionText
            field={captionFromVideo}
            hasDarkBackground={hasDarkBackground}
            region={region}
          />
        : null}
      </div>
    );
  }

  const coverHasSrc = Boolean(coverImage?.value?.src);
  const playLabel = titleStr || linkText || MEDIA_LABELS.playVideoFallback;
  const ctaLabel = linkText || playLabel;
  const modalAriaLabel = titleStr || MEDIA_LABELS.videoAriaFallback;

  if (isEditing) {
    const showCoverInEditor = isVideoFormatLayout;

    return (
      <div
        className={cn(
          'flex w-full min-w-0 max-w-full flex-col items-stretch',
          hasDarkBackground && 'overflow-x-clip',
          'gap-3',
          embeddedInCarousel && 'h-full min-h-0',
        )}
      >
        {showCoverInEditor && coverHasSrc && coverImage ? (
          <div className="w-full min-w-0 max-w-full shrink-0">
            <MediaImage
              image={coverImage}
              focalPoint={focalPoint}
              objectFit={objectFit ?? 'cover'}
              region={region}
              wrapperClassName="rounded"
              cropWidth={1200}
            />
          </div>
        ) : null}
        {showCoverInEditor && !coverHasSrc ? (
          <div className="flex min-h-[12rem] w-full min-w-0 shrink-0 items-center justify-center rounded bg-surface-muted">
            <span className="is-empty-hint">{MEDIA_LABELS.coverImageEmptyHint}</span>
          </div>
        ) : null}
        {isLinkStyle && link ? (
          <div className="flex w-full min-w-0 items-center justify-start gap-2">
            <CirclePlayIcon
              className={cn(
                'text-inherit',
                hasDarkBackground ? 'text-ink-inverse' : 'text-link',
              )}
            />
            <ContentSdkLink
              field={link}
              className={cn(
                'box-border m-0 inline max-w-full border-0 bg-transparent p-0 text-start font-media-tile text-font-medium font-normal leading-6 [-webkit-tap-highlight-color:transparent] cursor-pointer no-underline hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2',
                hasDarkBackground
                  ? 'text-ink-inverse hover:text-ink-inverse focus-visible:ring-ink-inverse focus-visible:ring-offset-surface-strong'
                  : 'text-link hover:text-link-strong focus-visible:ring-offset-surface',
              )}
              aria-label={linkAnchorProps?.['aria-label']}
              target={linkAnchorProps?.target}
              rel={linkAnchorProps?.rel}
            />
          </div>
        ) : null}
        {isButtonKind ? (
          <div className="flex w-full min-w-0 justify-start">
            <button
              type="button"
              disabled
              aria-disabled="true"
              className={cn(
                'box-border inline-flex min-h-[41.5px] min-w-[112px] cursor-default items-center justify-center gap-2 rounded-full border-0 border-none px-3 py-3 text-center opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-link-strong focus-visible:ring-offset-2',
                hasDarkBackground
                  ? 'focus-visible:ring-offset-surface-strong'
                  : 'focus-visible:ring-offset-surface',
                isContrastBtn &&
                  'transition-[background-color,color] duration-150 ease-in-out motion-reduce:transition-none bg-surface text-link-strong hover:bg-surface-muted hover:text-link-strong',
                !isContrastBtn &&
                  'transition-[background-color] duration-150 ease-in-out motion-reduce:transition-none',
                !isContrastBtn &&
                  hasDarkBackground &&
                  'bg-surface text-link-strong hover:bg-surface-muted',
                !isContrastBtn &&
                  !hasDarkBackground &&
                  'bg-link-strong text-ink-inverse hover:bg-link-hover',
              )}
            >
              {!isContrastBtn ? (
                <CirclePlayIcon className="text-inherit" />
              ) : null}
              <span className="box-border m-0 flex h-[17.5px] shrink-0 items-center justify-center border-0 p-0 text-inherit text-center font-media-tile text-font-media-tile-eyebrow font-normal leading-font-media-tile-eyebrow [-webkit-tap-highlight-color:transparent]">
                {ctaLabel}
              </span>
            </button>
          </div>
        ) : null}
        {!embeddedInCarousel && showDatasourceCaption && mediaCaption ?
          <MediaCaptionText field={mediaCaption} hasDarkBackground={false} region={region} />
        : null}
        <div
          className={cn(
            'w-full min-w-0 max-w-full shrink-0',
            embeddedInCarousel && 'flex min-h-0 flex-1 flex-col',
          )}
        >
          <MediaTileVideo
            video={video}
            mediaFrameStyle={inlineVideoFrameStyle}
            layoutVariant="media"
            posterWithPlay={videoFormatPosterWithPlay}
            playbackAutoplay={playback.autoplay}
            playbackLoop={playback.loop}
            fillCarouselSlide={embeddedInCarousel}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex w-full min-w-0 max-w-full flex-col items-stretch',
        hasDarkBackground && 'overflow-x-clip',
      )}
    >
      <div className="relative w-full min-w-0 max-w-full shrink-0 overflow-x-clip">
        {isPoster && coverHasSrc && coverImage ? (
          <div
            className="relative w-full min-w-0 max-w-full overflow-hidden rounded"
            style={modalPosterFrameStyle}
          >
            <div
              className="video-cover-image cursor-pointer overflow-hidden rounded"
              role="button"
              tabIndex={0}
              aria-label={playLabel}
              onClick={openModal}
              onKeyDown={handleCoverKeyDown}
            >
              <MediaImage
                image={coverImage}
                focalPoint={focalPoint}
                objectFit={objectFit ?? 'cover'}
                region={region}
                cropWidth={1200}
              />
            </div>
            <button
              type="button"
              tabIndex={-1}
              className="video-play-icon"
              aria-label={playLabel}
              onClick={(e) => {
                e.stopPropagation();
                openModal();
              }}
            >
              {ICON_PLAY_OVERLAY_LG}
            </button>
          </div>
        ) : null}

        {isPoster && !coverHasSrc ? (
          <div className="flex min-h-[12rem] flex-col items-center justify-center gap-3 rounded bg-surface-muted">
            <span className={cn(hasDarkBackground ? 'text-ink-primary' : 'text-ink-secondary')}>
              {MEDIA_LABELS.videoAriaFallback}
            </span>
            <button
              type="button"
              className="video-play-icon"
              aria-label={playLabel}
              onClick={openModal}
            >
              {ICON_PLAY_STROKED_LG}
            </button>
          </div>
        ) : null}

        {isLinkStyle ? (
          <div className="flex w-full min-w-0 max-w-full shrink-0 justify-start">
            <button
              type="button"
              className={cn(
                'box-border m-0 flex h-6 w-fit max-w-full shrink-0 items-center gap-2 border-0 bg-transparent p-0 text-start font-media-tile [-webkit-tap-highlight-color:transparent] cursor-pointer no-underline hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2',
                hasDarkBackground
                  ? 'text-ink-inverse hover:text-ink-inverse focus-visible:ring-ink-inverse focus-visible:ring-offset-surface-strong'
                  : 'text-link hover:text-link-strong focus-visible:ring-offset-surface',
              )}
              onClick={openModal}
            >
              <CirclePlayIcon className="text-inherit" />
              <span className="text-font-medium font-normal leading-6">{ctaLabel}</span>
            </button>
          </div>
        ) : null}

        {isButtonKind ? (
          <div className="flex w-full min-w-0 justify-start">
            <button
              type="button"
              className={cn(
                'box-border inline-flex min-h-[41.5px] min-w-[112px] cursor-pointer items-center justify-center gap-2 rounded-full border-0 border-none px-3 py-3 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-link-strong focus-visible:ring-offset-2',
                hasDarkBackground
                  ? 'focus-visible:ring-offset-surface-strong'
                  : 'focus-visible:ring-offset-surface',
                isContrastBtn &&
                  'transition-[background-color,color] duration-150 ease-in-out motion-reduce:transition-none bg-surface text-link-strong hover:bg-surface-muted hover:text-link-strong',
                !isContrastBtn &&
                  'transition-[background-color] duration-150 ease-in-out motion-reduce:transition-none',
                !isContrastBtn &&
                  hasDarkBackground &&
                  'bg-surface text-link-strong hover:bg-surface-muted',
                !isContrastBtn &&
                  !hasDarkBackground &&
                  'bg-link-strong text-ink-inverse hover:bg-link-hover',
              )}
              onClick={openModal}
            >
              {!isContrastBtn ? (
                ICON_PLAY_CIRCLE
              ) : null}
              <span className="box-border m-0 flex h-[17.5px] shrink-0 items-center justify-center border-0 p-0 text-inherit text-center font-media-tile text-font-media-tile-eyebrow font-normal leading-font-media-tile-eyebrow [-webkit-tap-highlight-color:transparent]">
                {ctaLabel}
              </span>
            </button>
          </div>
        ) : null}
      </div>

      {showDatasourceCaption && mediaCaption ? (
        <MediaCaptionText
          field={mediaCaption}
          hasDarkBackground={hasDarkBackground}
          region={region}
        />
      ) : null}
      {showVideoItemCaption && captionFromVideo ? (
        <MediaCaptionText
          field={captionFromVideo}
          hasDarkBackground={hasDarkBackground}
          region={region}
        />
      ) : null}

      <Modal
        isOpen={showModal}
        onChange={handleModalChange}
        modalSize="lg"
        variant="media"
        ariaLabel={modalAriaLabel}
      >
        <div
          className="relative mx-auto box-border block aspect-[256/144] overflow-clip p-0 [-webkit-tap-highlight-color:transparent] max-md:!w-[256px] max-md:!max-w-[256px] max-md:min-w-0 max-md:shrink-0 md:aspect-[720/405] md:w-full md:max-w-[720px] md:!max-w-[720px] lg:aspect-[718/403.88] lg:max-w-[718px] lg:!max-w-[718px]"
          role="region"
          aria-label={modalAriaLabel}
        >
          {playerMounted && showModal ? (
            <div className="absolute inset-0 left-0 top-0 z-0 m-0 box-border block h-full w-full max-w-full overflow-clip border-0 border-solid border-stroke-default p-0 font-roboto text-sm leading-[14px] text-ink-inverse [font-stretch:100%] [font-style:normal] [font-weight:400] [overflow-clip-margin:content-box] [word-break:normal] [-webkit-tap-highlight-color:transparent]">
              <BrightcoveModalPlayer
                videoId={videoId}
                loop={playback.loop}
                autoplayOnLoad={playback.autoplay}
                playerClassName="laitram-bc-player laitram-bc-player--contain"
                playerNotConfigured={MEDIA_LABELS.playerNotConfigured}
                onReady={(p) => {
                  playerRef.current = p;
                  p.muted(false);
                  if (ALLOW_VIDEO_AUTOPLAY && playback.autoplay) {
                    p.play();
                  }
                }}
              />
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
