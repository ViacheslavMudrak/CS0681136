import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const mockPathname = vi.hoisted(() => ({ current: '/Corp/en/deep/page' }));
const mockSearchParams = vi.hoisted(() => ({ current: '' }));
const mockRouteParams = vi.hoisted(() => ({ site: 'Corp', locale: 'en' }));
const mockIsPreview = vi.hoisted(() => ({ current: false }));

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname.current,
  useSearchParams: () => new URLSearchParams(mockSearchParams.current),
  useParams: () => mockRouteParams,
}));

vi.mock('@sitecore-content-sdk/nextjs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sitecore-content-sdk/nextjs')>();
  const React = await import('react');
  return {
    ...actual,
    Link: ({
      field,
      children,
      className,
      ...rest
    }: {
      field?: { value?: { href?: string; querystring?: string; text?: string } };
      children?: React.ReactNode;
      className?: string;
    }) => {
      const href = field?.value?.href ?? '';
      const qs = field?.value?.querystring?.trim();
      const fullHref = qs ? `${href}?${qs}` : href;
      return (
        <a href={fullHref} className={className} {...rest}>
          {children}
        </a>
      );
    },
    useSitecore: () => ({
      page: { mode: { isPreview: mockIsPreview.current, isEditing: false } },
    }),
  };
});

import { Default } from 'components/local-navigation/LocalNavigation';
import { LocalNavigationClient } from 'components/local-navigation/partial/LocalNavigationClient';
import type { LocalNavigationProps } from 'components/local-navigation/LocalNavigation.type';
import type { LocalNavResolvedItem } from 'components/local-navigation/LocalNavigation.type';

function createPage(overrides: Partial<LocalNavigationProps['page']> = {}): LocalNavigationProps['page'] {
  return {
    mode: { isEditing: false },
    layout: {
      sitecore: {
        route: {
          fields: { ShowSubNavigation: { value: true } },
        },
      },
    },
    ...overrides,
  } as LocalNavigationProps['page'];
}

function createProps(overrides: Partial<LocalNavigationProps> = {}): LocalNavigationProps {
  return {
    rendering: overrides.rendering ?? ({ uid: 'local-nav-test', componentName: 'LocalNavigation' } as never),
    page: createPage(overrides.page as never),
    params: {
      RenderingIdentifier: 'local-nav-rendering-id',
      styles: 'ln-custom-style',
      ...overrides.params,
    },
    fields: overrides.fields,
  } as LocalNavigationProps;
}

describe('LocalNavigation Default', () => {
  it('renders nothing when sub-navigation is off and not editing', () => {
    mockPathname.current = '/Corp/en/deep/page';
    const { container } = render(
      <Default
        {...createProps({
          page: createPage({
            mode: { isEditing: false },
            layout: {
              sitecore: {
                route: { fields: { ShowSubNavigation: { value: false } } },
              },
            },
          } as never),
          fields: {
            PrimaryLinkList: [
              {
                id: 'p1',
                fields: { Link: { value: { href: '/deep', text: 'Section' } } },
              },
            ],
          },
        })}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing on site home when not editing even if sub-navigation is on', () => {
    mockPathname.current = '/Corp/en';
    const { container } = render(
      <Default
        {...createProps({
          fields: {
            PrimaryLinkList: [
              {
                id: 'p1',
                fields: { Link: { value: { href: '/x', text: 'Section' } } },
              },
            ],
          },
        })}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows empty hint in editing mode when no primary or secondary links', () => {
    mockPathname.current = '/Corp/en/deep/page';
    render(
      <Default
        {...createProps({
          page: createPage({ mode: { isEditing: true } } as never),
          fields: {},
        })}
      />,
    );
    expect(screen.getByText('Local navigation')).toHaveClass('is-empty-hint');
  });

  it('renders nav landmark with primary label when sub-navigation is on and path is not home', () => {
    mockPathname.current = '/Corp/en/deep/page';
    render(
      <Default
        {...createProps({
          fields: {
            PrimaryLinkList: [
              {
                id: 'p1',
                fields: { Link: { value: { href: '/deep', text: 'My Section' } } },
              },
            ],
            SecondaryLinkList: [
              {
                id: 's1',
                fields: { Link: { value: { href: '/deep/a', text: 'Child A' } } },
              },
            ],
          },
        })}
      />,
    );

    const nav = screen.getByRole('navigation', { name: 'Local navigation' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'My Section' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Child A' })).toBeInTheDocument();

    const root = document.querySelector('.component.local-navigation');
    expect(root).toHaveClass('ln-custom-style');
    expect(root).toHaveAttribute('id', 'local-nav-rendering-id');

    const inner = document.querySelector('[data-slot="navigation-inner"]');
    expect(inner).toHaveClass('max-w-[1440px]');
    expect(inner).toHaveClass('ml-0', 'mr-auto');
    expect(inner?.className).not.toContain('local-navigation-inner');
    expect(inner?.className).not.toContain('mx-auto');
  });

  it('prefixes secondary link hrefs with site and locale for App Router navigation', () => {
    mockPathname.current = '/Corp/en/deep/page';
    mockIsPreview.current = false;
    mockSearchParams.current = '';
    render(
      <Default
        {...createProps({
          fields: {
            PrimaryLinkList: [
              {
                id: 'p1',
                fields: { Link: { value: { href: '/deep', text: 'My Section' } } },
              },
            ],
            SecondaryLinkList: [
              {
                id: 's1',
                fields: { Link: { value: { href: '/deep/a', text: 'Child A' } } },
              },
            ],
          },
        })}
      />,
    );

    const childLink = screen.getByRole('link', { name: 'Child A' });
    expect(childLink).toHaveAttribute('href', '/Corp/deep/a');
  });

  it('appends preview query params to secondary link hrefs in Preview Mode', () => {
    mockPathname.current = '/Corp/en/deep/page';
    mockIsPreview.current = true;
    mockSearchParams.current = 'mode=preview&sc_site=Corp&sc_lang=en&secret=test-secret';
    render(
      <Default
        {...createProps({
          fields: {
            PrimaryLinkList: [
              {
                id: 'p1',
                fields: { Link: { value: { href: '/deep', text: 'My Section' } } },
              },
            ],
            SecondaryLinkList: [
              {
                id: 's1',
                fields: {
                  Link: {
                    value: { href: '/deep/a', text: 'Child A', id: '{child-item-id}' },
                  },
                },
              },
            ],
          },
        })}
      />,
    );

    const childLink = screen.getByRole('link', { name: 'Child A' });
    const href = childLink.getAttribute('href') ?? '';
    expect(href.startsWith('/Corp/deep/a?')).toBe(true);
    const query = new URLSearchParams(href.split('?')[1] ?? '');
    expect(query.get('mode')).toBe('preview');
    expect(query.get('sc_site')).toBe('Corp');
    expect(query.get('route')).toBe('/deep/a');
    expect(query.get('sc_itemid')).toBe('child-item-id');
    mockIsPreview.current = false;
    mockSearchParams.current = '';
  });

  it('renders desktop chevron dropdown when a secondary has nested children', async () => {
    mockPathname.current = '/Corp/en/products/modular-plastic-belting';
    const secondaries: LocalNavResolvedItem[] = [
      {
        id: 'belt-types',
        label: 'Belt Types',
        link: { value: { href: '/products/modular-plastic-belting/belt-types', text: 'Belt Types' } },
        children: [
          {
            id: 'radius',
            label: 'Radius Belts',
            link: { value: { href: '/products/modular-plastic-belting/radius-belts', text: 'Radius Belts' } },
            children: [],
          },
        ],
      },
      {
        id: 'tools',
        label: 'Tools and Components',
        link: { value: { href: '/products/modular-plastic-belting/tools-and-components', text: 'Tools and Components' } },
        children: [],
      },
    ];

    render(
      <LocalNavigationClient
        isEditing={false}
        showSubRoute
        primaries={[
          {
            id: 'hub',
            label: 'Modular Plastic Belting',
            link: { value: { href: '/products/modular-plastic-belting', text: 'Modular Plastic Belting' } },
            children: [],
          },
        ]}
        secondaries={secondaries}
        routeItemGuid="5eae3a7f-c63a-4a5e-9d11-4b9b39356e4b"
      />,
    );

    const beltTypes = screen.getByRole('button', { name: /Belt Types/i });
    expect(beltTypes).toHaveAttribute('aria-haspopup', 'true');
    expect(screen.queryByRole('link', { name: 'Tools and Components' })).not.toHaveAttribute(
      'aria-haspopup',
      'true',
    );

    await act(async () => {
      await userEvent.setup().click(beltTypes);
    });
    expect(screen.getByRole('menu', { name: 'Belt Types' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Radius Belts' })).toBeInTheDocument();
  });

  it('always shows nested mobile submenu rows when a secondary has children', async () => {
    const user = userEvent.setup();
    mockPathname.current = '/Corp/en/products/modular-plastic-belting';
    const secondaries: LocalNavResolvedItem[] = [
      {
        id: 'belt-types',
        label: 'Belt Types',
        link: { value: { href: '/products/modular-plastic-belting/belt-types', text: 'Belt Types' } },
        children: [
          {
            id: 'radius',
            label: 'Radius Belts',
            link: { value: { href: '/products/modular-plastic-belting/radius-belts', text: 'Radius Belts' } },
            children: [],
          },
          {
            id: 'chain',
            label: 'Chain Belts',
            link: { value: { href: '/products/modular-plastic-belting/chain-belts', text: 'Chain Belts' } },
            children: [],
          },
        ],
      },
    ];

    render(
      <LocalNavigationClient
        isEditing={false}
        showSubRoute
        primaries={[
          {
            id: 'hub',
            label: 'Modular Plastic Belting',
            link: { value: { href: '/products/modular-plastic-belting', text: 'Modular Plastic Belting' } },
            children: [],
          },
        ]}
        secondaries={secondaries}
      />,
    );

    const toggle = screen.getByRole('button', { name: /open section navigation/i });
    await act(async () => {
      await user.click(toggle);
    });

    expect(screen.getByRole('link', { name: 'Radius Belts' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Chain Belts' })).toBeInTheDocument();
  });
});
