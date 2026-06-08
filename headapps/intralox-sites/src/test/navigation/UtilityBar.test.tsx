import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({})),
}));

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const React = await import('react');
  return {
    Link: ({
      field,
      children,
      className,
    }: {
      field?: { value?: { href?: string; text?: string } };
      children?: React.ReactNode;
      className?: string;
    }) => (
      <a href={field?.value?.href} className={className} data-testid="sdk-link">
        {children}
      </a>
    ),
    useSitecore: vi.fn(() => ({
      page: { language: 'en', locale: 'en', mode: { isEditing: false } },
    })),
  };
});

vi.mock('components/navigation/partial/NavigationIcons', () => ({
  FaIconFromCms: ({ cssClass }: { cssClass?: string }) =>
    cssClass ? <i className={cssClass} data-testid="fa-icon" /> : null,
  HEADER_ICON_DEFAULTS: { language: 'fa-regular fa-globe', utilityPhone: 'fa-solid fa-phone' },
  UI_ICONS: { chevronDown: <span data-testid="chevron-down" /> },
}));

vi.mock('components/navigation/navigationUtils', async () => {
  const actual = await vi.importActual<typeof import('components/navigation/navigationUtils')>(
    'components/navigation/navigationUtils',
  );
  return {
    ...actual,
    getPageContentLanguage: vi.fn(() => 'en'),
  };
});

import { UtilityBar } from 'components/navigation/partial/UtilityBar';
import type { LanguageItem, TopNavLinkItem } from 'components/navigation/Navigation.type';

function makeLangItem(id: string, label: string): LanguageItem {
  return {
    id,
    displayName: label,
    fields: {
      Title: { value: label },
      LanguageSource: { name: id, displayName: label },
    },
  } as never;
}

function makeNavLink(id: string, href: string, title: string): TopNavLinkItem {
  return {
    id,
    displayName: title,
    fields: {
      Title: { value: title },
      Link: { value: { href, text: title } },
    },
  } as never;
}

const baseProps = {
  topNavLinks: [] as TopNavLinkItem[],
  languages: [] as LanguageItem[],
  languageTitle: 'Language',
  isEditing: false,
};

describe('UtilityBar', () => {
  beforeEach(() => {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.getElementById('layout-sticky-chrome')?.style.removeProperty('padding-right');
  });

  it('renders navigation region', () => {
    render(<UtilityBar {...baseProps} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders top nav links', () => {
    const links = [makeNavLink('l1', '/about', 'About'), makeNavLink('l2', '/contact', 'Contact')];
    render(<UtilityBar {...baseProps} topNavLinks={links} />);
    expect(screen.getAllByTestId('sdk-link')).toHaveLength(2);
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('does not render nav link with empty href when not editing', () => {
    const links = [makeNavLink('l1', '', 'Empty Link')];
    render(<UtilityBar {...baseProps} topNavLinks={links} />);
    expect(screen.queryByText('Empty Link')).toBeFalsy();
  });

  it('renders language switcher button when languages are provided', () => {
    const langs = [makeLangItem('en', 'English'), makeLangItem('fr', 'French')];
    render(<UtilityBar {...baseProps} languages={langs} />);
    expect(screen.getByRole('button', { name: /language/i })).toBeInTheDocument();
  });

  it('does not render language switcher when no languages', () => {
    render(<UtilityBar {...baseProps} languages={[]} />);
    expect(screen.queryByRole('button')).toBeFalsy();
  });

  it('opens language dropdown on button click', () => {
    const langs = [makeLangItem('en', 'English'), makeLangItem('fr', 'French')];
    render(<UtilityBar {...baseProps} languages={langs} />);
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'French' })).toBeInTheDocument();
  });

  it('raises utility bar stacking order while the language dropdown is open', () => {
    const langs = [makeLangItem('en', 'English')];
    render(<UtilityBar {...baseProps} languages={langs} />);
    const utilityNav = screen.getByRole('navigation', { name: /utility/i });
    expect(utilityNav).not.toHaveClass('z-[30]');
    fireEvent.click(screen.getByRole('button'));
    expect(utilityNav).toHaveClass('z-[30]');
    fireEvent.click(screen.getByRole('button'));
    expect(utilityNav).not.toHaveClass('z-[30]');
  });

  it('hides the window scrollbar while the language dropdown is open', () => {
    const langs = [makeLangItem('en', 'English'), makeLangItem('fr', 'French')];
    render(<UtilityBar {...baseProps} languages={langs} />);
    fireEvent.click(screen.getByRole('button'));
    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.click(screen.getByRole('button'));
    expect(document.documentElement.style.overflow).toBe('');
    expect(document.body.style.overflow).toBe('');
  });

  it('closes language dropdown on second click', () => {
    const langs = [makeLangItem('en', 'English')];
    render(<UtilityBar {...baseProps} languages={langs} />);
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.click(btn);
    expect(screen.queryByRole('listbox')).toBeFalsy();
  });

  it('closes dropdown when clicking a language option', () => {
    const langs = [makeLangItem('en', 'English'), makeLangItem('fr', 'French')];
    render(<UtilityBar {...baseProps} languages={langs} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('option', { name: 'English' }));
    expect(screen.queryByRole('listbox')).toBeFalsy();
  });

  it('uses fallback label when languageTitle is empty', () => {
    const langs = [makeLangItem('en', 'English')];
    render(<UtilityBar {...baseProps} languages={langs} languageTitle="" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders nav link with phone icon for tel: href', () => {
    const links = [makeNavLink('l1', 'tel:+1234', 'Call Us')];
    render(<UtilityBar {...baseProps} topNavLinks={links} />);
    expect(screen.getByTestId('sdk-link')).toBeInTheDocument();
  });

  it('renders editing mode nav link even with empty href', () => {
    const links = [makeNavLink('l1', '', 'Empty Editing')];
    render(<UtilityBar {...baseProps} topNavLinks={links} isEditing={true} />);
    expect(screen.getByText('Empty Editing')).toBeInTheDocument();
  });

  it('handles ArrowDown on language trigger when closed', () => {
    const langs = [makeLangItem('en', 'English'), makeLangItem('fr', 'French')];
    render(<UtilityBar {...baseProps} languages={langs} />);
    const btn = screen.getByRole('button');
    fireEvent.keyDown(btn, { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('handles ArrowUp on language trigger when closed', () => {
    const langs = [makeLangItem('en', 'English'), makeLangItem('fr', 'French')];
    render(<UtilityBar {...baseProps} languages={langs} />);
    const btn = screen.getByRole('button');
    fireEvent.keyDown(btn, { key: 'ArrowUp' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('handles Escape key on language trigger when open', () => {
    const langs = [makeLangItem('en', 'English')];
    render(<UtilityBar {...baseProps} languages={langs} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('button', { name: /language/i }), { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeFalsy();
  });

  it('handles ArrowDown on language option', () => {
    const langs = [makeLangItem('en', 'English'), makeLangItem('fr', 'French')];
    render(<UtilityBar {...baseProps} languages={langs} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.keyDown(screen.getAllByRole('option')[0], { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('handles ArrowUp on language option (not first)', () => {
    const langs = [makeLangItem('de', 'Deutsch'), makeLangItem('en', 'English')];
    render(<UtilityBar {...baseProps} languages={langs} />);
    fireEvent.click(screen.getByRole('button'));
    const options = screen.getAllByRole('option');
    fireEvent.keyDown(options[1], { key: 'ArrowUp' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('handles ArrowUp on first language option (goes to trigger)', () => {
    const langs = [makeLangItem('en', 'English')];
    render(<UtilityBar {...baseProps} languages={langs} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.keyDown(screen.getAllByRole('option')[0], { key: 'ArrowUp' });
    expect(screen.queryByRole('listbox')).toBeInTheDocument();
  });

  it('handles Home key on language option', () => {
    const langs = [makeLangItem('en', 'English'), makeLangItem('fr', 'French')];
    render(<UtilityBar {...baseProps} languages={langs} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.keyDown(screen.getAllByRole('option')[1], { key: 'Home' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('handles End key on language option', () => {
    const langs = [makeLangItem('en', 'English'), makeLangItem('fr', 'French')];
    render(<UtilityBar {...baseProps} languages={langs} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.keyDown(screen.getAllByRole('option')[0], { key: 'End' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('handles Escape key on language option (closes dropdown)', () => {
    const langs = [makeLangItem('en', 'English'), makeLangItem('fr', 'French')];
    render(<UtilityBar {...baseProps} languages={langs} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.keyDown(screen.getAllByRole('option')[0], { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeFalsy();
  });

  it('renders sorted languages alphabetically', () => {
    const langs = [makeLangItem('fr', 'French'), makeLangItem('de', 'Deutsch'), makeLangItem('en', 'English')];
    render(<UtilityBar {...baseProps} languages={langs} />);
    fireEvent.click(screen.getByRole('button'));
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveTextContent('Deutsch');
    expect(options[1]).toHaveTextContent('English');
    expect(options[2]).toHaveTextContent('French');
  });
});
