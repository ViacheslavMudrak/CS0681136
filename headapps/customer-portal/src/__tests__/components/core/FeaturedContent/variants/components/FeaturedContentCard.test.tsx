import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import FeaturedContentCard from 'components/core/FeaturedContent/variants/components/FeaturedContentCard';
import { FEATURED_CONTENT_VARIANTS } from '../../../../../../helpers/enums';

// Mock Sitecore Content SDK components
vi.mock('@sitecore-content-sdk/nextjs', () => ({
  NextImage: ({ field, loading, width, height, 'aria-label': ariaLabel }: any) => {
    if (!field?.value?.src) return null;
    return (
      <img
        src={field.value.src}
        alt={field.value.alt || ''}
        loading={loading}
        width={width}
        height={height}
        aria-label={ariaLabel}
        data-testid="content-sdk-image"
      />
    );
  },
  Link: ({ field, className, editable, children }: any) => (
    <a href={field?.value?.href} className={className} data-testid="sitecore-link" data-editable={editable}>
      {children}
    </a>
  ),
}));

// Mock ChevronRightIcon (production uses CSS for color; optional stroke for footer links)
vi.mock('components/shared/icons/ChevronRightIcon', () => ({
  default: ({ stroke, width, height, className }: any) => (
    <svg
      data-testid="chevron-right-icon"
      stroke={stroke}
      width={width}
      height={height}
      className={className}
    >
      <path />
    </svg>
  ),
}));

function expectArrowWrapperClass(
  icon: HTMLElement,
  mode: "default" | "lobby"
): void {
  const wrapper = icon.parentElement;
  expect(wrapper).toBeTruthy();
  const className = wrapper?.className ?? "";
  if (mode === "lobby") {
    expect(className).toContain("[&_svg]:text-[#00287B]");
  } else {
    expect(className).toContain("[&_svg]:text-[#49B7F6]");
    expect(className).not.toContain("[&_svg]:text-[#00287B]");
  }
}

describe('FeaturedContentCard', () => {
  const createMockProps = (overrides?: any) => ({
    icon: {
      value: {
        src: '/test-icon.png',
        alt: 'Test Icon',
        width: 50,
        height: 50,
      },
    },
    iconAlt: 'Test Icon Alt',
    title: 'Test Title',
    description: 'Test Description',
    link: {
      value: {
        href: '/test-link',
        target: '_self',
      },
    },
    isSitecoreEditMode: false,
    variant: FEATURED_CONTENT_VARIANTS.DEFAULT,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render component with all props', () => {
      const props = createMockProps();
      render(<FeaturedContentCard {...props} />);

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByTestId('content-sdk-image')).toBeInTheDocument();
    });

    it('should render with correct aria-label', () => {
      const props = createMockProps();
      render(<FeaturedContentCard {...props} />);

      const image = screen.getByTestId('content-sdk-image');
      expect(image).toHaveAttribute('aria-label', 'Test Icon Alt');
    });
  });

  describe('Icon Rendering', () => {
    it('should render icon when src is provided', () => {
      const props = createMockProps();
      render(<FeaturedContentCard {...props} />);

      const image = screen.getByTestId('content-sdk-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/test-icon.png');
      expect(image).toHaveAttribute('alt', 'Test Icon');
      expect(image).toHaveAttribute('width', '50');
      expect(image).toHaveAttribute('height', '50');
    });

    it('should not render icon when src is not provided', () => {
      const props = createMockProps({
        icon: {
          value: {
            alt: 'Test Icon',
            width: 50,
            height: 50,
          },
        },
      });

      render(<FeaturedContentCard {...props} />);

      expect(screen.queryByTestId('content-sdk-image')).not.toBeInTheDocument();
    });

    it('should handle icon with undefined value', () => {
      const props = createMockProps({
        icon: {
          value: undefined,
        },
      });

      render(<FeaturedContentCard {...props} />);

      expect(screen.queryByTestId('content-sdk-image')).not.toBeInTheDocument();
    });

    it('should handle icon with null value', () => {
      const props = createMockProps({
        icon: null,
      });

      render(<FeaturedContentCard {...props} />);

      expect(screen.queryByTestId('content-sdk-image')).not.toBeInTheDocument();
    });

    it('should handle icon dimensions as strings', () => {
      const props = createMockProps({
        icon: {
          value: {
            src: '/test-icon.png',
            alt: 'Test Icon',
            width: '50',
            height: '50',
          },
        },
      });

      render(<FeaturedContentCard {...props} />);

      const image = screen.getByTestId('content-sdk-image');
      expect(image).toHaveAttribute('width', '50');
      expect(image).toHaveAttribute('height', '50');
    });

    it('should handle missing icon dimensions', () => {
      const props = createMockProps({
        icon: {
          value: {
            src: '/test-icon.png',
            alt: 'Test Icon',
          },
        },
      });

      render(<FeaturedContentCard {...props} />);

      const image = screen.getByTestId('content-sdk-image');
      expect(image).toBeInTheDocument();
      expect(image).not.toHaveAttribute('width');
      expect(image).not.toHaveAttribute('height');
    });
  });

  describe('Title and Description', () => {
    it('should render title', () => {
      const props = createMockProps();
      render(<FeaturedContentCard {...props} />);

      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should render description', () => {
      const props = createMockProps();
      render(<FeaturedContentCard {...props} />);

      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('should render title as React node', () => {
      const props = createMockProps({
        title: <span data-testid="custom-title">Custom Title</span>,
      });

      render(<FeaturedContentCard {...props} />);

      expect(screen.getByTestId('custom-title')).toBeInTheDocument();
    });

    it('should render description as React node', () => {
      const props = createMockProps({
        description: <div data-testid="custom-description">Custom Description</div>,
      });

      render(<FeaturedContentCard {...props} />);

      expect(screen.getByTestId('custom-description')).toBeInTheDocument();
    });
  });

  describe('Link Rendering', () => {
    it('should render link with href and target', () => {
      const props = createMockProps();
      render(<FeaturedContentCard {...props} />);

      const link = screen.getByText('Test Title').closest('a');
      expect(link).toHaveAttribute('href', '/test-link');
      expect(link).toHaveAttribute('target', '_self');
    });

    it('should handle link with _blank target', () => {
      const props = createMockProps({
        link: {
          value: {
            href: '/external-link',
            target: '_blank',
          },
        },
      });

      render(<FeaturedContentCard {...props} />);

      const link = screen.getByText('Test Title').closest('a');
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  describe('Variant Styling', () => {
    it('should apply default variant styles', () => {
      const props = createMockProps({
        variant: FEATURED_CONTENT_VARIANTS.DEFAULT,
      });

      const { container } = render(<FeaturedContentCard {...props} />);

      // Check that component renders (styles are applied via CSS classes)
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should apply lobby experience variant styles', () => {
      const props = createMockProps({
        variant: FEATURED_CONTENT_VARIANTS.LOBBY_EXPERIENCE,
      });

      const { container } = render(<FeaturedContentCard {...props} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should apply no card variant styles', () => {
      const props = createMockProps({
        variant: FEATURED_CONTENT_VARIANTS.NO_CARD,
      });

      const { container } = render(<FeaturedContentCard {...props} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should default to DEFAULT variant when variant is not provided', () => {
      const props = createMockProps();
      delete props.variant;

      render(<FeaturedContentCard {...props} />);

      expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument();
    });
  });

  describe('Arrow Icon', () => {
    it('should render arrow icon with default styling for DEFAULT variant', () => {
      const props = createMockProps({
        variant: FEATURED_CONTENT_VARIANTS.DEFAULT,
      });

      render(<FeaturedContentCard {...props} />);

      const icon = screen.getByTestId('chevron-right-icon');
      expect(icon).toBeInTheDocument();
      expectArrowWrapperClass(icon, 'default');
    });

    it('should render arrow icon with lobby styling for LOBBY_EXPERIENCE variant', () => {
      const props = createMockProps({
        variant: FEATURED_CONTENT_VARIANTS.LOBBY_EXPERIENCE,
      });

      render(<FeaturedContentCard {...props} />);

      const icon = screen.getByTestId('chevron-right-icon');
      expect(icon).toBeInTheDocument();
      expectArrowWrapperClass(icon, 'lobby');
    });

    it('should render arrow icon with default styling for NO_CARD variant', () => {
      const props = createMockProps({
        variant: FEATURED_CONTENT_VARIANTS.NO_CARD,
      });

      render(<FeaturedContentCard {...props} />);

      const icon = screen.getByTestId('chevron-right-icon');
      expect(icon).toBeInTheDocument();
      expectArrowWrapperClass(icon, 'default');
    });
  });

  describe('Sitecore Edit Mode', () => {
    it('should render edit link when isSitecoreEditMode is true', () => {
      const props = createMockProps({
        isSitecoreEditMode: true,
      });

      render(<FeaturedContentCard {...props} />);

      // Note: The component has nested <a> tags which is invalid HTML but exists in the component
      // We verify the edit link exists even though it's nested
      const editLink = screen.getByTestId('sitecore-link');
      expect(editLink).toBeInTheDocument();
      expect(editLink).toHaveTextContent('Edit Link');
      expect(editLink).toHaveAttribute('data-editable', 'true');
    });

    it('should not render edit link when isSitecoreEditMode is false', () => {
      const props = createMockProps({
        isSitecoreEditMode: false,
      });

      render(<FeaturedContentCard {...props} />);

      expect(screen.queryByTestId('sitecore-link')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      const props = createMockProps({
        title: '',
      });

      const { container } = render(<FeaturedContentCard {...props} />);

      const titleDiv = container.querySelector('[id$="-title"]');
      expect(titleDiv).toBeTruthy();
      expect(titleDiv?.textContent).toBe('');
    });

    it('should handle empty description', () => {
      const props = createMockProps({
        description: '',
      });

      const { container } = render(<FeaturedContentCard {...props} />);

      const descriptionDiv = container.querySelector('[id$="-description"]');
      expect(descriptionDiv).toBeTruthy();
      expect(descriptionDiv?.textContent).toBe('');
    });

    it('should handle missing link target', () => {
      const props = createMockProps({
        link: {
          value: {
            href: '/test-link',
          },
        },
      });

      render(<FeaturedContentCard {...props} />);

      const link = screen.getByText('Test Title').closest('a');
      expect(link).toHaveAttribute('href', '/test-link');
    });

    it('should handle iconAlt with empty string', () => {
      const props = createMockProps({
        iconAlt: '',
      });

      render(<FeaturedContentCard {...props} />);

      const image = screen.getByTestId('content-sdk-image');
      // When iconAlt is empty string, aria-label becomes undefined and is not rendered
      expect(image).not.toHaveAttribute('aria-label');
    });
  });
});
