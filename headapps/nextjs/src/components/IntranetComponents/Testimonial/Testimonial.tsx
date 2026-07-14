import { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { Text, Image, withDatasourceCheck, useSitecore } from '@sitecore-content-sdk/nextjs';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaCarouselType } from 'embla-carousel';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { withJumplink } from 'lib/enhancers/withJumplink';
import { TestimonialItem, TestimonialProps } from './Testimonial.types';

import { useMediaQuery } from '@mui/material';
import { MediaQueryConstants } from 'src/util/const/material';

import styles from './Testimonial.module.scss';

const cx = classNames.bind(styles);

const getUniqueKey = (t: TestimonialItem) =>
  t.id || (t.quote?.jsonValue?.value ? `quote-${t.quote.jsonValue.value.substring(0, 20)}` : '');

const Testimonial = (props: TestimonialProps): JSX.Element => {
  const { fields } = props;
  const datasource = fields?.data?.datasource;
  const { page } = useSitecore();

  const isMobile = useMediaQuery(MediaQueryConstants.Mobile);
  const isPageEditing = page.mode.isEditing;

  // Background image with default fallback
  const backgroundImageSrc =
    datasource?.backgroundImage?.jsonValue?.value?.src ||
    page.layout.sitecore.context.defaultImages?.testimonialBackgroundImage?.value?.src;

  // Merge children (approach 1) + shared (approach 2), children first
  const testimonials = useMemo(() => {
    const childrenTestimonials = datasource?.children?.results || [];
    const sharedTestimonials = datasource?.sharedTestimonials?.targetItems || [];

    const validChildren = isPageEditing
      ? childrenTestimonials
      : childrenTestimonials.filter((item) => {
          const quoteValue = item.quote?.jsonValue?.value;
          return quoteValue && quoteValue.trim().length > 0;
        });

    const validShared = isPageEditing
      ? sharedTestimonials
      : sharedTestimonials.filter((item) => {
          const quoteValue = item.quote?.jsonValue?.value;
          return quoteValue && quoteValue.trim().length > 0;
        });

    const merged: TestimonialItem[] = [];
    const seen = new Set<string>();

    for (const t of validChildren) {
      const k = getUniqueKey(t);
      if (k && !seen.has(k)) {
        seen.add(k);
        merged.push(t);
      } else if (isPageEditing && !k) {
        merged.push(t);
      }
    }

    for (const t of validShared) {
      const k = getUniqueKey(t);
      if (k && !seen.has(k)) {
        seen.add(k);
        merged.push(t);
      } else if (isPageEditing && !k) {
        merged.push(t);
      }
    }

    return merged;
  }, [datasource?.children?.results, datasource?.sharedTestimonials?.targetItems, isPageEditing]);

  const slides = useMemo(() => {
    if (testimonials.length > 0) {
      return testimonials;
    }
    return isPageEditing ? ([{}] as TestimonialItem[]) : [];
  }, [testimonials, isPageEditing]);

  const [activePage, setActivePage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    loop: false,
    slidesToScroll: 1,
  });

  const updateCarouselState = useCallback((api: EmblaCarouselType) => {
    const selected = api.selectedScrollSnap();
    setActivePage(selected);
    setPageCount(api.scrollSnapList().length);
    setAtStart(!api.canScrollPrev());
    setAtEnd(!api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => updateCarouselState(emblaApi);
    const onReInit = () => updateCarouselState(emblaApi);

    updateCarouselState(emblaApi);

    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onReInit);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onReInit);
    };
  }, [emblaApi, updateCarouselState]);

  useEffect(() => {
    setPageCount(slides.length);
    setActivePage(0);
    setAtStart(true);
    setAtEnd(slides.length <= 1);
    emblaApi?.reInit();
  }, [slides.length, emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  if (!isPageEditing && slides.length === 0) {
    return <></>;
  }

  return (
    <div className={cx('testimonial', 'component container gap-8', props.stylesSXA)}>
      <div className={cx('testimonial__header', 'flex justify-between gap-4')}>
        <Text tag="h2" field={datasource?.title?.jsonValue} />
      </div>

      <div
        className={cx(
          'testimonial__controls',
          'flex items-center justify-between md:justify-center gap-6'
        )}
      >
        {isMobile && pageCount > 1 && (
          <span className="flex text-sm text-brand-gray-600 pl-4 min-w-[100px]">
            {activePage + 1} of {pageCount}
          </span>
        )}

        {pageCount > 1 && (
          <div className="flex w-full justify-end md:justify-end gap-4 items-center">
            <div className="flex justify-end gap-4">
              <button
                className={cx('testimonial__slider-control', { disabled: atStart })}
                onClick={scrollPrev}
                aria-label="Previous slides"
                disabled={atStart}
              >
                <MaterialIcon name="ChevronLeft" />
              </button>
              <button
                className={cx('testimonial__slider-control', { disabled: atEnd })}
                onClick={scrollNext}
                aria-label="Next slides"
                disabled={atEnd}
              >
                <MaterialIcon name="ChevronRight" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className={cx('testimonial__carousel')}
        ref={emblaRef}
        style={backgroundImageSrc ? { backgroundImage: `url("${backgroundImageSrc}")` } : undefined}
      >
        <div className={cx('testimonial__embla-container')}>
          {slides.map((testimonial, index) => (
            <div
              className={cx('testimonial__embla-slide', 'flex items-center')}
              key={testimonial.id || index}
            >
              <div className={cx('testimonial__testimonial-item', 'flex flex-col gap-8')}>
                <p className={cx('testimonial__quote')}>
                  <Text tag="span" field={testimonial.quote?.jsonValue} />
                </p>

                <div className={cx('testimonial__author-content', 'flex gap-4 items-center')}>
                  <Image field={testimonial.authorImage?.jsonValue} alt="" />

                  <div className={cx('testimonial__author', 'flex flex-col gap-2')}>
                    <Text
                      tag="span"
                      className={cx('testimonial__author-name')}
                      field={testimonial.authorName?.jsonValue}
                    />
                    <Text
                      tag="span"
                      className={cx('testimonial__author-location')}
                      field={testimonial.authorTitle?.jsonValue}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!isMobile && pageCount > 1 && (
        <div className={cx('testimonial__dots', 'flex justify-center gap-2')}>
          {Array.from({ length: pageCount }).map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to testimonial ${index + 1}`}
              aria-current={index === activePage ? 'true' : 'false'}
              onClick={() => scrollTo(index)}
              className={cx(
                'dot',
                'w-3 h-3 rounded-full transition-all duration-200 cursor-pointer',
                index === activePage ? 'active' : 'not-active'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const Default = compose<TestimonialProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(Testimonial);

export default Testimonial;
