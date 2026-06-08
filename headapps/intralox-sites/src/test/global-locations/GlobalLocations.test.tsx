import { createElement } from 'react';
import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({
    field,
    tag = 'span',
    className,
    id,
  }: {
    field?: { value?: string };
    tag?: string;
    className?: string;
    id?: string;
  }) =>
    createElement(
      tag,
      { 'data-testid': 'sdk-text', className, id },
      field?.value ?? '',
    ),
  RichText: ({ field, className }: { field?: { value?: string }; className?: string }) => (
    <div data-testid="sdk-richtext" className={className}>
      {field?.value}
    </div>
  ),
  Link: ({
    field,
    className,
    children,
    rel,
    target,
  }: {
    field?: { value?: { href?: string; text?: string; target?: string } };
    className?: string;
    children?: ReactNode;
    rel?: string;
    target?: string;
  }) => (
    <a
      href={field?.value?.href}
      className={className}
      data-testid="sdk-link"
      rel={rel}
      target={target}
    >
      {children ?? field?.value?.text}
    </a>
  ),
  NextImage: ({ field, className }: { field?: { value?: { src?: string; width?: string; height?: string } }; className?: string }) =>
    field?.value?.src ?
      <img data-testid="sdk-image" src={field.value.src} className={className} alt="" />
    : null,
}));

vi.mock('lib/callout-i18n', () => ({
  getCalloutLabels: vi.fn(async () => ({ emptyHint: 'Callout' })),
}));

import type { ComponentRendering, Page } from '@sitecore-content-sdk/nextjs';

import { Default } from 'components/global-locations/GlobalLocations';
import type { GlobalLocationsProps } from 'components/global-locations/GlobalLocations.type';
import {
  resolveGlobalLocationsMapFrameAspect,
  resolveGlobalLocationsMapImageDimensions,
} from 'components/global-locations/globalLocationsUtils';

const baseParams = {
  styles: 'gl-style',
  RenderingIdentifier: 'gl-1',
} as GlobalLocationsProps['params'];

const basePage = {
  mode: { isEditing: false },
} as Page;

const baseRendering = {
  componentName: 'GlobalLocations',
  params: {
    ColorScheme: { Value: { value: 'light' } },
    TextAlignment: { Value: { value: 'Center' } },
    TextWidth: { Value: { value: '75' } },
    ContainerWidth: { Value: { value: 'default' } },
  },
} as unknown as ComponentRendering;

describe('GlobalLocations map dimensions', () => {
  it('uses live frame aspect 1168×565.844 (not CMS 571px height)', () => {
    expect(resolveGlobalLocationsMapFrameAspect()).toEqual({ width: 1168, height: 565.844 });
    expect(
      resolveGlobalLocationsMapImageDimensions({
        value: { src: '/map.png', width: '1168', height: '571' },
      }),
    ).toEqual({ width: 1168, height: 571 });
    expect(resolveGlobalLocationsMapImageDimensions(undefined)).toEqual({ width: 1168, height: 566 });
  });
});

describe('GlobalLocations layout (render)', () => {
  const layoutFields = {
    Headline: { value: 'Global' },
    Description: { value: '<p>Hello <strong>world</strong></p>' },
    Image: {
      value: { src: 'https://example.com/map.png', alt: 'Map', width: '800', height: '400' },
    },
  };

  async function renderLayout() {
    const { container } = render(
      await Default({
        fields: layoutFields,
        params: baseParams,
        page: basePage,
        rendering: baseRendering,
      }),
    );
    return container;
  }

  it('applies content-rail max-width tokens on the outer band', async () => {
    const container = await renderLayout();
    const outer = Array.from(container.querySelectorAll('div')).find((el) =>
      el.className.includes('min-[600px]:max-md:max-w-[length:var(--width-global-locations-content-sm)]'),
    );
    expect(outer).toBeTruthy();
    expect(outer?.className).toContain('max-w-full');
    expect(outer?.className).not.toContain('width-global-locations-shell');
  });

  it('uses 16px flex gap on copy stack and main column', async () => {
    const container = await renderLayout();
    const copyStack = container.querySelector('[data-testid="sdk-richtext"]')?.parentElement;
    expect(copyStack?.className).toContain(
      'gap-[length:var(--margin-global-locations-copy-block)]',
    );
    const mainColumn = copyStack?.parentElement;
    expect(mainColumn?.className).toContain(
      'gap-[length:var(--margin-global-locations-copy-block)]',
    );
    expect(mainColumn?.contains(container.querySelector('[data-testid="sdk-image"]'))).toBe(false);
  });

  it('styles description bold emphasis as ink-primary on light bands', async () => {
    const container = await renderLayout();
    const rte = container.querySelector('[data-testid="sdk-richtext"]');
    expect(rte?.className).toContain('[&_strong]:!text-ink-primary');
    expect(rte?.className).toContain('[&_b]:!text-ink-primary');
    expect(rte?.className).not.toContain('[&_strong]:!text-ink-muted');
  });

  it('uses fixed aspect-ratio map frame with absolute object-cover image', async () => {
    const container = await renderLayout();
    const frame = container.querySelector('[data-testid="sdk-image"]')?.parentElement;
    expect(frame?.className).toContain('relative');
    expect(frame?.className).toContain('[aspect-ratio:var(--aspect-ratio-global-locations-map)]');
    const img = container.querySelector('[data-testid="sdk-image"]');
    expect(img?.className).toContain('absolute');
    expect(img?.className).toContain('inset-0');
    expect(img?.className).toContain('object-cover');
    expect(img?.className).not.toContain('object-contain');
  });

  it('applies default copy-column band caps when TextWidth is unset', async () => {
    const { container } = render(
      await Default({
        fields: layoutFields,
        params: baseParams,
        page: basePage,
        rendering: {
          ...baseRendering,
          params: {
            ...baseRendering.params,
            TextWidth: { Value: { value: '' } },
          },
        },
      }),
    );
    const copyColumn = Array.from(container.querySelectorAll('div')).find((el) =>
      el.className.includes('min-[600px]:max-md:w-[length:var(--width-global-locations-copy-sm)]'),
    );
    expect(copyColumn).toBeTruthy();
    expect(copyColumn?.className).toContain('min-[768px]:max-lg:w-[length:var(--width-global-locations-copy-md)]');
    expect(copyColumn?.className).toContain('min-[992px]:max-xl:w-[length:var(--width-global-locations-copy-lg)]');
    expect(copyColumn?.className).toContain('min-[1200px]:w-[length:var(--width-global-locations-copy-max)]');
  });
});

describe('GlobalLocations Default', () => {
  it('renders empty hint when fields is missing', async () => {
    render(
      await Default({
        fields: undefined,
        params: baseParams,
        page: basePage,
        rendering: baseRendering,
      }),
    );
    expect(screen.getByText('Global Locations')).toHaveClass('is-empty-hint');
  });

  it('returns null when there is no preview content and not editing', async () => {
    const { container } = render(
      await Default({
        fields: {
          Eyebrow: { value: '' },
          Headline: { value: '' },
          Description: { value: '' },
        },
        params: baseParams,
        page: basePage,
        rendering: baseRendering,
      }),
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders headline as eyebrow, description, stats list, CTA with rel on _blank, and map', async () => {
    const { container } = render(
      await Default({
        fields: {
          Headline: { value: 'Global' },
          Description: {
            value: '<p>Hello <strong>world</strong></p>',
          },
          CalloutItems: [
            {
              id: 'c1',
              fields: {
                Value: { value: '100+' },
                Label: { value: 'Countries' },
                Link: { value: { href: '' } },
              },
            },
          ],
          Links: [
            {
              id: 'l1',
              fields: {
                Link: {
                  value: {
                    href: '/locations',
                    text: 'Global Locations',
                    target: '_blank',
                  },
                },
                Style: { fields: { Value: { value: 'More' } } },
              },
            },
          ],
          Image: {
            value: {
              src: 'https://example.com/map.png',
              alt: 'Map',
              width: '800',
              height: '400',
            },
          },
          ButtonAlignment: {
            fields: { Value: { value: 'Center' } },
          },
        },
        params: baseParams,
        page: basePage,
        rendering: baseRendering,
      }),
    );

    expect(screen.getByRole('region', { name: 'Global' })).toBeInTheDocument();
    expect(screen.getByTestId('sdk-richtext')).toHaveTextContent('<p>Hello <strong>world</strong></p>');
    expect(screen.getAllByRole('list').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('group', { name: 'GlobalLocations' })).toBeInTheDocument();
    const link = screen.getByTestId('sdk-link');
    expect(link).toHaveAttribute('href', '/locations');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getByTestId('sdk-image')).toHaveAttribute('src', 'https://example.com/map.png');

    const copyColumn = Array.from(container.querySelectorAll('div')).find((el) =>
      el.className.includes('min-[992px]:max-xl:w-[min(75%,var(--width-global-locations-copy-lg))]'),
    );
    expect(copyColumn).toBeTruthy();
    expect(copyColumn?.contains(screen.getByTestId('sdk-richtext'))).toBe(true);
    expect(copyColumn?.contains(screen.getByTestId('sdk-image'))).toBe(false);
  });

  it('shows authoring hints for empty links and callouts when editing', async () => {
    const editingPage = { mode: { isEditing: true } } as Page;
    render(
      await Default({
        fields: {
          Headline: { value: 'X' },
          Description: { value: '<p>Body</p>' },
          Links: [],
          CalloutItems: [],
        },
        params: baseParams,
        page: editingPage,
        rendering: baseRendering,
      }),
    );
    expect(screen.getByText('No links configured')).toBeInTheDocument();
    expect(screen.getByText('No statistics configured')).toBeInTheDocument();
  });

  it('applies bg-accent-teal section when BackgroundColor is Light Blue', async () => {
    const { container } = render(
      await Default({
        fields: {
          Headline: { value: 'Global' },
          Description: { value: '<p>Body</p>' },
        },
        params: baseParams,
        page: basePage,
        rendering: {
          ...baseRendering,
          params: {
            ...baseRendering.params,
            BackgroundColor: { Value: { value: 'Light Blue' } },
          },
        },
      }),
    );

    const section = container.querySelector('section.global-locations');
    expect(section).toHaveClass('bg-accent-teal');
    expect(section).not.toHaveClass('bg-surface-panel');
  });

  it('applies bg-surface-muted when BackgroundColor is Gray', async () => {
    const { container } = render(
      await Default({
        fields: {
          Headline: { value: 'Global' },
          Description: { value: '<p>Body</p>' },
        },
        params: baseParams,
        page: basePage,
        rendering: {
          ...baseRendering,
          params: {
            ...baseRendering.params,
            BackgroundColor: { Value: { value: 'Gray' } },
          },
        },
      }),
    );

    expect(container.querySelector('section.global-locations')).toHaveClass('bg-surface-muted');
  });
});
