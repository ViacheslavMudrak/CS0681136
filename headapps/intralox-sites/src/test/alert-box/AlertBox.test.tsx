import type { ReactNode } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AlertBox } from 'components/alert-box/AlertBox';
import { AlertBoxStrip } from 'components/alert-box/partial/AlertBoxPartials';
import type { AlertInfoBoxReference } from 'components/alert-box/AlertBox.type';
import {
  ALERT_BOX_ARIA_FALLBACK,
  ALERT_BOX_EMPTY_HINT,
  LAYOUT_ALERT_BOX_STRIP_ID,
} from 'components/alert-box/alertBoxUtils';

vi.mock('@laitram-l-l-c/intralox-ui-components', async () => {
  const actual = await vi.importActual<typeof import('@laitram-l-l-c/intralox-ui-components')>(
    '@laitram-l-l-c/intralox-ui-components',
  );
  return actual;
});

vi.mock('components/ui/Link', () => ({
  default: ({
    href,
    children,
    className,
    'aria-label': ariaLabel,
    target,
    rel,
  }: {
    href?: string;
    children?: ReactNode;
    className?: string;
    'aria-label'?: string;
    target?: string;
    rel?: string;
  }) => (
    <a href={href} className={className} aria-label={ariaLabel} target={target} rel={rel}>
      {children}
    </a>
  ),
}));

vi.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field, className }: { field?: { value?: string }; className?: string }) =>
    field?.value != null && field.value !== '' ? (
      <span data-testid="sdk-text" className={className}>
        {field.value}
      </span>
    ) : (
      <span data-testid="sdk-text-empty" className={className} />
    ),
  Link: ({
    field,
    children,
    className,
    'aria-label': ariaLabel,
    target,
    rel,
  }: {
    field?: { value?: { href?: string; text?: string; target?: string } };
    children?: ReactNode;
    className?: string;
    'aria-label'?: string;
    target?: string;
    rel?: string;
  }) => (
    <a
      data-testid="sdk-link"
      href={field?.value?.href}
      className={className}
      aria-label={ariaLabel}
      target={target}
      rel={rel}
    >
      {children}
    </a>
  ),
}));

const alertItem = (
  fields: AlertInfoBoxReference['fields'],
  overrides: Partial<AlertInfoBoxReference> = {},
): AlertInfoBoxReference => ({
  id: 'alert-1',
  displayName: 'Site alert',
  name: 'site-alert',
  fields,
  ...overrides,
});

describe('AlertBox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when alert is disabled', () => {
    const { container } = render(
      <AlertBox enableAlert={false} alertInfoBox={undefined} isEditing={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('returns null when datasource is missing and not editing', () => {
    const { container } = render(
      <AlertBox enableAlert alertInfoBox={undefined} isEditing={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows empty hint when datasource is missing in editing mode', () => {
    render(<AlertBox enableAlert alertInfoBox={undefined} isEditing />);
    expect(screen.getByTestId('alert-box')).toBeInTheDocument();
    expect(screen.getByText(ALERT_BOX_EMPTY_HINT)).toBeInTheDocument();
  });

  it('returns null when text and link are empty and not editing', () => {
    const { container } = render(
      <AlertBox
        enableAlert
        alertInfoBox={alertItem({
          Text: { value: '' },
          Link: { value: { href: '', text: '' } },
        })}
        isEditing={false}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders alert text in preview mode', () => {
    render(
      <AlertBox
        enableAlert
        alertInfoBox={alertItem({
          Text: { value: 'Scheduled maintenance' },
          Link: { value: { href: '', text: '' } },
        })}
        isEditing={false}
      />,
    );
    expect(screen.getByTestId('alert-box')).toBeInTheDocument();
    expect(screen.getByTestId('sdk-text')).toHaveTextContent('Scheduled maintenance');
    expect(document.getElementById(LAYOUT_ALERT_BOX_STRIP_ID)).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Scheduled maintenance'),
    );
  });

  it('renders a navigable link when href and link text are configured', () => {
    render(
      <AlertBox
        enableAlert
        alertInfoBox={alertItem({
          Text: { value: 'Read more' },
          Link: {
            value: {
              href: '/maintenance',
              text: 'Details',
              target: '_blank',
            },
          },
        })}
        isEditing={false}
      />,
    );
    const link = screen.getByRole('link', { name: /Read more/i });
    expect(link).toHaveAttribute('href', '/maintenance');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders editable empty SDK fields in editing mode when datasource exists but has no visible content', () => {
    render(
      <AlertBox
        enableAlert
        alertInfoBox={alertItem({
          Text: { value: '' },
          Link: { value: { href: '', text: '' } },
        })}
        isEditing
      />,
    );
    expect(screen.getByTestId('alert-box')).toBeInTheDocument();
    expect(screen.getByTestId('sdk-text-empty')).toBeInTheDocument();
    expect(screen.queryByText(ALERT_BOX_EMPTY_HINT)).not.toBeInTheDocument();
  });
});

describe('AlertBoxStrip', () => {
  it('uses Sitecore Link in editing mode when link is clickable', () => {
    render(
      <AlertBoxStrip
        textField={{ value: 'Alert copy' }}
        linkField={{ value: { href: '/go', text: 'Go' } }}
        showText
        showLink
        hasClickableLink
        isEditing
        ariaLabel="Alert copy. Go"
      />,
    );
    expect(screen.getByTestId('sdk-link')).toHaveAttribute('href', '/go');
    expect(screen.getByTestId('sdk-text')).toHaveTextContent('Alert copy');
  });

  it('renders non-link copy with section aria-label when not clickable', () => {
    render(
      <AlertBoxStrip
        textField={{ value: 'Heads up' }}
        linkField={undefined}
        showText
        showLink={false}
        hasClickableLink={false}
        isEditing={false}
        ariaLabel={ALERT_BOX_ARIA_FALLBACK}
      />,
    );
    const strip = document.getElementById(LAYOUT_ALERT_BOX_STRIP_ID);
    expect(strip).toHaveAttribute('aria-label', ALERT_BOX_ARIA_FALLBACK);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders a navigable preview link when clickable and not editing', () => {
    render(
      <AlertBoxStrip
        textField={{ value: 'Maintenance notice' }}
        linkField={{
          value: {
            href: '/maintenance',
            text: 'Details',
            target: '_blank',
          },
        }}
        showText
        showLink
        hasClickableLink
        isEditing={false}
        ariaLabel="Maintenance notice. Details"
      />,
    );
    const link = screen.getByRole('link', { name: 'Maintenance notice. Details' });
    expect(link).toHaveAttribute('href', '/maintenance');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByTestId('sdk-text')).toHaveTextContent('Maintenance notice');
  });
});
