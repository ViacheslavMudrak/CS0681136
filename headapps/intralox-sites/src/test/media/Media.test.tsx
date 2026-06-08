import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const React = await import('react');
  const { sitecoreDatasourceCheckPassthrough } = await import('src/test/mocks/viteSafeMocks');
  return {
    ...sitecoreDatasourceCheckPassthrough(),
    Text: ({ field }: { field?: { value?: string } }) =>
      field?.value ? <span>{field.value}</span> : null,
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
    NextImage: () => <img alt="" src="/mock.jpg" />,
  };
});

vi.mock('components/media/partial/MediaClient', () => ({
  MediaClient: () => <div data-testid="media-client-mock" />,
}));

vi.mock('components/media/partial/MediaImage', () => ({
  MediaImage: () => <img alt="" data-testid="media-image-mock" src="/img.jpg" />,
}));

import { Default } from 'components/media/Media';
import type { MediaProps } from 'components/media/mediaUtils';

const page = { mode: { isEditing: false } } as MediaProps['page'];
const params = { styles: '', RenderingIdentifier: 'm1' } as MediaProps['params'];
const rendering = { uid: 'r1' } as MediaProps['rendering'];

describe('Media Default', () => {
  it('renders empty hint when fields are missing', () => {
    render(
      <Default fields={undefined} params={params} page={page} rendering={rendering} />,
    );
    expect(screen.getByText('Media')).toBeInTheDocument();
  });

  it('renders nothing in preview when image media has no image src', () => {
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

  it('renders image branch with src in preview', () => {
    render(
      <Default
        fields={{
          MediaType: { fields: { Value: { value: 'Image' } } },
          Image: {
            value: { src: 'https://example.com/p.jpg', width: 800, height: 600 },
          },
        }}
        params={params}
        page={page}
        rendering={rendering}
      />,
    );
    expect(screen.getByTestId('media-image-mock')).toBeInTheDocument();
  });

  it('shows image placeholder in editing when image src is missing', () => {
    render(
      <Default
        fields={{
          MediaType: { fields: { Value: { value: 'Image' } } },
          Image: { value: {} },
        }}
        params={params}
        page={{ mode: { isEditing: true } } as MediaProps['page']}
        rendering={rendering}
      />,
    );
    expect(screen.getByText('Image')).toBeInTheDocument();
  });

  it('renders video branch via MediaClient when Brightcove id is present', () => {
    render(
      <Default
        fields={
          {
            MediaType: { fields: { Value: { value: 'Video' } } },
            Video: {
              fields: {
                Autoplay: { value: false },
                BrightcoveId: { value: '123' },
                Caption: { value: '' },
                CoverImage: { value: {} },
                Loop: { value: false },
                Title: { value: 'Test Video' },
              },
            },
          } as MediaProps['fields']
        }
        params={params}
        page={page}
        rendering={rendering}
      />,
    );
    expect(screen.getByTestId('media-client-mock')).toBeInTheDocument();
  });

  it('shows video empty hint in editing mode when Video field is missing (line 112-122)', () => {
    render(
      <Default
        fields={{ MediaType: { fields: { Value: { value: 'Video' } } } } as MediaProps['fields']}
        params={params}
        page={{ mode: { isEditing: true } } as MediaProps['page']}
        rendering={rendering}
      />,
    );
    expect(screen.getByText(/video/i)).toBeInTheDocument();
  });

  it('returns null in preview when Video field is missing and not editing (line 125-127)', () => {
    const { container } = render(
      <Default
        fields={{ MediaType: { fields: { Value: { value: 'Video' } } } } as MediaProps['fields']}
        params={params}
        page={page}
        rendering={rendering}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('returns null in preview when Video has no Brightcove id and not editing (line 130-132)', () => {
    const { container } = render(
      <Default
        fields={
          {
            MediaType: { fields: { Value: { value: 'Video' } } },
            Video: {
              fields: {
                BrightcoveId: { value: '' },
                Autoplay: { value: false },
                Loop: { value: false },
              },
            },
          } as MediaProps['fields']
        }
        params={params}
        page={page}
        rendering={rendering}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('merges params.styles on section root', () => {
    render(
      <Default
        fields={undefined}
        params={{ ...params, styles: 'custom-shell' }}
        page={page}
        rendering={rendering}
      />,
    );
    const section = screen.getByText('Media').closest('section');
    expect(section?.className).toContain('custom-shell');
    expect(section?.className).toContain('component');
  });

  it('adds overflow-x-clip when HasDarkBackground is enabled on video layout', () => {
    render(
      <Default
        fields={{
          MediaType: { fields: { Value: { value: 'Video' } } },
          Video: { fields: { BrightcoveId: { value: '12345' }, Title: { value: 'Clip' } } },
        }}
        params={
          {
            ...params,
            HasDarkBackground: { Value: { value: '1' } },
          } as MediaProps['params']
        }
        page={page}
        rendering={rendering}
      />,
    );
    const section = screen.getByTestId('media-client-mock').closest('section');
    expect(section?.className).toContain('overflow-x-clip');
  });
});
