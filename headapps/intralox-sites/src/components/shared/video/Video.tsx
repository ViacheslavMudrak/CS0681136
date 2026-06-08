"use client";

import ReactPlayerLoader from "@brightcove/react-player-loader";
import { NextImage, RichText } from "@sitecore-content-sdk/nextjs";
import React, { useCallback, useEffect, useRef, useState } from "react";
import type { ImageField } from "@sitecore-content-sdk/nextjs";
import { BrightcovePlayer, VideoMarkupProps } from "./Video.type";
import { Play } from "@laitram-l-l-c/intralox-icon-library";
import { CHROME_ICON_BASE } from "lib/chrome-icons";
import { cn } from "lib/utils";
import { ImageView } from "../ImageView/ImageView";
import Modal from "../Modal";

/**
 * Videos will autoplay unless NEXT_PUBLIC_DISABLE_VIDEO_AUTOPLAY is set to "1".
 */
const ALLOW_VIDEO_AUTOPLAY =
  process.env.NEXT_PUBLIC_DISABLE_VIDEO_AUTOPLAY !== "1";

const VideoMarkup = ({
  attrs,
  onSuccess,
  videoId,
  playerClassName = "laitram-bc-player",
}: VideoMarkupProps & { playerClassName?: string }) => {
  const { autoplay, loop, ...otherAttrs } = attrs ?? {};

  const accountId =
    process.env.NEXT_PUBLIC_BRIGHTCOVE_ACCOUNT_ID ??
    process.env.GATSBY_BRIGHTCOVE_ACCOUNT_ID;
  const playerId =
    process.env.NEXT_PUBLIC_BRIGHTCOVE_PLAYER_ID ??
    process.env.GATSBY_BRIGHTCOVE_PLAYER_ID;

  if (!accountId || !playerId) {
    return (
      <div className="flex items-center justify-center bg-surface-selected p-8 text-ink-subtle">
        Brightcove account not configured. Set NEXT_PUBLIC_BRIGHTCOVE_ACCOUNT_ID
        and NEXT_PUBLIC_BRIGHTCOVE_PLAYER_ID.
      </div>
    );
  }

  return (
    <ReactPlayerLoader
      accountId={accountId}
      playerId={playerId}
      videoId={videoId}
      attrs={{ className: playerClassName }}
      onSuccess={onSuccess}
      options={{
        ...otherAttrs,
        autoplay: ALLOW_VIDEO_AUTOPLAY ? autoplay : undefined,
        loop: ALLOW_VIDEO_AUTOPLAY ? loop : undefined,
      }}
    />
  );
};

export interface VideoProps {
  className?: string;
  cover?: boolean;
  coverImageCropWidth?: number;
  ratio?: number;
  suppressCaption?: boolean;
  videoId: string;
  autoplay?: boolean;
  loop?: boolean;
  coverImage?: ImageField;
  caption?: string;
  title?: string;
  iconSize?: "sm" | "base";
  muted?: boolean;
  playInModal?: boolean;
  /** Optional Brightcove root class(es), e.g. compact control bar modifiers. */
  playerClassName?: string;
}

function useIsInViewport(threshold = 0.75) {
  /** `null` = observer has not reported yet; avoids treating "unknown" as off-screen */
  const [isInViewport, setIsInViewport] = useState<boolean | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInViewport(entry.isIntersecting),
      { threshold },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return [isInViewport, ref] as const;
}

const Video = ({
  className = "",
  cover = false,
  coverImageCropWidth,
  ratio = 0.5625,
  suppressCaption = false,
  videoId,
  autoplay = false,
  loop = false,
  coverImage,
  caption,
  title,
  iconSize = "base",
  muted = true,
  playInModal = false,
  playerClassName,
}: VideoProps) => {
  const [isInViewport, targetRef] = useIsInViewport(0.75);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [player, setPlayer] = useState<BrightcovePlayer | null>(null);
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const pendingCoverPlayRef = useRef(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const attributes: Record<string, boolean | number | string | undefined> = {};
  if (autoplay) {
    attributes.playsInline = true;
  }

  const modalVideoAttrs: Record<string, boolean | number | string | undefined> =
    {};
  if (ALLOW_VIDEO_AUTOPLAY) {
    modalVideoAttrs.playsInline = true;
  }

  const handleCoverImageClick = () => {
    if (playInModal) {
      setShowModal(true);
    } else if (player) {
      player.play();
    } else {
      pendingCoverPlayRef.current = true;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCoverImageClick();
    }
  };

  useEffect(() => {
    if (!player) return;
    // Modal playback is driven by open state + autoplay options, not viewport
    if (playInModal) return;

    if (autoplay && ALLOW_VIDEO_AUTOPLAY) {
      if (isInViewport === true) {
        player.muted(muted);
        player.play();
        player.controls(false);
        if (loop) player.loop(true);
      } else if (isInViewport === false) {
        player.pause();
      }
    } else {
      if (isInViewport === true && !isPlaying && isAutoPaused) {
        player.play();
      } else if (isInViewport === false && isPlaying) {
        player.pause();
        setIsAutoPaused(true);
      }
    }
  }, [
    autoplay,
    isAutoPaused,
    isInViewport,
    isPlaying,
    loop,
    muted,
    playInModal,
    player,
  ]);

  useEffect(() => {
    if (!playInModal) return;
    if (!showModal) {
      setPlayer(null);
      return;
    }
    if (!player || !ALLOW_VIDEO_AUTOPLAY) return;
    player.play();
  }, [playInModal, showModal, player]);

  const onBrightcoveSuccess = useCallback(
    (success: { type: string; ref: unknown }) => {
      const bcPlayer = success.ref as BrightcovePlayer;

      bcPlayer.on("loadedmetadata", () => {
        setPlayer(bcPlayer);
        bcPlayer.muted(muted);
        if (pendingCoverPlayRef.current) {
          pendingCoverPlayRef.current = false;
          bcPlayer.play();
        }
      });

      bcPlayer.on("play", () => {
        setIsPlaying(true);
        setIsPaused(false);
        setIsAutoPaused(false);
      });
      bcPlayer.on("pause", () => {
        setIsPlaying(false);
        setIsPaused(true);
      });
      bcPlayer.on("ended", () => {
        setIsPlaying(false);
      });
    },
    [muted],
  );

  const showCover = playInModal || (cover && !playInModal && !isPlaying);
  const wrapperStyle =
    ratio && ratio > 0 ? { paddingBottom: `${ratio * 100}%` } : undefined;

  if (!videoId) {
    return null;
  }

  return (
    <>
      <div
        ref={targetRef}
        className={cn(
          className,
          "w-full bg-neutral-200",
          ratio === 0 && "",
          ratio && `pb-[${ratio * 100}%]`,
          !ratio && ratio !== 0 && "pb-[56.25%]",
          cover && !isPlaying && "video-responsive-wrapper--cover",
          cover &&
            isPlaying &&
            "[&_.video-js_.vjs-control-bar]:flex [&_.video-js]:pointer-events-auto",
          (!className || !className.includes("absolute")) && "relative",
        )}
        style={wrapperStyle}
      >
        {isMounted && !playInModal && (
          <VideoMarkup
            attrs={{
              ...attributes,
              autoplay,
              loop,
              muted,
            }}
            onSuccess={onBrightcoveSuccess}
            videoId={videoId}
            playerClassName={playerClassName}
          />
        )}
        {showCover ? (
          <div
            className="video-cover-image"
            onClick={handleCoverImageClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={title || "Play video"}
          >
            {coverImage?.value?.src ? (
              <ImageView
                image={coverImage}
                className="object-cover"
                cropRatio={ratio ? ratio : 0.5625}
                cropWidth={coverImageCropWidth}
                cover={cover}
              />
            ) : null}
            <button
              type="button"
              tabIndex={-1}
              className={cn(
                "video-play-icon",
                iconSize === "sm" ? "video-play-icon--sm" : "",
              )}
              aria-label="Play video"
            >
              <Play
                className={cn(
                  CHROME_ICON_BASE,
                  "[-webkit-text-fill-color:transparent] [-webkit-text-stroke:2px_currentColor]",
                  iconSize === "sm" ? "h-4 w-4" : "h-8 w-8",
                )}
                style={{
                  width: iconSize === "sm" ? "16px" : "32px",
                  height: iconSize === "sm" ? "16px" : "32px",
                }}
                aria-hidden="true"
              />
            </button>
          </div>
        ) : null}
      </div>
      {caption && !suppressCaption ? (
        caption.includes("<") ? (
          <div className="video-caption prose prose-sm">
            <RichText field={{ value: caption }} />
          </div>
        ) : (
          <div className="video-caption prose prose-sm">{caption}</div>
        )
      ) : null}

      {playInModal && (
        <Modal
          isOpen={showModal}
          onChange={(isOpen) => setShowModal(isOpen)}
          modalSize="lg"
          variant="media"
        >
          <div className="relative mx-auto box-border block aspect-[256/144] overflow-clip p-0 [-webkit-tap-highlight-color:transparent] max-md:!w-[256px] max-md:!max-w-[256px] max-md:min-w-0 max-md:shrink-0 md:aspect-[720/405] md:w-full md:max-w-[720px] md:!max-w-[720px] lg:aspect-[718/403.88] lg:max-w-[718px] lg:!max-w-[718px]">
            {isMounted && showModal ? (
              <div className="absolute inset-0 h-full w-full">
                <VideoMarkup
                  playerClassName="laitram-bc-player laitram-bc-player--contain"
                  attrs={{
                    ...modalVideoAttrs,
                    autoplay: ALLOW_VIDEO_AUTOPLAY ? true : undefined,
                    loop: ALLOW_VIDEO_AUTOPLAY ? loop : undefined,
                  }}
                  onSuccess={onBrightcoveSuccess}
                  videoId={videoId}
                />
              </div>
            ) : null}
          </div>
        </Modal>
      )}
    </>
  );
};

export default Video;
