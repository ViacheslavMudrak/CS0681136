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

import { Default } from 'components/quick-link-group/QuickLinkGroup';
import type { QuickLinkGroupFields } from 'components/quick-link-group/QuickLinkGroup.type';

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const { quickLinkSitecoreSdkMock } = await import('src/test/mocks/viteSafeMocks');
  return quickLinkSitecoreSdkMock();
});

const defaultPage = { mode: { isEditing: false } } as unknown as Page;
const editingPage = { mode: { isEditing: true } } as unknown as Page;
const defaultRendering = { componentName: 'QuickLinkGroup' } as unknown as ComponentRendering;

function createProps(overrides: {
  fields?: QuickLinkGroupFields | undefined;
  params?: Record<string, unknown>;
  page?: Page;
} = {}) {
  return {
    rendering: defaultRendering,
    page: overrides.page ?? defaultPage,
    params: {
      styles: '',
      RenderingIdentifier: 'qlg-test-id',
      ...overrides.params,
    },
    fields: overrides.fields as QuickLinkGroupFields | undefined,
  };
}

describe('QuickLinkGroup Default', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty datasource hint when fields are undefined', async () => {
    const ui = await Default(createProps({ fields: undefined }));
    render(ui);
    const hint = screen.getByText('Quick Link Group');
    expect(hint).toHaveClass('is-empty-hint');
  });

  it('returns null for visitors when there are no items and no aside copy', async () => {
    const ui = await Default(
      createProps({
        fields: { QuickLinkItems: [] },
      }),
    );
    const { container } = render(ui);
    expect(container.firstChild).toBeNull();
  });

  it('renders aside with editable headline and body in editing when there are no items', async () => {
    const ui = await Default(
      createProps({
        fields: { QuickLinkItems: [] },
        page: editingPage,
      }),
    );
    render(ui);
    expect(screen.getByTestId('quick-link-group').tagName.toLowerCase()).toBe('aside');
    expect(screen.getByTestId('quick-link-group-aside')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByTestId('sdk-richtext')).toBeInTheDocument();
  });

  it('renders press inquiries aside for visitors when headline and description are set', async () => {
    const fields: QuickLinkGroupFields = {
      QuickLinkItems: [],
      Headline: { value: 'Press Inquiries' },
      Description: {
        value:
          '<p>For press inquiries, please contact Brandon Campo at&nbsp;<a href="mailto:Brandon.Campo@Intralox.com?subject=Press%20Inquiry" title="Press Inquiry">Brandon.Campo@Intralox.com</a>.</p>',
      },
    };
    const ui = await Default(
      createProps({
        fields,
        params: {
          styles: '',
          RenderingIdentifier: 'qlg-test-id',
          Styles: { Value: { value: 'press-inquiries-aside' } },
        },
      }),
    );
    render(ui);
    const aside = screen.getByTestId('quick-link-group');
    expect(aside.tagName.toLowerCase()).toBe('aside');
    expect(aside).toHaveClass('quick-link-group--press-inquiries');
    expect(screen.getByRole('heading', { name: /press inquiries/i })).toBeInTheDocument();
    const richtext = screen.getByTestId('sdk-richtext');
    expect(richtext.textContent).toMatch(/Brandon Campo/i);
    expect(richtext.innerHTML).toMatch(/mailto:Brandon\.Campo@Intralox\.com/);
  });

  it('does not apply press inquiries modifier on aside when Styles token is omitted', async () => {
    const fields: QuickLinkGroupFields = {
      QuickLinkItems: [],
      Headline: { value: 'Press Inquiries' },
      Description: {
        value: '<p>Contact <a href="mailto:a@b.com">a@b.com</a>.</p>',
      },
    };
    const ui = await Default(createProps({ fields }));
    render(ui);
    expect(screen.getByTestId('quick-link-group')).not.toHaveClass(
      'quick-link-group--press-inquiries',
    );
  });

  it('omits empty headline for visitors when only description is set', async () => {
    const fields: QuickLinkGroupFields = {
      QuickLinkItems: [],
      Description: {
        value: '<p>Body only <a href="mailto:a@b.com">a@b.com</a></p>',
      },
    };
    const ui = await Default(createProps({ fields }));
    render(ui);
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    expect(screen.getByTestId('sdk-richtext')).toBeInTheDocument();
  });

  it('returns null for visitors when description is whitespace or empty tags only', async () => {
    const fields: QuickLinkGroupFields = {
      QuickLinkItems: [],
      Description: { value: '   <p><br></p>  ' },
    };
    const ui = await Default(createProps({ fields }));
    const { container } = render(ui);
    expect(container.firstChild).toBeNull();
  });

  it('renders Downloads sidebar column with blue links and descriptions when ListofLinks has no icons', async () => {
    const fields: QuickLinkGroupFields = {
      Headline: { value: 'Downloads' },
      ListofLinks: [
        {
          id: '5a61d718-0d9f-4d81-bbdb-4a07d4ce4916',
          displayName: 'Equipment Services Brochure',
          fields: {
            Image: { value: {} },
            Title: { value: 'Equipment Services Brochure' },
            Description: {
              value: 'An in-depth look at our Packer to Palletizer Service offerings',
            },
            Icon: undefined,
            Link: {
              value: {
                text: 'Equipment Services Brochure',
                href: '/',
                target: '_blank',
                linktype: 'internal',
              },
            },
          },
        },
        {
          id: 'ede2ccd0-aa0d-4cb5-bea1-f8b9727f2610',
          displayName: 'Flexible or Direct',
          fields: {
            Image: { value: {} },
            Title: {
              value:
                'Flexible or Direct? Choosing Your Package Handling System Design',
            },
            Description: {
              value:
                'Ensure the success of your next project by downloading our white paper',
            },
            Icon: undefined,
            Link: {
              value: {
                text: 'Flexible or Direct? Choosing Your Package Handling System Design',
                href: '/',
                target: '_blank',
                linktype: 'internal',
              },
            },
          },
        },
      ],
      Description: {
        value:
          '<p>For press inquiries, please contact Brandon Campo at&nbsp;<a href="mailto:Brandon.Campo@Intralox.com?subject=Press%20Inquiry" title="Press Inquiry">Brandon.Campo@Intralox.com</a>.</p>',
      },
    };
    const ui = await Default(
      createProps({
        fields,
        params: {
          CardType: { Value: { value: 'base' } },
          TextSize: { Value: { value: 'base' } },
          Theme: { Value: { value: 'default' } },
          IconPosition: { Value: { value: 'left' } },
        },
      }),
    );
    render(ui);
    const groupRoot = screen.getByTestId('quick-link-group');
    expect(groupRoot.tagName.toLowerCase()).toBe('section');
    expect(screen.getByRole('heading', { name: /downloads/i })).toBeInTheDocument();
    const outerList = groupRoot.querySelector('[role="list"]');
    expect(outerList).toBeTruthy();
    expect(outerList).toHaveAttribute('data-ql-group-layout', 'sidebar-column');
    const tiles = screen.getAllByTestId('quick-link-tile');
    expect(tiles).toHaveLength(2);
    expect(tiles[0]).toHaveAttribute('data-variant', 'base');
    expect(tiles[0]).toHaveAttribute('data-icon-position', 'left');
    expect(tiles[0].querySelector('.col-start-2')).toBeNull();
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(2);
    const brochureLink = links.find((l) =>
      l.textContent?.includes('Equipment Services Brochure'),
    );
    expect(brochureLink).toBeTruthy();
    expect(brochureLink!.className).toMatch(/\btext-link\b/);
    expect(brochureLink!.className).toMatch(/\bunderline\b/);
    expect(brochureLink!.className).not.toMatch(/\bfont-bold\b/);
    expect(brochureLink!).toHaveAttribute('rel', 'noopener noreferrer');
    const descriptions = screen.getAllByTestId('sdk-richtext');
    expect(descriptions.length).toBeGreaterThanOrEqual(2);
    expect(descriptions[0].textContent).toMatch(/Packer to Palletizer/);
    expect(descriptions[1].textContent).toMatch(/downloading our white paper/);
    expect(screen.queryByTestId('quick-link-group-description')).not.toBeInTheDocument();
  });

  /** Factory for a sidebar-column download item (no icon, base card type). */
  function makeDownloadLink(
    id: string,
    title: string,
    href: string,
    description?: string,
  ) {
    return {
      id,
      displayName: title,
      fields: {
        Image: { value: {} },
        Title: { value: title },
        Description: { value: description ?? '' },
        Icon: undefined,
        Link: {
          value: { text: title, href, target: '_blank', linktype: 'internal' },
        },
      },
    };
  }

  const downloadsParams = {
    CardType: { Value: { value: 'base' } },
    TextSize: { Value: { value: 'base' } },
    Theme: { Value: { value: 'default' } },
    IconPosition: { Value: { value: 'left' } },
  };

  it('renders a single download link with description', async () => {
    const fields: QuickLinkGroupFields = {
      Headline: { value: 'DOWNLOADS' },
      ListofLinks: [
        makeDownloadLink(
          'dl-single-1',
          'Equipment Services Brochure',
          '/brochures/equipment',
          'An in-depth look at our Packer to Palletizer Service offerings',
        ),
      ],
    };
    const ui = await Default(createProps({ fields, params: downloadsParams }));
    render(ui);

    expect(screen.getByRole('heading', { name: /downloads/i })).toBeInTheDocument();
    const tiles = screen.getAllByTestId('quick-link-tile');
    expect(tiles).toHaveLength(1);

    const list = screen.getByTestId('quick-link-group').querySelector('[role="list"]');
    expect(list).toHaveAttribute('data-ql-group-layout', 'sidebar-column');

    const link = screen.getByRole('link', { name: /equipment services brochure/i });
    expect(link).toBeTruthy();
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');

    const descriptions = screen.getAllByTestId('sdk-richtext');
    expect(descriptions).toHaveLength(1);
    expect(descriptions[0].textContent).toMatch(/Packer to Palletizer/);
  });

  it('renders a single download link without description', async () => {
    const fields: QuickLinkGroupFields = {
      Headline: { value: 'DOWNLOADS' },
      ListofLinks: [
        makeDownloadLink('dl-no-desc-1', 'Product Catalog', '/catalog'),
      ],
    };
    const ui = await Default(createProps({ fields, params: downloadsParams }));
    render(ui);

    expect(screen.getByRole('heading', { name: /downloads/i })).toBeInTheDocument();
    const tiles = screen.getAllByTestId('quick-link-tile');
    expect(tiles).toHaveLength(1);

    const link = screen.getByRole('link', { name: /product catalog/i });
    expect(link).toBeTruthy();

    expect(screen.queryByTestId('sdk-richtext')).not.toBeInTheDocument();
  });

  it('renders three download links all with descriptions', async () => {
    const fields: QuickLinkGroupFields = {
      Headline: { value: 'DOWNLOADS' },
      ListofLinks: [
        makeDownloadLink('dl-3a', 'Brochure A', '/a', 'Description for brochure A'),
        makeDownloadLink('dl-3b', 'Brochure B', '/b', 'Description for brochure B'),
        makeDownloadLink('dl-3c', 'White Paper C', '/c', 'Description for white paper C'),
      ],
    };
    const ui = await Default(createProps({ fields, params: downloadsParams }));
    render(ui);

    const tiles = screen.getAllByTestId('quick-link-tile');
    expect(tiles).toHaveLength(3);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(3);
    expect(links.find((l) => l.textContent?.includes('Brochure A'))).toBeTruthy();
    expect(links.find((l) => l.textContent?.includes('Brochure B'))).toBeTruthy();
    expect(links.find((l) => l.textContent?.includes('White Paper C'))).toBeTruthy();

    const descriptions = screen.getAllByTestId('sdk-richtext');
    expect(descriptions).toHaveLength(3);
    expect(descriptions[0].textContent).toMatch(/brochure A/i);
    expect(descriptions[1].textContent).toMatch(/brochure B/i);
    expect(descriptions[2].textContent).toMatch(/white paper C/i);
  });

  it('renders four download links without any descriptions', async () => {
    const fields: QuickLinkGroupFields = {
      Headline: { value: 'DOWNLOADS' },
      ListofLinks: [
        makeDownloadLink('dl-nd-1', 'Doc One', '/doc-1'),
        makeDownloadLink('dl-nd-2', 'Doc Two', '/doc-2'),
        makeDownloadLink('dl-nd-3', 'Doc Three', '/doc-3'),
        makeDownloadLink('dl-nd-4', 'Doc Four', '/doc-4'),
      ],
    };
    const ui = await Default(createProps({ fields, params: downloadsParams }));
    render(ui);

    const tiles = screen.getAllByTestId('quick-link-tile');
    expect(tiles).toHaveLength(4);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(4);

    expect(screen.queryByTestId('sdk-richtext')).not.toBeInTheDocument();
  });

  it('renders download links with mixed descriptions (some present, some absent)', async () => {
    const fields: QuickLinkGroupFields = {
      Headline: { value: 'DOWNLOADS' },
      ListofLinks: [
        makeDownloadLink(
          'dl-mix-1',
          'Equipment Services Brochure',
          '/brochures/equipment',
          'An in-depth look at our Packer to Palletizer Service offerings',
        ),
        makeDownloadLink('dl-mix-2', 'Quick Start Guide', '/guides/quick-start'),
        makeDownloadLink(
          'dl-mix-3',
          'System Design White Paper',
          '/papers/system-design',
          'Ensure the success of your next project by downloading our white paper',
        ),
      ],
    };
    const ui = await Default(createProps({ fields, params: downloadsParams }));
    render(ui);

    const tiles = screen.getAllByTestId('quick-link-tile');
    expect(tiles).toHaveLength(3);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(3);
    expect(links.find((l) => l.textContent?.includes('Equipment Services Brochure'))).toBeTruthy();
    expect(links.find((l) => l.textContent?.includes('Quick Start Guide'))).toBeTruthy();
    expect(links.find((l) => l.textContent?.includes('System Design White Paper'))).toBeTruthy();

    const descriptions = screen.getAllByTestId('sdk-richtext');
    expect(descriptions).toHaveLength(2);
    expect(descriptions[0].textContent).toMatch(/Packer to Palletizer/);
    expect(descriptions[1].textContent).toMatch(/downloading our white paper/);
  });

  it('renders ListofLinks as quick link tiles with headline when QuickLinkItems is empty', async () => {
    const fields: QuickLinkGroupFields = {
      Headline: { value: 'Questions?' },
      ListofLinks: [
        {
          id: '8bd996e9-1320-4681-bb1a-c12b1cda6914',
          fields: {
            Title: { value: 'Contact Customer Service' },
            Description: { value: '' },
            Image: { value: {} },
            Icon: {
              id: '7378a455-03e7-49d4-87ff-c926d806f6e0',
              fields: { Value: { value: 'phone' } },
            },
            Link: {
              value: {
                text: 'Contact Customer Service',
                href: '/support/phone-numbers',
                target: '_blank',
                linktype: 'internal',
              },
            },
          },
        },
      ],
    };
    const ui = await Default(
      createProps({
        fields,
        params: {
          CardType: { Value: { value: 'Standalone' } },
          TextSize: { Value: { value: 'base' } },
          Theme: { Value: { value: 'default' } },
          IconPosition: { Value: { value: 'left' } },
        },
      }),
    );
    render(ui);
    expect(screen.getByTestId('quick-link-group').tagName.toLowerCase()).toBe('section');
    expect(screen.getByRole('heading', { name: /questions\?/i })).toBeInTheDocument();
    const outerList = screen.getByTestId('quick-link-group').querySelector('[role="list"]');
    expect(outerList).toBeTruthy();
    expect(outerList).toHaveAttribute('data-ql-group-layout', 'sidebar-column');
    expect(outerList!.className).toMatch(/\bflex-col\b/);
    expect(outerList!.className).toMatch(/\bpx-0\b/);
    expect(outerList!.className).toMatch(/\bmt-0\b/);
    expect(outerList!.className).not.toMatch(/mt-\[var\(--layout-gutter-inline\)\]/);
    expect(outerList!.className).not.toMatch(/px-\[var\(--layout-gutter-inline\)\]/);
    expect(outerList!.className).not.toMatch(/\bborder-b\b/);
    const tiles = screen.getAllByTestId('quick-link-tile');
    expect(tiles).toHaveLength(1);
    expect(tiles[0]).toHaveAttribute('data-icon-position', 'left');
    const contactLink = screen.getByRole('link', { name: /contact customer service/i });
    expect(contactLink.className).toContain('text-font-medium');
    expect(contactLink.className).toMatch(/\btext-ink-primary\b/);
    expect(contactLink.className).toMatch(/\bfont-bold\b/);
    expect(contactLink.className).toContain('leading-[24px]');
    expect(contactLink.className).toMatch(/\bno-underline\b/);
    expect(contactLink.className).toMatch(/\bhover:text-ink-tertiary\b/);
    expect(contactLink.querySelector('svg')).toBeTruthy();
  });

  it('renders a flex list of quick link tiles from QuickLinkItems', async () => {
    const fields: QuickLinkGroupFields = {
      QuickLinkCount: {
        fields: { Value: { value: '3' } },
      },
      QuickLinkItems: [
        {
          id: 'a',
          fields: {
            Title: { value: 'One' },
            Description: { value: 'Desc one' },
            Icon: {
              fields: { Value: { value: 'phone' } },
            },
          },
        },
        {
          id: 'b',
          fields: {
            Title: { value: 'Two' },
            Description: { value: 'Desc two' },
            Icon: {
              fields: { Value: { value: 'mail' } },
            },
          },
        },
      ],
    };
    const ui = await Default(
      createProps({
        fields,
        params: { CardType: { Value: { value: 'base' } } },
      }),
    );
    render(ui);
    const groupRoot = screen.getByTestId('quick-link-group');
    expect(groupRoot).toBeInTheDocument();
    const outerList = groupRoot.querySelector('[role="list"]');
    expect(outerList).toBeTruthy();
    expect(outerList!.className).toMatch(/\bflex\b/);
    expect(outerList!.className).toMatch(/flex-col/);
    expect(outerList!.className).toMatch(/flex-nowrap/);
    expect(outerList!.className).toMatch(/\bpx-0\b/);
    const tiles = screen.getAllByTestId('quick-link-tile');
    expect(tiles).toHaveLength(2);
    expect(tiles[0]).toHaveAttribute('data-variant', 'base');
  });

  it('applies card-variant list item spacing and typography on tiles', async () => {
    const fields: QuickLinkGroupFields = {
      QuickLinkCount: {
        fields: { Value: { value: '3' } },
      },
      QuickLinkItems: [
        {
          id: 'a',
          fields: {
            Title: { value: 'One' },
            Icon: { fields: { Value: { value: 'phone' } } },
          },
        },
      ],
    };
    const ui = await Default(
      createProps({
        fields,
        params: { CardType: { Value: { value: 'card' } } },
      }),
    );
    render(ui);
    const tile = screen.getByTestId('quick-link-tile');
    expect(tile).toHaveAttribute('data-variant', 'card');
    const groupRoot = screen.getByTestId('quick-link-group');
    const outerList = groupRoot.querySelector('[role="list"]');
    expect(outerList).toBeTruthy();
    expect(outerList!.className).toMatch(/\bgap-6\b/);
    expect(outerList!.className).toMatch(/\bjustify-center\b/);
    expect(outerList!.className).toMatch(
      /px-\[length:var\(--layout-gutter-inline\)\]/,
    );
    expect(outerList!.className).toMatch(
      /min-\[768px\]:max-\[length:var\(--link-group-max-width-tablet\)\]/,
    );
    expect(outerList!.className).toMatch(/max-\[767px\]:\[grid-template-columns:1fr\]/);
    expect(outerList!.className).not.toMatch(
      /min-\[600px\]:max-\[767px\]:\[grid-template-columns/,
    );
    expect(outerList!.className).toMatch(/min-\[768px\]:w-full/);
    expect(outerList!.className).toMatch(
      /min-\[768px\]:max-\[991px\]:\[grid-template-columns:repeat\(2,minmax\(0,var\(--ql-group-card-w-md\)\)\)\]/,
    );
    expect(tile.className).toContain('h-auto');
    expect(tile.className).toMatch(/p-0!/);
    expect(tile.className).toMatch(/px-0!/);
    expect(tile.className).toContain('w-full');
    expect(tile.className).not.toContain('min-[1200px]:max-w-[min(var(--ql-group-card-w-xl),100%)]');
    expect(tile.className).toMatch(/\btext-ink-primary\b/);
    expect(tile.className).toContain('leading-[24px]');
    expect(tile.className).not.toContain('mt-12');
  });

  it('adds indent-bottom padding classes on component-content when Styles Value requests it', async () => {
    const fields: QuickLinkGroupFields = {
      QuickLinkCount: { fields: { Value: { value: '3' } } },
      QuickLinkItems: [
        {
          id: 'a',
          fields: {
            Title: { value: 'One' },
            Icon: { fields: { Value: { value: 'phone' } } },
          },
        },
      ],
    };
    const ui = await Default(
      createProps({
        fields,
        params: {
          CardType: { Value: { value: 'base' } },
          Styles: { Value: { value: 'indent-bottom' } },
        },
      }),
    );
    render(ui);
    const groupRoot = screen.getByTestId('quick-link-group');
    const content = groupRoot.querySelector('.component-content');
    expect(content).toBeTruthy();
    expect(content!.className).toMatch(/\bpb-12\b/);
    expect(content!.className).toMatch(/\bmd:pb-20\b/);
  });

  it('applies column count from QuickLinkCount to base tile flex widths', async () => {
    const fields: QuickLinkGroupFields = {
      QuickLinkCount: {
        fields: { Value: { value: '4' } },
      },
      QuickLinkItems: [
        {
          id: 'a',
          fields: {
            Title: { value: 'One' },
            Icon: { fields: { Value: { value: 'phone' } } },
          },
        },
      ],
    };
    const ui = await Default(
      createProps({
        fields,
        params: { CardType: { Value: { value: 'base' } } },
      }),
    );
    render(ui);
    const tile = screen.getByTestId('quick-link-tile');
    expect(tile.className).toContain('w-full');
    expect(tile.className).toContain('min-w-0');
  });

  it('renders base tiles with separate "Learn More" link below description', async () => {
    const fields: QuickLinkGroupFields = {
      QuickLinkItems: [
        {
          id: 'expertise-1',
          fields: {
            Title: { value: 'Expertise' },
            Description: { value: '<p>Our team can help manage risk.</p>' },
            Image: { value: { src: '/icons/expertise.png', alt: 'Expertise icon' } },
            Link: {
              value: {
                text: 'Learn More',
                href: '/solutions/expertise',
                linktype: 'internal',
              },
            },
          },
        },
        {
          id: 'service-2',
          fields: {
            Title: { value: 'Service' },
            Description: { value: '<p>Our team can help you identify challenges.</p>' },
            Image: { value: { src: '/icons/service.png', alt: 'Service icon' } },
            Link: {
              value: {
                text: 'Learn More',
                href: '/solutions/service',
                linktype: 'internal',
              },
            },
          },
        },
      ],
    };
    const ui = await Default(
      createProps({
        fields,
        params: {
          CardType: { Value: { value: 'base' } },
          IconPosition: { Value: { value: 'left' } },
        },
      }),
    );
    render(ui);
    const tiles = screen.getAllByTestId('quick-link-tile');
    expect(tiles).toHaveLength(2);
    expect(tiles[0]).toHaveAttribute('data-variant', 'base');
    expect(tiles[0]).toHaveAttribute('data-icon-position', 'left');
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(2);
    const learnMoreLinks = links.filter((l) => l.textContent?.includes('Learn More'));
    expect(learnMoreLinks).toHaveLength(2);
    expect(learnMoreLinks[0]).toHaveAttribute('href', '/solutions/expertise');
    expect(learnMoreLinks[1]).toHaveAttribute('href', '/solutions/service');
    expect(learnMoreLinks[0].className).toMatch(/\bgroup\b/);
    const learnMoreRow = learnMoreLinks[0].querySelector('span.text-link');
    expect(learnMoreRow?.className).toContain('group-hover:text-link-strong');
  });

  it('renders base "Learn More" CTA links in editing mode (page builder parity)', async () => {
    const fields: QuickLinkGroupFields = {
      QuickLinkItems: [
        {
          id: 'expertise-editing',
          fields: {
            Title: { value: 'Expertise' },
            Description: { value: '<p>Our team can help manage risk.</p>' },
            Link: {
              value: {
                text: 'Learn More',
                href: '/solutions/expertise',
                linktype: 'internal',
              },
            },
          },
        },
      ],
    };
    const ui = await Default(
      createProps({
        fields,
        page: editingPage,
        params: {
          CardType: { Value: { value: 'base' } },
          IconPosition: { Value: { value: 'left' } },
        },
      }),
    );
    render(ui);
    const learnMoreLink = screen.getByRole('link', { name: /learn more/i });
    expect(learnMoreLink).toHaveAttribute('href', '/solutions/expertise');
    expect(learnMoreLink.className).toMatch(/\btext-link\b/);
    expect(screen.getByRole('heading', { name: /expertise/i })).toBeInTheDocument();
  });

  it('renders Case Studies and Downloads as stacked rail lists with matching download tiles', async () => {
    const fields: QuickLinkGroupFields = {
      Headline: { value: 'DOWNLOADS' },
      QuickLinkItems: [
        {
          id: 'cs-1',
          fields: {
            Title: { value: 'Amadori' },
            Description: { value: '<p>ARB Sorter performance for Amadori.</p>' },
            Link: {
              value: {
                text: 'Amadori',
                href: '/case-studies/amadori',
                linktype: 'internal',
              },
            },
          },
        },
      ],
      ListofLinks: [
        makeDownloadLink(
          'dl-1',
          'Equipment Services Brochure',
          '/brochures/equipment',
          'An in-depth look at our Packer to Palletizer Service offerings',
        ),
      ],
    };
    const ui = await Default(
      createProps({
        fields,
        params: downloadsParams,
      }),
    );
    render(ui);
    const groupRoot = screen.getByTestId('quick-link-group');
    const layout = groupRoot.querySelector('[data-ql-group-layout="stacked-sidebar-rail"]');
    expect(layout).toBeTruthy();
    expect(layout?.className).toMatch(/\bflex-col\b/);
    const divider = screen.getByTestId('quick-link-group-sidebar-divider');
    expect(divider).toBeInTheDocument();
    expect(divider.className).toMatch(/\bborder-t\b/);
    expect(screen.getByRole('heading', { name: /case studies/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /downloads/i })).toBeInTheDocument();
    const tiles = screen.getAllByTestId('quick-link-tile');
    expect(tiles).toHaveLength(2);
    const brochureLink = screen.getByRole('link', { name: /equipment services brochure/i });
    expect(brochureLink).toHaveAttribute('href', '/brochures/equipment');
    expect(brochureLink.className).toMatch(/\btext-link\b/);
    expect(brochureLink.className).toMatch(/\bunderline\b/);
    const descriptions = screen.getAllByTestId('sdk-richtext');
    expect(descriptions[1].textContent).toMatch(/Packer to Palletizer/);
    expect(screen.getByRole('link', { name: /amadori/i })).toHaveAttribute(
      'href',
      '/case-studies/amadori',
    );
  });

  it('renders sidebar rail label from Link field when Title is empty (preview)', async () => {
    const fields: QuickLinkGroupFields = {
      Headline: { value: 'DOWNLOADS' },
      ListofLinks: [
        {
          id: 'dl-link-only',
          fields: {
            Title: { value: '' },
            Description: { value: 'Brochure description' },
            Image: { value: {} },
            Link: {
              value: {
                text: 'Equipment Services Brochure',
                href: '/brochures/equipment',
                target: '_blank',
                linktype: 'media',
              },
            },
          },
        },
      ],
    };
    const ui = await Default(
      createProps({
        fields,
        params: downloadsParams,
      }),
    );
    render(ui);
    const link = screen.getByRole('link', { name: /equipment services brochure/i });
    expect(link).toHaveAttribute('href', '/brochures/equipment');
  });

  it('renders Questions rail from Link field when Title is empty (editing)', async () => {
    const fields: QuickLinkGroupFields = {
      Headline: { value: 'Questions?' },
      ListofLinks: [
        {
          id: 'ql-link-only',
          fields: {
            Title: { value: '' },
            Description: { value: '' },
            Image: { value: {} },
            Icon: {
              id: '7378a455-03e7-49d4-87ff-c926d806f6e0',
              fields: { Value: { value: 'phone' } },
            },
            Link: {
              value: {
                text: 'Contact Customer Service',
                href: '',
                linktype: 'internal',
              },
            },
          },
        },
      ],
    };
    const ui = await Default(
      createProps({
        fields,
        page: editingPage,
        params: {
          CardType: { Value: { value: 'Standalone' } },
          TextSize: { Value: { value: 'base' } },
          Theme: { Value: { value: 'default' } },
          IconPosition: { Value: { value: 'left' } },
        },
      }),
    );
    render(ui);
    expect(screen.getByTestId('sdk-link')).toHaveTextContent('Contact Customer Service');
  });

  it('renders download title links in editing mode (page builder parity)', async () => {
    const fields: QuickLinkGroupFields = {
      Headline: { value: 'DOWNLOADS' },
      ListofLinks: [
        makeDownloadLink(
          'dl-edit-1',
          'Equipment Services Brochure',
          '/brochures/equipment',
          'An in-depth look at our Packer to Palletizer Service offerings',
        ),
      ],
    };
    const ui = await Default(
      createProps({
        fields,
        page: editingPage,
        params: downloadsParams,
      }),
    );
    render(ui);
    const link = screen.getByRole('link', { name: /equipment services brochure/i });
    expect(link).toHaveAttribute('href', '/brochures/equipment');
    expect(link.className).toMatch(/\btext-link\b/);
    expect(link.className).toMatch(/\bunderline\b/);
  });

  it('renders base tiles in single-column layout with full-width items', async () => {
    const fields: QuickLinkGroupFields = {
      QuickLinkCount: { fields: { Value: { value: '3' } } },
      QuickLinkItems: [
        {
          id: 'tech-1',
          fields: {
            Title: { value: 'Technology' },
            Description: { value: '<p>High performance across applications.</p>' },
            Image: { value: { src: '/icons/tech.png', alt: 'Tech' } },
            Link: { value: { text: 'Learn More', href: '/tech' } },
          },
        },
      ],
    };
    const ui = await Default(
      createProps({
        fields,
        params: { CardType: { Value: { value: 'base' } } },
      }),
    );
    render(ui);
    const groupRoot = screen.getByTestId('quick-link-group');
    const outerList = groupRoot.querySelector('[role="list"]');
    expect(outerList!.className).toMatch(/\bflex-col\b/);
    const tile = screen.getByTestId('quick-link-tile');
    expect(tile.className).toContain('w-full');
    expect(tile.className).not.toContain('md:w-1/2');
    expect(tile.className).not.toContain('lg:w-1/3');
  });

  it('uses link field text as "Learn More" link label and falls back gracefully', async () => {
    const fields: QuickLinkGroupFields = {
      QuickLinkItems: [
        {
          id: 'fallback-link',
          fields: {
            Title: { value: 'Item' },
            Description: { value: '' },
            Link: { value: { text: '', href: '/page' } },
          },
        },
      ],
    };
    const ui = await Default(
      createProps({
        fields,
        params: {
          CardType: { Value: { value: 'base' } },
          IconPosition: { Value: { value: 'left' } },
        },
      }),
    );
    render(ui);
    const links = screen.getAllByRole('link');
    const learnMoreLink = links.find((l) => l.textContent?.match(/Quick Link/i));
    expect(learnMoreLink).toBeTruthy();
  });

  it('renders title as h2 heading inside the clickable card wrapper', async () => {
    const fields: QuickLinkGroupFields = {
      QuickLinkItems: [
        {
          id: 'heading-check',
          fields: {
            Title: { value: 'Expertise' },
            Description: { value: '<p>Desc</p>' },
            Link: { value: { text: 'Learn More', href: '/expertise' } },
          },
        },
      ],
    };
    const ui = await Default(
      createProps({
        fields,
        params: {
          CardType: { Value: { value: 'base' } },
          IconPosition: { Value: { value: 'left' } },
        },
      }),
    );
    render(ui);
    const heading = screen.getByRole('heading', { name: /expertise/i });
    expect(heading.tagName.toLowerCase()).toBe('h2');
    const cardLink = heading.closest('a');
    expect(cardLink).not.toBeNull();
    expect(cardLink).toHaveAttribute('href', '/expertise');
  });
});
