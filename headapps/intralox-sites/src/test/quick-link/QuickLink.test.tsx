import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ComponentRendering, Page } from '@sitecore-content-sdk/nextjs';

vi.mock('lib/quick-link-i18n', () => ({
  QUICK_LINK_LABEL_FALLBACKS: {
    emptyHint: 'Quick Link',
    linkAriaFallback: 'Quick Link',
  },
  getQuickLinkLabels: vi.fn(async () => ({
    emptyHint: 'Quick Link',
    linkAriaFallback: 'Quick Link',
  })),
}));

import { Default } from 'components/quick-link/QuickLink';
import type { QuickLinkFields } from 'components/quick-link/QuickLink.type';

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const { quickLinkSitecoreSdkMock } = await import('src/test/mocks/viteSafeMocks');
  return quickLinkSitecoreSdkMock();
});

const defaultPage = { mode: { isEditing: false } } as unknown as Page;
const editingPage = { mode: { isEditing: true } } as unknown as Page;
const defaultRendering = { componentName: 'QuickLink' } as unknown as ComponentRendering;

function createProps(overrides: {
  fields?: QuickLinkFields | undefined;
  params?: Record<string, unknown>;
  page?: Page;
  rendering?: ComponentRendering;
} = {}) {
  return {
    rendering: overrides.rendering ?? defaultRendering,
    page: overrides.page ?? defaultPage,
    params: {
      styles: '',
      RenderingIdentifier: 'ql-test-id',
      ...overrides.params,
    },
    fields: overrides.fields as QuickLinkFields | undefined,
  };
}

/** Tile root (`a` / `div`) inside the non-standalone centering wrapper. */
function quickLinkTileRootEl(container: HTMLElement): HTMLElement | null {
  const wrap = container.querySelector('.component-content > .flex.justify-center');
  if (!wrap) return null;
  const direct =
    wrap.querySelector(':scope > a') ?? wrap.querySelector(':scope > div');
  if (direct?.className) {
    return direct as HTMLElement;
  }
  const nested =
    wrap.querySelector(':scope a[class*="rounded"]') ??
    wrap.querySelector(':scope div[class*="rounded"]');
  return (nested ?? direct) as HTMLElement | null;
}

describe('QuickLink Default', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty hint when fields are undefined', async () => {
    const ui = await Default(createProps({ fields: undefined }));
    render(ui);
    const hint = screen.getByText('Quick Link');
    expect(hint).toHaveClass('is-empty-hint');
  });

  it('returns null for visitors when there is no meaningful content', async () => {
    const ui = await Default(createProps({ fields: {} }));
    const { container } = render(ui);
    expect(container.firstChild).toBeNull();
  });

  it('renders title from integrated GraphQL data.datasource when flat Title is empty', async () => {
    const fields = {
      data: {
        datasource: {
          title: { jsonValue: { value: 'From datasource' } },
        },
      },
    } as unknown as QuickLinkFields;
    const ui = await Default(createProps({ fields }));
    render(ui);
    expect(screen.getByTestId('quick-link')).toBeInTheDocument();
    expect(screen.getByTestId('sdk-text')).toHaveTextContent('From datasource');
  });

  it('sets data-variant base vs card from CardType param', async () => {
    const { rerender } = render(
      await Default(
        createProps({
          fields: {
            Title: { value: 'Products' },
          },
          params: {
            CardType: { Value: { value: 'base' } },
          },
        }),
      ),
    );
    expect(screen.getByTestId('quick-link')).toHaveAttribute('data-variant', 'base');

    rerender(
      await Default(
        createProps({
          fields: {
            Title: { value: 'Products' },
          },
          params: {
            CardType: { Value: { value: 'card' } },
          },
        }),
      ),
    );
    expect(screen.getByTestId('quick-link')).toHaveAttribute('data-variant', 'card');
  });

  it('applies rel noopener noreferrer when target is _blank', async () => {
    const ui = await Default(
      createProps({
        fields: {
          Title: { value: 'Go' },
          Link: {
            value: {
              href: 'https://example.com',
              text: '',
              target: '_blank',
            },
          },
        },
      }),
    );
    render(ui);
    const a = screen.getByRole('link', { name: /go/i });
    expect(a).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders layout in editing mode so authors can fill empty title', async () => {
    const ui = await Default(
      createProps({
        fields: { Title: { value: '' } },
        page: editingPage,
      }),
    );
    render(ui);
    expect(screen.getByTestId('quick-link')).toBeInTheDocument();
    expect(screen.getByTestId('sdk-text')).toBeInTheDocument();
  });

  it('uses base default IconPosition top: stacked column at all breakpoints (flex-col), full-width layout', async () => {
    const ui = await Default(
      createProps({
        fields: { Title: { value: 'T' } },
        params: { CardType: { Value: { value: 'base' } } },
      }),
    );
    const { container } = render(ui);
    const section = screen.getByTestId('quick-link');
    expect(section).toHaveAttribute('data-icon-position', 'top');
    expect(container.querySelector('.component-content > .flex.justify-center')).toBeTruthy();
    const inner = quickLinkTileRootEl(container);
    expect(inner?.className).toMatch(/w-full/);
    expect(inner?.className).toMatch(/max-w-full/);
    expect(inner?.className).toMatch(/flex-col/);
    expect(inner?.className).not.toMatch(/flex-row/);
    expect(section.className).toMatch(/w-full/);
    expect(inner?.className).toMatch(/124px/);
    expect(inner?.className).toMatch(/flex-nowrap/);
    expect(inner?.className).toMatch(/justify-start/);
  });

  it('uses base IconPosition left: horizontal icon + text row at all breakpoints', async () => {
    const ui = await Default(
      createProps({
        fields: { Title: { value: 'T' } },
        params: {
          CardType: { Value: { value: 'base' } },
          IconPosition: { Value: { value: 'left' } },
        },
      }),
    );
    const { container } = render(ui);
    expect(screen.getByTestId('quick-link')).toHaveAttribute('data-icon-position', 'left');
    const inner = quickLinkTileRootEl(container);
    expect(inner?.className).toMatch(/flex-row/);
    expect(inner?.className).not.toMatch(/flex-col/);
  });

  it('uses base IconPosition center: column with centered items', async () => {
    const ui = await Default(
      createProps({
        fields: { Title: { value: 'T' } },
        params: {
          CardType: { Value: { value: 'base' } },
          IconPosition: { Value: { value: 'center' } },
        },
      }),
    );
    const { container } = render(ui);
    expect(screen.getByTestId('quick-link')).toHaveAttribute('data-icon-position', 'center');
    const inner = quickLinkTileRootEl(container);
    expect(inner?.className).toMatch(/flex-col/);
    expect(inner?.className).toMatch(/items-center/);
  });

  it('uses card chrome classes for card variant (mobile layout + md overrides)', async () => {
    const ui = await Default(
      createProps({
        fields: { Title: { value: 'T' } },
        params: { CardType: { Value: { value: 'card' } } },
      }),
    );
    const { container } = render(ui);
    const section = screen.getByTestId('quick-link');
    const content = container.querySelector('.component-content');
    expect(content?.className).toMatch(/max-md:px-\[16px\]/);
    expect(section.className).toMatch(/p-0!/);
    expect(section.className).toMatch(/px-0!/);
    expect(section.className).toMatch(/w-full/);
    const inner = quickLinkTileRootEl(container);
    expect(inner?.className).toMatch(/mx-auto/);
    expect(inner?.className).toMatch(/md:mx-auto/);
    expect(inner?.className).toMatch(/rounded-lg/);
    expect(inner?.className).toMatch(/border-stroke-default/);
    expect(inner?.className).toMatch(/w-\[358px\]/);
    expect(inner?.className).toMatch(/min-\[600px\]:max-\[767px\]:w-\[272px\]/);
    expect(inner?.className).toMatch(/min-h-\[171\.75px\]/);
    expect(inner?.className).toMatch(/\bh-auto\b/);
    expect(inner?.className).toMatch(/p-6/);
    expect(inner?.querySelector('.px-4.pb-6.pt-4')).toBeNull();
    expect(inner?.className).toMatch(/shadow-quick-link-card/);
    expect(inner?.className).toMatch(/md:w-\[356px\]/);
    expect(inner?.className).toMatch(/md:min-h-\[187\.75px\]/);
    expect(inner?.className).toMatch(/md:items-center/);
    expect(inner?.className).toMatch(/md:text-center/);
    expect(inner?.className).toMatch(/\bmd:p-6\b/);
    expect(inner?.className).toMatch(/lg:w-\[468px\]/);
    expect(inner?.className).toMatch(/xl:w-\[572px\]/);
    expect(inner?.className).toMatch(/lg:min-h-\[187\.75px\]/);
    expect(inner?.className).toMatch(/lg:p-6/);
    expect(inner?.className).toMatch(/lg:items-center/);
    expect(inner?.className).toMatch(/lg:text-center/);
    expect(section).toHaveAttribute('data-icon-position', 'center');
  });

  it('uses card IconPosition top: left-aligned stack inside chrome', async () => {
    const ui = await Default(
      createProps({
        fields: { Title: { value: 'T' } },
        params: {
          CardType: { Value: { value: 'card' } },
          IconPosition: { Value: { value: 'top' } },
        },
      }),
    );
    const { container } = render(ui);
    expect(screen.getByTestId('quick-link')).toHaveAttribute('data-icon-position', 'top');
    const inner = quickLinkTileRootEl(container);
    expect(inner?.className).toMatch(/items-start/);
    expect(inner?.className).toMatch(/text-left/);
    expect(inner?.className).toMatch(/flex-col/);
  });

  it('uses card IconPosition left: row layout inside chrome', async () => {
    const ui = await Default(
      createProps({
        fields: { Title: { value: 'T' } },
        params: {
          CardType: { Value: { value: 'card' } },
          IconPosition: { Value: { value: 'left' } },
        },
      }),
    );
    const { container } = render(ui);
    expect(screen.getByTestId('quick-link')).toHaveAttribute('data-icon-position', 'left');
    const inner = quickLinkTileRootEl(container);
    expect(inner?.className).toMatch(/flex-row/);
  });

  it('uses full-width horizontal standalone rail when card + Standalone is 1', async () => {
    const ui = await Default(
      createProps({
        fields: {
          Title: { value: 'Identify a Belt' },
          Description: { value: '<p>Need help identifying your belt?</p>' },
          Link: { value: { href: '/guide', text: '' } },
        },
        params: {
          CardType: { Value: { value: 'card' } },
          Standalone: { Value: { value: '1' } },
        },
      }),
    );
    const { container } = render(ui);
    expect(screen.getByTestId('quick-link')).toHaveAttribute('data-standalone', 'true');
    const outer = screen.getByTestId('quick-link-standalone-outer');
    expect(outer).toHaveClass('quick-link-standalone-outer');
    const tile = screen.getByRole('link', { name: /identify a belt/i });
    expect(tile.className).toMatch(/flex-col/);
    expect(tile.className).toMatch(/min-\[600px\]:flex-row/);
    expect(tile.className).toMatch(/w-full/);
    expect(tile.className).not.toMatch(/w-\[358px\]/);
    expect(container.querySelector('.bg-quick-link-icon-rail')).toBeTruthy();
    expect(tile.querySelector('.px-4.pb-6.pt-4')).toBeNull();
  });

  it('does not set standalone rail for base variant when Standalone is 1', async () => {
    const ui = await Default(
      createProps({
        fields: { Title: { value: 'T' } },
        params: {
          CardType: { Value: { value: 'base' } },
          Standalone: { Value: { value: '1' } },
        },
      }),
    );
    render(ui);
    expect(screen.getByTestId('quick-link')).not.toHaveAttribute('data-standalone');
  });

  it('treats Sitecore checkbox param Standalone as { value: true } on card', async () => {
    const ui = await Default(
      createProps({
        fields: {
          Title: { value: 'T' },
          Link: { value: { href: 'https://example.com', text: '' } },
        },
        params: {
          CardType: { Value: { value: 'card' } },
          Standalone: { value: true },
        },
      }),
    );
    render(ui);
    expect(screen.getByTestId('quick-link')).toHaveAttribute('data-standalone', 'true');
  });

  it('card whole-tile link: shows link text when title is empty and does not use aria-label override (WCAG 2.5.3)', async () => {
    const ui = await Default(
      createProps({
        fields: {
          Title: { value: '' },
          Link: { value: { href: '/solutions', text: 'Get Support' } },
        },
        params: { CardType: { Value: { value: 'card' } } },
      }),
    );
    render(ui);
    const tile = screen.getByRole('link', { name: /get support/i });
    expect(tile).toHaveTextContent('Get Support');
    expect(tile).not.toHaveAttribute('aria-label');
  });

  it('reads Standalone from rendering.params when omitted from component params', async () => {
    const ui = await Default(
      createProps({
        fields: {
          Title: { value: 'T' },
          Link: { value: { href: 'https://example.com', text: '' } },
        },
        params: {
          CardType: { Value: { value: 'card' } },
        },
        rendering: {
          ...defaultRendering,
          params: { Standalone: { value: true } },
        } as unknown as ComponentRendering,
      }),
    );
    render(ui);
    expect(screen.getByTestId('quick-link')).toHaveAttribute('data-standalone', 'true');
  });
});
