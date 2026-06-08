'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type JSX,
  type ReactNode,
} from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import ReactPlayerLoader from '@brightcove/react-player-loader';
import { Link as ContentSdkLink, type ImageField, type LinkField } from '@sitecore-content-sdk/nextjs';

import { extractMediaTileBrightcoveId } from 'components/media-tile/mediaTileUtils';
import { MediaImage } from 'components/media/partial/MediaImage';
import type { MediaPlaybackOptions } from 'components/media/mediaUtils';
import {
  getCmsLinkAnchorProps,
  MEDIA_LABELS,
  MEDIA_VIDEO_QUERY_KEY,
  titleToVideoSlug,
} from 'components/media/mediaUtils';
import Modal from 'components/shared/Modal';
import type { BrightcovePlayer } from 'components/shared/video/Video.type';
import type { IVideoFields } from 'src/utils/interface';

import { ICON_PLAY_OVERLAY_LG, ICON_PLAY_STROKED_LG } from 'lib/chrome-icons';

import { INTRODUCTION_LABELS } from '../introductionUtils';

const ALLOW_VIDEO_AUTOPLAY =
  process.env.NEXT_PUBLIC_DISABLE_VIDEO_AUTOPLAY !== '1';

function IntroductionVideoCtaCirclePlayIcon(): JSX.Element {
  return (
    <svg
      aria-hidden
      className="block shrink-0 text-link"
      fill="none"
      style={{
        width: 'var(--text-font-medium)',
        height: 'var(--text-font-medium)',
      }}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10.25 7.75v8.5l6.375-4.25-6.375-4.25Z"
        fill="currentColor"
      />
    </svg>
  );
}

function BrightcoveModalPlayer({
  videoId,
  loop,
  autoplayOnLoad,
  onReady,
  playerClassName = 'laitram-bc-player',
  playerNotConfigured,
}: {
  videoId: string;
  loop: boolean;
  autoplayOnLoad: boolean;
  onReady?: (player: BrightcovePlayer) => void;
  playerClassName?: string;
  playerNotConfigured: string;
}): JSX.Element | null {
  const accountId =
    process.env.NEXT_PUBLIC_BRIGHTCOVE_ACCOUNT_ID ??
    process.env.GATSBY_BRIGHTCOVE_ACCOUNT_ID;
  const playerId =
    process.env.NEXT_PUBLIC_BRIGHTCOVE_PLAYER_ID ??
    process.env.GATSBY_BRIGHTCOVE_PLAYER_ID;

  if (!accountId || !playerId) {
    return (
      <div
        className="flex items-center justify-center bg-surface-muted p-8 text-ink-secondary"
        role="status"
      >
        {playerNotConfigured}
      </div>
    );
  }

  const onSuccess = (success: { type: string; ref: unknown }) => {
    const bcPlayer = success.ref as BrightcovePlayer;
    bcPlayer.on('loadedmetadata', () => {
      onReady?.(bcPlayer);
    });
  };

  return (
    <ReactPlayerLoader
      accountId={accountId}
      playerId={playerId}
      videoId={videoId}
      attrs={{ className: playerClassName }}
      onSuccess={onSuccess}
      options={{
        playsInline: ALLOW_VIDEO_AUTOPLAY ? true : undefined,
        autoplay: ALLOW_VIDEO_AUTOPLAY && autoplayOnLoad ? true : undefined,
        loop: ALLOW_VIDEO_AUTOPLAY ? loop : undefined,
      }}
    />
  );
}

export interface IntroductionClientProps {
  children: ReactNode;
  isEditing: boolean;
  video: IVideoFields;
  coverImage: ImageField | undefined;
  link: LinkField | undefined;
  playback: MediaPlaybackOptions;
}

/** Video Introduction: poster + modal Brightcove player and optional CTA link. */
export function IntroductionClient({
  children,
  isEditing,
  video,
  coverImage,
  link,
  playback,
}: IntroductionClientProps): JSX.Element | null {
  const vf = video.fields;
  /** Match {@link extractMediaTileBrightcoveId} (GraphQL-wrapped video items) for modal CTA and preview routing. */
  const videoId = (extractMediaTileBrightcoveId(video) ?? '').trim();

  const titleVal = vf?.Title?.value;
  const titleStr =
    typeof titleVal === 'string' ? titleVal : titleVal != null ? String(titleVal) : '';
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

  const linkText =
    typeof link?.value?.text === 'string' && link.value.text.trim() !== ''
      ? link.value.text.trim()
      : typeof link?.value?.description === 'string' && link.value.description.trim() !== ''
        ? link.value.description.trim()
        : '';

  const linkAnchorProps = link
    ? getCmsLinkAnchorProps(link, INTRODUCTION_LABELS.linkAriaFallback)
    : null;

  const playLabel = titleStr || linkText || INTRODUCTION_LABELS.playVideoFallback;
  const modalAriaLabel = titleStr || INTRODUCTION_LABELS.videoAriaFallback;

  const coverHasSrc = Boolean(coverImage?.value?.src);

  /** Visitor: show when Link field is present on datasource; text falls back to {@link INTRODUCTION_LABELS.playVideoFallback}. */
  const showVideoCta = Boolean(videoId) && link != null;

  if (!videoId) {
    return isEditing ? (
      <div className="flex w-full min-w-0 flex-col items-start gap-4 md:flex-row md:items-start md:gap-0">
        <div
          className="relative box-border flex h-[220px] w-[220px] max-w-full shrink-0 items-center justify-center overflow-x-clip overflow-y-clip bg-surface align-middle"
        >
          <span className="is-empty-hint">{MEDIA_LABELS.videoEmptyHint}</span>
        </div>
        <div className="box-border flex w-full min-w-0 flex-1 flex-col gap-0 break-words isolate pl-0 [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] md:mt-4 md:pl-12">
          {children}
          {link ? (
            <div className="mt-4">
              <ContentSdkLink
                className="box-border inline-flex w-fit max-w-full cursor-pointer items-center gap-2 border-0 bg-transparent p-0 font-media-tile text-font-medium font-normal leading-6 text-link no-underline transition-colors [-webkit-tap-highlight-color:transparent] hover:text-link-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-subtle)]"
                field={link}
                aria-label={linkAnchorProps?.['aria-label']}
                rel={linkAnchorProps?.rel}
                target={linkAnchorProps?.target}
              />
            </div>
          ) : null}
        </div>
      </div>
    ) : null;
  }

  if (isEditing) {
    return (
      <div className="flex w-full min-w-0 flex-col items-start gap-4 md:flex-row md:items-start md:gap-0">
        <div className="relative box-border block h-[220px] w-[220px] max-w-full shrink-0 overflow-x-clip overflow-y-clip align-middle">
          {coverHasSrc && coverImage ? (
            <div className="absolute inset-0 box-border overflow-x-clip overflow-y-clip">
              <MediaImage
                cropWidth={1200}
                focalPoint={undefined}
                image={coverImage}
                objectFit="cover"
                region={undefined}
                wrapperClassName="pointer-events-none h-full w-full min-h-0 min-w-0 [&_img]:h-full [&_img]:w-full [&_img]:max-h-none [&_img]:max-w-none [&_img]:object-cover [&_img]:object-center"
              />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface">
              <span className="is-empty-hint">{MEDIA_LABELS.coverImageEmptyHint}</span>
            </div>
          )}
        </div>
        <div className="box-border flex w-full min-w-0 flex-1 flex-col gap-0 break-words isolate pl-0 [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] md:mt-4 md:pl-12">
          {children}
          {link ? (
            <div className="mt-4">
              <ContentSdkLink
                className="box-border inline-flex w-fit max-w-full cursor-pointer items-center gap-2 border-0 bg-transparent p-0 font-media-tile text-font-medium font-normal leading-6 text-link no-underline transition-colors [-webkit-tap-highlight-color:transparent] hover:text-link-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-subtle)]"
                field={link}
                aria-label={linkAnchorProps?.['aria-label']}
                rel={linkAnchorProps?.rel}
                target={linkAnchorProps?.target}
              />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex w-full min-w-0 flex-col items-start gap-4 md:flex-row md:items-start md:gap-0">
        {coverHasSrc && coverImage ? (
          <button
            type="button"
            aria-label={playLabel}
            className="group relative m-0 box-border block h-[220px] w-[220px] max-w-full shrink-0 cursor-pointer overflow-x-clip overflow-y-clip border-0 bg-transparent p-0 text-left align-middle focus:outline-none focus-visible:ring-2 focus-visible:ring-media-tile-link focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-media-tile-section)]"
            onClick={openModal}
          >
            <div className="video-cover-image group-hover:[&_img]:opacity-[0.88]">
              <MediaImage
                cropWidth={1200}
                focalPoint={undefined}
                image={coverImage}
                objectFit="cover"
                region={undefined}
                wrapperClassName="h-full w-full"
              />
            </div>
            <span
              className="video-play-icon pointer-events-none z-[100] focus:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-subtle)]"
              aria-hidden
            >
              {ICON_PLAY_OVERLAY_LG}
            </span>
          </button>
        ) : (
          <div className="group relative box-border flex h-[220px] w-[220px] max-w-full shrink-0 flex-col items-center justify-center gap-3 overflow-x-clip overflow-y-clip bg-surface align-middle">
            <span className="text-ink-secondary">{INTRODUCTION_LABELS.videoAriaFallback}</span>
            <button
              aria-label={playLabel}
              className="video-play-icon z-[100] pointer-events-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-subtle)]"
              onClick={openModal}
              type="button"
            >
              {ICON_PLAY_STROKED_LG}
            </button>
          </div>
        )}

        <div className="box-border flex w-full min-w-0 flex-1 flex-col gap-0 break-words isolate pl-0 [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] md:mt-4 md:pl-12">
          {children}
          {showVideoCta ? (
            <div className="mt-4">
              <button
                className="group box-border inline-flex w-fit max-w-full cursor-default items-center gap-1 border-0 bg-transparent p-0 text-left font-media-tile text-font-medium font-normal leading-6 text-link no-underline transition-colors [-webkit-tap-highlight-color:transparent] focus:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-subtle)]"
                onClick={openModal}
                type="button"
              >
                <IntroductionVideoCtaCirclePlayIcon />
                <span className="transition-colors group-hover:text-link-strong">
                  {linkText || INTRODUCTION_LABELS.playVideoFallback}
                </span>
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <Modal
        ariaLabel={modalAriaLabel}
        isOpen={showModal}
        modalSize="lg"
        onChange={handleModalChange}
        variant="media"
      >
        <div
          aria-label={modalAriaLabel}
          className="relative mx-auto box-border block aspect-[256/144] overflow-clip p-0 [-webkit-tap-highlight-color:transparent] max-md:!w-[256px] max-md:!max-w-[256px] max-md:min-w-0 max-md:shrink-0 md:aspect-[720/405] md:w-full md:max-w-[720px] md:!max-w-[720px] lg:aspect-[718/403.88] lg:max-w-[718px] lg:!max-w-[718px]"
          role="region"
        >
          {playerMounted && showModal ? (
            <div className="absolute inset-0 left-0 top-0 z-0 m-0 box-border block h-full w-full max-w-full overflow-clip border-0 border-solid border-stroke-default p-0 font-roboto text-sm leading-[14px] text-ink-inverse [font-stretch:100%] [font-style:normal] [font-weight:400] [overflow-clip-margin:content-box] [word-break:normal] [-webkit-tap-highlight-color:transparent]">
              <BrightcoveModalPlayer
                autoplayOnLoad={playback.autoplay}
                loop={playback.loop}
                onReady={(p) => {
                  playerRef.current = p;
                  p.muted(false);
                  if (ALLOW_VIDEO_AUTOPLAY && playback.autoplay) {
                    p.play();
                  }
                }}
                playerClassName="laitram-bc-player laitram-bc-player--contain"
                playerNotConfigured={INTRODUCTION_LABELS.playerNotConfigured}
                videoId={videoId}
              />
            </div>
          ) : null}
        </div>
      </Modal>
    </>
  );
}
