import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

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
      <a
        href={field?.value?.href}
        className={className}
        aria-label={ariaLabel}
        data-testid="sdk-link"
      >
        {children ?? field?.value?.text}
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

import LinkRenderer from 'components/shared/LinkRenderer';
import type { ILinkFields } from 'src/utils/interface';

function makeLink(
  text: string,
  href: string,
  style: 'Button' | 'More' | 'Link' = 'Link',
  overrides: Partial<ILinkFields['fields']> = {},
): ILinkFields {
  return {
    fields: {
      Style: { fields: { Value: { value: style } } },
      Link: { value: { href, text } },
      Icon: { fields: { Value: { value: '' } } },
      IconPosition: { fields: { Value: { value: '' } } },
      Colorscheme: { fields: { Value: { value: 'default' } } },
      ...overrides,
    },
  };
}

describe('LinkRenderer', () => {
  it('renders a basic link with default style', () => {
    render(<LinkRenderer links={[makeLink('Read More', '/page')]} />);
    expect(screen.getByRole('link', { name: 'Read More' })).toHaveAttribute('href', '/page');
  });

  it('renders nothing when links array is empty', () => {
    const { container } = render(<LinkRenderer links={[]} />);
    const links = container.querySelectorAll('a');
    expect(links).toHaveLength(0);
  });

  it('renders a Button style link via ui/Link pill', () => {
    render(<LinkRenderer links={[makeLink('Sign Up', '/signup', 'Button')]} />);
    const link = screen.getByRole('link', { name: 'Sign Up' });
    expect(link.className).toContain('bg-surface');
    expect(link.className).toContain('rounded-[9999px]');
  });

  it('renders a Button style link with default theme when contrast is false', () => {
    render(
      <LinkRenderer links={[makeLink('Sign Up', '/signup', 'Button')]} contrast={false} />,
    );
    expect(screen.getByRole('link', { name: 'Sign Up' }).className).toContain('bg-action');
  });

  it('renders a More style link', () => {
    render(<LinkRenderer links={[makeLink('Learn More', '/more', 'More')]} />);
    expect(screen.getByRole('link', { name: 'Learn More' })).toBeInTheDocument();
  });

  it('applies left alignment justify-start class', () => {
    const { container } = render(
      <LinkRenderer links={[makeLink('Go', '/go')]} alignment="left" />,
    );
    expect(container.firstElementChild?.className).toContain('justify-start');
  });

  it('applies right alignment justify-end class', () => {
    const { container } = render(
      <LinkRenderer links={[makeLink('Go', '/go')]} alignment="right" />,
    );
    expect(container.firstElementChild?.className).toContain('justify-end');
  });

  it('applies non-contrast divide-stroke-default class', () => {
    const { container } = render(
      <LinkRenderer links={[makeLink('Go', '/go')]} contrast={false} />,
    );
    expect(container.firstElementChild?.className).toContain('divide-stroke-default');
  });

  it('renders Button with icon before label when IconPosition is "Before Label"', () => {
    const link = makeLink('Click', '/click', 'Button', {
      Icon: { fields: { Value: { value: 'fa-solid fa-phone' } } },
      IconPosition: { fields: { Value: { value: 'Before Label' } } },
    });
    const { container } = render(<LinkRenderer links={[link]} />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('renders Button with icon after label when IconPosition is "After Label"', () => {
    const link = makeLink('Click', '/click', 'Button', {
      Icon: { fields: { Value: { value: 'fa-solid fa-arrow-right' } } },
      IconPosition: { fields: { Value: { value: 'After Label' } } },
    });
    const { container } = render(<LinkRenderer links={[link]} />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('renders More style with icon before label', () => {
    const link = makeLink('More', '/more', 'More', {
      Icon: { fields: { Value: { value: 'fa-solid fa-chevron-right' } } },
      IconPosition: { fields: { Value: { value: 'Before Label' } } },
    });
    const { container } = render(<LinkRenderer links={[link]} />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('renders More style with icon after label', () => {
    const link = makeLink('More', '/more', 'More', {
      Icon: { fields: { Value: { value: 'fa-solid fa-chevron-right' } } },
      IconPosition: { fields: { Value: { value: 'After Label' } } },
    });
    const { container } = render(<LinkRenderer links={[link]} />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('renders outline circle badge icon when icon is outline circle chevron', () => {
    const link = makeLink('Go', '/go', 'Button', {
      Icon: { fields: { Value: { value: 'fa-solid fa-circle-chevron-down' } } },
      IconPosition: { fields: { Value: { value: 'Before Label' } } },
    });
    const { container } = render(<LinkRenderer links={[link]} />);
    expect(container.querySelector('span.rounded-full')).toBeTruthy();
  });

  it('renders Button with alert colorscheme', () => {
    const link = makeLink('Alert', '/alert', 'Button', {
      Colorscheme: { fields: { Value: { value: 'alert' } } },
    });
    const { container } = render(<LinkRenderer links={[link]} contrast={false} />);
    expect(container.querySelector('a')?.className).toContain('bg-warning');
  });

  it('renders multiple links', () => {
    render(
      <LinkRenderer links={[makeLink('First', '/first'), makeLink('Second', '/second')]} />,
    );
    expect(screen.getByRole('link', { name: 'First' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Second' })).toBeInTheDocument();
  });

  it('applies aria-label from alt prop', () => {
    render(<LinkRenderer links={[makeLink('CTA', '/cta')]} alt="Custom aria label" />);
    const link = screen.getByRole('link', { name: 'Custom aria label' });
    expect(link).toBeInTheDocument();
  });

  it('uses SDK Link when editing', () => {
    render(
      <LinkRenderer links={[makeLink('Edit', '/edit', 'Button')]} isEditing />,
    );
    expect(screen.getByTestId('sdk-link')).toHaveAttribute('href', '/edit');
    expect(screen.getByTestId('sdk-link')).toHaveTextContent('Edit');
  });
});
