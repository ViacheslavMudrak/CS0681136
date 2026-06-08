import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => '/test',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const React = await import('react');
  return {
    Link: ({ field, children, className }: { field?: { value?: { href?: string } }; children?: React.ReactNode; className?: string }) => (
      <a href={field?.value?.href} className={className} data-testid="sdk-link">{children}</a>
    ),
    Text: ({ field, tag: Tag = 'p', className }: { field?: { value?: string }; tag?: string; className?: string }) =>
      React.createElement(Tag ?? 'p', { className, 'data-testid': 'sdk-text' }, field?.value ?? ''),
  };
});

vi.mock('components/media-tile/partial/MediaTileVideo', () => ({
  MediaTileVideo: () => <div data-testid="media-tile-video" />,
}));

vi.mock('components/shared/Modal', () => ({
  default: ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) =>
    isOpen ? <div data-testid="modal">{children}</div> : null,
}));

vi.mock('components/shared/video/BrightcoveModalPlayer', () => ({
  BrightcoveModalPlayer: () => <div data-testid="bc-player" />,
}));

vi.mock('components/media/partial/MediaImage', () => ({
  MediaImage: () => <img alt="" src="/mock.jpg" data-testid="media-image" />,
}));

vi.mock('@laitram-l-l-c/intralox-ui-components', async () => {
  const actual = await vi.importActual<typeof import('@laitram-l-l-c/intralox-ui-components')>(
    '@laitram-l-l-c/intralox-ui-components',
  );
  return {
    ...actual,
    cx: (...args: unknown[]) => args.filter(Boolean).join(' '),
  };
});

import { MediaClient } from 'components/media/partial/MediaClient';
import type { MediaClientProps } from 'components/media/partial/MediaClient';

const baseVideo = {
  fields: {
    BrightcoveId: { value: 'vid-123' },
    Title: { value: 'Test Video' },
    Caption: { value: '' },
    Autoplay: { value: false },
    Loop: { value: false },
    AccountId: { value: '' },
    PlayerId: { value: '' },
  },
} as never;

const emptyVideo = {
  fields: {
    BrightcoveId: { value: '' },
    Title: { value: '' },
    Caption: { value: '' },
  },
} as never;

const basePlayback: MediaClientProps['playback'] = { autoplay: false, loop: false };

function makeProps(overrides: Partial<MediaClientProps> = {}): MediaClientProps {
  return {
    isEditing: false,
    video: baseVideo,
    coverImage: undefined,
    presentation: 'modal-poster',
    playback: basePlayback,
    link: undefined,
    focalPoint: undefined,
    objectFit: undefined,
    region: undefined,
    ...overrides,
  };
}

describe('MediaClient', () => {
  it('returns null when no videoId and not editing', () => {
    const { container } = render(<MediaClient {...makeProps({ video: emptyVideo })} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders editing hint when no videoId and isEditing is true', () => {
    render(<MediaClient {...makeProps({ video: emptyVideo, isEditing: true })} />);
    expect(screen.getByText(/video/i)).toBeInTheDocument();
  });

  it('renders inline presentation with MediaTileVideo', () => {
    render(<MediaClient {...makeProps({ presentation: 'inline' })} />);
    expect(screen.getByTestId('media-tile-video')).toBeInTheDocument();
  });

  it('renders inline in carousel', () => {
    render(<MediaClient {...makeProps({ presentation: 'inline', embeddedInCarousel: true })} />);
    expect(screen.getByTestId('media-tile-video')).toBeInTheDocument();
  });

  it('renders inline with datasource caption', () => {
    render(
      <MediaClient
        {...makeProps({
          presentation: 'inline',
          mediaCaption: { value: 'My caption' } as never,
        })}
      />,
    );
    expect(screen.getByTestId('sdk-text')).toBeInTheDocument();
  });

  it('renders modal-poster without cover image (no src)', () => {
    const { container } = render(<MediaClient {...makeProps({ presentation: 'modal-poster' })} />);
    expect(container.querySelector('.video-play-icon')).toBeInTheDocument();
  });

  it('renders modal-poster with cover image', () => {
    const coverImage = { value: { src: '/img.jpg', width: 800, height: 600 } } as never;
    render(<MediaClient {...makeProps({ presentation: 'modal-poster', coverImage })} />);
    expect(screen.getByTestId('media-image')).toBeInTheDocument();
  });

  it('renders modal-link presentation', () => {
    const { container } = render(<MediaClient {...makeProps({ presentation: 'modal-link' })} />);
    expect(container.querySelector('button')).toBeInTheDocument();
  });

  it('renders modal-button presentation', () => {
    const { container } = render(<MediaClient {...makeProps({ presentation: 'modal-button' })} />);
    expect(container.querySelector('button')).toBeInTheDocument();
  });

  it('renders modal-button-contrast presentation', () => {
    const { container } = render(
      <MediaClient {...makeProps({ presentation: 'modal-button-contrast' })} />,
    );
    expect(container.querySelector('button')).toBeInTheDocument();
  });

  it('renders editing view for modal-poster presentation', () => {
    render(<MediaClient {...makeProps({ isEditing: true, presentation: 'modal-poster' })} />);
    expect(screen.getByTestId('media-tile-video')).toBeInTheDocument();
  });

  it('renders editing view for modal-poster with cover image', () => {
    const coverImage = { value: { src: '/img.jpg', width: 800, height: 600 } } as never;
    render(
      <MediaClient {...makeProps({ isEditing: true, presentation: 'modal-poster', coverImage })} />,
    );
    expect(screen.getByTestId('media-image')).toBeInTheDocument();
  });

  it('renders editing view for modal-link with link', () => {
    const link = { value: { href: '/video', text: 'Watch', description: '' } } as never;
    render(
      <MediaClient {...makeProps({ isEditing: true, presentation: 'modal-link', link })} />,
    );
    expect(screen.getByTestId('sdk-link')).toBeInTheDocument();
  });

  it('renders editing view for modal-button presentation', () => {
    render(<MediaClient {...makeProps({ isEditing: true, presentation: 'modal-button' })} />);
    const btn = screen.getByRole('button');
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });

  it('renders editing view for modal-button-contrast presentation', () => {
    render(
      <MediaClient {...makeProps({ isEditing: true, presentation: 'modal-button-contrast' })} />,
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });

  it('renders caption from video item in modal-poster when no datasource caption', () => {
    const videoWithCaption = {
      fields: {
        ...baseVideo.fields,
        BrightcoveId: { value: 'vid-456' },
        Caption: { value: 'Video item caption' },
      },
    } as never;
    render(
      <MediaClient
        {...makeProps({
          presentation: 'modal-poster',
          video: videoWithCaption,
        })}
      />,
    );
    expect(screen.getByText('Video item caption')).toBeInTheDocument();
  });

  it('renders with dark background class', () => {
    const { container } = render(
      <MediaClient {...makeProps({ presentation: 'inline', hasDarkBackground: true })} />,
    );
    expect(container.querySelector('.overflow-x-clip')).toBeInTheDocument();
  });

  it('renders link description as CTA label when link text is empty', () => {
    const link = { value: { href: '/page', text: '', description: 'Watch the video' } } as never;
    render(<MediaClient {...makeProps({ presentation: 'modal-button', link })} />);
    expect(screen.getByText('Watch the video')).toBeInTheDocument();
  });
});
