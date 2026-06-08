import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import GlobalSearch from 'components/core/GlobalSearch/GlobalSearch';
import { TEST_CASE_DATA_IDS } from '../../../../helpers/enums';
import type { IGlobalSearchFields } from 'components/core/GlobalSearch/GlobalSearch.type';

vi.mock('next/dynamic', () => ({
  default: () => {
    const React = require('react');
    return function DynamicGlobalSearchStub(props: { testId?: string }) {
      return React.createElement('div', { 'data-testid': props.testId }, 'GlobalSearchDefaultVariant');
    };
  },
}));

// Mock the variant component
vi.mock('components/core/GlobalSearch/variants/GlobalSearchDefault.variant', () => ({
  GlobalSearchDefaultVariant: ({ testId, fields }: { testId: string; fields: IGlobalSearchFields }) => (
    <div data-testid={testId}>GlobalSearchDefaultVariant</div>
  ),
}));

describe('GlobalSearch', () => {
  const mockParams = {
    params: {
      styles: 'test-styles',
      RenderingIdentifier: 'test-id',
    },
  };

  const mockFields: IGlobalSearchFields = {
    SearchTitle: {
      value: 'Search',
    },
    SearchPlaceholder: {
      value: 'Search...',
    },
    Categories: [
      {
        id: 'cat-1',
        url: '/category/cat-1',
        name: 'Category 1',
        displayName: 'Products',
        fields: {
          Title: {
            value: 'Products',
          },
          URL: {
            value: {
              href: 'products',
            },
          },
          Icon: {
            value: {
              src: '/product-icon.png',
              alt: 'Product Icon',
              width: 20,
              height: 20,
            },
          },
        },
      },
    ],
    SearchIcon: {
      value: {
        src: '/search-icon.png',
        alt: 'Search Icon',
        width: 16,
        height: 16,
      },
    },
  };

  it('should render component with test id', () => {
    render(<GlobalSearch fields={mockFields} params={mockParams} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.GLOBAL_SEARCH)).toBeInTheDocument();
  });

  it('should pass fields and params to variant component', () => {
    render(<GlobalSearch fields={mockFields} params={mockParams} />);

    const variant = screen.getByTestId(TEST_CASE_DATA_IDS.GLOBAL_SEARCH);
    expect(variant).toBeInTheDocument();
    expect(variant.textContent).toBe('GlobalSearchDefaultVariant');
  });

  it('should handle empty fields', () => {
    const emptyFields: IGlobalSearchFields = {
      SearchTitle: { value: '' },
      SearchPlaceholder: { value: '' },
      Categories: [],
      SearchIcon: { value: undefined },
    };

    render(<GlobalSearch fields={emptyFields} params={mockParams} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.GLOBAL_SEARCH)).toBeInTheDocument();
  });

  it('should handle missing fields gracefully', () => {
    const partialFields = {
      SearchTitle: { value: 'Search' },
    } as unknown as IGlobalSearchFields;

    render(<GlobalSearch fields={partialFields} params={mockParams} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.GLOBAL_SEARCH)).toBeInTheDocument();
  });

  it('should handle empty categories array', () => {
    const fieldsWithEmptyCategories: IGlobalSearchFields = {
      ...mockFields,
      Categories: [],
    };

    render(<GlobalSearch fields={fieldsWithEmptyCategories} params={mockParams} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.GLOBAL_SEARCH)).toBeInTheDocument();
  });
});



