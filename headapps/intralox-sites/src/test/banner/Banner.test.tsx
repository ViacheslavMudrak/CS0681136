import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ComponentRendering, Page } from '@sitecore-content-sdk/nextjs';

import { Default } from 'components/banner/Banner';
import type { BannerProps } from 'components/banner/Banner.type';
import { BANNER_EMPTY_HINT, BANNER_SECTION_ARIA_FALLBACK } from 'components/banner/bannerUtils';

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  return {
    Text: ({
      field,
      tag = 'span',
      className,
    }: {
      field?: { value?: string };
      tag?: string;
      className?: string;
    }) => {
      const content = field?.value ?? null;
      if (tag === 'h2') {
        return content ? (
          <h2 className={className}>{content}</h2>
        ) : (
          <h2 className={className} data-testid="text-empty" />
        );
      }
      return content ? (
        <span className={className}>{content}</span>
      ) : (
        <span className={className} data-testid="text-empty" />
      );
    },
    NextImage: ({ field }: { field?: { value?: { src?: string } } }) => (
      <img alt="" data-testid="banner-next-image" src={field?.value?.src ?? ''} />
    ),
  };
});

const rendering = { displayName: 'Banner' } as unknown as ComponentRendering;

function makePage(
  routeFields: Record<string, unknown>,
  isEditing: boolean,
): Page {
  return {
    mode: { isEditing },
    layout: {
      sitecore: {
        route: {
          fields: routeFields,
        },
      },
    },
  } as unknown as Page;
}

const baseParams = { styles: 'extra-style', RenderingIdentifier: 'banner-id' } as BannerProps['params'];

/** Route payload used when ShowImage must not show the photo (image present but ignored). */
const ROUTE_WITH_TITLE_AND_IMAGE = {
  Title: { value: 'Hard-coded page title' },
  Image: { value: { src: 'https://example.com/must-not-render.jpg', width: 1920, height: 1080 } },
} as const;

describe('Banner Default — ShowImage not "1" (hard-coded matrix)', () => {
  const showImageOffValues: Array<string | undefined> = [
    undefined,
    '',
    '0',
    'false',
    'no',
    '2',
  ];

  it.each(showImageOffValues)('preview: ShowImage=%j hides image and shows solid title strip when title exists', (ShowImage) => {
    render(
      <Default
        fields={undefined}
        params={{ ...baseParams, ShowImage } as BannerProps['params']}
        page={makePage({ ...ROUTE_WITH_TITLE_AND_IMAGE }, false)}
        rendering={rendering}
      />,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Hard-coded page title' })).toBeInTheDocument();
    expect(screen.queryByTestId('banner-next-image')).not.toBeInTheDocument();
  });

  it.each(showImageOffValues)(
    'preview: ShowImage=%j with no title renders nothing (image suppressed)',
    (ShowImage) => {
      const { container } = render(
        <Default
          fields={undefined}
          params={{ ...baseParams, ShowImage } as BannerProps['params']}
          page={makePage(
            {
              Title: { value: '' },
              Image: { value: { src: 'https://example.com/suppressed.jpg', width: 800, height: 600 } },
            },
            false,
          )}
          rendering={rendering}
        />,
      );
      expect(container.firstChild).toBeNull();
    },
  );
});

describe('Banner Default', () => {
  it('returns null in preview when there is no title and no image with ShowImage off', () => {
    const { container } = render(
      <Default
        fields={undefined}
        params={{ ...baseParams, ShowImage: '0' }}
        page={makePage({ Title: { value: '' }, Image: { value: {} } }, false)}
        rendering={rendering}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('does not render a title strip for whitespace-only title in preview', () => {
    render(
      <Default
        fields={undefined}
        params={{ ...baseParams, ShowImage: '1' }}
        page={makePage(
          {
            Title: { value: '   ' },
            Image: { value: { src: 'https://example.com/a.jpg', width: 1920, height: 1080 } },
          },
          false,
        )}
        rendering={rendering}
      />,
    );
    expect(screen.getByTestId('banner-next-image')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
  });

  it('renders image and h2 title when ShowImage is 1 and route has title and image', () => {
    render(
      <Default
        fields={undefined}
        params={{ ...baseParams, ShowImage: '1' }}
        page={makePage(
          {
            Title: { value: 'Solutions' },
            Image: { value: { src: 'https://example.com/a.jpg', width: 1920, height: 1080 } },
          },
          false,
        )}
        rendering={rendering}
      />,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Solutions' })).toBeInTheDocument();
    expect(screen.getByTestId('banner-next-image')).toHaveAttribute(
      'src',
      'https://example.com/a.jpg',
    );
  });

  it('treats hasBanner as alias for ShowImage', () => {
    render(
      <Default
        fields={undefined}
        params={{ ...baseParams, hasBanner: '1' } as BannerProps['params']}
        page={makePage(
          {
            Title: { value: 'T' },
            Image: { value: { src: 'https://example.com/b.jpg', width: 800, height: 600 } },
          },
          false,
        )}
        rendering={rendering}
      />,
    );
    expect(screen.getByTestId('banner-next-image')).toBeInTheDocument();
  });

  it('renders title on solid background when ShowImage is off', () => {
    render(
      <Default
        fields={undefined}
        params={{ ...baseParams, ShowImage: '0' }}
        page={makePage(
          {
            Title: { value: 'Page title' },
            Image: { value: { src: 'https://example.com/ignored.jpg' } },
          },
          false,
        )}
        rendering={rendering}
      />,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Page title' })).toBeInTheDocument();
    expect(screen.queryByTestId('banner-next-image')).not.toBeInTheDocument();
  });

  it('title strip uses dev parity typography and responsive title-strip chrome', () => {
    const { container } = render(
      <Default
        fields={undefined}
        params={{ ...baseParams, ShowImage: '0' }}
        page={makePage({ Title: { value: 'Resources' } }, false)}
        rendering={rendering}
      />,
    );
    const section = container.querySelector('section.banner--title-strip');
    expect(section).toBeInTheDocument();
    const heading = screen.getByRole('heading', { level: 2, name: 'Resources' });
    expect(heading.className).toContain('font-media-tile');
    expect(heading.className).toContain('font-medium!');
    expect(heading.className).toContain('text-[30px]');
    expect(heading.className).toContain('md:max-lg:text-ink-primary');
    expect(heading.className).toContain('md:max-lg:text-font-extrabig');
    const strip = container.querySelector('.banner-strip');
    expect(strip?.className).toContain('md:max-lg:bg-surface');
    const column = container.querySelector('.banner-title-column');
    expect(column?.className).toContain('min-[2100px]:!mx-[450px]');
  });

  it('image scrim keeps white 30px title and overlay positioning', () => {
    const { container } = render(
      <Default
        fields={undefined}
        params={{ ...baseParams, ShowImage: '1' }}
        page={makePage(
          {
            Title: { value: 'Solutions' },
            Image: { value: { src: 'https://example.com/a.jpg', width: 1920, height: 1080 } },
          },
          false,
        )}
        rendering={rendering}
      />,
    );
    const heading = screen.getByRole('heading', { level: 2, name: 'Solutions' });
    expect(heading.className).toContain('text-ink-inverse');
    expect(heading.className).toContain('text-[30px]');
    expect(heading.className).not.toContain('md:max-lg:text-ink-primary');
    const strip = container.querySelector('.banner-strip--overlay');
    expect(strip?.className).toContain('absolute');
    expect(strip?.className).not.toContain('md:max-lg:bg-surface');
  });

  it('renders solid title when ShowImage is 1 but image src is missing', () => {
    render(
      <Default
        fields={undefined}
        params={{ ...baseParams, ShowImage: '1' }}
        page={makePage(
          {
            Title: { value: 'No photo' },
            Image: { value: {} },
          },
          false,
        )}
        rendering={rendering}
      />,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'No photo' })).toBeInTheDocument();
    expect(screen.queryByTestId('banner-next-image')).not.toBeInTheDocument();
  });

  it('prefers fields over route for title and image', () => {
    render(
      <Default
        fields={{
          Title: { value: 'From fields' },
          Image: { value: { src: 'https://example.com/from-fields.jpg', width: 100, height: 50 } },
        }}
        params={{ ...baseParams, ShowImage: '1' }}
        page={makePage(
          {
            Title: { value: 'From route' },
            Image: { value: { src: 'https://example.com/from-route.jpg' } },
          },
          false,
        )}
        rendering={rendering}
      />,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'From fields' })).toBeInTheDocument();
    expect(screen.getByTestId('banner-next-image')).toHaveAttribute(
      'src',
      'https://example.com/from-fields.jpg',
    );
  });

  it('shows empty hint in editing when there is nothing to display', () => {
    render(
      <Default
        fields={undefined}
        params={{ ...baseParams, ShowImage: '0' }}
        page={makePage({ Title: { value: '' }, Image: { value: {} } }, true)}
        rendering={rendering}
      />,
    );
    const hint = screen.getByText(BANNER_EMPTY_HINT);
    expect(hint).toBeInTheDocument();
    expect(hint).toHaveClass('is-empty-hint');
  });

  it('applies params.styles and RenderingIdentifier to the section (id lowercased)', () => {
    const { container } = render(
      <Default
        fields={undefined}
        params={{ ...baseParams, ShowImage: '0', RenderingIdentifier: 'Banner_Block' }}
        page={makePage({ Title: { value: 'X' } }, false)}
        rendering={rendering}
      />,
    );
    const section = container.querySelector('section#banner_block');
    expect(section).toBeInTheDocument();
    expect(section?.className).toContain('extra-style');
  });

  it('uses fallback aria-label when title is empty with image-only preview', () => {
    render(
      <Default
        fields={undefined}
        params={{ ...baseParams, ShowImage: '1' }}
        page={makePage(
          {
            Title: { value: '' },
            Image: { value: { src: 'https://example.com/only.jpg', width: 1920, height: 1080 } },
          },
          false,
        )}
        rendering={rendering}
      />,
    );
    expect(screen.getByLabelText(BANNER_SECTION_ARIA_FALLBACK)).toBeInTheDocument();
  });
});
