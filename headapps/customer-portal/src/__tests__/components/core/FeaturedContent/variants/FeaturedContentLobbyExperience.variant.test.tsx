import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { FeaturedContentLobbyExperienceVariant } from 'components/core/FeaturedContent/variants/FeaturedContentLobbyExperience.variant';
import { TEST_CASE_DATA_IDS } from '../../../../../helpers/enums';
import type { IFeaturedContentLobbyExperienceFields } from 'components/core/FeaturedContent/FeaturedContent.type';
import { fetchUserProfile } from '@/lib/apis/user-profile-api';

const mockReplace = vi.fn();

vi.mock('@okta/okta-react', () => ({
  useOktaAuth: () => ({
    authState: {
      isAuthenticated: true,
      idToken: { claims: { email: 'lobby.user@example.com' } },
    },
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
}));

vi.mock('@/lib/apis/user-profile-api', () => ({
  fetchUserProfile: vi.fn(),
}));

vi.mock('@/lib/user-profile-session-storage', () => ({
  storeUserProfile: vi.fn(),
}));

vi.mock('@/lib/locale-cookie', () => ({
  getPreferredLocalePath: vi.fn((pathname: string, locale: string) =>
    pathname === '/' && locale === 'fr' ? '/fr' : '/',
  ),
}));

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
  default: ({ icon, iconAlt, title, description, variant }: any) => {
    // Handle icon as ImageField object - render it if it has a value with src
    const iconElement = icon?.value?.src ? (
      <img
        src={icon.value.src}
        alt={icon.value.alt || iconAlt || ''}
        data-testid="card-icon"
      />
    ) : null;

    return (
      <div data-testid="featured-content-card" aria-label={iconAlt} data-variant={variant}>
        {iconElement}
        {title}
        {description}
      </div>
    );
  },
}));

// Mock ChevronRightIcon
vi.mock('components/shared/icons/ChevronRightIcon', () => ({
  default: ({ stroke, width, height }: any) => (
    <svg
      data-testid="chevron-right-icon"
      stroke={stroke}
      width={width}
      height={height}
    >
      <path />
    </svg>
  ),
}));

describe('FeaturedContentLobbyExperienceVariant', () => {
  const mockParams = {
    params: {
      styles: 'test-styles',
      RenderingIdentifier: 'test-id',
    },
  };

  const createMockFields = (
    overrides?: Partial<IFeaturedContentLobbyExperienceFields>
  ): IFeaturedContentLobbyExperienceFields =>
    ({
      PrimaryTitle: {
        value: 'Explore while you wait',
      },
      Description: {
        value: 'Discover our resources and tools already available.',
      },
      ContentCards: [],
      Content: {
        value: '',
      },
      WebsiteURL: {
        value: {
          href: 'https://example.com',
          text: 'example.com',
        },
      },
      ...overrides,
    }) as IFeaturedContentLobbyExperienceFields;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReplace.mockClear();
    vi.mocked(fetchUserProfile).mockResolvedValue({
      parentContact: [],
      leads: [],
    });
  });

  describe('Component Rendering', () => {
    it('should render component with test id', () => {
      const fields = createMockFields();
      render(<FeaturedContentLobbyExperienceVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      expect(screen.getByTestId(TEST_CASE_DATA_IDS.FEATURED_CONTENT)).toBeInTheDocument();
    });

    it('should render empty div when fields are not provided', () => {
      render(<FeaturedContentLobbyExperienceVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={null as any} params={mockParams} />);

      const container = screen.getByTestId(TEST_CASE_DATA_IDS.FEATURED_CONTENT);
      expect(container).toBeInTheDocument();
      expect(container.children.length).toBe(0);
    });
  });

  describe('Title and Description', () => {
    it('should render title field', () => {
      const fields = createMockFields();
      render(<FeaturedContentLobbyExperienceVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      expect(screen.getByText('Explore while you wait')).toBeInTheDocument();
      const textElements = screen.getAllByTestId('content-sdk-text');
      expect(textElements.length).toBeGreaterThan(0);
      expect(textElements.some(el => el.textContent === 'Explore while you wait')).toBe(true);
    });

    it('should render description field', () => {
      const fields = createMockFields();
      render(<FeaturedContentLobbyExperienceVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      expect(screen.getByText('Discover our resources and tools already available.')).toBeInTheDocument();
      expect(screen.getByTestId('content-sdk-rich-text')).toBeInTheDocument();
    });

    it('should handle empty title field', () => {
      const fields = createMockFields({ PrimaryTitle: { value: '' } });
      render(<FeaturedContentLobbyExperienceVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      expect(screen.queryByText('Explore while you wait')).not.toBeInTheDocument();
    });

    it('should handle empty description field', () => {
      const fields = createMockFields({ Description: { value: '' } });
      render(<FeaturedContentLobbyExperienceVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      expect(screen.queryByText('Discover our resources and tools already available.')).not.toBeInTheDocument();
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

      render(<FeaturedContentLobbyExperienceVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      const cards = screen.getAllByTestId('featured-content-card');
      expect(cards.length).toBe(2);
      // Verify variant is passed correctly
      cards.forEach(card => {
        expect(card).toHaveAttribute('data-variant', 'lobbyExperience');
      });
    });

    it('should render empty cards array', () => {
      const fields = createMockFields({ ContentCards: [] });
      render(<FeaturedContentLobbyExperienceVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

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

      render(<FeaturedContentLobbyExperienceVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      const card = screen.getByTestId('featured-content-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('aria-label', '');
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

      render(<FeaturedContentLobbyExperienceVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      const card = screen.getByTestId('featured-content-card');
      expect(card).toBeInTheDocument();
    });

    it('should use icon alt as iconAlt when provided', () => {
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
                  alt: 'Test Icon Alt',
                  width: 50,
                  height: 50,
                },
              },
              Link: { value: { href: '/link-1' } },
            },
          },
        ],
      });

      render(<FeaturedContentLobbyExperienceVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      const card = screen.getByTestId('featured-content-card');
      expect(card).toHaveAttribute('aria-label', 'Test Icon Alt');
    });

    it('should use empty string as iconAlt fallback when alt is missing', () => {
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

      render(<FeaturedContentLobbyExperienceVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      const card = screen.getByTestId('featured-content-card');
      expect(card).toHaveAttribute('aria-label', '');
    });
  });

  describe('Auth footer (CopyRightText via AuthFooterInfo)', () => {
    it('should render copyright when CopyRightText is provided', () => {
      const fields = createMockFields({ CopyRightText: { value: 'Footer information text' } });
      render(<FeaturedContentLobbyExperienceVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      expect(screen.getByText('Footer information text')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument();
    });

    it('should not render footer chevron when CopyRightText field is missing', () => {
      const fields = createMockFields({
        CopyRightText: undefined as unknown as IFeaturedContentLobbyExperienceFields['CopyRightText'],
      });
      render(<FeaturedContentLobbyExperienceVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      expect(screen.queryByTestId('chevron-right-icon')).not.toBeInTheDocument();
    });

    it('should not render footer chevron when CopyRightText field is null', () => {
      const fields = createMockFields({
        CopyRightText: null as unknown as IFeaturedContentLobbyExperienceFields['CopyRightText'],
      });
      render(<FeaturedContentLobbyExperienceVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      expect(screen.queryByTestId('chevron-right-icon')).not.toBeInTheDocument();
    });

    it('should render ChevronRightIcon with correct props when CopyRightText is present', () => {
      const fields = createMockFields({ CopyRightText: { value: 'Footer text' } });
      render(<FeaturedContentLobbyExperienceVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      const icon = screen.getByTestId('chevron-right-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('stroke', '#0377BA');
      expect(icon).toHaveAttribute('width', '6');
      expect(icon).toHaveAttribute('height', '9');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined ContentCards', () => {
      const fields = createMockFields({ ContentCards: undefined as any });
      render(<FeaturedContentLobbyExperienceVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      const cards = screen.queryAllByTestId('featured-content-card');
      expect(cards.length).toBe(0);
    });

    it('should handle partial field data', () => {
      const partialFields = {
        PrimaryTitle: { value: 'Partial Title' },
        Description: { value: '' },
        ContentCards: [],
        WebsiteURL: { value: { href: 'https://example.com', text: 'example' } },
        BottomInfo: { value: '' },
      } as unknown as IFeaturedContentLobbyExperienceFields;

      render(<FeaturedContentLobbyExperienceVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={partialFields} params={mockParams} />);

      expect(screen.getByTestId(TEST_CASE_DATA_IDS.FEATURED_CONTENT)).toBeInTheDocument();
    });

    it('should render formCard structure correctly', () => {
      const fields = createMockFields();
      const { container } = render(<FeaturedContentLobbyExperienceVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      // Check that the formCard structure is rendered
      const formCard = container.querySelector('[data-testid="featured-content"]');
      expect(formCard).toBeInTheDocument();
    });
  });

  describe('Lobby profile redirect', () => {
    it('redirects to localized home when parentContact exists', async () => {
      vi.mocked(fetchUserProfile).mockResolvedValue({
        parentContact: [{ id: 'p1', childContacts: [] }],
        leads: [],
        userPreference: { defaultLanguage: 'fr' },
      });

      const fields = createMockFields();
      render(<FeaturedContentLobbyExperienceVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/fr');
      });

      expect(fetchUserProfile).toHaveBeenCalledWith({ email: 'lobby.user@example.com' });
    });

    it('does not redirect when parentContact is empty', async () => {
      vi.mocked(fetchUserProfile).mockResolvedValue({
        parentContact: [],
        leads: [],
      });

      const fields = createMockFields();
      render(<FeaturedContentLobbyExperienceVariant testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT} fields={fields} params={mockParams} />);

      await waitFor(() => {
        expect(fetchUserProfile).toHaveBeenCalledWith({ email: 'lobby.user@example.com' });
      });

      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});
