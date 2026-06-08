import { Link as ContentSdkLink } from '@sitecore-content-sdk/nextjs';

import type { JSX } from 'react';

import type { EventListProps, EventListYearGroup } from 'components/event-list/EventList.type';
import {
  EVENT_LIST_EMPTY_DATASOURCE,
  EVENT_LIST_EMPTY_EDITING_HINT,
  EVENT_LIST_REGION_ARIA,
  EVENT_LIST_CARD_SIZE_PARAM,
  eventListHasVisitorContent,
  eventListItemHasVisitorContent,
  eventListItemKey,
  eventListItemToLinkField,
  eventListYearGroupHasVisitorContent,
  extractEventListYearGroups,
  formatEventListFullDateRange,
  formatEventListLocationLine,
  formatEventListShortDateRange,
  readEventListParamValue,
  resolveEventListCardSizeKey,
} from 'components/event-list/eventListUtils';
import { ICON_CALENDAR, ICON_MAP_PIN } from 'lib/chrome-icons';
import { cn } from 'lib/utils';
import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';

function EventListCalendarIcon(): JSX.Element {
  return (
    <span
      className="flex shrink-0 items-start justify-center pt-[2px] text-font-media-tile-eyebrow leading-none text-ink-tertiary"
      aria-hidden="true"
    >
      {ICON_CALENDAR}
    </span>
  );
}

function EventListPinIcon(): JSX.Element {
  return (
    <span
      className="flex shrink-0 items-start justify-center pt-[2px] text-font-media-tile-eyebrow leading-none text-ink-tertiary"
      aria-hidden="true"
    >
      {ICON_MAP_PIN}
    </span>
  );
}

function YearSection({
  group,
  isEditing,
}: {
  group: EventListYearGroup;
  isEditing: boolean;
}): JSX.Element | null {
  const yearRaw = typeof group.Year === 'string' ? group.Year.trim() : '';
  const yearLabel = yearRaw || '—';
  const items = Array.isArray(group.EventItems) ? group.EventItems : [];
  const visibleItems = items.filter(
    (row) => row != null && typeof row === 'object' && (eventListItemHasVisitorContent(row) || isEditing),
  );

  if (visibleItems.length === 0 && !isEditing) {
    return null;
  }

  return (
    <div className="min-w-0">
      <h2 className="m-0 border-0 border-b border-solid border-stroke-default p-0 pb-[10px] font-media-tile text-font-extrabig font-bold leading-tight text-ink-primary">
        {yearLabel}
      </h2>
      {!visibleItems.length && isEditing ?
        <p className="m-0 py-4">
          <span className="is-empty-hint">{EVENT_LIST_EMPTY_EDITING_HINT}</span>
        </p>
      : null}
      {visibleItems.length > 0 ?
        <ul className="m-0 list-none p-0" role="list">
          {visibleItems.map((item, idx) => {
            const key = eventListItemKey(yearLabel, item, idx);
            const title = typeof item.EventName === 'string' ? item.EventName.trim() : '';
            const linkField = eventListItemToLinkField(title, item.EventUrl);
            const href = linkField?.value?.href?.trim() ?? '';
            const target = linkField?.value?.target;
            const shortDate = formatEventListShortDateRange(item);
            const fullDate = formatEventListFullDateRange(item);
            const locationLine = formatEventListLocationLine(item);
            const showLink = Boolean(linkField) && href.length > 0 && !isEditing;
            const ariaForTitle = title || href || 'Event';

            return (
              <li
                key={key}
                className="event-list__row grid grid-cols-1 gap-0 py-6 sm:grid-cols-[136px_1fr] sm:gap-8"
                role="listitem"
              >
                <p className="m-0 min-w-0 font-media-tile text-font-large font-bold leading-snug text-ink-primary sm:whitespace-nowrap">
                  {shortDate || '\u00a0'}
                </p>
                <div className="min-w-0 mt-2 sm:mt-0">
                  {showLink && linkField ?
                    <p className="!m-0">
                      <ContentSdkLink
                        field={linkField}
                        className="box-border cursor-pointer font-media-tile text-font-large font-bold leading-snug text-link no-underline decoration-solid underline-offset-2 outline-none transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke] duration-150 ease-in-out motion-reduce:transition-none hover:text-link-strong hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-surface [-webkit-tap-highlight-color:transparent]"
                        aria-label={ariaForTitle}
                        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
                      />
                    </p>
                  : title ?
                    <p className="m-0 font-media-tile text-font-large font-bold leading-snug text-ink-primary">
                      {title}
                    </p>
                  : isEditing ?
                    <span className="is-empty-hint">Event name</span>
                  : null}
                  <div className="mt-2 flex flex-nowrap items-start gap-x-5 font-roboto text-font-media-tile-eyebrow font-normal leading-normal text-ink-tertiary">
                    {fullDate ?
                      <span className="inline-flex min-w-0 shrink items-start gap-2">
                        <EventListCalendarIcon />
                        <span>{fullDate}</span>
                      </span>
                    : null}
                    {locationLine ?
                      <span className="inline-flex min-w-0 shrink items-start gap-2">
                        <EventListPinIcon />
                        <span>{locationLine}</span>
                      </span>
                    : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      : null}
    </div>
  );
}

/** Grouped event listing by year with short and full date columns. */
export function Default({ fields, params, page }: EventListProps): JSX.Element | null {
  const isEditing = page.mode.isEditing;
  const styles = params.styles ?? '';
  const paramsRecord = params as EventListProps['params'] & Record<string, unknown>;
  const colorSchemeRaw = readEventListParamValue(paramsRecord, 'ColorScheme');
  const eventListCardSizeRaw = readEventListParamValue(paramsRecord, EVENT_LIST_CARD_SIZE_PARAM);
  const colorScheme = colorSchemeRaw?.toLowerCase().trim();
  const eventListCardSizeKey = resolveEventListCardSizeKey(eventListCardSizeRaw);
  if (!fields) {
    if (!isEditing) {
      return null;
    }
    return (
      <section
        className={cn(
          'component event-list',
          colorScheme === 'dark' && 'bg-surface-inverse text-ink-inverse',
          (colorScheme === 'gray' || colorScheme === 'grey') && 'bg-surface-muted text-ink-primary',
          colorScheme !== 'dark' && colorScheme !== 'gray' && colorScheme !== 'grey' &&
            'bg-surface text-ink-primary',
          styles,
          eventListCardSizeKey === 'base' &&
            'box-border flex-[0_0_100%] min-w-0 shrink-0 grow-0 basis-full p-0! w-screen max-w-[100vw] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]',
          eventListCardSizeKey === 'compact' && 'box-border w-full min-w-0 max-w-none p-0! px-0!',
        )}
        data-event-list-card-size={eventListCardSizeKey}
        {...renderingAnchorIdProps(params.RenderingIdentifier)}
        aria-label={EVENT_LIST_REGION_ARIA}
        data-testid="event-list"
      >
        <div className="component-content box-border m-0 min-w-0 w-full max-w-none">
          <div
            className={cn(
              'box-border mx-auto w-full min-w-0 max-w-full px-4 min-[600px]:max-w-[600px] min-[768px]:max-w-[768px] min-[992px]:max-w-[782px]',
              eventListCardSizeKey === 'base' && 'event-list-outer',
              eventListCardSizeKey === 'compact' && 'event-list-outer-compact',
            )}
          >
            <span className="is-empty-hint">{EVENT_LIST_EMPTY_DATASOURCE}</span>
          </div>
        </div>
      </section>
    );
  }

  const groups = extractEventListYearGroups(fields.EventListings);
  const hasVisitor = eventListHasVisitorContent(groups);

  if (!hasVisitor && !isEditing) {
    return null;
  }

  const visibleYearSections = groups.filter(
    (g) => g != null && typeof g === 'object' && (eventListYearGroupHasVisitorContent(g) || isEditing),
  );

  return (
    <section
      className={cn(
        'component event-list',
        colorScheme === 'dark' && 'bg-surface-inverse text-ink-inverse',
        (colorScheme === 'gray' || colorScheme === 'grey') && 'bg-surface-muted text-ink-primary',
        colorScheme !== 'dark' && colorScheme !== 'gray' && colorScheme !== 'grey' &&
          'bg-surface text-ink-primary',
        styles,
        eventListCardSizeKey === 'base' &&
          'box-border flex-[0_0_100%] min-w-0 shrink-0 grow-0 basis-full p-0! w-screen max-w-[100vw] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]',
        eventListCardSizeKey === 'compact' && 'box-border w-full min-w-0 max-w-none p-0! px-0!',
      )}
      data-event-list-card-size={eventListCardSizeKey}
      {...renderingAnchorIdProps(params.RenderingIdentifier)}
      aria-label={EVENT_LIST_REGION_ARIA}
      data-testid="event-list"
    >
      <div className="component-content box-border m-0 min-w-0 w-full max-w-none">
        <div
          className={cn(
            'box-border mx-auto w-full min-w-0 max-w-full px-4 min-[600px]:max-w-[600px] min-[768px]:max-w-[768px] min-[992px]:max-w-[782px]',
            eventListCardSizeKey === 'base' && 'event-list-outer',
            eventListCardSizeKey === 'compact' && 'event-list-outer-compact',
          )}
        >
          {!visibleYearSections.length && isEditing ?
            <span className="is-empty-hint">{EVENT_LIST_EMPTY_EDITING_HINT}</span>
          : null}
          <div className="flex flex-col gap-12">
            {visibleYearSections.map((group, idx) => (
              <YearSection
                key={typeof group.Year === 'string' ? `${group.Year}-${idx}` : `y-${idx}`}
                group={group}
                isEditing={isEditing}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
