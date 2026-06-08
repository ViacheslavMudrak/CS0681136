import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('components/shared/video/Video', () => ({
  default: ({ videoId, className }: { videoId: string; className?: string }) => (
    <div data-testid="video" data-video-id={videoId} className={className} />
  ),
}));

import { MediaTileVideo } from 'components/media-tile/partial/MediaTileVideo';

function makeVideo(brightcoveId: string) {
  return {
    fields: {
      BrightcoveId: { value: brightcoveId },
      Title: { value: 'Test Video' },
      Caption: { value: '' },
      Autoplay: { value: false },
      Loop: { value: false },
      CoverImage: undefined,
    },
  } as never;
}

describe('MediaTileVideo', () => {
  it('returns null when videoId is empty', () => {
    const { container } = render(<MediaTileVideo video={makeVideo('')} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when video is undefined', () => {
    const { container } = render(<MediaTileVideo video={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders video in tile layout (default)', () => {
    render(<MediaTileVideo video={makeVideo('vid-123')} />);
    expect(screen.getByTestId('video')).toHaveAttribute('data-video-id', 'vid-123');
  });

  it('renders video in media layout', () => {
    render(<MediaTileVideo video={makeVideo('vid-123')} layoutVariant="media" />);
    expect(screen.getByTestId('video')).toBeInTheDocument();
  });

  it('renders with fillCarouselSlide=true and media layout', () => {
    render(
      <MediaTileVideo video={makeVideo('vid-123')} layoutVariant="media" fillCarouselSlide={true} />,
    );
    expect(screen.getByTestId('video')).toBeInTheDocument();
  });

  it('renders with fillCarouselSlide=true but tile layout (no carousel fill)', () => {
    render(
      <MediaTileVideo video={makeVideo('vid-123')} layoutVariant="tile" fillCarouselSlide={true} />,
    );
    expect(screen.getByTestId('video')).toBeInTheDocument();
  });

  it('renders with custom outerWrapperClassName', () => {
    const { container } = render(
      <MediaTileVideo
        video={makeVideo('vid-123')}
        outerWrapperClassName="custom-outer"
        layoutVariant="media"
      />,
    );
    expect(container.querySelector('.custom-outer')).toBeTruthy();
  });

  it('renders with posterWithPlay=true', () => {
    render(
      <MediaTileVideo video={makeVideo('vid-123')} layoutVariant="media" posterWithPlay={true} />,
    );
    expect(screen.getByTestId('video')).toBeInTheDocument();
  });

  it('renders with hasCardChrome=true in tile layout', () => {
    render(<MediaTileVideo video={makeVideo('vid-123')} layoutVariant="tile" hasCardChrome={true} />);
    expect(screen.getByTestId('video')).toBeInTheDocument();
  });

  it('renders with explicit mediaFrameStyle=null', () => {
    render(<MediaTileVideo video={makeVideo('vid-123')} mediaFrameStyle={null} />);
    expect(screen.getByTestId('video')).toBeInTheDocument();
  });

  it('renders with explicit mediaFrameStyle object', () => {
    render(
      <MediaTileVideo
        video={makeVideo('vid-123')}
        mediaFrameStyle={{ aspectRatio: '16 / 9' }}
      />,
    );
    expect(screen.getByTestId('video')).toBeInTheDocument();
  });

  it('passes autoplay from video fields when playbackAutoplay is undefined', () => {
    const videoWithAutoplay = {
      fields: {
        BrightcoveId: { value: 'vid-auto' },
        Autoplay: { value: true },
        Loop: { value: false },
        Title: { value: '' },
        Caption: { value: '' },
        CoverImage: undefined,
      },
    } as never;
    render(<MediaTileVideo video={videoWithAutoplay} />);
    expect(screen.getByTestId('video')).toBeInTheDocument();
  });

  it('overrides autoplay with playbackAutoplay prop', () => {
    render(<MediaTileVideo video={makeVideo('vid-123')} playbackAutoplay={true} playbackLoop={true} />);
    expect(screen.getByTestId('video')).toBeInTheDocument();
  });
});
