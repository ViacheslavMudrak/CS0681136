import { JSX } from 'react';

import { getFieldStringValue } from 'components/divider/dividerUtils';

import type { CarouselProps } from './Carousel.type';
import { CarouselClient } from './partial/CarouselClient';
import { cn } from 'lib/utils';
import {
  CAROUSEL_EMPTY_HINT,
  carouselMediaItemIsActive,
  carouselTestimonialItemIsActive,
  getCarouselRenderingDisplayName,
  readCarouselCheckbox,
  resolveCarouselContentKind,
  resolveCarouselFields,
} from './carouselUtils';

/**
 * @param fields - Carousel datasource (flat Edge JSON or integrated `data.datasource`)
 * @param params - Rendering params (`styles`, `RenderingIdentifier`)
 * @param page - Page context; uses `page.mode.isEditing`
 * @param rendering - Layout rendering metadata (display name for a11y)
 * @returns Section with `component` / `component-content` wrapper, or null when there are no slides and not in editing mode
 */
export const Default = ({
  fields,
  params,
  page,
  rendering,
}: CarouselProps): JSX.Element | null => {
  const { isEditing } = page.mode;
  const { styles, RenderingIdentifier: id } = params;

  if (!fields) {
    return (
      <section
        className={cn('component carousel w-full min-w-0 max-w-full', styles ?? '')}
        id={id}
      >
        <div className="component-content">
          <span className="is-empty-hint">{CAROUSEL_EMPTY_HINT}</span>
        </div>
      </section>
    );
  }

  const resolved = resolveCarouselFields(fields);
  const contentKind = resolveCarouselContentKind(resolved.contentType);
  const carouselBgRaw = getFieldStringValue(resolved.backgroundColor?.fields?.Value).toLowerCase();
  const carouselBgName = (
    resolved.backgroundColor?.name ?? resolved.backgroundColor?.displayName ?? ''
  ).toLowerCase();
  const carouselBgValue = carouselBgRaw || carouselBgName;
  const isGrayCarouselBackground =
    carouselBgValue.includes('gray') || carouselBgValue.includes('grey');
  const showControls = readCarouselCheckbox(resolved.showControls);
  const autoplay = readCarouselCheckbox(resolved.autoplay);

  const mediaItems =
    contentKind === 'media' ?
      resolved.mediaItems.filter((item) => carouselMediaItemIsActive(item, isEditing))
    : [];

  const testimonialItems =
    contentKind === 'testimonial' ?
      resolved.testimonialItems.filter((item) =>
        carouselTestimonialItemIsActive(item, isEditing),
      )
    : [];

  const slideCount = contentKind === 'media' ? mediaItems.length : testimonialItems.length;

  if (slideCount === 0 && !isEditing) {
    return null;
  }

  return (
    <section
      className={cn('component carousel w-full min-w-0 max-w-full', styles ?? '')}
      id={id}
    >
      <div
        className={cn(
          'component-content w-full min-w-0 max-w-full',
          contentKind === 'testimonial' && ' md:pt-4 md:pb-4',
        )}
      >
        <CarouselClient
          isEditing={isEditing}
          renderingDisplayName={getCarouselRenderingDisplayName(rendering)}
          contentKind={contentKind}
          backgroundClass={
            isGrayCarouselBackground ? 'bg-surface-muted' : 'bg-surface'
          }
          showControls={showControls}
          autoplay={autoplay}
          mediaItems={mediaItems}
          testimonialItems={testimonialItems}
          page={page}
        />
      </div>
    </section>
  );
};
