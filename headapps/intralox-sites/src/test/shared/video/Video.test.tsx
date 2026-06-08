import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

type PlayerHandler = () => void;

const playerHandlers: Record<string, PlayerHandler> = {};

const mockPlayer = {
  muted: vi.fn(),
  play: vi.fn(),
  pause: vi.fn(),
  controls: vi.fn(),
  loop: vi.fn(),
  on: vi.fn((event: string, handler: PlayerHandler) => {
    playerHandlers[event] = handler;
  }),
};

let onSuccessHandler: ((success: { type: string; ref: unknown }) => void) | undefined;

vi.mock('@brightcove/react-player-loader', () => ({
  default: (props: {
    attrs?: { className?: string };
    onSuccess?: (success: { type: string; ref: unknown }) => void;
  }) => {
    onSuccessHandler = props.onSuccess;
    return <div data-testid="bc-loader" className={props.attrs?.className} />;
  },
}));

vi.mock('@laitram-l-l-c/intralox-icon-library', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@laitram-l-l-c/intralox-icon-library')>();
  return {
    ...actual,
    Play: () => <span data-testid="play-icon" />,
  };
});

import Video from 'components/shared/video/Video';

describe('Video', () => {
  const originalAccount = process.env.NEXT_PUBLIC_BRIGHTCOVE_ACCOUNT_ID;
  const originalPlayer = process.env.NEXT_PUBLIC_BRIGHTCOVE_PLAYER_ID;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_BRIGHTCOVE_ACCOUNT_ID = 'acc-1';
    process.env.NEXT_PUBLIC_BRIGHTCOVE_PLAYER_ID = 'pl-1';
    vi.clearAllMocks();
    Object.keys(playerHandlers).forEach((key) => delete playerHandlers[key]);
    onSuccessHandler = undefined;

    class MockIntersectionObserver {
      observe = vi.fn();
      disconnect = vi.fn();
      constructor(_callback: IntersectionObserverCallback) {}
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_BRIGHTCOVE_ACCOUNT_ID = originalAccount;
    process.env.NEXT_PUBLIC_BRIGHTCOVE_PLAYER_ID = originalPlayer;
    vi.unstubAllGlobals();
  });

  it('toggles cover wrapper classes when playback starts', async () => {
    const { container } = render(<Video videoId="vid-1" cover coverImage={{ value: { src: '/cover.jpg' } }} />);

    const wrapper = container.querySelector('.video-responsive-wrapper--cover');
    expect(wrapper).toBeTruthy();
    expect(wrapper?.className).toContain('video-responsive-wrapper--cover');
    expect(wrapper?.className).not.toContain('[&_.video-js_.vjs-control-bar]:flex');

    await act(async () => {
      onSuccessHandler?.({ type: 'success', ref: mockPlayer });
      playerHandlers.loadedmetadata?.();
      playerHandlers.play?.();
    });

    expect(wrapper?.className).not.toContain('video-responsive-wrapper--cover');
    expect(wrapper?.className).toContain('[&_.video-js_.vjs-control-bar]:flex');
    expect(wrapper?.className).toContain('[&_.video-js]:pointer-events-auto');
    expect(mockPlayer.controls).not.toHaveBeenCalled();
  });

  it('passes playerClassName through to Brightcove loader', () => {
    render(
      <Video
        videoId="vid-2"
        playerClassName="laitram-bc-player laitram-bc-player--compact-controls [&_.vjs-tech]:object-cover [&_.vjs-tech]:object-center"
      />,
    );

    const loader = screen.getByTestId('bc-loader');
    expect(loader).toHaveClass('laitram-bc-player--compact-controls');
    expect(loader.className).toContain('[&_.vjs-tech]:object-cover');
    expect(loader.className).toContain('[&_.vjs-tech]:object-center');
  });

  it('does not apply cover-mode classes when cover is false', () => {
    const { container } = render(<Video videoId="vid-3" />);

    const wrapper = container.firstElementChild;
    expect(wrapper?.className).not.toContain('video-responsive-wrapper--cover');
    expect(wrapper?.className).not.toContain('[&_.video-js_.vjs-control-bar]:flex');
  });
});
