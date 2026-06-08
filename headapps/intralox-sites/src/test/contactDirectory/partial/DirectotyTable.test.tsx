import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('components/callToAction/partial/LinkVIew', () => ({
  default: ({
    children,
    link,
    className,
  }: {
    children: React.ReactNode;
    link?: { value?: { href?: string } };
    className?: string;
  }) => (
    <a href={link?.value?.href} className={className} data-testid="link-view">
      {children}
    </a>
  ),
}));

vi.mock('components/contactDirectory/partial/WhatsAppButton', () => ({
  default: () => <div data-testid="whatsapp-button" />,
}));

import DirectotyTable from 'components/contactDirectory/partial/DirectotyTable';

describe('DirectotyTable', () => {
  it('renders only the wrapper when no contact values are provided', () => {
    const { container } = render(<DirectotyTable />);

    expect(container.firstChild).toHaveClass('w-full', 'text-sm');
    expect(screen.queryByTestId('link-view')).not.toBeInTheDocument();
    expect(screen.queryByTestId('whatsapp-button')).not.toBeInTheDocument();
  });

  it('renders international toll-free telephone with tel link', () => {
    render(
      <DirectotyTable
        internationalTollFreeTelephoneLabel="Intl toll free"
        internationalTollFreeTelephone="+1 800 111 2222"
      />,
    );

    expect(screen.getByText('Intl toll free')).toBeInTheDocument();
    expect(screen.getByText('+1 800 111 2222')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '+1 800 111 2222' })).toHaveAttribute(
      'href',
      'tel:+1-800-111-2222',
    );
    expect(screen.getByRole('link', { name: '+1 800 111 2222' })).toHaveClass(
      'underline',
      'hover:no-underline',
    );
  });

  it('renders toll-free and main telephone rows with stripped display and tel href', () => {
    render(
      <DirectotyTable
        tollFreeTelephoneLabel="Toll free"
        tollFreeTelephone="1 800 555 0000"
        telephoneLabel="Phone"
        telephone="1 234 567 8900"
      />,
    );

    expect(screen.getByText('Toll free')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '1-800-555-0000' })).toHaveAttribute(
      'href',
      'tel:1-800-555-0000',
    );
    expect(screen.getByRole('link', { name: '1-234-567-8900' })).toHaveAttribute(
      'href',
      'tel:1-234-567-8900',
    );
  });

  it('renders fax and toll-free fax as plain text with whitespace stripped', () => {
    render(
      <DirectotyTable
        faxLabel="Fax"
        fax="1 800 555 0001"
        tollFreeFaxLabel="Toll free fax"
        tollFreeFax="1 800 555 0002"
      />,
    );

    expect(screen.getByText('Fax')).toBeInTheDocument();
    expect(screen.getByText('1-800-555-0001')).toBeInTheDocument();
    expect(screen.getByText('Toll free fax')).toBeInTheDocument();
    expect(screen.getByText('1-800-555-0002')).toBeInTheDocument();
    expect(screen.queryAllByTestId('link-view')).toHaveLength(0);
  });

  it('renders email with mailto link', () => {
    render(
      <DirectotyTable emailLabel="Email" emailAddress="support@example.com" />,
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'support@example.com' })).toHaveAttribute(
      'href',
      'mailto:support@example.com',
    );
  });

  it('renders WhatsApp row when showWhatsApp is true', () => {
    render(<DirectotyTable showWhatsApp whatsAppLabel="WhatsApp" />);

    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
    expect(screen.getByTestId('whatsapp-button')).toBeInTheDocument();
  });

  it('does not render WhatsApp row when showWhatsApp is false', () => {
    render(<DirectotyTable showWhatsApp={false} whatsAppLabel="WhatsApp" />);

    expect(screen.queryByText('WhatsApp')).not.toBeInTheDocument();
    expect(screen.queryByTestId('whatsapp-button')).not.toBeInTheDocument();
  });

  it('applies row layout classes on contact rows', () => {
    const { container } = render(
      <DirectotyTable telephoneLabel="Phone" telephone="555-1234" />,
    );

    const row = container.querySelector('.flex.justify-between');
    expect(row).toBeInTheDocument();
    expect(row?.querySelector('.py-1.text-left.font-medium')).toBeInTheDocument();
    expect(row?.querySelector('.text-right')).toBeInTheDocument();
  });
});
