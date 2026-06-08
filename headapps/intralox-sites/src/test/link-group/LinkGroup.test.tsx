import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ComponentRendering, Page } from '@sitecore-content-sdk/nextjs';

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const { quickLinkSitecoreSdkMock } = await import('src/test/mocks/viteSafeMocks');
  const base = quickLinkSitecoreSdkMock();
  return {
    ...base,
    RichText: ({
      field,
      className,
    }: {
      field?: { value?: string };
      className?: string;
    }) =>
      field?.value != null ?
        <div data-testid="sdk-richtext" className={className}>
          {field.value}
        </div>
      : null,
  };
});

import { Default } from 'components/link-group/LinkGroup';
import type { LinkGroupFields } from 'components/link-group/LinkGroup.type';

const defaultPage = { mode: { isEditing: false } } as unknown as Page;
const editingPage = { mode: { isEditing: true } } as unknown as Page;
const defaultRendering = { componentName: 'LinkGroup' } as unknown as ComponentRendering;

function createProps(overrides: {
  fields?: LinkGroupFields | undefined;
  params?: Record<string, unknown>;
  page?: Page;
} = {}) {
  return {
    rendering: defaultRendering,
    page: overrides.page ?? defaultPage,
    params: {
      styles: '',
      RenderingIdentifier: 'lg-test-id',
      ...overrides.params,
    },
    fields: overrides.fields as LinkGroupFields | undefined,
  };
}

describe('LinkGroup Default', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty datasource hint when fields are undefined', () => {
    render(<Default {...createProps({ fields: undefined })} />);
    const hint = screen.getByText('Link Group');
    expect(hint).toHaveClass('is-empty-hint');
  });

  it('returns null for visitors when there are no displayable items', () => {
    const { container } = render(
      <Default
        {...createProps({
          fields: { Linkitems: [] },
        })}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows empty list hint in editing when there are no items', () => {
    render(
      <Default
        {...createProps({
          fields: { Linkitems: [] },
          page: editingPage,
        })}
      />,
    );
    expect(screen.getByText('No link items configured')).toBeInTheDocument();
  });

  it('renders raster Icon field as NextImage beside title', () => {
    const fields: LinkGroupFields = {
      Linkitems: [
        {
          id: 'img-1',
          fields: {
            Title: { value: 'Insurance: medical' },
            Icon: {
              value: {
                src: 'https://edge.sitecorecloud.io/icons/icon-stethoscope.png',
                alt: '',
                width: '64',
                height: '65',
              },
            },
            Link: { value: { href: '' } },
          },
        },
      ],
    };
    render(<Default {...createProps({ fields })} />);
    const img = screen.getByTestId('sdk-image');
    expect(img).toHaveAttribute('src', 'https://edge.sitecorecloud.io/icons/icon-stethoscope.png');
    expect(screen.getByText('Insurance: medical')).toBeInTheDocument();
  });

  it('renders Font Awesome icon classes from CMS droplist values', () => {
    const fields: LinkGroupFields = {
      Linkitems: [
        {
          id: 'fa-1',
          fields: {
            Title: { value: 'Medical' },
            Icon: { fields: { Value: { value: 'fas fa-stethoscope' } } },
            Link: { value: { href: '' } },
          },
        },
      ],
    };
    const { container } = render(<Default {...createProps({ fields })} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeTruthy();
  });

  it('maps bare icon names to Font Awesome solid classes', () => {
    const fields: LinkGroupFields = {
      Linkitems: [
        {
          id: 'fa-2',
          fields: {
            Title: { value: 'Savings' },
            Icon: { fields: { Value: { value: 'piggy-bank' } } },
            Link: { value: { href: '' } },
          },
        },
      ],
    };
    const { container } = render(<Default {...createProps({ fields })} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeTruthy();
  });

  it('keeps tiles and list left-aligned when TextAlign is Center (center layout not supported)', () => {
    const fields: LinkGroupFields = {
      Linkitems: [
        { id: 'one', fields: { Title: { value: 'Benefit' }, Link: { value: { href: '' } } } },
      ],
    };
    const { container } = render(
      <Default
        {...createProps({
          fields,
          params: {
            styles: '',
            RenderingIdentifier: 'lg-test-id',
            Columns: { Value: { value: '1' } },
            TextAlign: { Value: { value: 'Center' } },
          },
        })}
      />,
    );
    const list = container.querySelector('[role="list"]');
    expect(list).not.toHaveClass('text-center');
    expect(list).toHaveClass('grid');
    const item = container.querySelector('[role="listitem"]');
    expect(item).toHaveClass('w-full');
    expect(item?.querySelector('[class*="text-center"]')).toBeFalsy();
    const tileTitle = container.querySelector('[role="listitem"] [data-testid="sdk-text"]');
    expect(tileTitle?.className).toContain('text-left');
  });

  it('keeps two-column tiles left-aligned when TextAlign is Center', () => {
    const fields: LinkGroupFields = {
      Linkitems: [
        { id: 'a', fields: { Title: { value: 'Left col' }, Link: { value: { href: '' } } } },
        { id: 'b', fields: { Title: { value: 'Right col' }, Link: { value: { href: '' } } } },
      ],
    };
    const { container } = render(
      <Default
        {...createProps({
          fields,
          params: {
            styles: '',
            RenderingIdentifier: 'lg-test-id',
            Columns: { Value: { value: '2' } },
            TextAlign: { Value: { value: 'Center' } },
          },
        })}
      />,
    );
    expect(container.querySelector('[role="list"]')).not.toHaveClass('text-center');
    const items = container.querySelectorAll('[role="listitem"]');
    expect(items[0]).toHaveClass('w-full');
    expect(items[1]).toHaveClass('w-full');
    expect(items[0]?.querySelector('[class*="text-center"]')).toBeFalsy();
    expect(items[1]?.querySelector('[class*="text-center"]')).toBeFalsy();
  });

  it('renders link items with titles', () => {
    const fields: LinkGroupFields = {
      Linkitems: [
        {
          id: 'a',
          displayName: 'A',
          fields: {
            Title: { value: 'Benefit one' },
            Description: { value: '' },
            Link: { value: { href: '' } },
          },
        },
        {
          id: 'b',
          fields: {
            Title: { value: 'Benefit two' },
          },
        },
      ],
    };
    render(<Default {...createProps({ fields })} />);
    expect(screen.getByText('Benefit one')).toBeInTheDocument();
    expect(screen.getByText('Benefit two')).toBeInTheDocument();
    expect(screen.getByTestId('link-group')).toBeInTheDocument();
  });

  it('wraps tile in SDK link when href is set and not editing', () => {
    const fields: LinkGroupFields = {
      Linkitems: [
        {
          id: 'x',
          fields: {
            Title: { value: 'Go' },
            Link: { value: { href: '/careers', text: 'Careers' } },
          },
        },
      ],
    };
    render(<Default {...createProps({ fields })} />);
    const link = screen.getByTestId('sdk-link');
    expect(link).toHaveAttribute('href', '/careers');
  });

  it('whole-tile link: does not use aria-label when title is visible (WCAG 2.5.3)', () => {
    const fields: LinkGroupFields = {
      Linkitems: [
        {
          id: 'wellness',
          fields: {
            Title: { value: 'On-site wellness clinic, gym, and pharmacy' },
            Description: { value: '<ul><li>Gym access</li></ul>' },
            Link: { value: { href: '/wellness' } },
          },
        },
      ],
    };
    render(<Default {...createProps({ fields })} />);
    const link = screen.getByTestId('sdk-link');
    expect(link).toHaveTextContent('On-site wellness clinic, gym, and pharmacy');
    expect(link).not.toHaveAttribute('aria-label');
  });

  it('does not wrap tile in navigable link when editing', () => {
    const fields: LinkGroupFields = {
      Linkitems: [
        {
          id: 'x',
          fields: {
            Title: { value: 'Go' },
            Link: { value: { href: '/careers', text: 'Careers' } },
          },
        },
      ],
    };
    render(<Default {...createProps({ fields, page: editingPage })} />);
    const links = screen.getAllByTestId('sdk-link');
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Go')).toBeInTheDocument();
  });

  it('renders parent Title and Description header when both are set', () => {
    const fields: LinkGroupFields = {
      Title: { value: 'Section Heading' },
      Description: { value: '<p>Section description</p>' },
      Linkitems: [
        { id: 'a', fields: { Title: { value: 'Tile One' }, Link: { value: { href: '' } } } },
      ],
    };
    render(<Default {...createProps({ fields })} />);
    const sectionTitle = screen.getAllByTestId('sdk-text').find((el) => el.textContent === 'Section Heading');
    expect(sectionTitle).toBeTruthy();
    expect(screen.getByTestId('sdk-richtext')).toBeInTheDocument();
  });

  it('renders parent Title in editing mode with no items', () => {
    const fields: LinkGroupFields = {
      Title: { value: 'Edit Heading' },
      Linkitems: [],
    };
    render(<Default {...createProps({ fields, page: editingPage })} />);
    const titleEl = screen.getAllByTestId('sdk-text').find((el) => el.textContent === 'Edit Heading');
    expect(titleEl).toBeTruthy();
    expect(titleEl).toHaveClass('text-ink-primary');
  });

  it('renders without crashing when styles is undefined', () => {
    const fields: LinkGroupFields = {
      Linkitems: [
        { id: 'a', fields: { Title: { value: 'Tile' }, Link: { value: { href: '' } } } },
      ],
    };
    const { container } = render(<Default {...createProps({ fields, params: { styles: undefined, RenderingIdentifier: '' } })} />);
    const section = container.querySelector('section.link-group');
    expect(section).toBeTruthy();
    expect(section?.className).not.toContain('undefined');
    expect(section).toHaveClass('bg-surface');
  });

  it('uses two-column grid classes when Columns is 2', () => {
    const fields: LinkGroupFields = {
      Linkitems: [
        { id: 'a', fields: { Title: { value: 'A' }, Link: { value: { href: '' } } } },
        { id: 'b', fields: { Title: { value: 'B' }, Link: { value: { href: '' } } } },
      ],
    };
    const { container } = render(
      <Default
        {...createProps({
          fields,
          params: {
            styles: '',
            RenderingIdentifier: 'lg-test-id',
            Columns: { Value: { value: '2' } },
          },
        })}
      />,
    );
    const list = container.querySelector('[role="list"]');
    expect(list).toHaveClass('md:grid-cols-2');
    expect(list).toHaveClass('md:gap-x-[48px]');
  });
});

describe('LinkGroup ColorScheme (render-based)', () => {
  const tileFields: LinkGroupFields = {
    Title: { value: 'Section Heading' },
    Description: { value: '<p>Section description</p>' },
    Linkitems: [
      { id: 'a', fields: { Title: { value: 'Tile' }, Link: { value: { href: '' } } } },
    ],
  };

  it('keeps bg-surface on section root for dark ColorScheme', () => {
    const { container } = render(
      <Default
        {...createProps({
          fields: tileFields,
          params: {
            styles: '',
            RenderingIdentifier: 'lg-test-id',
            ColorScheme: { Value: { value: 'Dark' } },
          },
        })}
      />,
    );
    expect(container.querySelector('section.link-group')).toHaveClass('bg-surface');
  });

  it('uses text-ink-primary on parent headline for dark ColorScheme', () => {
    render(
      <Default
        {...createProps({
          fields: tileFields,
          params: {
            styles: '',
            RenderingIdentifier: 'lg-test-id',
            ColorScheme: { Value: { value: 'Dark' } },
          },
        })}
      />,
    );
    const headline = screen.getAllByTestId('sdk-text').find((el) => el.textContent === 'Section Heading');
    expect(headline).toHaveClass('text-ink-primary');
  });

  it('uses text-ink description utilities when ColorScheme is Light', () => {
    render(
      <Default
        {...createProps({
          fields: tileFields,
          params: {
            styles: '',
            RenderingIdentifier: 'lg-test-id',
            ColorScheme: { Value: { value: 'Light' } },
          },
        })}
      />,
    );
    expect(screen.getByTestId('sdk-richtext')).toHaveClass('!text-ink');
  });

  it('uses text-ink-muted description utilities when ColorScheme is Gray', () => {
    render(
      <Default
        {...createProps({
          fields: tileFields,
          params: {
            styles: '',
            RenderingIdentifier: 'lg-test-id',
            ColorScheme: { Value: { value: 'Gray' } },
          },
        })}
      />,
    );
    expect(screen.getByTestId('sdk-richtext')).toHaveClass('!text-ink-muted');
  });

  it('uses gray tile description tone on rendered tile when ColorScheme is Gray', () => {
    const fields: LinkGroupFields = {
      Linkitems: [
        {
          id: 'a',
          fields: {
            Title: { value: 'Benefit' },
            Description: { value: '<p>Details</p>' },
            Link: { value: { href: '' } },
          },
        },
      ],
    };
    render(
      <Default
        {...createProps({
          fields,
          params: {
            styles: '',
            RenderingIdentifier: 'lg-test-id',
            ColorScheme: { Value: { value: 'Gray' } },
          },
        })}
      />,
    );
    const tileDescription = screen.getAllByTestId('sdk-richtext')[0];
    expect(tileDescription).toHaveClass('text-ink-muted');
    expect(tileDescription).toHaveClass('[&_li]:before:bg-accent-teal');
  });
});
