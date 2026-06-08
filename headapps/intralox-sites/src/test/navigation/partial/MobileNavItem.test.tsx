import type { AriaAttributes, ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { megaMenuSectionOverviewIsCurrentPage } from 'components/local-navigation/localNavigationUtils';
import type { MainNavItem } from 'components/navigation/Navigation.type';
import { MobileNavItem } from 'components/navigation/partial/NavigationMobilePartials';

vi.mock('@sitecore-content-sdk/nextjs', () => ({
  Link: ({
    children,
    className,
    editable: _editable,
    target: _target,
    rel: _rel,
    field: _field,
    onClick,
    'aria-current': ariaCurrent,
  }: {
    children?: ReactNode;
    className?: string;
    editable?: boolean;
    target?: string;
    rel?: string;
    field?: unknown;
    onClick?: () => void;
    'aria-current'?: AriaAttributes['aria-current'];
  }) => (
    <a href="#" className={className} aria-current={ariaCurrent} onClick={onClick}>
      {children}
    </a>
  ),
  Text: ({ field }: { field?: { value?: string } }) => <>{field?.value}</>,
  NextImage: () => null,
  RichText: () => null,
}));

describe('MobileNavItem', () => {
  const expandableItem: MainNavItem = {
    id: 'sol',
    fields: {
      Title: { value: 'Solutions' },
      Link: { value: { href: '/Solutions', text: 'Solutions' } },
      ChildLinks: [
        {
          id: 'packer',
          fields: {
            Title: { value: 'Packer' },
            Link: { value: { href: '/Solutions/Packer', text: 'Packer' } },
          },
        },
      ],
    },
  };

  it('keeps expand button idle; Overview link is current on section URL when expanded', async () => {
    const user = userEvent.setup();
    expect(megaMenuSectionOverviewIsCurrentPage('/Corp/en/Solutions', expandableItem, undefined, null)).toBe(
      true
    );

    render(
      <ul>
        <MobileNavItem
          item={expandableItem}
          isEditing={false}
          onLinkClick={vi.fn()}
          pathname="/Corp/en/Solutions"
        />
      </ul>
    );

    expect(screen.getByRole('button', { name: /expand solutions/i })).not.toHaveClass('!bg-stroke-default');
    await user.click(screen.getByRole('button', { name: /expand solutions/i }));
    const overviewOnSection = await screen.findByRole('link', { name: 'Overview' });
    expect(overviewOnSection).toHaveClass('!bg-stroke-default');
  });

  it('Overview is not current on a child URL; expand row still idle', async () => {
    const user = userEvent.setup();
    expect(
      megaMenuSectionOverviewIsCurrentPage('/Corp/en/Solutions/Packer', expandableItem, undefined, null)
    ).toBe(false);

    render(
      <ul>
        <MobileNavItem
          item={expandableItem}
          isEditing={false}
          onLinkClick={vi.fn()}
          pathname="/Corp/en/Solutions/Packer"
        />
      </ul>
    );

    expect(screen.getByRole('button', { name: /expand solutions/i })).not.toHaveClass('!bg-stroke-default');
    await user.click(screen.getByRole('button', { name: /expand solutions/i }));
    const overviewOnChild = await screen.findByRole('link', { name: 'Overview' });
    expect(overviewOnChild).not.toHaveClass('!bg-stroke-default');
  });

  it('marks leaf primary link current when pathname matches', () => {
    const leaf: MainNavItem = {
      id: 'sol-leaf',
      fields: {
        Title: { value: 'Solutions' },
        Link: { value: { href: '/Solutions', text: 'Solutions' } },
        ChildLinks: [],
      },
    };
    expect(megaMenuSectionOverviewIsCurrentPage('/Corp/en/Solutions', leaf, undefined, null)).toBe(true);

    render(
      <ul>
        <MobileNavItem
          item={leaf}
          isEditing={false}
          onLinkClick={vi.fn()}
          pathname="/Corp/en/Solutions"
        />
      </ul>
    );
    const link = screen.getByRole('link', { name: 'Solutions' });
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link).toHaveClass('!bg-stroke-default');
  });
});
