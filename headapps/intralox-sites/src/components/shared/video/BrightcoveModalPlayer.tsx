'use client';

import type { JSX } from 'react';
import ReactPlayerLoader from '@brightcove/react-player-loader';

import type { BrightcovePlayer } from './Video.type';

const ALLOW_VIDEO_AUTOPLAY =
  process.env.NEXT_PUBLIC_DISABLE_VIDEO_AUTOPLAY !== '1';

export interface BrightcoveModalPlayerProps {
  videoId: string;
  loop: boolean;
  autoplayOnLoad: boolean;
  onReady?: (player: BrightcovePlayer) => void;
  playerClassName?: string;
  playerNotConfigured: string;
}

/**
 * Brightcove player for modal dialogs when account/player env vars are set.
 *
 * @param props - Video id, loop/autoplay (gated by env), optional ready callback, classes, missing-config copy.
 */
export function BrightcoveModalPlayer({
  videoId,
  loop,
  autoplayOnLoad,
  onReady,
  playerClassName = 'laitram-bc-player',
  playerNotConfigured,
}: BrightcoveModalPlayerProps): JSX.Element | null {
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
