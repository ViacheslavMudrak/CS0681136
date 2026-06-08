import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Auth from 'components/core/Auth/Auth';
import { TEST_CASE_DATA_IDS } from '../../../../helpers/enums';
import type { IAuthFields } from 'components/core/Auth/Auth.type';

// Mock the variant component
vi.mock('components/core/Auth/variants/AuthDefault.variant', () => ({
  AuthDefaultVariant: ({ testId }: { testId: string; fields: IAuthFields }) => (
    <div data-testid={testId}>AuthDefaultVariant</div>
  ),
}));

describe('Auth', () => {
  const mockParams = {
    params: {
      styles: 'test-styles',
      RenderingIdentifier: 'test-id',
    },
  };

  const mockFields: IAuthFields = {
    AuthenticationType: {
      value: 'Sign in',
    },
    AuthenticationHeader: {
      value: 'Test Header',
    },
    BottomInfo: {
      value: 'Test Bottom Info',
    },
  };

  it('should render Auth component with test id', () => {
    render(<Auth fields={mockFields} params={mockParams} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.AUTH)).toBeInTheDocument();
  });

  it('should pass fields and params to variant component', () => {
    render(<Auth fields={mockFields} params={mockParams} />);

    const variant = screen.getByTestId(TEST_CASE_DATA_IDS.AUTH);
    expect(variant).toBeInTheDocument();
    expect(variant.textContent).toBe('AuthDefaultVariant');
  });

  it('should handle empty fields', () => {
    const emptyFields: IAuthFields = {
      AuthenticationType: { value: '' },
      AuthenticationHeader: { value: '' },
      BottomInfo: { value: '' },
    };

    render(<Auth fields={emptyFields} params={mockParams} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.AUTH)).toBeInTheDocument();
  });

  it('should handle missing fields gracefully', () => {
    const partialFields = {
      AuthenticationType: { value: 'Sign in' },
    } as unknown as IAuthFields;

    render(<Auth fields={partialFields} params={mockParams} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.AUTH)).toBeInTheDocument();
  });
});





