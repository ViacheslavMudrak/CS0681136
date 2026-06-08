import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@laitram-l-l-c/intralox-ui-components', () => ({
  ModalOverlay: ({
    children,
    isOpen,
    onOpenChange,
  }: {
    children: React.ReactNode;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) =>
    isOpen ? (
      <div data-testid="overlay">
        <button type="button" onClick={() => onOpenChange?.(false)}>
          dismiss-overlay
        </button>
        {children}
      </div>
    ) : null,
  Modal: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="imodal" className={className}>
      {children}
    </div>
  ),
}));

vi.mock('components/shared/BaseContainer', () => ({
  Container: ({
    children,
    width,
    bare,
    className,
    paddingX,
  }: {
    children: React.ReactNode;
    width?: string;
    bare?: boolean;
    className?: string;
    paddingX?: boolean;
  }) => (
    <div data-testid="container" data-width={width} data-bare={bare} data-padding-x={paddingX} className={className}>
      {children}
    </div>
  ),
}));

import Modal from 'components/shared/Modal';

describe('Modal', () => {
  beforeEach(() => {
    vi.stubGlobal('scrollTo', vi.fn());
  });

  it('renders when open and invokes onChange(false) on dismiss', () => {
    const onChange = vi.fn();
    render(
      <Modal isOpen ariaLabel="Dialog" onChange={onChange} modalSize="sm">
        <p>Body</p>
      </Modal>,
    );
    expect(screen.getByTestId('overlay')).toBeInTheDocument();
    fireEvent.click(screen.getByText('dismiss-overlay'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('invokes onClose when provided instead of onChange', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen ariaLabel="X" onClose={onClose}>
        <p>y</p>
      </Modal>,
    );
    fireEvent.click(screen.getByText('dismiss-overlay'));
    expect(onClose).toHaveBeenCalled();
  });

  it('applies media variant shell classes', () => {
    render(
      <Modal isOpen ariaLabel="Video" variant="media" modalSize="lg">
        <p>media body</p>
      </Modal>,
    );
    const inner = screen.getByTestId('imodal');
    expect(inner.className).toMatch(/rounded-2xl/);
  });

  it('uses xl container width mapping', () => {
    render(
      <Modal isOpen ariaLabel="Wide" modalSize="xl">
        <p>wide</p>
      </Modal>,
    );
    expect(screen.getByTestId('container')).toHaveAttribute('data-width', 'default');
  });

  it('applies panelClassName banded max-width on the modal panel', () => {
    render(
      <Modal
        isOpen
        ariaLabel="Product"
        containerBare
        panelClassName="box-border !w-full min-w-0 max-w-full sm:!max-w-[568px] md:!max-w-[736px] lg:!max-w-[960px] xl:!max-w-[992px]"
      >
        <p>product</p>
      </Modal>,
    );
    const inner = screen.getByTestId('imodal');
    expect(inner.className).toContain('!w-full');
    expect(inner.className).toContain('md:!max-w-[736px]');
    expect(inner.className).toContain('xl:!max-w-[992px]');
  });
});
