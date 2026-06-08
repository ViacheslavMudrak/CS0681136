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

import MediaCardView from 'components/shared/MediaCardView';

const makeLink = (href: string): Parameters<typeof MediaCardView>[0]['link'] => ({
  value: { href, text: 'Label' },
});

describe('MediaCardView', () => {
  it('renders MediaCard link when href is set', () => {
    render(
      <MediaCardView link={makeLink('/page')} className="tile-cls" mediaElement={<span data-testid="media" />}>
        Body
      </MediaCardView>,
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '/page');
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByTestId('media')).toBeInTheDocument();
  });

  it('renders div when href is empty', () => {
    const { container } = render(
      <MediaCardView link={{ value: { href: '', text: '' } }} className="tile-cls">
        No href
      </MediaCardView>,
    );
    expect(screen.queryByRole('link')).toBeFalsy();
    expect(container.querySelector('div.tile-cls')).toHaveTextContent('No href');
  });

  it('uses SDK Link when editing', () => {
    render(
      <MediaCardView link={makeLink('/page')} isEditing className="tile-cls">
        Editable
      </MediaCardView>,
    );
    expect(screen.getByTestId('sdk-link')).toHaveAttribute('href', '/page');
  });

  it('skips DS MediaCard content padding wrapper when contentPadding is none', () => {
    const { container } = render(
      <MediaCardView
        link={makeLink('/page')}
        className="tile-cls"
        contentPadding="none"
        mediaElement={<span data-testid="media" />}
      >
        <span data-testid="body">Body</span>
      </MediaCardView>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveClass('tile-cls');
    expect(link).toContainElement(screen.getByTestId('media'));
    expect(link).toContainElement(screen.getByTestId('body'));
    expect(container.querySelector('.px-4.pb-6.pt-4')).toBeNull();
  });
});
