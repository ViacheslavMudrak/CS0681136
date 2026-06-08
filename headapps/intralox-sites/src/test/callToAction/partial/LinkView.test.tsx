import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const React = await import('react');
  return {
    Link: ({
      field,
      children,
      className,
    }: {
      field?: { value?: { href?: string } };
      children?: React.ReactNode;
      className?: string;
    }) => (
      <a href={field?.value?.href} className={className} data-testid="sdk-link">
        {children}
      </a>
    ),
    useSitecore: () => ({
      page: { mode: { isEditing: false, isPreview: false } },
    }),
  };
});

vi.mock('@laitram-l-l-c/intralox-ui-components', async () => {
  const actual = await vi.importActual<typeof import('@laitram-l-l-c/intralox-ui-components')>(
    '@laitram-l-l-c/intralox-ui-components',
  );
  return actual;
});

import LinkView from 'components/callToAction/partial/LinkVIew';

const makeLink = (href: string): Parameters<typeof LinkView>[0]['link'] => ({
  value: { href, text: 'Label' },
});

describe('LinkView', () => {
  it('renders tile as anchor when href is set', () => {
    render(
      <LinkView link={makeLink('/page')} isTile className="tile-cls">
        Tile text
      </LinkView>,
    );
    expect(screen.getByRole('link', { name: 'Tile text' })).toHaveAttribute('href', '/page');
    expect(screen.getByText('Tile text')).toBeInTheDocument();
  });

  it('renders tile as div when href is empty', () => {
    const { container } = render(
      <LinkView link={{ value: { href: '', text: '' } }} isTile className="tile-cls">
        No href
      </LinkView>,
    );
    expect(screen.queryByRole('link')).toBeFalsy();
    expect(container.querySelector('div.tile-cls')).toHaveTextContent('No href');
  });

  it('uses SDK Link when editing (tile)', () => {
    render(
      <LinkView link={makeLink('/page')} isTile isEditing className="tile-cls">
        Editable tile
      </LinkView>,
    );
    expect(screen.getByTestId('sdk-link')).toHaveAttribute('href', '/page');
  });

  it('applies pill + contrast classes via ui/Link', () => {
    render(
      <LinkView link={makeLink('/p')} buttonType="pill" contrast>
        Pill
      </LinkView>,
    );
    const a = screen.getByRole('link', { name: 'Pill' });
    expect(a.className).toContain('bg-surface');
    expect(a.className).toContain('text-action');
  });

  it('applies pill theme muted', () => {
    render(
      <LinkView link={makeLink('/p')} buttonType="pill" buttonTheme="muted">
        Muted
      </LinkView>,
    );
    expect(screen.getByRole('link', { name: 'Muted' }).className).toContain('bg-bg-light-gray');
  });

  it('applies pill theme alert', () => {
    render(
      <LinkView link={makeLink('/p')} buttonType="pill" buttonTheme="alert">
        Alert
      </LinkView>,
    );
    expect(screen.getByRole('link', { name: 'Alert' }).className).toContain('bg-warning');
  });

  it('applies more style with contrast', () => {
    render(
      <LinkView link={makeLink('/m')} buttonType="more" contrast>
        More
      </LinkView>,
    );
    expect(screen.getByRole('link', { name: 'More' }).className).toContain('text-ink-inverse');
  });

  it('applies more style without contrast', () => {
    render(
      <LinkView link={makeLink('/m')} buttonType="more">
        More
      </LinkView>,
    );
    expect(screen.getByRole('link', { name: 'More' }).className).toContain('text-action-link');
  });

  it('applies link style (same branch as more)', () => {
    render(
      <LinkView link={makeLink('/l')} buttonType="link">
        Link style
      </LinkView>,
    );
    expect(screen.getByRole('link', { name: 'Link style' }).className).toContain('hover:underline');
  });

  it('uses default pill theme when buttonTheme is omitted', () => {
    render(
      <LinkView link={makeLink('/p')} buttonType="pill">
        Default theme pill
      </LinkView>,
    );
    expect(screen.getByRole('link', { name: 'Default theme pill' }).className).toContain('bg-action');
  });

  it('applies legacy rectangular CTA classes for non-pill/non-link buttonType at runtime', () => {
    render(
      <LinkView link={makeLink('/legacy')} buttonType={'grid' as never}>
        Legacy CTA
      </LinkView>,
    );
    expect(screen.getByRole('link', { name: 'Legacy CTA' }).className).toContain('bg-brand-red');
  });

  it('applies pill contrast theme', () => {
    render(
      <LinkView link={makeLink('/p')} buttonType="pill" buttonTheme="contrast">
        Contrast theme
      </LinkView>,
    );
    expect(screen.getByRole('link', { name: 'Contrast theme' }).className).toContain('bg-surface');
  });

  it('renders icon before label (case-insensitive)', () => {
    const { container } = render(
      <LinkView
        link={makeLink('/i')}
        icon="fa-solid fa-phone"
        iconPosition="Before Label"
      >
        Call
      </LinkView>,
    );
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('renders icon after label', () => {
    const { container } = render(
      <LinkView
        link={makeLink('/i')}
        icon="fa-solid fa-arrow-right"
        iconPosition="After label"
      >
        Next
      </LinkView>,
    );
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('does not render icon span when position does not match', () => {
    const { container } = render(
      <LinkView link={makeLink('/i')} icon="fa-solid fa-star" iconPosition="Center">
        Star
      </LinkView>,
    );
    expect(container.querySelector('svg')).toBeFalsy();
  });

  it('uses SDK Link when editing (non-tile)', () => {
    render(
      <LinkView link={makeLink('/edit')} buttonType="pill" isEditing>
        Edit me
      </LinkView>,
    );
    expect(screen.getByTestId('sdk-link')).toHaveTextContent('Edit me');
  });

  it('renders nothing in preview when href is empty', () => {
    const { container } = render(
      <LinkView link={{ value: { href: '', text: '' } }} buttonType="pill">
        Empty
      </LinkView>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
