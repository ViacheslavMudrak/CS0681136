import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FeaturedContent, { NoCard, LobbyExperience } from 'components/core/FeaturedContent/FeaturedContent';
import { TEST_CASE_DATA_IDS } from '../../../../helpers/enums';
import type { IFeaturedContentFields, IFeaturedContentLobbyExperienceFields } from 'components/core/FeaturedContent/FeaturedContent.type';

// Mock the variant components
vi.mock('components/core/FeaturedContent/variants/FeaturedContentDefault.variant', () => ({
  FeaturedContentDefaultVariant: ({ testId, fields }: { testId: string; fields: IFeaturedContentFields }) => (
    <div data-testid={testId}>FeaturedContentDefaultVariant</div>
  ),
}));

vi.mock('components/core/FeaturedContent/variants/FeaturedContentNoCard.variant', () => ({
  FeaturedContentNoCardVariant: ({ testId, fields }: { testId: string; fields: IFeaturedContentFields }) => (
    <div data-testid={testId}>FeaturedContentNoCardVariant</div>
  ),
}));

vi.mock('components/core/FeaturedContent/variants/FeaturedContentLobbyExperience.variant', () => ({
  FeaturedContentLobbyExperienceVariant: ({ testId, fields }: { testId: string; fields: IFeaturedContentLobbyExperienceFields }) => (
    <div data-testid={testId}>FeaturedContentLobbyExperienceVariant</div>
  ),
}));

describe('FeaturedContent', () => {
  const mockParams = {
    params: {
      styles: 'test-styles',
      RenderingIdentifier: 'test-id',
    },
  };

  const mockFields: IFeaturedContentFields = {
    Title: {
      value: 'Test Title',
    },
    Description: {
      value: 'Test Description',
    },
    ContentCards: [],
    Logo: {
      value: {
        src: '/test-logo.png',
        alt: 'Test Logo',
        width: 100,
        height: 50,
      },
    },
    BackgroundImage: {
      value: {
        src: '/test-background.jpg',
        alt: 'Test Background',
        width: 1920,
        height: 1080,
      },
    },
    Content: {
      value: 'Test Content',
    },
  };

  it('should render FeaturedContent component with test id', () => {
    render(<FeaturedContent fields={mockFields} params={mockParams} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.FEATURED_CONTENT)).toBeInTheDocument();
  });

  it('should pass fields and params to variant component', () => {
    render(<FeaturedContent fields={mockFields} params={mockParams} />);

    const variant = screen.getByTestId(TEST_CASE_DATA_IDS.FEATURED_CONTENT);
    expect(variant).toBeInTheDocument();
    expect(variant.textContent).toBe('FeaturedContentDefaultVariant');
  });

  it('should handle empty fields', () => {
    const emptyFields: IFeaturedContentFields = {
      Title: { value: '' },
      Description: { value: '' },
      ContentCards: [],
      Logo: { value: undefined },
      BackgroundImage: { value: undefined },
      Content: { value: '' },
    };

    render(<FeaturedContent fields={emptyFields} params={mockParams} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.FEATURED_CONTENT)).toBeInTheDocument();
  });

  it('should handle missing fields gracefully', () => {
    const partialFields = {
      Title: { value: 'Test Title' },
    } as unknown as IFeaturedContentFields;

    render(<FeaturedContent fields={partialFields} params={mockParams} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.FEATURED_CONTENT)).toBeInTheDocument();
  });
});

describe('FeaturedContent NoCard Variant', () => {
  const mockParams = {
    params: {
      styles: 'test-styles',
      RenderingIdentifier: 'test-id',
    },
  };

  const mockFields: IFeaturedContentFields = {
    Title: {
      value: 'Test Title',
    },
    Description: {
      value: 'Test Description',
    },
    ContentCards: [],
    Logo: {
      value: {
        src: '/test-logo.png',
        alt: 'Test Logo',
        width: 100,
        height: 50,
      },
    },
    BackgroundImage: {
      value: {
        src: '/test-background.jpg',
        alt: 'Test Background',
        width: 1920,
        height: 1080,
      },
    },
    Content: {
      value: 'Test Content',
    },
  };

  it('should render NoCard variant component', () => {
    render(<NoCard fields={mockFields} params={mockParams} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.FEATURED_CONTENT)).toBeInTheDocument();
    expect(screen.getByText('FeaturedContentNoCardVariant')).toBeInTheDocument();
  });

  it('should pass fields and params to NoCard variant component', () => {
    render(<NoCard fields={mockFields} params={mockParams} />);

    const variant = screen.getByTestId(TEST_CASE_DATA_IDS.FEATURED_CONTENT);
    expect(variant).toBeInTheDocument();
    expect(variant.textContent).toBe('FeaturedContentNoCardVariant');
  });

  it('should handle empty fields in NoCard variant', () => {
    const emptyFields: IFeaturedContentFields = {
      Title: { value: '' },
      Description: { value: '' },
      ContentCards: [],
      Logo: { value: undefined },
      BackgroundImage: { value: undefined },
      Content: { value: '' },
    };

    render(<NoCard fields={emptyFields} params={mockParams} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.FEATURED_CONTENT)).toBeInTheDocument();
  });
});

describe('FeaturedContent LobbyExperience Variant', () => {
  const mockParams = {
    params: {
      styles: 'test-styles',
      RenderingIdentifier: 'test-id',
    },
  };

  const mockFields: IFeaturedContentLobbyExperienceFields = {
    Title: {
      value: 'Test Title',
    },
    Description: {
      value: 'Test Description',
    },
    ContentCards: [],
    Content: {
      value: 'Test Content',
    },
  };

  it('should render LobbyExperience variant component', () => {
    render(<LobbyExperience fields={mockFields} params={mockParams} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.FEATURED_CONTENT)).toBeInTheDocument();
    expect(screen.getByText('FeaturedContentLobbyExperienceVariant')).toBeInTheDocument();
  });

  it('should pass fields and params to LobbyExperience variant component', () => {
    render(<LobbyExperience fields={mockFields} params={mockParams} />);

    const variant = screen.getByTestId(TEST_CASE_DATA_IDS.FEATURED_CONTENT);
    expect(variant).toBeInTheDocument();
    expect(variant.textContent).toBe('FeaturedContentLobbyExperienceVariant');
  });

  it('should handle empty fields in LobbyExperience variant', () => {
    const emptyFields: IFeaturedContentLobbyExperienceFields = {
      Title: { value: '' },
      Description: { value: '' },
      ContentCards: [],
      Content: { value: '' },
    };

    render(<LobbyExperience fields={emptyFields} params={mockParams} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.FEATURED_CONTENT)).toBeInTheDocument();
  });
});

