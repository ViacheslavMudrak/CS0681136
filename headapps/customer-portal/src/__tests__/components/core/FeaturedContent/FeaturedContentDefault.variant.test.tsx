import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { FeaturedContentDefaultVariant } from 'components/core/FeaturedContent/variants/FeaturedContentDefault.variant';
import { TEST_CASE_DATA_IDS } from '../../../../helpers/enums';
import type { IFeaturedContentFields } from 'components/core/FeaturedContent/FeaturedContent.type';

// Mock Sitecore Content SDK components
vi.mock('@sitecore-content-sdk/nextjs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sitecore-content-sdk/nextjs')>();
  
  // Create a mock context value
  const mockContextValue = {
    page: {
      layout: {
        sitecore: {
          context: {
            pageState: actual.LayoutServicePageState?.Normal || 'normal',
          },
        },
      },
    },
  };

  // Create a React context
  const SitecoreProviderReactContext = React.createContext(mockContextValue);

  return {
    ...actual,
    NextImage: ({ field, className, loading, width, height }: any) => {
      if (!field?.value?.src) return null;
      return (
        <img
          src={field.value.src}
          alt={field.value.alt || ''}
          className={className}
          loading={loading}
          width={width}
          height={height}
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
    SitecoreProviderReactContext,
  };
});

// Mock FeaturedContentCard component
vi.mock('components/core/FeaturedContent/variants/components/FeaturedContentCard', () => ({
  default: ({ icon, iconAlt, title, description }: any) => {
    // Handle icon field - it's an ImageField object, not a ReactNode
    const iconElement = icon?.value?.src ? (
      <img
        src={icon.value.src}
        alt={icon.value.alt || iconAlt || ''}
        data-testid="card-icon"
      />
    ) : null;
    
    return (
      <div data-testid="featured-content-card" aria-label={iconAlt}>
        {iconElement}
        {title}
        {description}
      </div>
    );
  },
}));

describe('FeaturedContentDefaultVariant', () => {
  const mockParams = {
    params: {
      styles: 'test-styles',
      RenderingIdentifier: 'test-id',
    },
  };

  const createMockFields = (overrides?: Partial<IFeaturedContentFields>): IFeaturedContentFields => ({
    PrimaryTitle: {
      value: 'Test Title',
    },
    SecondaryTitle: {
      value: '',
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
      render(<FeaturedContentDefaultVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      expect(screen.getByTestId(TEST_CASE_DATA_IDS.FEATURED_CONTENT)).toBeInTheDocument();
    });

    it('should render empty div when fields are not provided', () => {
      render(<FeaturedContentDefaultVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={null as any} params={mockParams} />);

      const container = screen.getByTestId(TEST_CASE_DATA_IDS.FEATURED_CONTENT);
      expect(container).toBeInTheDocument();
      expect(container.children.length).toBe(0);
    });
  });

  describe('Title and Description', () => {
    it('should render title field', () => {
      const fields = createMockFields();
      render(<FeaturedContentDefaultVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      const textElements = screen.getAllByTestId('content-sdk-text');
      expect(textElements.length).toBeGreaterThan(0);
      expect(textElements.some(el => el.textContent === 'Test Title')).toBe(true);
    });

    it('should render description field', () => {
      const fields = createMockFields();
      render(<FeaturedContentDefaultVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      expect(screen.getByText('Test Description')).toBeInTheDocument();
      const richTextElements = screen.getAllByTestId('content-sdk-rich-text');
      expect(richTextElements.length).toBeGreaterThan(0);
      expect(richTextElements.some(el => el.textContent === 'Test Description')).toBe(true);
    });

    it('should handle empty title field', () => {
      const fields = createMockFields({ PrimaryTitle: { value: '' }, SecondaryTitle: { value: '' }, Content: { value: '' } });
      render(<FeaturedContentDefaultVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      // Title text should not be rendered, but other text elements might exist
      expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    });

    it('should handle empty description field', () => {
      const fields = createMockFields({ Description: { value: '' }, Content: { value: '' } });
      render(<FeaturedContentDefaultVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      // Description should not be rendered when empty
      const descriptionText = screen.queryByText('Test Description');
      expect(descriptionText).not.toBeInTheDocument();
      
      // No rich text elements should be present when both Description and Content are empty
      const richTextElements = screen.queryAllByTestId('content-sdk-rich-text');
      expect(richTextElements.length).toBe(0);
    });
  });

  describe('Background Image', () => {
    it('should render background image when provided', () => {
      const fields = createMockFields();
      render(<FeaturedContentDefaultVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      // Background image is rendered via CSS background-image, not as an img tag
      // Check that the background container exists with the background image style
      const container = screen.getByTestId(TEST_CASE_DATA_IDS.FEATURED_CONTENT);
      const backgroundDiv = container.querySelector('[style*="background-image"]');
      expect(backgroundDiv).toBeInTheDocument();
      expect(backgroundDiv).toHaveStyle({ backgroundImage: 'url("/test-background.jpg")' });
    });

    it('should not render background sections when background image is missing', () => {
      const fields = createMockFields({ BackgroundImage: { value: undefined } });
      render(<FeaturedContentDefaultVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      // When background image is missing, nothing should render (empty div)
      const container = screen.getByTestId(TEST_CASE_DATA_IDS.FEATURED_CONTENT);
      expect(container.children.length).toBe(0);
      const images = screen.queryAllByTestId('content-sdk-image');
      expect(images.length).toBe(0);
    });

    it('should not render background sections when background image src is missing', () => {
      const fields = createMockFields({
        BackgroundImage: {
          value: {
            alt: 'Test',
            width: 100,
            height: 100,
          },
        },
      });
      render(<FeaturedContentDefaultVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      // When background image src is missing, nothing should render (empty div)
      const container = screen.getByTestId(TEST_CASE_DATA_IDS.FEATURED_CONTENT);
      expect(container.children.length).toBe(0);
      const images = screen.queryAllByTestId('content-sdk-image');
      expect(images.length).toBe(0);
    });
  });

  describe('Logo', () => {
    it('should render logo for desktop view', () => {
      const fields = createMockFields();
      render(<FeaturedContentDefaultVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      const images = screen.getAllByTestId('content-sdk-image');
      const logoImages = images.filter((img) => img.getAttribute('src') === '/test-logo.png');
      expect(logoImages.length).toBeGreaterThan(0);
    });

    it('should not render logo when logo field is missing', () => {
      const fields = createMockFields({ Logo: { value: undefined } });
      render(<FeaturedContentDefaultVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      const images = screen.queryAllByTestId('content-sdk-image');
      const logoImages = images.filter((img) => img.getAttribute('src') === '/test-logo.png');
      expect(logoImages.length).toBe(0);
    });

    it('should not render logo when logo src is missing', () => {
      const fields = createMockFields({
        Logo: {
          value: {
            alt: 'Test Logo',
            width: 100,
            height: 50,
          },
        },
      });
      render(<FeaturedContentDefaultVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      const images = screen.queryAllByTestId('content-sdk-image');
      const logoImages = images.filter((img) => img.getAttribute('src') === '/test-logo.png');
      expect(logoImages.length).toBe(0);
    });
  });

  describe('Content Cards', () => {
    it('should render content cards when provided', () => {
      const fields = createMockFields({
        ContentCards: [
          {
            id: 'card-1',
            url: '/card-1',
            name: 'Card 1',
            displayName: 'Card 1',
            fields: {
              Title: { value: 'Card Title 1' },
              Description: { value: 'Card Description 1' },
              Icon: {
                value: {
                  src: '/card-icon-1.png',
                  alt: 'Card Icon 1',
                  width: 50,
                  height: 50,
                },
              },
              Link: { value: { href: '/link-1' } },
            },
          },
          {
            id: 'card-2',
            url: '/card-2',
            name: 'Card 2',
            displayName: 'Card 2',
            fields: {
              Title: { value: 'Card Title 2' },
              Description: { value: 'Card Description 2' },
              Icon: {
                value: {
                  src: '/card-icon-2.png',
                  alt: 'Card Icon 2',
                  width: 50,
                  height: 50,
                },
              },
              Link: { value: { href: '/link-2' } },
            },
          },
        ],
      });

      render(<FeaturedContentDefaultVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      const cards = screen.getAllByTestId('featured-content-card');
      expect(cards.length).toBe(2);
    });

    it('should render empty cards array', () => {
      const fields = createMockFields({ ContentCards: [] });
      render(<FeaturedContentDefaultVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      const cards = screen.queryAllByTestId('featured-content-card');
      expect(cards.length).toBe(0);
    });

    it('should handle card with missing icon', () => {
      const fields = createMockFields({
        ContentCards: [
          {
            id: 'card-1',
            url: '/card-1',
            name: 'Card 1',
            displayName: 'Card 1',
            fields: {
              Title: { value: 'Card Title 1' },
              Description: { value: 'Card Description 1' },
              Icon: { value: undefined },
              Link: { value: { href: '/link-1' } },
            },
          },
        ],
      });

      render(<FeaturedContentDefaultVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      const card = screen.getByTestId('featured-content-card');
      expect(card).toBeInTheDocument();
      // Icon should not be rendered
      const iconImages = card.querySelectorAll('[data-testid="card-icon"]');
      expect(iconImages.length).toBe(0);
    });

    it('should handle card with icon missing src', () => {
      const fields = createMockFields({
        ContentCards: [
          {
            id: 'card-1',
            url: '/card-1',
            name: 'Card 1',
            displayName: 'Card 1',
            fields: {
              Title: { value: 'Card Title 1' },
              Description: { value: 'Card Description 1' },
              Icon: {
                value: {
                  alt: 'Card Icon 1',
                  width: 50,
                  height: 50,
                },
              },
              Link: { value: { href: '/link-1' } },
            },
          },
        ],
      });

      render(<FeaturedContentDefaultVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      const card = screen.getByTestId('featured-content-card');
      expect(card).toBeInTheDocument();
      // Icon should not be rendered without src
      const iconImages = card.querySelectorAll('[data-testid="card-icon"]');
      expect(iconImages.length).toBe(0);
    });

    it('should use displayName as iconAlt fallback', () => {
      const fields = createMockFields({
        ContentCards: [
          {
            id: 'card-1',
            url: '/card-1',
            name: 'Card 1',
            displayName: 'Test Card Display Name',
            fields: {
              Title: { value: 'Card Title 1' },
              Description: { value: 'Card Description 1' },
              Icon: {
                value: {
                  src: '/card-icon-1.png',
                  width: 50,
                  height: 50,
                },
              },
              Link: { value: { href: '/link-1' } },
            },
          },
        ],
      });

      render(<FeaturedContentDefaultVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      const card = screen.getByTestId('featured-content-card');
      expect(card).toHaveAttribute('aria-label', 'Test Card Display Name');
    });
  });

  describe('Content Field', () => {
    it('should render content field when provided', () => {
      const fields = createMockFields({ Content: { value: 'Additional Content' } });
      render(<FeaturedContentDefaultVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      expect(screen.getByText('Additional Content')).toBeInTheDocument();
    });

    it('should not render content field when value is empty', () => {
      const fields = createMockFields({ Content: { value: '' } });
      render(<FeaturedContentDefaultVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      // Content field should not be rendered when empty
      const contentTexts = screen.queryAllByText('Test Content');
      expect(contentTexts.length).toBe(0);
    });

    it('should not render content field when value is undefined', () => {
      const fields = createMockFields({ Content: { value: undefined } });
      render(<FeaturedContentDefaultVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      // Content field should not be rendered when undefined
      const contentTexts = screen.queryAllByText('Test Content');
      expect(contentTexts.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined ContentCards', () => {
      const fields = createMockFields({ ContentCards: undefined as any });
      render(<FeaturedContentDefaultVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      const cards = screen.queryAllByTestId('featured-content-card');
      expect(cards.length).toBe(0);
    });

    it('should handle partial field data', () => {
      const partialFields = {
        PrimaryTitle: { value: 'Partial Title' },
      } as unknown as IFeaturedContentFields;

      render(<FeaturedContentDefaultVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={partialFields} params={mockParams} />);

      expect(screen.getByTestId(TEST_CASE_DATA_IDS.FEATURED_CONTENT)).toBeInTheDocument();
    });
  });
});

