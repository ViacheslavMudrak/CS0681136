import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentRendering, Page } from '@sitecore-content-sdk/nextjs';

import { Default } from 'components/carousel/Carousel';
import type { CarouselFields, CarouselProps } from 'components/carousel/Carousel.type';
import { CAROUSEL_EMPTY_HINT } from 'components/carousel/carouselUtils';

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const { testimonialSitecoreSdkMock } = await import('src/test/mocks/viteSafeMocks');
  return testimonialSitecoreSdkMock();
});

vi.mock('components/media/partial/MediaClient', () => ({
  MediaClient: () => <div data-testid="media-client-stub">Video</div>,
}));

const baseParams = {
  styles: '',
  RenderingIdentifier: 'carousel-test',
} as CarouselProps['params'];

const basePage = { mode: { isEditing: false } } as unknown as Page;

const baseRendering = {
  displayName: 'Carousel',
} as unknown as ComponentRendering;

describe('Carousel Default', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty hint when fields are missing', () => {
    render(
      <Default
        fields={undefined}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    const hint = screen.getByText(CAROUSEL_EMPTY_HINT);
    expect(hint).toBeInTheDocument();
    expect(hint).toHaveClass('is-empty-hint');
  });

  it('applies gray background token class when Background Color is Gray', () => {
    const fields: CarouselFields = {
      ContentType: {
        fields: { Value: { value: 'Media' } },
      },
      BackgroundColor: {
        fields: { Value: { value: 'Gray' } },
      },
      MediaItems: [
        {
          id: 'm1',
          displayName: 'Slide 1',
          fields: {
            MediaType: { fields: { Value: { value: 'Image' } } },
            Image: {
              value: { src: 'https://example.com/a.jpg', alt: 'A', width: '400', height: '300' },
            },
          },
        },
      ],
      ShowControls: { value: false },
      Autoplay: { value: false },
    };

    const { container } = render(
      <Default
        fields={fields}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );

    const chrome = container.querySelector('.bg-surface-muted');
    expect(chrome).toBeTruthy();
  });

  it('media mode does not render testimonial-only content', () => {
    const fields: CarouselFields = {
      ContentType: { fields: { Value: { value: 'Media' } } },
      BackgroundColor: { fields: { Value: { value: 'White' } } },
      MediaItems: [
        {
          id: 'm1',
          fields: {
            MediaType: { fields: { Value: { value: 'Image' } } },
            Image: {
              value: { src: 'https://example.com/x.jpg', alt: '', width: '100', height: '100' },
            },
          },
        },
      ],
      TestimonialItems: [
        {
          id: 't1',
          fields: {
            Quote: { value: 'SECRET_TESTIMONIAL_QUOTE_XYZ' },
          },
        },
      ],
      ShowControls: { value: false },
      Autoplay: { value: false },
    };

    render(
      <Default
        fields={fields}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );

    expect(screen.queryByText('SECRET_TESTIMONIAL_QUOTE_XYZ')).not.toBeInTheDocument();
  });

  it('testimonial mode advances via dot control and updates active slide', async () => {
    const user = userEvent.setup();
    const fields: CarouselFields = {
      ContentType: { fields: { Value: { value: 'Testimonial' } } },
      BackgroundColor: { fields: { Value: { value: 'White' } } },
      MediaItems: [
        {
          id: 'm1',
          fields: {
            MediaType: { fields: { Value: { value: 'Image' } } },
            Image: {
              value: { src: 'https://example.com/y.jpg', alt: '', width: '100', height: '100' },
            },
          },
        },
      ],
      TestimonialItems: [
        {
          id: 't1',
          displayName: 'T1',
          fields: { Quote: { value: 'First quote body' } },
        },
        {
          id: 't2',
          displayName: 'T2',
          fields: { Quote: { value: 'Second quote body' } },
        },
      ],
      ShowControls: { value: true },
      Autoplay: { value: false },
    };

    render(
      <Default
        fields={fields}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );

    const firstSlide = document.querySelector('[data-carousel-slide-id="t1"]');
    const secondSlide = document.querySelector('[data-carousel-slide-id="t2"]');
    expect(firstSlide?.getAttribute('aria-hidden')).not.toBe('true');
    expect(secondSlide).toHaveAttribute('aria-hidden', 'true');
    expect(secondSlide).toHaveAttribute('inert');

    const dots = screen.getAllByRole('button', { name: /go to slide/i });
    expect(dots[0]).toHaveAttribute('aria-current', 'true');
    expect(dots[1]).not.toHaveAttribute('aria-current');

    await user.click(screen.getByRole('button', { name: /go to slide 2/i }));

    const firstAfter = document.querySelector('[data-carousel-slide-id="t1"]');
    const secondAfter = document.querySelector('[data-carousel-slide-id="t2"]');
    expect(secondAfter?.getAttribute('aria-hidden')).not.toBe('true');
    expect(firstAfter).toHaveAttribute('aria-hidden', 'true');
    expect(dots[1]).toHaveAttribute('aria-current', 'true');
  });

  it('testimonial mode renders prev/next when Show Controls is on and next updates dots', async () => {
    const user = userEvent.setup();
    const fields: CarouselFields = {
      ContentType: { fields: { Value: { value: 'Testimonial' } } },
      BackgroundColor: { fields: { Value: { value: 'White' } } },
      MediaItems: [],
      TestimonialItems: [
        {
          id: 't1',
          displayName: 'T1',
          fields: { Quote: { value: 'First quote body' } },
        },
        {
          id: 't2',
          displayName: 'T2',
          fields: { Quote: { value: 'Second quote body' } },
        },
      ],
      ShowControls: { value: true },
      Autoplay: { value: false },
    };

    render(
      <Default
        fields={fields}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );

    expect(screen.getByRole('button', { name: /previous slide/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next slide/i })).toBeInTheDocument();

    const dots = screen.getAllByRole('button', { name: /go to slide/i });
    expect(dots[0]).toHaveAttribute('aria-current', 'true');

    await user.click(screen.getByRole('button', { name: /next slide/i }));

    expect(document.querySelector('[data-carousel-slide-id="t2"]')?.getAttribute('aria-hidden')).not.toBe(
      'true',
    );
    expect(document.querySelector('[data-carousel-slide-id="t1"]')).toHaveAttribute('aria-hidden', 'true');
    expect(dots[1]).toHaveAttribute('aria-current', 'true');
  });

  it('focusable carousel region moves to first and last slide with Home and End', () => {
    const fields: CarouselFields = {
      ContentType: { fields: { Value: { value: 'Testimonial' } } },
      BackgroundColor: { fields: { Value: { value: 'White' } } },
      MediaItems: [],
      TestimonialItems: [
        {
          id: 't1',
          displayName: 'T1',
          fields: { Quote: { value: 'First quote body' } },
        },
        {
          id: 't2',
          displayName: 'T2',
          fields: { Quote: { value: 'Second quote body' } },
        },
      ],
      ShowControls: { value: false },
      Autoplay: { value: false },
    };

    render(
      <Default
        fields={fields}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );

    const region = screen.getByRole('region', { name: 'Carousel' });
    region.focus();

    fireEvent.keyDown(region, { key: 'End' });
    expect(document.querySelector('[data-carousel-slide-id="t2"]')?.getAttribute('aria-hidden')).not.toBe(
      'true',
    );
    expect(document.querySelector('[data-carousel-slide-id="t1"]')).toHaveAttribute('aria-hidden', 'true');

    fireEvent.keyDown(region, { key: 'Home' });
    expect(document.querySelector('[data-carousel-slide-id="t1"]')?.getAttribute('aria-hidden')).not.toBe(
      'true',
    );
    expect(document.querySelector('[data-carousel-slide-id="t2"]')).toHaveAttribute('aria-hidden', 'true');
  });
});
