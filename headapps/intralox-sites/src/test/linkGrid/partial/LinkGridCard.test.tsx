import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const React = await import('react');
  return {
    RichText: ({ field, tag: Tag = 'div', className }: { field?: { value?: string }; tag?: string; className?: string }) =>
      React.createElement(Tag ?? 'div', { className, 'data-testid': 'richtext' }, field?.value ?? ''),
  };
});

vi.mock('components/shared/ImageView/ImageView', () => ({
  ImageView: () => <img alt="" src="/mock.jpg" data-testid="image-view" />,
}));

vi.mock('components/callToAction/partial/LinkVIew', () => ({
  default: ({ children, link, className }: { children: React.ReactNode; link?: { value?: { href?: string } }; className?: string }) => (
    <a href={link?.value?.href} className={className} data-testid="link-view">
      {children}
    </a>
  ),
}));

vi.mock('@laitram-l-l-c/intralox-ui-components', async () => {
  const actual = await vi.importActual<typeof import('@laitram-l-l-c/intralox-ui-components')>(
    '@laitram-l-l-c/intralox-ui-components',
  );
  return actual;
});

import { LinkGridCard, isLinkGridListingClickable } from 'components/linkGrid/partial/LinkGridCard';
import type { IServiceListingsFields } from 'components/linkGrid/LinkGrid.type';

describe('isLinkGridListingClickable', () => {
  it('returns true for a valid URL', () => {
    expect(isLinkGridListingClickable('/page')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isLinkGridListingClickable('')).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isLinkGridListingClickable(undefined)).toBe(false);
  });

  it('returns false for whitespace-only string', () => {
    expect(isLinkGridListingClickable('   ')).toBe(false);
  });
});

const baseItem: IServiceListingsFields = {
  Title: 'Service A',
  LinkURL: '/service-a',
  Image: 'https://example.com/a.jpg',
  Description: 'Description A',
  SubIndustries: [],
};

describe('LinkGridCard', () => {
  it('renders as a link when LinkURL is set (isClickable=true)', () => {
    render(<LinkGridCard item={baseItem} size="base" />);
    expect(screen.getByTestId('link-view')).toHaveAttribute('href', '/service-a');
  });

  it('renders as article when LinkURL is empty (isClickable=false)', () => {
    const { container } = render(<LinkGridCard item={{ ...baseItem, LinkURL: '' }} size="base" />);
    expect(container.querySelector('article')).toBeTruthy();
    expect(screen.queryByTestId('link-view')).toBeFalsy();
  });

  it('renders image when Image is set', () => {
    render(<LinkGridCard item={baseItem} size="base" />);
    expect(screen.getByTestId('image-view')).toBeTruthy();
  });

  it('does not render image when Image is empty', () => {
    render(<LinkGridCard item={{ ...baseItem, Image: '' }} size="base" />);
    expect(screen.queryByTestId('image-view')).toBeFalsy();
  });

  it('renders compact size card', () => {
    const { container } = render(<LinkGridCard item={baseItem} size="compact" />);
    expect(container.querySelector('a')).toBeTruthy();
  });

  it('renders standalone size card', () => {
    render(<LinkGridCard item={baseItem} size="standalone" />);
    expect(screen.getByTestId('link-view')).toBeInTheDocument();
  });

  it('renders with dark color scheme', () => {
    const { container } = render(
      <LinkGridCard item={baseItem} size="base" linkCardColorScheme="dark" />,
    );
    expect(container.querySelector('.bg-chrome-bar')).toBeTruthy();
  });

  it('renders sub-industries as a div (isSubIndustries=true) with links', () => {
    const itemWithSubIndustries: IServiceListingsFields = {
      ...baseItem,
      SubIndustries: [
        { Title: 'Sub A', Url: '/sub-a' },
        { Title: 'Sub B', Url: '/sub-b' },
      ],
    };
    const { container } = render(
      <LinkGridCard item={itemWithSubIndustries} size="standalone" hasSubIndustries={true} />,
    );
    // isSubIndustries=true renders as div, not link or article
    expect(container.querySelector('ul')).toBeTruthy();
    expect(screen.getAllByTestId('link-view')).toHaveLength(3);
  });

  it('renders chevron when isClickable and size is base', () => {
    const { container } = render(<LinkGridCard item={baseItem} size="base" />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('renders standalone card with sub-industry title link and chevron', () => {
    const itemWithSubIndustries: IServiceListingsFields = {
      ...baseItem,
      SubIndustries: [{ Title: 'Sub', Url: '/sub' }],
    };
    render(
      <LinkGridCard item={itemWithSubIndustries} size="standalone" hasSubIndustries={true} />,
    );
    expect(screen.getByText('Sub')).toBeInTheDocument();
  });

  it('renders mobile card without cover objectFit', () => {
    render(<LinkGridCard item={baseItem} size="standalone" isMobile={true} />);
    expect(screen.getByTestId('image-view')).toBeInTheDocument();
  });

  it('renders sub-industry with dark scheme link color', () => {
    const itemWithSubIndustries: IServiceListingsFields = {
      ...baseItem,
      SubIndustries: [{ Title: 'Sub Dark', Url: '/sub-dark' }],
    };
    render(
      <LinkGridCard
        item={itemWithSubIndustries}
        size="standalone"
        hasSubIndustries={true}
        linkCardColorScheme="dark"
      />,
    );
    expect(screen.getByText('Sub Dark')).toBeInTheDocument();
  });
});
