import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ComponentRendering, Page } from '@sitecore-content-sdk/nextjs';

import { Default } from 'components/media-box/MediaBox';
import type { MediaBoxFields, MediaBoxProps } from 'components/media-box/MediaBox.type';
import {
  MEDIA_BOX_EMPTY_HINT,
  MEDIA_BOX_MEDIA_PLACEHOLDER,
  MEDIA_BOX_SECTION_FALLBACK,
  MEDIA_BOX_WATCH_THE_VIDEO,
  mediaBoxContentOptionsIsModal,
  mediaBoxHasVisitorContent,
  mediaBoxWatchVideoCtaChromeApplies,
  normalizeMediaBoxMediaType,
  resolveMediaBoxContentOptionsDataValue,
  resolveMediaBoxFields,
} from 'components/media-box/mediaBoxUtils';
import { extractMediaTileBrightcoveId } from 'components/media-tile/mediaTileUtils';

vi.mock('.sitecore/component-map', () => ({
  default: new Map(),
}));

vi.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field }: { field?: { value?: string } }) =>
    field?.value != null && field.value !== '' ?
      <h2>{field.value}</h2>
    : null,
  RichText: ({ field }: { field?: { value?: string } }) =>
    field?.value != null && field.value !== '' ?
      <div data-testid="sdk-richtext">{field.value}</div>
    : null,
  Link: ({
    children,
    field,
    className,
    target,
    rel,
    'aria-label': ariaLabel,
  }: {
    children?: React.ReactNode;
    field?: { value?: { href?: string; text?: string; target?: string } };
    className?: string;
    target?: string;
    rel?: string;
    'aria-label'?: string;
  }) => {
    const href = field?.value?.href ?? '#';
    return (
      <a
        href={href}
        className={className}
        target={target}
        rel={rel}
        aria-label={ariaLabel}
        data-testid="sdk-link"
      >
        {children != null && children !== false ? children : (field?.value?.text ?? href)}
      </a>
    );
  },
  NextImage: ({ field }: { field?: { value?: { src?: string; alt?: string } } }) =>
    field?.value?.src ?
      // Test double only — production uses Sitecore NextImage.
      // eslint-disable-next-line @next/next/no-img-element -- mock Sitecore NextImage for RTL
      <img src={field.value.src} alt={field.value.alt ?? ''} data-testid="sdk-next-image" />
    : null,
}));

const basePage = { mode: { isEditing: false } } as unknown as Page;
const editingPage = { mode: { isEditing: true } } as unknown as Page;
const baseRendering = { componentName: 'MediaBox' } as unknown as ComponentRendering;

const baseParams = {
  styles: '',
  RenderingIdentifier: 'mb-1',
} as unknown as MediaBoxProps['params'];

const mediaTypeItem = (value: string) => ({
  id: 'mt',
  fields: { Value: { value } },
});

/** Shape from XM Cloud layout service (PascalCase field names, Video as item reference). */
const sitecoreLayoutMediaBoxVideoFields = {
  MediaType: {
    id: 'f5b2ba12-396c-4015-bb3d-e864479424f5',
    name: 'Video',
    displayName: 'Video',
    fields: { Value: { value: 'Video' } },
  },
  Thumbnail: {
    value: {
      src: 'https://edge.sitecorecloud.io/example/thumb.webp',
      alt: '',
      width: '200',
      height: '154',
    },
  },
  Video: {
    id: 'ee42c11b-04e7-401a-98eb-b8eb6fc6656b',
    fields: {
      CoverImage: { value: {} },
      BrightcoveId: { value: '6253901440001' },
      Autoplay: { value: false },
      Loop: { value: false },
      Title: { value: 'Glazing' },
      Caption: { value: '' },
    },
  },
  Heading: { value: 'Making the Right Choice' },
  Description: { value: '<p>Body</p>' },
  Link: {
    value: { href: 'https://example.com/doc.pdf', text: 'Download White Paper', target: '_blank' },
  },
} as unknown as MediaBoxProps['fields'];

describe('resolveMediaBoxFields / layout shapes', () => {
  it('resolves Video + MediaType from XM Cloud layout-service reference item', () => {
    const resolved = resolveMediaBoxFields(sitecoreLayoutMediaBoxVideoFields);
    expect(normalizeMediaBoxMediaType(resolved)).toBe('video');
    expect(extractMediaTileBrightcoveId(resolved.Video)).toBe('6253901440001');
  });

  it('maps camelCase field keys from Content SDK to Video / mediaType', () => {
    const raw = {
      mediaType: sitecoreLayoutMediaBoxVideoFields.MediaType,
      video: sitecoreLayoutMediaBoxVideoFields.Video,
      thumbnail: sitecoreLayoutMediaBoxVideoFields.Thumbnail,
      heading: sitecoreLayoutMediaBoxVideoFields.Heading,
      description: sitecoreLayoutMediaBoxVideoFields.Description,
      link: sitecoreLayoutMediaBoxVideoFields.Link,
    } as unknown as MediaBoxProps['fields'];
    const resolved = resolveMediaBoxFields(raw);
    expect(normalizeMediaBoxMediaType(resolved)).toBe('video');
    expect(extractMediaTileBrightcoveId(resolved.Video)).toBe('6253901440001');
  });

  it('uses droplist item name when Value is absent', () => {
    expect(
      normalizeMediaBoxMediaType({
        MediaType: { name: 'Video', fields: {} },
      } as unknown as MediaBoxProps['fields']),
    ).toBe('video');
  });

  it('prefers datasource MediaType Image over rendering Format Video (mismatched CMS params)', () => {
    expect(
      normalizeMediaBoxMediaType(
        { MediaType: mediaTypeItem('Image') } as unknown as MediaBoxFields,
        { Format: { Value: { value: 'Video' } } },
      ),
    ).toBe('image');
  });

  it('uses rendering Format when MediaType has no label', () => {
    expect(
      normalizeMediaBoxMediaType({} as MediaBoxFields, {
        Format: { Value: { value: 'Video' } },
      }),
    ).toBe('video');
  });

  it('reads Brightcove id when video reference uses Fields (capital F)', () => {
    expect(
      extractMediaTileBrightcoveId({
        id: 'x',
        Fields: { BrightcoveId: { value: '6253901440001' } },
      }),
    ).toBe('6253901440001');
  });

  it('reads MediaType from jsonValue envelope', () => {
    expect(
      normalizeMediaBoxMediaType({
        MediaType: {
          jsonValue: { fields: { Value: { value: 'Video' } } },
        },
      } as unknown as MediaBoxFields),
    ).toBe('video');
  });
});

describe('MediaBox Default', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when fields are missing and not editing', () => {
    const { container } = render(
      <Default
        fields={undefined}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows empty hint when fields are missing and editing', () => {
    render(
      <Default
        fields={undefined}
        params={baseParams}
        page={editingPage}
        rendering={baseRendering}
      />,
    );
    expect(screen.getByText(MEDIA_BOX_EMPTY_HINT)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: MEDIA_BOX_SECTION_FALLBACK })).toBeInTheDocument();
  });

  it('wraps markup in outer and inner shells (InfoBox-aligned responsive column)', () => {
    render(
      <Default
        fields={undefined}
        params={baseParams}
        page={editingPage}
        rendering={baseRendering}
      />,
    );
    expect(screen.getByTestId('media-box-outer')).toBeInTheDocument();
    expect(screen.getByTestId('media-box-inner')).toBeInTheDocument();
  });

  it('applies large-desktop outer cap and two-column layout resets', () => {
    const { container } = render(
      <div className="two-column-container">
        <Default
          fields={undefined}
          params={baseParams}
          page={editingPage}
          rendering={baseRendering}
        />
      </div>,
    );
    const section = container.querySelector('section.component.media-box');
    const outer = screen.getByTestId('media-box-outer');
    expect(section?.className).toContain('[.two-column-container_&]:w-full');
    expect(section?.className).toContain('[.two-column-container_&]:ml-0');
    expect(outer.className).toContain('min-[1200px]:max-w-[calc(var(--infobox-max-width-desktop-xl)+2*var(--layout-gutter-inline))]');
    expect(outer.className).toContain('[.two-column-container_&]:max-w-none');
    expect(outer.className).toContain('[.two-column-container_&]:px-0');
    expect(outer.className).toContain('[.two-column-container_&]:my-0');
  });

  it('returns null when all visitor content is empty and not editing', () => {
    const { container } = render(
      <Default
        fields={{
          MediaType: mediaTypeItem('Image'),
          Heading: { value: '' },
          Description: { value: '' },
          Link: { value: { href: '' } },
        }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders heading, rich text, link, and image for image + thumbnail datasource', () => {
    render(
      <Default
        fields={{
          MediaType: mediaTypeItem('Image'),
          Heading: { value: 'Making the Right Choice' },
          Description: { value: '<p>Body copy</p>' },
          Link: {
            value: {
              href: 'https://example.com/doc.pdf',
              text: 'Download',
              target: '_blank',
            },
          },
          Thumbnail: {
            value: {
              src: 'https://example.com/thumb.webp',
              alt: '',
              width: '200',
              height: '154',
            },
          },
        }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Making the Right Choice' })).toBeInTheDocument();
    expect(screen.getByTestId('sdk-richtext')).toHaveTextContent('<p>Body copy</p>');
    const links = screen.getAllByTestId('sdk-link');
    expect(links).toHaveLength(2);
    links.forEach((link) => {
      expect(link).toHaveAttribute('href', 'https://example.com/doc.pdf');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
    expect(screen.getByTestId('sdk-next-image').closest('a')).toHaveAttribute(
      'href',
      'https://example.com/doc.pdf',
    );
    expect(screen.getAllByTestId('sdk-next-image')).toHaveLength(1);
  });

  it('does not render heading when empty in visitor mode', () => {
    render(
      <Default
        fields={{
          MediaType: mediaTypeItem('Image'),
          Heading: { value: '' },
          Description: { value: '<p>Only body</p>' },
          Thumbnail: {
            value: { src: 'https://example.com/t.webp', alt: 't' },
          },
        }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByTestId('sdk-richtext')).toBeInTheDocument();
  });

  it('applies Theme Dark shell: dark gray background and light text', () => {
    render(
      <Default
        fields={{
          MediaType: mediaTypeItem('Image'),
          Description: { value: '<p>x</p>' },
          Thumbnail: { value: { src: 'https://example.com/t.webp', alt: '' } },
        }}
        params={
          {
            ...baseParams,
            Theme: { Value: { value: 'Dark' } },
          } as unknown as MediaBoxProps['params']
        }
        page={basePage}
        rendering={
          {
            ...baseRendering,
            params: { Theme: { Value: { value: 'Dark' } } },
          } as unknown as ComponentRendering
        }
      />,
    );
    const inner = screen.getByTestId('media-box-inner');
    expect(inner.className).toMatch(/bg-chrome-stripe/);
    expect(inner.className).toMatch(/text-ink-inverse/);
  });

  it('replaces Link pill with Watch the video text link when MediaType is Video and Brightcove id exists', () => {
    render(
      <Default
        fields={sitecoreLayoutMediaBoxVideoFields}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    expect(screen.queryByTestId('sdk-link')).not.toBeInTheDocument();
    expect(screen.getByText(MEDIA_BOX_WATCH_THE_VIDEO)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Glazing' })).toBeInTheDocument();
  });

  it('shows Watch the video in Page Builder when MediaType is Video and Brightcove id exists', () => {
    const resolved = resolveMediaBoxFields(sitecoreLayoutMediaBoxVideoFields);
    expect(mediaBoxWatchVideoCtaChromeApplies(resolved)).toBe(true);
    render(
      <Default
        fields={sitecoreLayoutMediaBoxVideoFields}
        params={baseParams}
        page={editingPage}
        rendering={baseRendering}
      />,
    );
    const link = screen.getByTestId('sdk-link');
    expect(link).toHaveAttribute('href', 'https://example.com/doc.pdf');
    expect(link).toHaveTextContent(MEDIA_BOX_WATCH_THE_VIDEO);
  });

  it('renders video cover in media rail when MediaType is Video and CoverImage has src', () => {
    render(
      <Default
        fields={{
          MediaType: mediaTypeItem('Video'),
          Description: { value: '<p>Watch</p>' },
          Video: {
            fields: {
              BrightcoveId: { value: '12345' },
              Autoplay: { value: false },
              Caption: { value: '' },
              CoverImage: {
                value: { src: 'https://example.com/cover.webp', alt: 'Cover' },
              },
              Loop: { value: false },
              Title: { value: '' },
            },
          },
        }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    const img = screen.getByTestId('sdk-next-image');
    expect(img).toHaveAttribute('src', 'https://example.com/cover.webp');
  });

  it('uses Thumbnail in rail when MediaType is Video and CoverImage has no src', () => {
    render(
      <Default
        fields={{
          MediaType: mediaTypeItem('Video'),
          Description: { value: '<p>Watch</p>' },
          Thumbnail: { value: { src: 'https://example.com/poster.webp', alt: 'Poster' } },
          Video: {
            fields: {
              BrightcoveId: { value: '12345' },
              Autoplay: { value: false },
              Caption: { value: '' },
              CoverImage: { value: { src: '', alt: '' } },
              Loop: { value: false },
              Title: { value: '' },
            },
          },
        }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    expect(screen.getByTestId('sdk-next-image')).toHaveAttribute(
      'src',
      'https://example.com/poster.webp',
    );
  });

  it('merges Video from data.datasource when root Video is empty', () => {
    render(
      <Default
        fields={{
          MediaType: mediaTypeItem('Video'),
          Description: { value: '<p>Watch</p>' },
          data: {
            datasource: {
              Video: {
                fields: {
                  BrightcoveId: { value: 'from-ds' },
                  Autoplay: { value: false },
                  Caption: { value: '' },
                  CoverImage: {
                    value: { src: 'https://example.com/ds-cover.webp', alt: '' },
                  },
                  Loop: { value: false },
                  Title: { value: '' },
                },
              },
            },
          },
        }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    expect(screen.getByTestId('sdk-next-image')).toHaveAttribute(
      'src',
      'https://example.com/ds-cover.webp',
    );
  });

  it('shows Thumbnail in rail when Video type but no Brightcove id (visitor)', () => {
    render(
      <Default
        fields={{
          MediaType: mediaTypeItem('Video'),
          Description: { value: '<p>Watch</p>' },
          Thumbnail: { value: { src: 'https://example.com/fallback.webp', alt: '' } },
        }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    expect(screen.getByTestId('sdk-next-image')).toHaveAttribute(
      'src',
      'https://example.com/fallback.webp',
    );
  });

  it('sets data-content-options when ContentOptions param is present', () => {
    const { container } = render(
      <Default
        fields={{
          MediaType: mediaTypeItem('Image'),
          Description: { value: '<p>x</p>' },
          Thumbnail: { value: { src: 'https://example.com/t.webp', alt: '' } },
        }}
        params={
          {
            ...baseParams,
            ContentOptions: { Value: { value: 'Downloadable' } },
          } as unknown as MediaBoxProps['params']
        }
        page={basePage}
        rendering={baseRendering}
      />,
    );
    expect(container.querySelector('section')?.getAttribute('data-content-options')).toBe(
      'Downloadable',
    );
  });

  it('shows media rail placeholder in editing when image mode has no primary, thumbnail, or video rail (lines 222-230)', () => {
    render(
      <Default
        fields={{
          MediaType: mediaTypeItem('Image'),
          Heading: { value: 'Draft heading' },
          Description: { value: '<p>Body</p>' },
        }}
        params={baseParams}
        page={editingPage}
        rendering={baseRendering}
      />,
    );
    expect(screen.getByText(MEDIA_BOX_MEDIA_PLACEHOLDER)).toHaveClass('is-empty-hint');
  });

  it('renders image layout when ContentOptions is Modal and primary image exists (image modal provider branch)', () => {
    render(
      <Default
        fields={{
          MediaType: mediaTypeItem('Image'),
          Heading: { value: 'H' },
          Description: { value: '<p>x</p>' },
          Media: {
            value: {
              src: 'https://example.com/hero.jpg',
              alt: 'Hero',
            },
          },
        }}
        params={
          {
            ...baseParams,
            ContentOptions: { Value: { value: 'Modal' } },
          } as unknown as MediaBoxProps['params']
        }
        page={basePage}
        rendering={baseRendering}
      />,
    );
    expect(screen.getByTestId('sdk-next-image')).toHaveAttribute('src', 'https://example.com/hero.jpg');
  });
});

describe('mediaBoxHasVisitorContent', () => {
  it('returns true when heading text is present', () => {
    const fields = { Heading: { value: 'Hello' } } as unknown as MediaBoxProps['fields'];
    expect(mediaBoxHasVisitorContent(fields)).toBe(true);
  });

  it('returns true when a visible link href is present', () => {
    const fields = {
      Link: { value: { href: 'https://example.com' } },
    } as unknown as MediaBoxProps['fields'];
    expect(mediaBoxHasVisitorContent(fields)).toBe(true);
  });

  it('returns true for video kind with a Brightcove id', () => {
    const fields = resolveMediaBoxFields(sitecoreLayoutMediaBoxVideoFields);
    expect(mediaBoxHasVisitorContent(fields)).toBe(true);
  });

  it('returns true for video kind without Brightcove id but with thumbnail (line 483)', () => {
    const videoFieldsNoId = {
      MediaType: {
        fields: { Value: { value: 'Video' } },
      },
      Thumbnail: { value: { src: 'https://example.com/thumb.jpg', alt: '' } },
    } as unknown as MediaBoxProps['fields'];
    const resolved = resolveMediaBoxFields(videoFieldsNoId);
    expect(mediaBoxHasVisitorContent(resolved)).toBe(true);
  });

  it('returns false for video kind with no Brightcove id and no thumbnail (line 483 false branch)', () => {
    const videoFieldsNoIdNoThumb = {
      MediaType: {
        fields: { Value: { value: 'Video' } },
      },
    } as unknown as MediaBoxProps['fields'];
    const resolved = resolveMediaBoxFields(videoFieldsNoIdNoThumb);
    expect(mediaBoxHasVisitorContent(resolved)).toBe(false);
  });

  it('returns true for image kind with a visible primary image', () => {
    const fields = {
      Media: { value: { src: 'https://example.com/img.jpg', alt: 'alt' } },
    } as unknown as MediaBoxProps['fields'];
    expect(mediaBoxHasVisitorContent(fields)).toBe(true);
  });

  it('returns false when no content is present', () => {
    expect(mediaBoxHasVisitorContent({} as MediaBoxProps['fields'])).toBe(false);
  });
});

describe('normalizeMediaBoxMediaType with mergedParams Format', () => {
  it('reads Format from mergedParams when present (line 445)', () => {
    const fields = {} as MediaBoxProps['fields'];
    expect(normalizeMediaBoxMediaType(fields, { Format: 'video' })).toBe('video');
  });

  it('returns image as default when mergedParams Format is unknown', () => {
    const fields = {} as MediaBoxProps['fields'];
    expect(normalizeMediaBoxMediaType(fields, { Format: 'unknown' })).toBe('image');
  });
});

describe('mediaBoxContentOptionsIsModal / resolveMediaBoxContentOptionsDataValue', () => {
  it('returns true for Modal (case-insensitive)', () => {
    expect(mediaBoxContentOptionsIsModal({ ContentOptions: { Value: { value: 'Modal' } } })).toBe(
      true,
    );
  });

  it('returns true for model CMS typo alias', () => {
    expect(mediaBoxContentOptionsIsModal({ ContentOptions: { Value: { value: 'Model' } } })).toBe(
      true,
    );
  });

  it('returns false for non-modal content options', () => {
    expect(
      mediaBoxContentOptionsIsModal({ ContentOptions: { Value: { value: 'Downloadable' } } }),
    ).toBe(false);
  });

  it('resolveMediaBoxContentOptionsDataValue returns trimmed string when set', () => {
    expect(
      resolveMediaBoxContentOptionsDataValue({
        ContentOptions: { Value: { value: '  Modal  ' } },
      }),
    ).toBe('Modal');
  });

  it('resolveMediaBoxContentOptionsDataValue returns undefined when empty', () => {
    expect(resolveMediaBoxContentOptionsDataValue({ ContentOptions: { Value: { value: '   ' } } })).toBe(
      undefined,
    );
  });
});
