import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeaturedContentNoCardVariant } from 'components/core/FeaturedContent/variants/FeaturedContentNoCard.variant';
import { TEST_CASE_DATA_IDS } from '../../../../../helpers/enums';
import type { IFeaturedContentFields } from 'components/core/FeaturedContent/FeaturedContent.type';

// Mock Sitecore Content SDK components
vi.mock('@sitecore-content-sdk/nextjs', () => ({
  NextImage: ({ field, className, loading }: any) => {
    if (!field?.value?.src) return null;
    return (
      <img
        src={field.value.src}
        alt={field.value.alt || ''}
        className={className}
        loading={loading}
        data-testid="content-sdk-image"
      />
    );
  },
  RichText: ({ field, className }: any) => {
    if (!field?.value) return null;
    return (
      <div className={className} data-testid="content-sdk-rich-text">
        {field.value}
      </div>
    );
  },
  Text: ({ field, tag: Tag = 'div', className }: any) => {
    if (!field?.value) return null;
    return (
      <Tag className={className} data-testid="content-sdk-text">
        {field.value}
      </Tag>
    );
  },
}));

// Mock FullHeightBackground component
vi.mock('components/core/FeaturedContent/variants/components/FullHeightBackground', () => ({
  default: ({ imageUrl, children }: any) => (
    <div data-testid="full-height-background" data-image-url={imageUrl}>
      {children}
    </div>
  ),
}));

describe('FeaturedContentNoCardVariant', () => {
  const mockParams = {
    params: {
      styles: 'test-styles',
      RenderingIdentifier: 'test-id',
    },
  };

  const createMockFields = (overrides?: Partial<IFeaturedContentFields>): IFeaturedContentFields => ({
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
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render component with test id', () => {
      const fields = createMockFields();
      render(<FeaturedContentNoCardVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      expect(screen.getByTestId(TEST_CASE_DATA_IDS.FEATURED_CONTENT)).toBeInTheDocument();
    });

    it('should render empty div when fields are not provided', () => {
      render(<FeaturedContentNoCardVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={null as any} params={mockParams} />);

      const container = screen.getByTestId(TEST_CASE_DATA_IDS.FEATURED_CONTENT);
      expect(container).toBeInTheDocument();
      expect(container.children.length).toBe(0);
    });
  });

  describe('Background Image', () => {
    it('should render FullHeightBackground when background image is provided', () => {
      const fields = createMockFields();
      render(<FeaturedContentNoCardVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      const background = screen.getByTestId('full-height-background');
      expect(background).toBeInTheDocument();
      expect(background).toHaveAttribute('data-image-url', '/test-background.jpg');
    });

    it('should not render FullHeightBackground when background image is missing', () => {
      const fields = createMockFields({ BackgroundImage: { value: undefined } });
      render(<FeaturedContentNoCardVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      expect(screen.queryByTestId('full-height-background')).not.toBeInTheDocument();
    });

    it('should not render FullHeightBackground when background image src is missing', () => {
      const fields = createMockFields({
        BackgroundImage: {
          value: {
            alt: 'Test',
            width: 100,
            height: 100,
          },
        },
      });
      render(<FeaturedContentNoCardVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      expect(screen.queryByTestId('full-height-background')).not.toBeInTheDocument();
    });
  });

  describe('Content Field', () => {
    it('should render content field when provided', () => {
      const fields = createMockFields({ Content: { value: 'Additional Content' }, Description: { value: '' } });
      render(<FeaturedContentNoCardVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      expect(screen.getByText('Additional Content')).toBeInTheDocument();
      const richTextElements = screen.getAllByTestId('content-sdk-rich-text');
      expect(richTextElements.length).toBeGreaterThan(0);
      expect(richTextElements.some(el => el.textContent === 'Additional Content')).toBe(true);
    });

    it('should not render content field when value is empty', () => {
      const fields = createMockFields({ Content: { value: '' }, Description: { value: '' } });
      render(<FeaturedContentNoCardVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      // When both Content and Description are empty, no rich text elements should be present
      const richTextElements = screen.queryAllByTestId('content-sdk-rich-text');
      expect(richTextElements.length).toBe(0);
    });

    it('should not render content field when value is undefined', () => {
      const fields = createMockFields({ Content: { value: undefined }, Description: { value: '' } });
      render(<FeaturedContentNoCardVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      // When Content is undefined and Description is empty, no rich text elements should be present
      const richTextElements = screen.queryAllByTestId('content-sdk-rich-text');
      expect(richTextElements.length).toBe(0);
    });

    it('should render content inside FullHeightBackground when background is present', () => {
      const fields = createMockFields({ Content: { value: 'Test Content' } });
      render(<FeaturedContentNoCardVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      const background = screen.getByTestId('full-height-background');
      expect(background).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle partial field data', () => {
      const partialFields = {
        BackgroundImage: {
          value: {
            src: '/test-background.jpg',
            alt: 'Test Background',
            width: 1920,
            height: 1080,
          },
        },
        Content: { value: 'Test Content' },
      } as unknown as IFeaturedContentFields;

      render(<FeaturedContentNoCardVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={partialFields} params={mockParams} />);

      expect(screen.getByTestId(TEST_CASE_DATA_IDS.FEATURED_CONTENT)).toBeInTheDocument();
      expect(screen.getByTestId('full-height-background')).toBeInTheDocument();
    });

    it('should handle missing BackgroundImage field', () => {
      const partialFields = {
        Content: { value: 'Test Content' },
      } as unknown as IFeaturedContentFields;

      render(<FeaturedContentNoCardVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={partialFields} params={mockParams} />);

      expect(screen.getByTestId(TEST_CASE_DATA_IDS.FEATURED_CONTENT)).toBeInTheDocument();
      expect(screen.queryByTestId('full-height-background')).not.toBeInTheDocument();
    });

    it('should handle empty string background image src', () => {
      const fields = createMockFields({
        BackgroundImage: {
          value: {
            src: '',
            alt: 'Test',
            width: 100,
            height: 100,
          },
        },
      });
      render(<FeaturedContentNoCardVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      expect(screen.queryByTestId('full-height-background')).not.toBeInTheDocument();
    });
  });
});
