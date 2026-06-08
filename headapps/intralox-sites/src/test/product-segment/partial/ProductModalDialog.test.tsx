import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('components/shared/Modal', () => ({
  default: ({
    children,
    isOpen,
    containerClassName,
    panelClassName,
    ariaLabel,
  }: {
    children: React.ReactNode;
    isOpen?: boolean;
    containerClassName?: string;
    panelClassName?: string;
    ariaLabel?: string;
  }) =>
    isOpen ? (
      <div
        data-testid="product-modal-shell"
        data-container-class={containerClassName}
        data-panel-class={panelClassName}
        aria-label={ariaLabel}
      >
        {children}
      </div>
    ) : null,
}));

vi.mock('components/shared/ImageView/ImageView', () => ({
  ImageView: () => <div data-testid="image-view-mock" />,
}));

vi.mock('components/shared/video/Video', () => ({
  default: () => <div data-testid="video-mock" />,
}));

vi.mock('components/callout/partial/CalloutPartials', () => ({
  CalloutItem: ({
    productModalCalloutLayout,
  }: {
    productModalCalloutLayout?: boolean;
  }) => (
    <div
      data-testid="callout-item-mock"
      data-product-modal-layout={productModalCalloutLayout ? 'true' : 'false'}
    />
  ),
}));

vi.mock('components/callout/partial/CalloutGroupListItem', () => ({
  CalloutGroupListItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="callout-group-item">{children}</div>
  ),
}));

vi.mock('components/testimonial/partial/TestimonialPartials', () => ({
  TestimonialCard: () => <div data-testid="testimonial-mock" />,
}));

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const React = await import('react');
  return {
    Text: ({
      field,
      tag: Tag = 'span',
      className,
      id,
    }: {
      field?: { value?: string };
      tag?: string;
      className?: string;
      id?: string;
    }) =>
      React.createElement(Tag ?? 'span', { className, id, 'data-testid': 'sdk-text' }, field?.value ?? ''),
    RichText: ({
      field,
      tag: Tag = 'div',
      className,
    }: {
      field?: { value?: string };
      tag?: string;
      className?: string;
    }) =>
      React.createElement(Tag ?? 'div', { className, 'data-testid': 'rich-text' }, field?.value ?? ''),
    Link: ({
      field,
      className,
      children,
    }: {
      field?: { value?: { href?: string; text?: string } };
      className?: string;
      children?: React.ReactNode;
    }) => (
      <a href={field?.value?.href} className={className}>
        {children ?? field?.value?.text}
      </a>
    ),
  };
});

import { ProductModalDialog } from 'components/product-segment/partial/ProductModalDialog';
import { passiveTransferModal } from '../productSegmentFixtures';

describe('ProductModalDialog', () => {
  it('returns null when modal item is undefined', () => {
    const { container } = render(
      <ProductModalDialog modal={undefined} isOpen isEditing={false} onClose={() => undefined} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('applies banded shell and panel classes inline on Modal', () => {
    render(
      <ProductModalDialog
        modal={passiveTransferModal()}
        isOpen
        isEditing={false}
        onClose={() => undefined}
      />,
    );

    const shell = screen.getByTestId('product-modal-shell');
    expect(shell.getAttribute('data-container-class')).toContain('sm:max-w-[568px]');
    expect(shell.getAttribute('data-container-class')).toContain('xl:max-w-[992px]');
    expect(shell.getAttribute('data-panel-class')).toContain('!w-full');
    expect(shell.getAttribute('data-panel-class')).toContain('md:!max-w-[736px]');
    expect(shell.getAttribute('data-panel-class')).toContain('xl:!max-w-[992px]');
  });

  it('passes productModalCalloutLayout to embedded callout items', () => {
    const modal = passiveTransferModal();
    modal.fields = {
      ...modal.fields,
      Callout: {
        fields: {
          Style: { fields: { Value: { value: 'card' } } },
          Direction: { fields: { Value: { value: 'column' } } },
          TextSize: { fields: { Value: { value: 'sm' } } },
          Callouts: [
            {
              id: 'c-1',
              fields: {
                Value: { value: '99%' },
                Label: { value: 'Uptime' },
              },
            },
          ],
        },
      },
      Image: { value: { src: '/media/product.jpg', alt: 'Product' } },
    };

    render(
      <ProductModalDialog modal={modal} isOpen isEditing={false} onClose={() => undefined} />,
    );

    expect(screen.getByTestId('callout-item-mock')).toHaveAttribute(
      'data-product-modal-layout',
      'true',
    );
  });

  it('renders single-column layout when right column has no content', () => {
    render(
      <ProductModalDialog
        modal={{
          id: 'm-minimal',
          fields: {
            Title: { value: 'Minimal product' },
            Overview: { value: 'Overview only' },
          },
        }}
        isOpen
        isEditing={false}
        onClose={() => undefined}
      />,
    );

    expect(screen.getByText('Minimal product')).toBeInTheDocument();
    expect(screen.queryByTestId('image-view-mock')).not.toBeInTheDocument();
    expect(screen.queryByTestId('callout-item-mock')).not.toBeInTheDocument();
  });
});
