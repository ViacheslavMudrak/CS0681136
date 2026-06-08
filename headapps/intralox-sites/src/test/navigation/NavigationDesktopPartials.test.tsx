import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    className,
    'aria-label': ariaLabel,
    'aria-current': ariaCurrent,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    'aria-label'?: string;
    'aria-current'?: string;
  }) => (
    <a href={href} className={className} aria-label={ariaLabel} aria-current={ariaCurrent}>
      {children}
    </a>
  ),
}));

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const React = await import('react');
  return {
    Link: ({
      field,
      children,
      className,
      'aria-label': ariaLabel,
    }: {
      field?: { value?: { href?: string; text?: string } };
      children?: React.ReactNode;
      className?: string;
      'aria-label'?: string;
    }) => (
      <a href={field?.value?.href} className={className} aria-label={ariaLabel} data-testid="sdk-link">
        {children ?? field?.value?.text}
      </a>
    ),
    NextImage: ({
      field,
      className,
    }: {
      field?: { value?: { src?: string } };
      className?: string;
    }) => <img src={field?.value?.src} className={className} alt="" data-testid="next-image" />,
    RichText: ({ field, className }: { field?: { value?: string }; className?: string }) => (
      <div className={className} data-testid="richtext">
        {field?.value}
      </div>
    ),
    Text: ({ field, tag: Tag = 'span' }: { field?: { value?: string }; tag?: string }) =>
      React.createElement(Tag ?? 'span', {}, field?.value ?? ''),
  };
});

vi.mock('clsx', () => ({
  clsx: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

vi.mock('components/local-navigation/localNavigationUtils', () => ({
  megaMenuChildRowIsCurrentPage: vi.fn(() => false),
  megaMenuSectionOverviewIsCurrentPage: vi.fn(() => false),
}));

vi.mock('components/navigation/navigationUtils', async () => {
  const actual = await vi.importActual<typeof import('components/navigation/navigationUtils')>(
    'components/navigation/navigationUtils',
  );
  return actual;
});

vi.mock('components/navigation/partial/NavigationIcons', () => ({
  UI_ICONS: { chevronRight: <span data-testid="chevron-right" /> },
  FaIconFromCms: () => null,
  HEADER_ICON_DEFAULTS: {},
}));

import { HeaderLogo } from 'components/navigation/partial/NavigationDesktopPartials';

describe('HeaderLogo', () => {
  it('renders link wrapping logo when not editing', () => {
    render(
      <HeaderLogo
        logo={{ value: { src: '/logo.svg', width: 150, height: 32 } } as never}
        logoAriaLabel="Home"
        isEditing={false}
        isHomePage={false}
        homeHref="/"
      />,
    );
    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).toHaveAttribute('href', '/');
    expect(screen.getByTestId('next-image')).toBeInTheDocument();
  });

  it('renders logo with aria-current=page on home page', () => {
    render(
      <HeaderLogo
        logo={{ value: { src: '/logo.svg', width: 150, height: 32 } } as never}
        logoAriaLabel="Home"
        isEditing={false}
        isHomePage={true}
        homeHref="/"
      />,
    );
    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it('renders div wrapper (not link) when in editing mode', () => {
    const { container } = render(
      <HeaderLogo
        logo={{ value: { src: '/logo.svg' } } as never}
        logoAriaLabel="Home"
        isEditing={true}
        isHomePage={false}
        homeHref="/"
      />,
    );
    expect(container.querySelector('a')).toBeFalsy();
    expect(container.querySelector('div[aria-label="Home"]')).toBeTruthy();
  });

  it('renders text fallback when no logo src and not editing', () => {
    const { container } = render(
      <HeaderLogo
        logo={undefined}
        logoAriaLabel="Home"
        isEditing={false}
        isHomePage={false}
        homeHref="/"
      />,
    );
    expect(container.querySelector('[data-testid="next-image"]')).toBeFalsy();
    expect(container.querySelector('span.text-brand-red')).toBeTruthy();
  });

  it('renders logo image even without src in editing mode (src=undefined)', () => {
    render(
      <HeaderLogo
        logo={{ value: { src: '' } } as never}
        logoAriaLabel="Home"
        isEditing={true}
        isHomePage={false}
        homeHref="/"
      />,
    );
    // In editing mode, NextImage renders even with empty src
    expect(screen.getByTestId('next-image')).toBeInTheDocument();
  });
});
