import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  usePathname: () => '/Corp/en/deep/page',
}));

vi.mock('react-dom', async () => {
  const actual = await vi.importActual<typeof import('react-dom')>('react-dom');
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const React = await import('react');
  return {
    Link: ({
      children,
      className,
    }: {
      children?: React.ReactNode;
      className?: string;
    }) => (
      <a href="#mock-home" className={className}>
        {children}
      </a>
    ),
    Text: ({ field, tag: Tag = 'span' }: { field?: { value?: string }; tag?: string }) =>
      React.createElement(Tag ?? 'span', {}, field?.value ?? ''),
    useSitecore: () => ({ page: { mode: { isEditing: false } } }),
  };
});

vi.mock('components/local-navigation/localNavigationUtils', () => ({
  isAppHomePathname: () => false,
  mainNavItemMatchesCurrentPath: () => false,
  routeShowsSubNavigation: () => false,
}));

vi.mock('components/navigation/partial/NavigationDesktopPartials', () => ({
  HeaderLogo: () => <div data-testid="header-logo" />,
  MegaMenuPanel: () => null,
}));

vi.mock('components/navigation/partial/NavigationSearchPartials', () => ({
  DesktopSearch: () => null,
  MobileControls: () => null,
}));

vi.mock('components/navigation/partial/NavigationMobilePartials', () => ({
  MobileOverlay: () => null,
}));

vi.mock('components/navigation/partial/UtilityBar', () => ({
  UtilityBar: () => null,
}));

import { Default } from 'components/navigation/Navigation';
import type { NavigationProps } from 'components/navigation/Navigation.type';

function createProps(overrides: Partial<NavigationProps> = {}): NavigationProps {
  return {
    rendering: overrides.rendering ?? ({ uid: 'nav-test', componentName: 'Navigation' } as never),
    page: {
      mode: { isEditing: false },
      layout: { sitecore: { route: { fields: {} } } },
      ...overrides.page,
    } as NavigationProps['page'],
    params: {
      RenderingIdentifier: 'nav-rendering-id',
      styles: 'nav-custom-style',
      ...overrides.params,
    },
    fields: overrides.fields,
  } as NavigationProps;
}

describe('Navigation Default', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    document.getElementById = vi.fn().mockReturnValue(null);
  });

  it('renders empty hint when fields are missing', () => {
    render(<Default {...createProps({ fields: undefined as never })} />);
    expect(screen.getByText('Navigation')).toHaveClass('is-empty-hint');
  });

  it('renders SXA-defeating root shell with params.styles', () => {
    render(<Default {...createProps({ fields: {} as never })} />);

    const root = document.querySelector('.component.navigation.header-navigation');
    expect(root).toBeInTheDocument();
    expect(root).toHaveClass('nav-custom-style');
    expect(root).toHaveClass('m-0!');
  });

  it('renders desktop menubar with stretch reset classes when main links exist', () => {
    render(
      <Default
        {...createProps({
          fields: {
            MainNavigationLinks: [
              {
                id: 'main-1',
                fields: { Title: { value: 'Products' } },
              },
            ],
          } as never,
        })}
      />,
    );

    const menubar = screen.getByRole('menubar');
    expect(menubar).toHaveClass('list-none');
    expect(menubar).toHaveClass('pt-0!');
  });
});
