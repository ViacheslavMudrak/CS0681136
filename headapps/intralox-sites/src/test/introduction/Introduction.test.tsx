import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => '/test',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@brightcove/react-player-loader', () => ({
  default: () => <div data-testid="bc-loader" />,
}));

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const React = await import('react');
  const { sitecoreDatasourceCheckPassthrough } = await import('src/test/mocks/viteSafeMocks');
  return {
    ...sitecoreDatasourceCheckPassthrough(),
    Text: ({ field }: { field?: { value?: string } }) =>
      field?.value ? <span>{field.value}</span> : null,
    RichText: ({ field }: { field?: { value?: string } }) =>
      field?.value ? <div dangerouslySetInnerHTML={{ __html: field.value }} /> : null,
    Link: ({
      field,
      children,
      ...rest
    }: {
      field?: { value?: { href?: string; text?: string } };
      children?: React.ReactNode;
    } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a href={field?.value?.href ?? '#'} {...rest}>
        {children ?? field?.value?.text}
      </a>
    ),
    NextImage: () => <img alt="" data-testid="next-image" src="/mock.jpg" />,
  };
});

vi.mock('components/shared/Modal', () => ({
  default: ({
    children,
    isOpen,
  }: {
    children: React.ReactNode;
    isOpen?: boolean;
  }) => (isOpen ? <div data-testid="video-modal">{children}</div> : null),
}));

vi.mock('components/media/partial/MediaImage', () => ({
  MediaImage: () => <img alt="" data-testid="media-image-mock" src="/cover.jpg" />,
}));

import { Default } from 'components/introduction/Introduction';
import type { IntroductionProps } from 'components/introduction/Introduction.type';

const page = { mode: { isEditing: false } } as IntroductionProps['page'];
const params = { styles: '', RenderingIdentifier: 'intro-1' } as IntroductionProps['params'];
const rendering = {
  uid: 'r1',
  componentName: 'Introduction',
  displayName: 'Introduction',
} as IntroductionProps['rendering'];

const videoFields = {
  fields: {
    BrightcoveId: { value: '12345' },
    Title: { value: 'Demo Video' },
    Autoplay: { value: false },
    Loop: { value: false },
    Caption: { value: '' },
    CoverImage: {
      value: { src: 'https://example.com/cover.jpg', width: 800, height: 800 },
    },
  },
};

describe('Introduction Default', () => {
  it('renders empty hint when fields are missing', () => {
    render(
      <Default fields={undefined} params={params} page={page} rendering={rendering} />,
    );
    expect(screen.getByText('Introduction')).toBeInTheDocument();
  });

  it('renders nothing in preview when no visitor-visible content', () => {
    const { container } = render(
      <Default
        fields={{
          MediaType: { fields: { Value: { value: 'Image' } } },
          Image: { value: {} },
        }}
        params={params}
        page={page}
        rendering={rendering}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('does not render link in image branch preview (link is for video only)', () => {
    render(
      <Default
        fields={{
          MediaType: { fields: { Value: { value: 'Image' } } },
          Image: {
            value: { src: 'https://example.com/p.jpg', width: 600, height: 600 },
          },
          Link: { value: { href: '/more', text: 'Learn more' } },
        }}
        params={params}
        page={page}
        rendering={rendering}
      />,
    );
    expect(screen.getByTestId('media-image-mock')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Learn more' }),
    ).not.toBeInTheDocument();
  });

  it('does not render video CTA link in image branch when editing (Link is video-only; avoids stale Watch Video in Pages)', () => {
    render(
      <Default
        fields={{
          MediaType: { fields: { Value: { value: 'Image' } } },
          Image: {
            value: { src: 'https://example.com/p.jpg', width: 600, height: 600 },
          },
          Link: { value: { href: '#', text: 'Watch Video' } },
        }}
        params={params}
        page={{ mode: { isEditing: true } } as IntroductionProps['page']}
        rendering={rendering}
      />,
    );
    expect(screen.getByTestId('media-image-mock')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Watch Video' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Learn more' })).not.toBeInTheDocument();
  });

  it('renders headline and body when no media in preview', () => {
    render(
      <Default
        fields={{
          Headline: { value: 'Hello' },
          Text: { value: '<p>Body copy</p>' },
          MediaType: { fields: { Value: { value: 'Image' } } },
          Image: { value: {} },
        }}
        params={params}
        page={page}
        rendering={rendering}
      />,
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Body copy')).toBeInTheDocument();
  });

  it('renders Description when Text is absent (Sitecore template field name)', () => {
    render(
      <Default
        fields={{
          Headline: { value: 'Specialized knowledge' },
          Description: {
            value:
              "Intralox's System Solutions Group helps you identify and solve the challenges that stand in the way.",
          },
          MediaType: { fields: { Value: { value: 'Image' } } },
          Image: { value: {} },
        }}
        params={params}
        page={page}
        rendering={rendering}
      />,
    );
    expect(screen.getByText('Specialized knowledge')).toBeInTheDocument();
    expect(
      screen.getByText(/Intralox's System Solutions Group helps you identify/i),
    ).toBeInTheDocument();
  });

  it('opens modal from video CTA click', async () => {
    const user = userEvent.setup();
    render(
      <Default
        fields={{
          MediaType: { fields: { Value: { value: 'Video' } } },
          Video: videoFields,
          Link: { value: { href: '#', text: 'Watch Video' } },
        }}
        params={params}
        page={page}
        rendering={rendering}
      />,
    );
    const cta = screen.getByRole('button', { name: 'Watch Video' });
    expect(cta.className).toContain('text-link');
    expect(cta.className).not.toContain('bg-link-strong');
    expect(cta.className).not.toContain('rounded-full');
    await user.click(cta);
    expect(screen.getByTestId('video-modal')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/Video player is not configured/i);
  });

  it('opens modal from thumbnail keyboard', async () => {
    const user = userEvent.setup();
    render(
      <Default
        fields={{
          MediaType: { fields: { Value: { value: 'Video' } } },
          Video: videoFields,
          Link: { value: { href: '#', text: 'Watch Video' } },
        }}
        params={params}
        page={page}
        rendering={rendering}
      />,
    );
    const [videoCoverRegion] = screen.getAllByRole('button', { name: 'Demo Video' });
    expect(videoCoverRegion).toBeTruthy();
    videoCoverRegion.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('video-modal')).toBeInTheDocument();
  });
});
