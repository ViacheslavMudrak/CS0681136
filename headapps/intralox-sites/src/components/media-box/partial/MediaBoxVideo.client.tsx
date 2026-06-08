'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import type { ImageField } from '@sitecore-content-sdk/nextjs';
import { Link as ContentSdkLink } from '@sitecore-content-sdk/nextjs';
import { CirclePlayIcon, ICON_PLAY_STROKED_SM } from 'lib/chrome-icons';
import { cn } from 'lib/utils';

import { MEDIA_LABELS } from 'components/media/mediaUtils';
import { MediaImage } from 'components/media/partial/MediaImage';
import { extractMediaTileBrightcoveId } from 'components/media-tile/mediaTileUtils';
import Modal from 'components/shared/Modal';
import { BrightcoveModalPlayer } from 'components/shared/video/BrightcoveModalPlayer';
import type { BrightcovePlayer } from 'components/shared/video/Video.type';
import type { IVideoFields } from 'src/utils/interface';

import type { MediaBoxFields } from '../MediaBox.type';
import {
  MEDIA_BOX_MEDIA_THUMB_SIZES,
  MEDIA_BOX_THUMB_FRAME_HEIGHT,
  MEDIA_BOX_THUMB_FRAME_WIDTH,
  MEDIA_BOX_WATCH_THE_VIDEO,
  mediaBoxWatchVideoCtaChromeApplies,
  resolveMediaBoxImageModalCtaImageField,
  resolveMediaBoxLinkAriaLabel,
} from '../mediaBoxUtils';
import { useMediaBoxImageModal } from './MediaBoxImageModal.client';

const ALLOW_VIDEO_AUTOPLAY =
  process.env.NEXT_PUBLIC_DISABLE_VIDEO_AUTOPLAY !== '1';

function resolvePlayLabel(video: IVideoFields | null | undefined): string {
  const titleVal = video?.fields?.Title?.value;
  const titleStr =
    typeof titleVal === 'string' ? titleVal : titleVal != null ? String(titleVal) : '';
  const t = titleStr.trim();
  return t !== '' ? t : MEDIA_LABELS.playVideoFallback;
}

function resolveVideoPlayAriaLabel(fields: MediaBoxFields): string {
  const titleVal = fields.Video?.fields?.Title?.value;
  const titleStr =
    typeof titleVal === 'string' ? titleVal : titleVal != null ? String(titleVal) : '';
  const t = titleStr.trim();
  return t !== '' ? t : MEDIA_LABELS.playVideoFallback;
}

export type MediaBoxVideoPlayContextValue = {
  openVideoModal: () => void;
};

const MediaBoxVideoPlayContext = createContext<MediaBoxVideoPlayContextValue | null>(null);

/**
 * @returns Shared Brightcove modal opener when Media Box is in visitor video mode with a Brightcove id; otherwise `null`.
 */
export function useMediaBoxVideoPlay(): MediaBoxVideoPlayContextValue | null {
  return useContext(MediaBoxVideoPlayContext);
}

export interface MediaBoxVideoPlayProviderProps {
  video: IVideoFields | null | undefined;
  isEditing: boolean;
  children: ReactNode;
}

/**
 * When Media Box `MediaType` is Video and a Brightcove id exists (visitor mode), provides `openVideoModal` for the rail and text CTA and renders a single shared modal.
 */
export function MediaBoxVideoPlayProvider({
  video,
  isEditing,
  children,
}: MediaBoxVideoPlayProviderProps): JSX.Element {
  const videoId = extractMediaTileBrightcoveId(video ?? undefined) ?? '';
  const vf = video?.fields;
  const autoplayOnLoad = Boolean(vf?.Autoplay?.value);
  const loop = Boolean(vf?.Loop?.value);
  const playLabel = resolvePlayLabel(video);
  const modalAriaLabel =
    playLabel !== MEDIA_LABELS.playVideoFallback ? playLabel : MEDIA_LABELS.videoAriaFallback;

  const [showModal, setShowModal] = useState(false);
  const playerRef = useRef<BrightcovePlayer | null>(null);
  const [playerMounted, setPlayerMounted] = useState(false);

  useEffect(() => {
    setPlayerMounted(true);
  }, []);

  const openVideoModal = useCallback(() => {
    if (!videoId || isEditing) return;
    setShowModal(true);
  }, [videoId, isEditing]);

  const handleModalChange = useCallback((open: boolean) => {
    if (!open) {
      setShowModal(false);
      playerRef.current = null;
    }
  }, []);

  const contextValue = useMemo<MediaBoxVideoPlayContextValue | null>(() => {
    if (isEditing || !videoId) return null;
    return { openVideoModal };
  }, [isEditing, videoId, openVideoModal]);

  return (
    <MediaBoxVideoPlayContext.Provider value={contextValue}>
      {children}
      {videoId && !isEditing ?
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
            {playerMounted && showModal ?
              <div className="absolute inset-0 left-0 top-0 z-0 m-0 box-border block h-full w-full max-w-full overflow-clip border-0 border-solid border-stroke-default p-0 font-roboto text-sm leading-[14px] text-ink-inverse [font-stretch:100%] [font-style:normal] [font-weight:400] [overflow-clip-margin:content-box] [word-break:normal] [-webkit-tap-highlight-color:transparent]">
                <BrightcoveModalPlayer
                  videoId={videoId}
                  loop={loop}
                  autoplayOnLoad={autoplayOnLoad}
                  playerClassName="laitram-bc-player laitram-bc-player--contain"
                  playerNotConfigured={MEDIA_LABELS.playerNotConfigured}
                  onReady={(p) => {
                    playerRef.current = p;
                    p.muted(false);
                    if (ALLOW_VIDEO_AUTOPLAY && autoplayOnLoad) {
                      p.play();
                    }
                  }}
                />
              </div>
            : null}
          </div>
        </Modal>
      : null}
    </MediaBoxVideoPlayContext.Provider>
  );
}

export interface MediaBoxVideoCoverClientProps {
  video: IVideoFields | null | undefined;
  coverImage: ImageField;
  isEditing: boolean;
}

/** Media Box video rail poster; opens shared Brightcove modal via {@link MediaBoxVideoPlayProvider}. */
export function MediaBoxVideoCoverClient({
  video,
  coverImage,
  isEditing,
}: MediaBoxVideoCoverClientProps): JSX.Element {
  const videoId = extractMediaTileBrightcoveId(video ?? undefined) ?? '';
  const sharedPlay = useMediaBoxVideoPlay();
  const useSharedModal = Boolean(sharedPlay && videoId && !isEditing);

  const vf = video?.fields;
  const autoplayOnLoad = Boolean(vf?.Autoplay?.value);
  const loop = Boolean(vf?.Loop?.value);
  const playLabel = resolvePlayLabel(video);
  const modalAriaLabel =
    playLabel !== MEDIA_LABELS.playVideoFallback ? playLabel : MEDIA_LABELS.videoAriaFallback;

  const [showModal, setShowModal] = useState(false);
  const playerRef = useRef<BrightcovePlayer | null>(null);
  const [playerMounted, setPlayerMounted] = useState(false);

  useEffect(() => {
    setPlayerMounted(true);
  }, []);

  const openModal = useCallback(() => {
    if (!videoId || isEditing) return;
    if (useSharedModal) {
      sharedPlay?.openVideoModal();
      return;
    }
    setShowModal(true);
  }, [videoId, isEditing, useSharedModal, sharedPlay]);

  const handleModalChange = useCallback((open: boolean) => {
    if (!open) {
      setShowModal(false);
      playerRef.current = null;
    }
  }, []);

  const handleCoverKeyDown = (e: KeyboardEvent) => {
    if (!videoId || isEditing) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal();
    }
  };

  const showPlayDecoration = isEditing || Boolean(videoId);

  const coverImageEl = (
    <MediaImage
      image={coverImage}
      focalPoint={undefined}
      objectFit="cover"
      region="default"
      sizes={MEDIA_BOX_MEDIA_THUMB_SIZES}
      wrapperClassName="shadow-media-box-thumb"
      fillFrame={{
        width: MEDIA_BOX_THUMB_FRAME_WIDTH,
        height: MEDIA_BOX_THUMB_FRAME_HEIGHT,
      }}
      fillTone="onDark"
      fillPointerCursor
      imageInteractiveClassName="opacity-100 transition-[opacity,filter] duration-150 [transition-timing-function:ease] motion-reduce:transition-none hover:opacity-90 hover:brightness-90"
    />
  );

  const playGlyph = ICON_PLAY_STROKED_SM;

  const railInner = (
    <>
      {videoId && !isEditing ?
        <div
          className="block cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2"
          role="button"
          tabIndex={0}
          aria-label={playLabel}
          onClick={openModal}
          onKeyDown={handleCoverKeyDown}
        >
          {coverImageEl}
        </div>
      : coverImageEl}
      {showPlayDecoration ?
        isEditing || !videoId ?
          <div
            className="absolute left-1/2 top-1/2 z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-0 bg-black/50 text-ink-inverse opacity-80 transition-opacity duration-150 ease-in-out motion-reduce:transition-none pointer-events-none"
            aria-hidden
          >
            {playGlyph}
          </div>
        : <button
            type="button"
            className="absolute left-1/2 top-1/2 z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-0 bg-black/50 text-ink-inverse opacity-80 transition-opacity duration-150 ease-in-out motion-reduce:transition-none cursor-pointer hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2"
            aria-label={playLabel}
            onClick={(e) => {
              e.stopPropagation();
              openModal();
            }}
          >
            {playGlyph}
          </button>
      : null}
    </>
  );

  const rail = (
    <div
      className="media-box-thumb-outer box-border m-0 block h-[77.25px] w-[100px] shrink-0 border-0 border-solid border-stroke-default p-0"
      data-slot="media-box-video-cover-container"
    >
      <div
        className="media-box-thumb-inner box-border m-0 shrink-0 border-0 border-solid border-stroke-default p-0 relative"
        data-slot="media-box-video-cover-image"
      >
        {railInner}
      </div>
    </div>
  );

  if (!videoId || isEditing || useSharedModal) {
    return rail;
  }

  return (
    <>
      {rail}
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
          {playerMounted && showModal ?
            <div className="absolute inset-0 left-0 top-0 z-0 m-0 box-border block h-full w-full max-w-full overflow-clip border-0 border-solid border-stroke-default p-0 font-roboto text-sm leading-[14px] text-ink-inverse [font-stretch:100%] [font-style:normal] [font-weight:400] [overflow-clip-margin:content-box] [word-break:normal] [-webkit-tap-highlight-color:transparent]">
              <BrightcoveModalPlayer
                videoId={videoId}
                loop={loop}
                autoplayOnLoad={autoplayOnLoad}
                playerClassName="laitram-bc-player laitram-bc-player--contain"
                playerNotConfigured={MEDIA_LABELS.playerNotConfigured}
                onReady={(p) => {
                  playerRef.current = p;
                  p.muted(false);
                  if (ALLOW_VIDEO_AUTOPLAY && autoplayOnLoad) {
                    p.play();
                  }
                }}
              />
            </div>
          : null}
        </div>
      </Modal>
    </>
  );
}

export interface MediaBoxTextColumnCtaProps {
  fields: MediaBoxFields;
  isEditing: boolean;
  /** Merged rendering params (e.g. `Format` when `MediaType` is empty). */
  mergedParams?: Record<string, unknown>;
  isDarkTheme: boolean;
  showHeading: boolean;
  showDesc: boolean;
}

/**
 * Media Box text-column CTA: pill link from Sitecore, or “Watch the video” when visitor video play is wired via {@link MediaBoxVideoPlayProvider}.
 */
export function MediaBoxTextColumnCta({
  fields,
  isEditing,
  mergedParams,
  isDarkTheme,
  showHeading,
  showDesc,
}: MediaBoxTextColumnCtaProps): JSX.Element | null {
  const videoPlay = useMediaBoxVideoPlay();
  const imageModal = useMediaBoxImageModal();
  const { Link } = fields;
  if (!Link) return null;

  const watchVideoCtaChrome = mediaBoxWatchVideoCtaChromeApplies(fields, mergedParams);
  const showWatchVideoLink = Boolean(videoPlay) && !isEditing;

  const ctaModalImage = resolveMediaBoxImageModalCtaImageField(fields, mergedParams);
  const useImageModalCta = Boolean(imageModal && ctaModalImage && !isEditing);

  const linkTargetRaw = Link.value?.target;
  const linkTarget =
    typeof linkTargetRaw === 'string' && linkTargetRaw !== '' ? linkTargetRaw : undefined;

  if (watchVideoCtaChrome && isEditing) {
    return (
      <div className={cn((showHeading || showDesc) && 'mt-4', 'flex w-full min-w-0 justify-start')}>
        <ContentSdkLink
          field={Link}
          editable
          className={cn(
            'group box-border m-0 inline-flex h-[21px] w-fit max-w-full shrink-0 cursor-default items-center gap-1 border-0 bg-transparent p-0 text-start font-media-tile text-font-media-tile-eyebrow font-normal leading-[21px] [-webkit-tap-highlight-color:transparent] no-underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2',
            isDarkTheme ?
              'text-ink-inverse focus-visible:ring-ink-inverse focus-visible:ring-offset-surface-strong'
            : 'text-link focus-visible:ring-offset-surface',
          )}
          target={linkTarget}
          rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
          aria-label={resolveVideoPlayAriaLabel(fields)}
        >
          <CirclePlayIcon className="text-inherit" />
          <span
            className={cn(
              'box-border m-0 border-0 p-0 no-underline decoration-solid underline-offset-2 decoration-current',
              isDarkTheme ? 'group-hover:text-neutral-300' : 'group-hover:text-link-strong',
            )}
          >
            {MEDIA_BOX_WATCH_THE_VIDEO}
          </span>
        </ContentSdkLink>
      </div>
    );
  }

  if (showWatchVideoLink) {
    const handleKeyDown = (e: KeyboardEvent<HTMLAnchorElement>) => {
      if (e.key === ' ') {
        e.preventDefault();
        videoPlay?.openVideoModal();
      }
    };
    return (
      <div className={cn((showHeading || showDesc) && 'mt-4', 'flex w-full min-w-0 justify-start')}>
        <a
          href="#"
          className={cn(
            'group box-border m-0 inline-flex h-[21px] w-fit max-w-full shrink-0 cursor-default items-center gap-1 border-0 bg-transparent p-0 text-start font-media-tile text-font-media-tile-eyebrow font-normal leading-[21px] [-webkit-tap-highlight-color:transparent] no-underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2',
            isDarkTheme ?
              'text-ink-inverse focus-visible:ring-ink-inverse focus-visible:ring-offset-surface-strong'
            : 'text-link focus-visible:ring-offset-surface',
          )}
          aria-label={resolveVideoPlayAriaLabel(fields)}
          onClick={(e) => {
            e.preventDefault();
            videoPlay?.openVideoModal();
          }}
          onKeyDown={handleKeyDown}
        >
          <CirclePlayIcon className="text-inherit leading-[21px]" />
          <span
            className={cn(
              'box-border m-0 border-0 p-0 no-underline decoration-solid underline-offset-2 decoration-current',
              isDarkTheme ? 'group-hover:text-neutral-300' : 'group-hover:text-link-strong',
            )}
          >
            {MEDIA_BOX_WATCH_THE_VIDEO}
          </span>
        </a>
      </div>
    );
  }

  const handleImageModalCtaKeyDown = (e: KeyboardEvent<HTMLAnchorElement>) => {
    if (!useImageModalCta || !imageModal || !ctaModalImage) return;
    if (e.key === ' ') {
      e.preventDefault();
      imageModal.openImageModal(ctaModalImage);
    }
  };

  return (
    <div className={cn((showHeading || showDesc) && 'mt-4', 'flex w-full min-w-0 justify-start')}>
      <ContentSdkLink
        field={Link}
        editable={isEditing}
        className={
          isDarkTheme
            ? 'box-border inline-block min-h-[41.5px] min-w-[112px] cursor-pointer rounded-full border-0 border-surface [border-style:none] bg-surface px-3 py-3 text-center font-inherit text-font-media-tile-eyebrow font-normal leading-font-media-tile-button text-link-strong no-underline [-webkit-tap-highlight-color:transparent] transition-[background-color,color] duration-150 [transition-timing-function:ease-in-out] motion-reduce:transition-none hover:bg-surface-muted hover:text-link-strong hover:[&_span]:text-link-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-link-strong [&_span]:text-link-strong w-auto max-w-none focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-chrome-stripe)]'
            : 'box-border inline-block min-h-[41.5px] min-w-[112px] cursor-pointer rounded-full border-0 border-surface [border-style:none] bg-link-strong px-3 py-3 text-center font-inherit text-font-media-tile-eyebrow font-normal leading-font-media-tile-button text-ink-inverse no-underline [-webkit-tap-highlight-color:transparent] transition-[background-color] duration-150 [transition-timing-function:ease-in-out] motion-reduce:transition-none hover:bg-link-hover focus:outline-none focus:ring-2 focus:ring-link-strong w-auto max-w-none focus:ring-offset-2 focus:ring-offset-surface'
        }
        target={linkTarget}
        rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
        aria-label={resolveMediaBoxLinkAriaLabel(fields)}
        onClick={
          useImageModalCta && imageModal && ctaModalImage ?
            (e) => {
              e.preventDefault();
              imageModal.openImageModal(ctaModalImage);
            }
          : undefined
        }
        onKeyDown={useImageModalCta ? handleImageModalCtaKeyDown : undefined}
      />
    </div>
  );
}
