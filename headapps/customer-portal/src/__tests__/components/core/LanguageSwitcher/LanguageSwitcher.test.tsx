import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LanguageSwitcher from 'components/core/LanguageSwitcher/LanguageSwitcher';
import { TEST_CASE_DATA_IDS } from '../../../../helpers/enums';
import type { ILanguageSwitcherFields } from 'components/core/LanguageSwitcher/LanguageSwitcher.type';
import type { IParams } from 'src/helpers/interface';

// Mock the variant component
vi.mock('components/core/LanguageSwitcher/variants/LanguageSwitcherDefault.variant', () => ({
  LanguageSwitcherDefaultVariant: ({
    testId,
    fields,
  }: {
    testId: string;
    fields: ILanguageSwitcherFields;
    params?: IParams;
  }) => (
    <div data-testid={testId}>LanguageSwitcherDefaultVariant</div>
  ),
}));

describe('LanguageSwitcher', () => {
  const mockParams = {
    params: {
      styles: 'test-styles',
      RenderingIdentifier: 'test-id',
    },
  };

  const mockFields: ILanguageSwitcherFields = {
    Title: {
      value: 'Language',
    },
    LanguageSelection: [
      {
        id: 'lang-1',
        url: '/lang-1',
        name: 'Language 1',
        displayName: 'English',
        fields: {
          LanguageTitle: {
            value: 'English',
          },
          LanguageSource: {
            id: 'source-1',
            url: '/source-1',
            name: 'Source 1',
            displayName: 'Source 1',
            fields: {
              'Base Culture': { value: '' },
              'Fallback Region Display Name': { value: '' },
              Charset: { value: '' },
              'Code page': { value: '' },
              Dictionary: { value: '' },
              Encoding: { value: '' },
              'Fallback Language': { value: '' },
              Iso: { value: 'en' },
              'Regional Iso Code': { value: 'en-US' },
              'WorldLingo Language Identifier': { value: '' },
            },
          },
        },
      },
    ],
    Icon: {
      value: {
        src: '/globe-icon.png',
        alt: 'Language Icon',
        width: 12,
        height: 12,
      },
    },
  };

  it('should render component with test id', () => {
    render(<LanguageSwitcher fields={mockFields} params={mockParams} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER)).toBeInTheDocument();
  });

  it('should pass fields and params to variant component', () => {
    render(<LanguageSwitcher fields={mockFields} params={mockParams} />);

    const variant = screen.getByTestId(TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER);
    expect(variant).toBeInTheDocument();
    expect(variant.textContent).toBe('LanguageSwitcherDefaultVariant');
  });

  it('should handle empty fields', () => {
    const emptyFields: ILanguageSwitcherFields = {
      Title: { value: '' },
      LanguageSelection: [],
      Icon: { value: undefined },
    };

    render(<LanguageSwitcher fields={emptyFields} params={mockParams} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER)).toBeInTheDocument();
  });

  it('should handle missing fields gracefully', () => {
    const partialFields = {
      Title: { value: 'Language' },
    } as unknown as ILanguageSwitcherFields;

    render(<LanguageSwitcher fields={partialFields} params={mockParams} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER)).toBeInTheDocument();
  });

  it('should handle disabled switcher via rendering param', () => {
    const paramsWithDisabled: IParams = {
      ...mockParams,
      DisableLanguageSwitcher: '1',
    };

    render(<LanguageSwitcher fields={mockFields} params={paramsWithDisabled} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER)).toBeInTheDocument();
  });
});



