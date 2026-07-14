import { JSX, useState, useCallback, useEffect } from 'react';
import { Link, Text, withDatasourceCheck, useSitecore } from '@sitecore-content-sdk/nextjs';
import useEmblaCarousel from 'embla-carousel-react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { MediaQueryConstants } from 'src/util/const/material';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';

import { EventCardProps, SaveTheDateProps } from './SaveTheDate.types';
import styles from './SaveTheDate.module.scss';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { withJumplink } from 'lib/enhancers/withJumplink';

const cx = classNames.bind(styles);

const SaveTheDate = (props: SaveTheDateProps): JSX.Element | null => {
  const { fields } = props;
  const { page } = useSitecore();
  const isPageEditing = page?.mode?.isEditing;
  const isMobile = useMediaQuery(MediaQueryConstants.Mobile);

  const datasource = fields.data.datasource;
  const headline = datasource?.headline?.jsonValue;

  // Valid events only need an event title
  const validEvents = isPageEditing
    ? datasource?.children?.results || []
    : (datasource?.children?.results || []).filter((event) => event.eventTitle?.jsonValue?.value);

  const eventCount = validEvents.length;

  const isSingleCard = eventCount === 1;
  const isMultipleCards = eventCount >= 2 && eventCount <= 4;
  const isSliderCards = (isMobile && eventCount > 1) || (!isMobile && eventCount > 4);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    dragFree: false,
    loop: false,
    containScroll: 'trimSnaps',
    align: 'start',
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setActiveIndex(emblaApi.selectedScrollSnap());
      setAtStart(!emblaApi.canScrollPrev());
      setAtEnd(!emblaApi.canScrollNext());
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    if (isMobile) {
      emblaApi.scrollPrev();
      return;
    }
    const current = emblaApi.selectedScrollSnap();
    const next = Math.max(current - 4, 0);
    emblaApi.scrollTo(next);
  }, [emblaApi, isMobile]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    if (isMobile) {
      emblaApi.scrollNext();
      return;
    }
    const snaps = emblaApi.scrollSnapList();
    const current = emblaApi.selectedScrollSnap();
    const next = Math.min(current + 4, snaps.length - 1);
    emblaApi.scrollTo(next);
  }, [emblaApi, isMobile]);

  const hideComponent = (!datasource || validEvents.length === 0) && !isPageEditing;
  if (hideComponent) return null;

  return (
    <div className={cx('save-the-date', 'component', props.stylesSXA)}>
      <div
        className={cx('save-the-date__container', 'container', {
          'save-the-date__container--single': isSingleCard,
          'save-the-date__container--multiple': isMultipleCards,
          'save-the-date__container--slider': isSliderCards,
        })}
      >
        {isSingleCard ? (
          <>
            <div className={cx('save-the-date__headline-wrapper')}>
              {headline && (
                <Text tag="h2" field={headline} className={cx('save-the-date__headline')} />
              )}
            </div>
            <div className={cx('save-the-date__cards-wrapper')}>
              {validEvents.map((event, index) => (
                <EventCard key={index} event={event} isPageEditing={isPageEditing} />
              ))}
            </div>
          </>
        ) : (
          <>
            {!isSliderCards && headline && (
              <Text tag="h2" field={headline} className={cx('save-the-date__headline')} />
            )}

            {isSliderCards && (
              <>
                <div
                  className={cx('save-the-date__headline-container', 'flex justify-between gap-4')}
                >
                  <Text tag="h2" field={headline} className={cx('save-the-date__headline')} />
                </div>

                <div
                  className={cx(
                    'save-the-date__controls-container',
                    'flex gap-4 items-center md:items-end justify-between md:justify-end'
                  )}
                >
                  {isMobile && (
                    <span className="flex text-sm text-brand-gray-600 pl-4">
                      {activeIndex + 1} of {eventCount}
                    </span>
                  )}
                  <div
                    className={cx(
                      'save-the-date__buttons-container',
                      'flex gap-4 items-end justify-end pr-2'
                    )}
                  >
                    <button
                      className={cx('save-the-date__slider-control', { disabled: atStart })}
                      onClick={scrollPrev}
                      aria-label="Previous slides"
                    >
                      <MaterialIcon name="ChevronLeft" />
                    </button>
                    <button
                      className={cx('save-the-date__slider-control', { disabled: atEnd })}
                      onClick={scrollNext}
                      aria-label="Next slides"
                    >
                      <MaterialIcon name="ChevronRight" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {isSliderCards ? (
              <div className={cx('save-the-date__embla')} ref={emblaRef}>
                <div className={cx('save-the-date__embla-track')}>
                  {validEvents.map((event, index) => (
                    <div className={cx('save-the-date__embla-slide')} key={index}>
                      <EventCard event={event} isPageEditing={isPageEditing} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={cx('save-the-date__cards-wrapper')}>
                {validEvents.map((event, index) => (
                  <EventCard key={index} event={event} isPageEditing={isPageEditing} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const EventCard = ({ event, isPageEditing }: EventCardProps): JSX.Element | null => {
  const hasEventTitle = Boolean(event.eventTitle?.jsonValue?.value);
  const shouldRender = hasEventTitle || isPageEditing;
  if (!shouldRender) return null;

  return (
    <div className={cx('save-the-date__card')}>
      {(event.date?.jsonValue.value || isPageEditing) && (
        <Text tag="span" field={event.date.jsonValue} className={cx('save-the-date__card-date')} />
      )}
      {(event.eventTitle?.jsonValue.value || isPageEditing) && (
        <Text
          tag="h3"
          field={event.eventTitle.jsonValue}
          className={cx('save-the-date__card-title')}
        />
      )}
      {(event.time?.jsonValue.value || isPageEditing) && (
        <div className={cx('save-the-date__card-time-wrapper')}>
          <MaterialIcon name="AccessTime" className={cx('save-the-date__card-icon')} />
          <Text tag="span" field={event.time.jsonValue} />
        </div>
      )}
      {(event.eventDescription?.jsonValue.value || isPageEditing) && (
        <Text
          tag="p"
          field={event.eventDescription.jsonValue}
          className={cx('save-the-date__card-description')}
        />
      )}
      {((event.buttonLink?.jsonValue && event.buttonLink.jsonValue.value?.href) ||
        isPageEditing) && (
        <Link
          field={event.buttonLink.jsonValue}
          className={cx('save-the-date__card-link', 'flex items-center gap-1')}
        >
          {event.buttonLink.jsonValue.value.text}
          <MaterialIcon name="East" />
        </Link>
      )}
    </div>
  );
};

export default compose<SaveTheDateProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(SaveTheDate);
