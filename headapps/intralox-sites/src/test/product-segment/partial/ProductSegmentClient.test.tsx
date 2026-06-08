import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const replaceMock = vi.fn();

function createSearchParams(initial: string) {
  return new URLSearchParams(initial);
}

let searchParamsRef = createSearchParams('');

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => '/products/arb-equipment',
  useSearchParams: () => searchParamsRef,
}));

vi.mock('components/shared/ImageView/ImageView', () => ({
  ImageView: () => <div data-testid="image-view-mock" />,
}));

vi.mock('components/shared/Modal', () => ({
  default: ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) =>
    isOpen ? <div data-testid="product-modal">{children}</div> : null,
}));

vi.mock('components/callToAction/partial/LinkVIew', () => ({
  default: () => <div data-testid="link-view-mock" />,
}));

vi.mock('components/callout/partial/CalloutPartials', () => ({
  CalloutItem: () => <div data-testid="callout-item-mock" />,
}));

vi.mock('components/testimonial/partial/TestimonialPartials', () => ({
  TestimonialCard: () => <div data-testid="testimonial-mock" />,
}));

vi.mock('components/shared/video/BrightcoveModalPlayer', () => ({
  BrightcoveModalPlayer: () => <div data-testid="bc-player-mock" />,
}));

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const React = await import('react');
  return {
    Text: ({
      field,
      tag: Tag = 'span',
      className,
    }: {
      field?: { value?: string };
      tag?: string;
      className?: string;
    }) =>
      React.createElement(Tag ?? 'span', { className, 'data-testid': 'sdk-text' }, field?.value ?? ''),
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
    Field: ({ field }: { field?: { value?: string } }) => field?.value ?? null,
  };
});

import { ProductSegmentClient } from 'components/product-segment/partial/ProductSegmentClient';
import type { ProductSegmentClientProps } from 'components/product-segment/partial/ProductSegmentClient';
import {
  buildProductSegmentFields,
  passiveTransferModal,
  productSegmentApplication,
  productSegmentModal,
} from '../productSegmentFixtures';
import type {
  ProductModalItem,
  ProductSegmentFields,
  ProductSegmentTaxonomyItem,
} from 'components/product-segment/ProductSegment.type';

function app(id: string, url: string, label: string): ProductSegmentTaxonomyItem {
  return productSegmentApplication(id, url, label);
}

function modal(
  id: string,
  url: string,
  title: string,
  applications: ProductSegmentTaxonomyItem[] = [],
): ProductModalItem {
  return productSegmentModal(id, url, title, applications);
}

const sorting = app('1', '/application-filters/sorting', 'Sorting');

const baseFields: ProductSegmentFields = buildProductSegmentFields([
  modal('m1', '/data/product-model/merge', 'Merge', [sorting]),
  passiveTransferModal(sorting),
]);

const baseParams = {
  styles: '',
  RenderingIdentifier: 'product-segment-1',
} as ProductSegmentClientProps['params'];

function makeProps(overrides: Partial<ProductSegmentClientProps> = {}): ProductSegmentClientProps {
  return {
    fields: baseFields,
    params: baseParams,
    isEditing: false,
    isPreview: false,
    ...overrides,
  };
}

describe('ProductSegmentClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParamsRef = createSearchParams('');
    replaceMock.mockClear();
  });

  it('renders header and segment radiogroup without detail UI when no segment param', () => {
    const { container } = render(<ProductSegmentClient {...makeProps()} />);

    const section = container.querySelector('section.product-segment');
    expect(section?.className).toContain('w-screen');
    expect(section?.className).toContain('max-w-[100vw]');

    const content = container.querySelector('section.product-segment > .component-content');
    expect(content?.className).toContain('max-w-none');

    const shell = container.querySelector('[data-testid="product-segment-shell"]');
    expect(shell?.className).toContain('product-segment-outer');
    expect(shell?.className).toContain('box-border');
    expect(shell?.className).toContain('py-0');
    expect(shell?.className).toContain('px-[var(--layout-gutter-inline)]');
    expect(shell?.className).toContain('max-[599px]:mx-0');
    expect(shell?.className).toContain('sm:max-w-[600px]');
    expect(shell?.className).toContain('md:max-w-[768px]');
    expect(shell?.className).toContain('lg:max-w-full');
    expect(shell?.className).toContain('min-[1025px]:max-w-[1024px]');
    expect(shell?.className).not.toContain('max-w-[1200px]');
    expect(shell?.className).not.toContain('py-10');

    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    expect(screen.getByText('Find your solution')).toBeInTheDocument();
  });

  it('shows application tabs and solution cards when segment param is present', () => {
    searchParamsRef = createSearchParams('segment=e-commerce');
    render(<ProductSegmentClient {...makeProps()} />);

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('marks segment from ?segment= query as selected', () => {
    searchParamsRef = createSearchParams('segment=postal-parcel-including');
    render(<ProductSegmentClient {...makeProps()} />);

    const postal = screen.getByRole('radio', { name: 'Postal & Parcel' });
    expect(postal).toHaveAttribute('aria-checked', 'true');
  });

  it('updates URL and reveals detail UI when selecting a segment', async () => {
    render(<ProductSegmentClient {...makeProps()} />);
    const user = userEvent.setup();

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Postal & Parcel' }));

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalled();
    const url = String(replaceMock.mock.calls.at(-1)?.[0] ?? '');
    expect(url).toContain('segment=postal-parcel-including');
    expect(url).not.toContain('application=');
    expect(url).not.toContain('item=');
  });

  it('updates URL when selecting an application filter', async () => {
    searchParamsRef = createSearchParams('segment=e-commerce');
    render(<ProductSegmentClient {...makeProps()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('tab', { name: 'Sorting' }));

    expect(replaceMock).toHaveBeenCalled();
    const url = String(replaceMock.mock.calls.at(-1)?.[0] ?? '');
    expect(url).toContain('application=sorting');
    expect(url).not.toContain('item=');
  });

  it('opens modal and sets item query when a solution card is clicked', async () => {
    searchParamsRef = createSearchParams('segment=e-commerce');
    render(<ProductSegmentClient {...makeProps()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('listitem', { name: /Merge/i }));

    expect(screen.getByTestId('product-modal')).toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalled();
    const url = String(replaceMock.mock.calls.at(-1)?.[0] ?? '');
    expect(url).toContain('item=merge');
  });

  it('does not call router.replace while editing', async () => {
    render(<ProductSegmentClient {...makeProps({ isEditing: true })} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('radio', { name: 'Postal & Parcel' }));

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('restores deep link state from URL on load', () => {
    searchParamsRef = createSearchParams(
      'segment=postal-parcel-including&application=sorting&item=90-degree-sorter',
    );
    render(<ProductSegmentClient {...makeProps()} />);

    expect(screen.getByRole('radio', { name: 'Postal & Parcel' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Sorting' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('product-modal')).toBeInTheDocument();
  });
});
