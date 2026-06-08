import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { NavChildItem } from 'components/navigation/Navigation.type';
import { MobileSecondaryItem } from 'components/navigation/partial/NavigationMobilePartials';

vi.mock('@sitecore-content-sdk/nextjs', () => ({
  Link: ({
    children,
    field,
    className,
    onClick,
  }: {
    children?: ReactNode;
    field?: { value?: { href?: string; text?: string } };
    className?: string;
    onClick?: () => void;
  }) => (
    <a href={field?.value?.href ?? '#'} className={className} onClick={onClick}>
      {children}
    </a>
  ),
}));

describe('MobileSecondaryItem', () => {
  it('renders a flat secondary link when there are no ChildLinks', () => {
    const item: NavChildItem = {
      id: 'sec-flat',
      fields: {
        Title: { value: 'Services' },
        Link: { value: { href: '/services', text: 'Services' } },
        ChildLinks: [],
      },
    };

    render(
      <ul>
        <MobileSecondaryItem
          item={item}
          isEditing={false}
          onLinkClick={vi.fn()}
          pathname="/en"
        />
      </ul>,
    );

    expect(screen.getByRole('link', { name: 'Services' })).toHaveAttribute('href', '/services');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows nested ChildLinks behind expand when resolved children exist, without CMS child flags', async () => {
    const user = userEvent.setup();
    const item: NavChildItem = {
      id: 'food',
      fields: {
        Title: { value: 'Food' },
        Link: { value: { href: '/Industries/Food', text: 'Food' } },
        ChildLinks: [
          {
            id: 'ter-1',
            fields: {
              Title: { value: 'Meat' },
              Link: { value: { href: '/Industries/Food/Meat', text: 'Meat' } },
            },
          },
        ],
        ShowChildLinks: { value: false },
        HasChildLinks: { value: false },
      },
    };

    render(
      <ul>
        <MobileSecondaryItem
          item={item}
          isEditing={false}
          onLinkClick={vi.fn()}
          pathname="/en"
        />
      </ul>,
    );

    expect(screen.getByRole('button', { name: /expand food/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Meat' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /expand food/i }));

    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('href', '/Industries/Food');
    expect(screen.getByRole('link', { name: 'Meat' })).toHaveAttribute('href', '/Industries/Food/Meat');
  });

  it('uses expand control when resolved ChildLinks exist', async () => {
    const user = userEvent.setup();
    const item: NavChildItem = {
      id: 'packer',
      fields: {
        Title: { value: 'Packer to Palletizer' },
        Link: { value: { href: '/Solutions/Packer', text: 'Packer to Palletizer' } },
        ChildLinks: [
          {
            id: 'ter-1',
            fields: {
              Title: { value: 'Expertise' },
              Link: { value: { href: '/Solutions/Packer/Expertise', text: 'Expertise' } },
            },
          },
        ],
      },
    };

    render(
      <ul>
        <MobileSecondaryItem
          item={item}
          isEditing={false}
          onLinkClick={vi.fn()}
          pathname="/en"
        />
      </ul>,
    );

    expect(screen.getByRole('button', { name: /expand packer/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Expertise' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /expand packer/i }));

    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('href', '/Solutions/Packer');
    expect(screen.getByRole('link', { name: 'Expertise' })).toHaveAttribute(
      'href',
      '/Solutions/Packer/Expertise',
    );
  });

  it('renders a flat secondary link when tertiary exist but Products suppression is on', () => {
    const item: NavChildItem = {
      id: 'mpb',
      fields: {
        Title: { value: 'Modular Plastic Belting' },
        Link: { value: { href: '/belts', text: 'Modular Plastic Belting' } },
        ChildLinks: [
          {
            id: 'ter-1',
            fields: {
              Title: { value: 'Belt Types' },
              Link: { value: { href: '/belts/types', text: 'Belt Types' } },
            },
          },
        ],
      },
    };

    render(
      <ul>
        <MobileSecondaryItem
          item={item}
          isEditing={false}
          onLinkClick={vi.fn()}
          pathname="/en"
          suppressSecondaryTertiaryExpand
        />
      </ul>,
    );

    expect(screen.getByRole('link', { name: 'Modular Plastic Belting' })).toHaveAttribute(
      'href',
      '/belts',
    );
    expect(screen.queryByRole('button', { name: /expand/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Belt Types' })).not.toBeInTheDocument();
  });
});
