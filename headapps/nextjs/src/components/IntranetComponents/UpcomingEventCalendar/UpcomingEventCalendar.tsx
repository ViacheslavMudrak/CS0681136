import { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { Text, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import { useSession } from 'next-auth/react';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaCarouselType } from 'embla-carousel';
import classNames from 'classnames/bind';
import { useI18n } from 'next-localization';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { withJumplink } from 'lib/enhancers/withJumplink';

import styles from './UpcomingEventCalendar.module.scss';
import {
  UpcomingEventCalendarProps,
  EventCard,
  UpcomingEventCalendarDictionary,
} from './UpcomingEventCalendar.types';

import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import {
  useUpcomingCalendarEvents,
  GoogleCalendarEvent,
} from 'lib/firebase/hooks/use-upcoming-calendar-events';

const cx = classNames.bind(styles);

const UpcomingEventCalendar = (props: UpcomingEventCalendarProps): JSX.Element => {
  const { data: session, status } = useSession();
  const { fields, params } = props;
  const datasource = fields;
  const { t } = useI18n();

  const showCalendarCta = params?.showCalendarCta === '1';
  const showAllEventDescriptions = params?.showAllEventDescriptions === '1';
  const showAllEventTimes = params?.showAllEventTimes === '1';

  const isAuthenticated = !!session?.googleAccessToken;
  const calendarId = isAuthenticated ? datasource?.googleCalendarId?.value : null;

  const {
    events: googleEvents,
    isLoadingEvents,
    error: fetchError,
  } = useUpcomingCalendarEvents(calendarId);

  const [isMobile, setIsMobile] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    isMobile ? { align: 'start', loop: false, dragFree: false, slidesToScroll: 1 } : {}
  );

  const formatDateRange = useCallback(
    (start: GoogleCalendarEvent['start'], end: GoogleCalendarEvent['end']): string => {
      const startDate = new Date(start.dateTime || start.date!);
      const endDate = new Date(end.dateTime || end.date!);

      const formatOptions: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      };

      const isSingleDay = startDate.toDateString() === endDate.toDateString();
      if (isSingleDay) {
        return startDate.toLocaleDateString('en-US', formatOptions).toLowerCase();
      }

      const startFormatted = startDate.toLocaleDateString('en-US', formatOptions).toLowerCase();
      const endFormatted = endDate.toLocaleDateString('en-US', formatOptions).toLowerCase();
      return `${startFormatted} - ${endFormatted}`;
    },
    []
  );

  const formatTime = useCallback(
    (start: GoogleCalendarEvent['start'], end: GoogleCalendarEvent['end']): string => {
      if (!start.dateTime || !end.dateTime) {
        return t('AllDay') || UpcomingEventCalendarDictionary.AllDay;
      }

      const startDate = new Date(start.dateTime);
      const endDate = new Date(end.dateTime);

      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      };

      const startTime = startDate.toLocaleTimeString('en-US', timeOptions).toLowerCase();
      const endTime = endDate.toLocaleTimeString('en-US', timeOptions).toLowerCase();

      const tzAbbr =
        new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/New_York',
          timeZoneName: 'short',
        })
          .formatToParts(startDate)
          .find((part) => part.type === 'timeZoneName')?.value || '';

      return `${startTime} - ${endTime} ${tzAbbr}`;
    },
    [t]
  );

  const transformEvents = useCallback(
    (incoming: GoogleCalendarEvent[]): EventCard[] => {
      const now = new Date();

      const formatGoogleUrlDate = (dateStr: string | undefined, isAllDay: boolean): string => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const iso = date.toISOString().replace(/-|:|\.\d\d\d/g, '');
        return isAllDay ? iso.split('T')[0] : iso;
      };

      return incoming
        .filter((event) => {
          const endDate = new Date(event.end.dateTime || event.end.date!);
          return endDate.getTime() >= now.getTime();
        })
        .sort((a, b) => {
          const aStart = new Date(a.start.dateTime || a.start.date!);
          const bStart = new Date(b.start.dateTime || b.start.date!);
          return aStart.getTime() - bStart.getTime();
        })
        .slice(0, 9)
        .map((event) => {
          let cleanDescription = event.description || '';

          // clean Task type description - descriptions belong to Google Tasks, and the Calendar API has no access to that data.
          if (cleanDescription.includes('Changes made to the title')) {
            cleanDescription = cleanDescription.split(/Changes made to the title/i)[0].trim();
          }

          const isAllDay = !event.start.dateTime;
          const startStr = formatGoogleUrlDate(event.start.dateTime || event.start.date, isAllDay);
          const endStr = formatGoogleUrlDate(event.end.dateTime || event.end.date, isAllDay);

          const googleUrl = new URL('https://www.google.com/calendar/render');
          googleUrl.searchParams.append('action', 'TEMPLATE');
          googleUrl.searchParams.append(
            'text',
            event.summary || t('UntitledEvent') || UpcomingEventCalendarDictionary.UntitledEvent
          );
          googleUrl.searchParams.append('dates', `${startStr}/${endStr}`);
          googleUrl.searchParams.append('details', cleanDescription);
          if (event.location) googleUrl.searchParams.append('location', event.location);

          return {
            cardDate: formatDateRange(event.start, event.end),
            cardTitle: event.summary || UpcomingEventCalendarDictionary.UntitledEvent,
            cardTime: formatTime(event.start, event.end),
            cardDescription: cleanDescription,
            cardDestinationUrl: googleUrl.toString(),
          };
        });
    },
    [formatDateRange, formatTime, t]
  );

  const errorMessage = useMemo(() => {
    if (!isAuthenticated && status !== 'loading') {
      return t('UnableToView') || UpcomingEventCalendarDictionary.UnableToView;
    }
    if (fetchError) {
      return fetchError.message || UpcomingEventCalendarDictionary.UnableToView;
    }
    return null;
  }, [isAuthenticated, status, fetchError, t]);

  const transformedEvents: EventCard[] = useMemo(() => {
    if (!isAuthenticated) return [];
    if (!googleEvents || googleEvents.length === 0) return [];
    return transformEvents(googleEvents);
  }, [isAuthenticated, googleEvents, transformEvents]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const itemsCount = transformedEvents.length ?? 0;

  const onSelect = useCallback(
    (api: EmblaCarouselType) => {
      if (!api) return;
      setAtStart(api.canScrollPrev() === false);
      setAtEnd(api.canScrollNext() === false);
      setActivePage(api.selectedScrollSnap());
      setPageCount(Math.ceil(itemsCount / 1));
    },
    [itemsCount]
  );

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.reInit({ align: 'start', loop: false, slidesToScroll: 1 });
    onSelect(emblaApi);

    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, isMobile, onSelect]);

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  const handleAddToCalendar = (event: EventCard) => {
    if (event.cardDestinationUrl) window.open(event.cardDestinationUrl, '_blank');
  };

  const decodeHtml = (html: string) => {
    return html
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
  };

  const loading = isAuthenticated ? isLoadingEvents : false;

  return (
    <div className={cx('upcoming-event-calendar', 'component', props.stylesSXA)}>
      <div className={cx('upcoming-event-calendar__container', 'container')}>
        <div
          className={cx(
            'upcoming-event-calendar__header',
            'flex flex-col md:flex-row gap-4 md:gap-8 mb-8'
          )}
        >
          <div className={cx('upcoming-event-calendar__header-content', 'md:flex-[1_1_70%]')}>
            {datasource?.headline && <Text field={datasource.headline} tag="h2" />}
            {datasource?.subtext && <Text field={datasource.subtext} tag="p" />}
          </div>

          {showCalendarCta && (
            <div
              className={cx(
                'upcoming-event-calendar__header-button',
                'flex md:flex-[1_1_30%] md:justify-end md:items-end'
              )}
            >
              <a
                href={`https://calendar.google.com/calendar/u/0/r?cid=${datasource?.googleCalendarId?.value}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cx('asc-btn asc-btn--primary', 'w-fit')}
              >
                {datasource?.buttonText?.value || 'See Calendar'}
              </a>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue-500" />
            <p className="mt-2">
              {t('LoadingEvents') || UpcomingEventCalendarDictionary.LoadingEvents}
            </p>
          </div>
        ) : errorMessage ? (
          <div className="text-center py-8 text-gray-600">{errorMessage}</div>
        ) : transformedEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            {t('NoEvents') || UpcomingEventCalendarDictionary.NoEvents}
          </div>
        ) : (
          <>
            <div className={cx('upcoming-event-calendar__wrapper', 'embla')}>
              <div
                className={cx(
                  'upcoming-event-calendar__viewport',
                  isMobile ? 'embla__viewport overflow-hidden' : ''
                )}
                ref={isMobile ? emblaRef : undefined}
              >
                <div
                  className={cx(
                    'upcoming-event-calendar__card-container',
                    isMobile ? 'embla__container flex gap-4 pb-6' : 'grid grid-cols-3 gap-4 pb-6'
                  )}
                >
                  {transformedEvents.map((event, index) => {
                    const href = event.cardDestinationUrl;
                    return (
                      <div
                        key={href || `${index}`}
                        className={cx(
                          'upcoming-event-calendar__card',
                          'flex flex-col bg-white gap-4 h-full',
                          isMobile ? 'flex-[0_0_80%] mx-2' : ''
                        )}
                      >
                        <div
                          className={cx(
                            'upcoming-event-calendar__card-date',
                            'flex justify-between gap-4 items-center'
                          )}
                        >
                          <span>{event.cardDate}</span>

                          <div
                            className={cx('upcoming-event-calendar__add-icon')}
                            onClick={() => handleAddToCalendar(event)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleAddToCalendar(event);
                              }
                            }}
                          >
                            <MaterialIcon name="AddCircleOutline" />
                          </div>
                        </div>

                        <h3>{event.cardTitle}</h3>

                        {showAllEventTimes && (
                          <div
                            className={cx(
                              'upcoming-event-calendar__card-time',
                              'flex items-center gap-1'
                            )}
                          >
                            <MaterialIcon name="AccessTime" />
                            <span>{event.cardTime}</span>
                          </div>
                        )}

                        {showAllEventDescriptions && event.cardDescription && (
                          <div
                            className={cx('upcoming-event-calendar__card-description', 'mb-4')}
                            dangerouslySetInnerHTML={{
                              __html: decodeHtml(event.cardDescription),
                            }}
                          />
                        )}

                        <div
                          className={cx(
                            'upcoming-event-calendar__card-link',
                            'flex gap-2 items-center'
                          )}
                        >
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="uppercase text-sm tracking-[1.25px]"
                          >
                            {t('LearnMore') || UpcomingEventCalendarDictionary.LearnMore}
                          </a>
                          <MaterialIcon name="East" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {isMobile && (
              <div
                className={cx(
                  'upcoming-event-calendar__controls',
                  'flex md:hidden items-center justify-between md:justify-center gap-6'
                )}
              >
                <span className="text-sm text-brand-gray-600 pl-4">
                  {activePage + 1} of {pageCount || itemsCount}
                </span>

                <div className="flex gap-4">
                  <button onClick={scrollPrev} disabled={atStart}>
                    <MaterialIcon
                      name="ChevronLeft"
                      className={cx(`${atStart ? 'at-start' : ''}`)}
                    />
                  </button>

                  <button onClick={scrollNext} disabled={atEnd}>
                    <MaterialIcon name="ChevronRight" className={cx(`${atEnd ? 'at-end' : ''}`)} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default compose<UpcomingEventCalendarProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(UpcomingEventCalendar);
