import { Fragment, type CSSProperties, type JSX } from 'react';

import { NextImage, Text } from '@sitecore-content-sdk/nextjs';
import { cn } from 'lib/utils';

import type { TimelineEvent, TimelineGroup } from '../Timeline.type';
import type { TimelineDecadeChipPlacement } from '../timelineUtils';
import {
  extractBrightcoveId,
  getDecadeHeader,
  groupEventsByDecadeInGroup,
  getTimelineImageAspectRatioCss,
  getTimelineImageFrameVariant,
  parseTimelineImagePixelDimensions,
  resolveCTAText,
  sortEventsByYear,
  timelineEventAnchorId,
  TIMELINE_LABELS,
} from '../timelineUtils';
import { TimelineImageModalTrigger } from './TimelineImageModal.client';
import { TimelineVideoClient } from './TimelineClient';
import { TimelineContentCardShell } from './TimelineEventCardAtoms';

interface TimelineEventCardProps {
  /** The timeline event item from Sitecore. */
  event: TimelineEvent;
  /** When true, image is on the right and content on the left (global even index). */
  isReversed: boolean;
  /** Whether the page is in XM Cloud Pages editing mode. */
  isEditing: boolean;
  /** DOM `id` for scroll targets (year rail); must match `timelineEventAnchorId` in `timelineUtils`. */
  anchorId: string;
}

/** Single timeline event card (mobile stack; desktop three-column row with spine dot). */
export function TimelineEventCard({
  event,
  isReversed,
  isEditing,
  anchorId,
}: TimelineEventCardProps): JSX.Element | null {
  const { fields, displayName } = event;
  const { Year, Title, Description, Image, Video, Link } = fields ?? {};

  const hasImage = Boolean(Image?.value?.src) || isEditing;
  const hasYear = Boolean(Year?.value?.trim()) || isEditing;
  const hasTitle = Boolean(Title?.value?.trim()) || isEditing;
  const hasDescription = Boolean(Description?.value?.trim()) || isEditing;

  const brightcoveId = extractBrightcoveId(Video);
  const hasVideo = Boolean(Video && brightcoveId);
  const ctaText = resolveCTAText(Link?.value, TIMELINE_LABELS.watchVideo);
  const videoTitle =
    (typeof Video?.fields?.Title?.value === 'string' ? Video.fields.Title.value.trim() : '') ||
    (Title?.value?.trim() ?? displayName ?? TIMELINE_LABELS.videoAriaFallback);

  const hasContent = hasYear || hasTitle || hasDescription || hasVideo;

  if (!hasImage && !hasContent) return null;

  const imageFrameVariant = getTimelineImageFrameVariant(Image);
  const imageAspectRatio = getTimelineImageAspectRatioCss(Image, imageFrameVariant);
  const isPortraitImage = imageFrameVariant === 'portrait';
  const portraitTabletAspectRatioUnitless =
    isPortraitImage ?
      (() => {
        const d = parseTimelineImagePixelDimensions(Image);
        return d ? d.w / d.h : 284 / 430.84;
      })()
    : undefined;

  const cardInner = (
    <>
      {hasYear && (
        <Text
          field={Year}
          tag="span"
          className="m-0 box-border inline bg-transparent p-0 text-[length:20px] font-bold leading-[30px] text-orange [-webkit-tap-highlight-color:transparent] [unicode-bidi:isolate]"
        />
      )}
      {hasTitle && (
        <Text
          field={Title}
          tag="h3"
          className="mb-1 box-border block w-full max-w-full text-[length:22.67px] font-bold leading-[27.2px] text-chrome-stripe [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]"
        />
      )}
      {hasDescription && (
        <Text field={Description} tag="p" className="box-border block w-full max-w-full text-[length:18.67px] font-normal leading-[28px] text-ink-muted [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] mb-0" />
      )}
      {hasVideo && (
        <div className="mt-4">
          <TimelineVideoClient videoId={brightcoveId} videoTitle={videoTitle} ctaText={ctaText} />
        </div>
      )}
      {!hasVideo && isEditing && Video && !brightcoveId && (
        <span className="is-empty-hint mt-4 inline-block">{TIMELINE_LABELS.videoEmptyHint}</span>
      )}
    </>
  );

  const timelineDot = (
    <span className="inline-flex h-auto w-auto shrink-0 items-center justify-center [clip-rule:evenodd] [fill-rule:evenodd]">
      <span
        className="box-border flex h-[40.65px] w-[40.65px] shrink-0 items-center justify-center rounded-full border-2 border-solid border-orange bg-surface"
        data-timeline-spine-dot
      >
        <span className="h-[22.59px] w-[22.59px] shrink-0 rounded-full bg-orange" aria-hidden />
      </span>
    </span>
  );

  const eventImageAspectStyle = {
    ['--timeline-event-img-ar']: imageAspectRatio,
    ...(portraitTabletAspectRatioUnitless !== undefined ?
      { ['--timeline-img-ar']: String(portraitTabletAspectRatioUnitless) }
    : {}),
  } as CSSProperties;

  const isLandscapeLikeImage = !isPortraitImage;

  const eventImageAltOrTitle =
    (typeof Image?.value?.alt === 'string' && Image.value.alt.trim() !== '' ?
      Image.value.alt.trim()
    : null) ??
    Title?.value?.trim() ??
    displayName ??
    TIMELINE_LABELS.imageModalAriaFallback;

  const eventImageFrame =
    hasImage ?
      <div className="box-border w-full min-w-0 max-md:pb-[14px] md:block md:w-full md:min-h-0 md:p-0">
        <div
          className={cn(
            'relative box-border block w-full min-w-0 max-md:max-w-full max-md:max-h-none overflow-x-clip overflow-y-clip rounded-md max-md:mx-0 motion-reduce:md:transition-none md:[transition:opacity_2000ms_ease-out,transform_600ms_ease-out,visibility_2000ms_ease-out] md:will-change-[opacity,transform,visibility]',
            'max-[599px]:[aspect-ratio:var(--timeline-event-img-ar)] md:aspect-auto',
            isPortraitImage
              ? 'md:shrink-0 md:w-[calc(130.9px+(100vw-768px)*0.249)] md:h-[calc(234.88px+(100vw-768px)*0.447)] min-[1200px]:w-[238.449px] min-[1200px]:h-[427.865px] min-[1400px]:w-[284px] min-[1400px]:h-[430.84px] min-[600px]:max-md:mx-auto min-[600px]:max-md:shrink-0 min-[600px]:max-md:w-[min(518px,calc(488.88px*var(--timeline-img-ar)))] min-[600px]:max-md:h-[min(488.88px,calc(518px/var(--timeline-img-ar)))] max-md:z-[1] max-md:mb-[14px] max-md:flex max-md:w-full max-md:justify-center min-[600px]:max-md:mb-[14px] motion-reduce:max-md:transition-none max-md:[transition:opacity_2s_ease-out,transform_0.6s_ease-out,visibility_2s_ease-out] max-md:will-change-[opacity,transform,visibility]'
              : 'md:shrink-0 md:max-lg:w-[calc(239.336px+(100vw-768px)*0.35647)] md:max-lg:h-[calc(153.32px+(100vw-768px)*0.22835)] lg:max-[1199px]:w-[calc(252px+(100vw-992px)*0.30918)] lg:max-[1199px]:h-[calc(161.438px+(100vw-992px)*0.19807)] min-[1200px]:max-[1399px]:w-[calc(335.195px+(100vw-1200px)*0.32)] min-[1200px]:max-[1399px]:h-[calc(214.734px+(100vw-1200px)*0.205)] min-[1400px]:w-[399.195px] min-[1400px]:h-[255.734px] min-[600px]:max-md:mx-auto min-[600px]:max-md:w-[518px] min-[600px]:max-md:max-w-[518px] min-[600px]:max-md:shrink-0 min-[600px]:max-md:[aspect-ratio:var(--timeline-event-img-ar)]',
            isReversed
              ? 'md:max-lg:ml-[24.17px] md:max-lg:max-w-[calc(100%-24.17px)] lg:ml-[106px] lg:max-w-[calc(100%-106px)]'
              : 'md:max-lg:mr-[24.17px] md:max-lg:max-w-[calc(100%-24.17px)] lg:mr-[106px] lg:max-w-[calc(100%-106px)]',
          )}
          style={eventImageAspectStyle}
        >
          <NextImage
            field={Image}
            fill
            className="absolute inset-0 box-border h-full max-h-full w-full max-w-full object-cover object-center align-middle [overflow-clip-margin:content-box] [-webkit-tap-highlight-color:transparent]"
            sizes={
              isLandscapeLikeImage
                ? '(max-width: 599px) calc(100vw - 4rem), (max-width: 767px) 518px, (max-width: 991px) 319px, (max-width: 1199px) 316px, (max-width: 1399px) 335px, 400px'
                : '(max-width: 599px) calc(100vw - 4rem), (max-width: 767px) 518px, (max-width: 1199px) 200px, (max-width: 1399px) 238px, 284px'
            }
          />
        </div>
      </div>
    : null;

  const eventImage: JSX.Element | null =
    hasImage ?
      Image?.value?.src && !isEditing ?
        <TimelineImageModalTrigger
          ariaLabel={eventImageAltOrTitle}
          image={Image!}
          isEditing={false}
        >
          {eventImageFrame}
        </TimelineImageModalTrigger>
      : eventImageFrame
    : null;

  return (
    <div id={anchorId} className="w-full scroll-mt-24">
      {}
      <article
        aria-label={Title?.value?.trim() ?? displayName ?? undefined}
        className="relative isolate box-border flex w-full min-w-0 shrink-0 flex-col content-center gap-0 font-media-tile text-font-big leading-[30px] text-ink-muted [-webkit-tap-highlight-color:transparent] [unicode-bidi:isolate] max-md:py-[45px] md:hidden"
      >
        {eventImage}
        <TimelineContentCardShell isReversed={isReversed}>{cardInner}</TimelineContentCardShell>
      </article>

      {}
      <article
        aria-label={Title?.value?.trim() ?? displayName ?? undefined}
        className="relative isolate hidden box-border w-full grid-cols-[minmax(0,1fr)_50px_minmax(0,1fr)] font-media-tile text-font-big leading-[30px] text-ink-muted [-webkit-tap-highlight-color:transparent] [unicode-bidi:isolate] md:grid md:items-stretch md:justify-start"
      >
        {/* Image column — `relative` frame + fill img; placement alternates by `isReversed` */}
        <div
          className={cn(
            'relative z-[1] box-border flex min-h-0 w-full min-w-0 flex-col font-media-tile text-ink-muted [-webkit-tap-highlight-color:transparent] [unicode-bidi:isolate] max-md:mt-4 md:row-start-1 md:my-[90px] md:mx-0',
            'md:flex md:h-auto md:flex-row md:basis-1/2 md:flex-[0_0_50%] md:items-center md:self-center md:p-0 md:text-[length:20px] md:leading-[30px]',
            isReversed ? 'md:justify-start' : 'md:justify-end',
            'motion-reduce:md:transition-none md:[transition:opacity_2000ms_ease-out,transform_600ms_ease-out,visibility_2000ms_ease-out] md:will-change-[opacity,transform,visibility]',
            isReversed ? 'md:col-start-3' : 'md:col-start-1',
          )}
        >
          {eventImage}
        </div>

        {}
        <div
          aria-hidden="true"
          className="pointer-events-none relative z-[3] box-border hidden h-full min-h-0 w-full min-w-0 shrink-0 font-media-tile text-font-big leading-[30px] text-ink-muted [-webkit-tap-highlight-color:transparent] [unicode-bidi:isolate] md:col-start-2 md:row-start-1 md:flex md:w-[50px] md:flex-col md:content-center md:items-center md:justify-center md:self-stretch"
        >
          {timelineDot}
        </div>

        {/* Text column: orange segment to axis + single card (one Sitecore field tree) */}
        <div
          className={cn(
            'relative z-[1] box-border flex min-h-0 w-full min-w-0 flex-col justify-center overflow-visible max-md:mt-6 md:row-start-1 md:my-[90px] md:mx-0',
            isReversed ? 'md:col-start-1' : 'md:col-start-3',
          )}
        >
          <div
            className={cn(
              isReversed
                ? 'pointer-events-none absolute top-1/2 z-[1] hidden h-[2px] -translate-y-1/2 bg-orange md:block md:right-[-4.675px] md:max-lg:left-[calc(100%-min(calc(237px+(100vw-768px)*0.3587),100%))] lg:max-[1199px]:left-[calc(100%-min(calc(269px+(100vw-992px)*0.3865),100%))] min-[1200px]:left-[calc(100%-min(373px,100%))] min-[1400px]:left-[calc(100%-min(453px,100%))]'
                : 'pointer-events-none absolute top-1/2 z-[1] hidden h-[2px] -translate-y-1/2 bg-orange md:left-[-4.675px] md:block md:max-lg:right-[calc(100%-min(calc(237px+(100vw-768px)*0.3587),100%))] lg:right-[calc(100%-80px)] lg:max-[1199px]:right-[calc(100%-min(calc(269px+(100vw-992px)*0.3865),100%))] min-[1200px]:right-[calc(100%-min(373px,100%))] min-[1400px]:right-[calc(100%-min(453px,100%))]',
            )}
            aria-hidden
          />
          <div
            className={cn(
              'flex w-full min-w-0 basis-full flex-col gap-0',
              'md:basis-full md:flex-row md:items-center md:gap-0',
              isReversed ? 'md:flex-row-reverse md:justify-end' : 'md:justify-start',
            )}
          >
            <div
              className="relative z-[2] hidden min-h-0 shrink-0 flex-col items-center justify-center overflow-visible md:flex md:w-[16px] lg:w-[80px]"
              aria-hidden
            />
            <div
              className={cn(
                'min-w-0 flex-1 md:min-w-0 md:flex md:items-center relative z-[3]',
                isReversed ? 'md:justify-start' : 'md:justify-end',
              )}
            >
              <TimelineContentCardShell isReversed={isReversed} desktopGrid>
                {cardInner}
              </TimelineContentCardShell>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

interface TimelineSectionProps {
  /** Sitecore group (background fields; `displayName` for a11y). */
  group: TimelineGroup;
  /** Count of renderable events in all **previous** sections (global alternation baseline). */
  priorEventCount: number;
  /** Whether the page is in XM Cloud Pages editing mode. */
  isEditing: boolean;
  /** When true, renders the timeline end marker (orange dot on the spine) below the last event in this section. */
  showClosingTerminal?: boolean;
  /** When true, the first timeline band on the page: below `md`, the decade chip row has bottom padding only (no top padding). */
  isFirstSection?: boolean;
  /** Per-decade-band chip visibility from {@link buildTimelineDecadeChipPlacements} (global dedup). */
  decadeChipPlacements?: TimelineDecadeChipPlacement[];
}

/**
 * One timeline band: decade chips, spine, events, and optional closing terminal.
 */
export function TimelineSection({
  group,
  priorEventCount,
  isEditing,
  showClosingTerminal = false,
  isFirstSection = false,
  decadeChipPlacements,
}: TimelineSectionProps): JSX.Element | null {
  const { fields, displayName } = group;
  const { BackgroundColor, BackgroundImage, TimelineEvents } = fields ?? {};

  const rawEvents = TimelineEvents?.filter((e) => e?.fields) ?? [];
  const events = sortEventsByYear(rawEvents);
  const decadeBands = groupEventsByDecadeInGroup(events);
  const fallbackDecadeHeader = getDecadeHeader(events);
  const bgBandValue = BackgroundColor?.fields?.Value?.value?.toLowerCase().trim();
  const bgBandIsGrey = bgBandValue === 'grey' || bgBandValue === 'gray';
  const hasBgImage = Boolean(BackgroundImage?.value?.src);
  const isGrayBand = !hasBgImage && bgBandIsGrey;

  if (!events.length && !isEditing) return null;

  const sectionAriaLabel =
    displayName ??
    (decadeBands.length === 1 ?
      String(decadeBands[0]!.decadeStart || fallbackDecadeHeader)
    : fallbackDecadeHeader || undefined);

  let globalEventOffset = 0;

  const spineBottomInsetClass = showClosingTerminal
    ? isGrayBand
      ? 'bottom-[calc(80px+32.73px/2)]'
      : 'bottom-6'
    : 'bottom-0';

  const mobileSpineVerticalClass = showClosingTerminal
    ? isGrayBand
      ? 'top-0 max-md:bottom-[calc(48px+32.73px/2)]'
      : 'top-0 max-md:bottom-[calc(32.73px/2)]'
    : 'top-0 bottom-0';

  return (
    <section
      aria-label={sectionAriaLabel}
      className={cn(
        'relative overflow-visible box-border px-0 py-0',
        'w-full min-w-0 max-md:w-screen max-md:max-w-[100vw] max-md:shrink-0 max-md:ml-[calc(50%-50vw)] max-md:mr-[calc(50%-50vw)]',
        hasBgImage
          ? bgBandIsGrey
            ? 'bg-surface-muted'
            : 'bg-surface'
          : isGrayBand
            ? 'bg-surface'
            : bgBandIsGrey
              ? 'bg-surface-muted'
              : 'bg-surface',
      )}
    >
      {(isGrayBand || (hasBgImage && BackgroundImage)) && (
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute z-0 overflow-hidden md:bottom-0 md:left-1/2 md:w-screen md:max-w-[100vw] md:-translate-x-1/2',
            isFirstSection && hasBgImage
              ? 'max-md:top-[46px] max-md:right-0 max-md:bottom-0 max-md:left-0 md:top-[46px]'
              : 'max-md:inset-0 md:top-0',
            isGrayBand
              ? 'bg-surface'
              : hasBgImage
                ? bgBandIsGrey
                  ? 'bg-surface-muted'
                  : 'bg-surface'
                : '',
          )}
        >
          {isGrayBand && (
            <div className="pointer-events-none absolute inset-0 bg-surface-muted max-lg:[clip-path:polygon(0_7%,100%_3%,100%_95%,0_100%)] lg:[clip-path:polygon(0_10%,100%_2%,100%_93%,0_100%)]" />
          )}
          {hasBgImage && BackgroundImage && (
            <div className="pointer-events-none absolute inset-0">
              <NextImage
                field={BackgroundImage}
                fill
                className="object-contain object-top align-middle [overflow-clip-margin:content-box]"
                sizes="100vw"
                alt=""
              />
            </div>
          )}
        </div>
      )}

      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute z-[3] hidden w-[3px] bg-ink-primary max-md:block',
          'max-md:left-[calc(1rem+max(0px,(100vw-min(600px,100vw))/2))]',
          mobileSpineVerticalClass,
        )}
      />

      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute left-0 right-0 top-0 z-[1] hidden justify-center md:flex',
          spineBottomInsetClass,
        )}
      >
        <div className="relative h-full w-full max-w-full min-[600px]:max-md:max-w-[600px] md:max-w-[min(1168px,calc(100vw-192px))]">
          <div className="absolute left-1/2 top-0 bottom-0 w-[3px] -translate-x-1/2 bg-ink-primary" />
        </div>
      </div>

      <div
        className={cn(
          'relative z-10 mx-auto box-border max-md:pr-4',
          'w-full max-w-full min-[600px]:max-md:max-w-[600px] md:max-w-[min(1168px,calc(100vw-192px))]',
          'max-md:pl-[66px]',
        )}
      >
        <div className="relative z-[1] w-full">
          {(() => {
            const bandsToRender =
              decadeBands.length > 0 ? decadeBands : [{ decadeStart: 0, events }];
            return bandsToRender.map((band, bandIndex) => {
              const chipLabel =
                band.decadeStart > 0 ?
                  String(band.decadeStart)
                : fallbackDecadeHeader;
              const isLastBand = bandIndex === bandsToRender.length - 1;
              const chipPlacement = decadeChipPlacements?.[bandIndex];
              const showDecadeChip = chipPlacement?.showChip ?? true;
              const chipUsesFirstSectionSpacing =
                chipPlacement?.usesFirstSectionSpacing ?? (isFirstSection && bandIndex === 0);
              const bandEventOffset = globalEventOffset;
              globalEventOffset += band.events.length;

              return (
                <Fragment key={`${group.id}-decade-${band.decadeStart}-${bandIndex}`}>
                  {showDecadeChip && (chipLabel || isEditing) && (
                    <div
                      className={cn(
                        'relative z-10 box-border flex w-full flex-col items-center justify-start font-media-tile max-md:items-start [-webkit-tap-highlight-color:transparent] [unicode-bidi:isolate]',
                        'max-md:min-h-0',
                        chipUsesFirstSectionSpacing
                          ? 'max-md:min-h-0 max-md:pt-0 max-md:pb-[45px] md:min-h-[136px] md:pt-0 md:pb-[90px]'
                          : 'max-md:min-h-0 max-md:py-[45px] md:py-[90px]',
                      )}
                      aria-label={chipLabel ? `Timeline section: ${chipLabel}` : undefined}
                    >
                      <span className="relative z-[1] mx-auto box-border block h-[46px] w-max max-w-[min(100%,calc(100vw-32px))] shrink-0 bg-[rgb(57,67,72)] px-6 py-2 text-center font-media-tile text-font-big font-bold leading-[30px] text-ink-inverse max-md:relative max-md:z-[3] max-md:mx-0 max-md:max-w-full max-md:-translate-x-[calc(66px-1rem-3px)] max-md:text-left [-webkit-tap-highlight-color:transparent] [unicode-bidi:isolate]">
                        {chipLabel ||
                          (isEditing ? <span className="is-empty-hint">Decade header</span> : null)}
                      </span>
                    </div>
                  )}

                  <div className="relative z-10 w-full">
                    {band.events.length > 0 ? (
                      <div className="relative">
                        <div
                          role="list"
                          className="relative z-[2] flex flex-col items-stretch justify-start gap-[90px] max-md:gap-0"
                        >
                          {band.events.map((event, eventIndex) => (
                            <div
                              key={event.id}
                              role="listitem"
                              className="relative box-border w-full"
                            >
                              <TimelineEventCard
                                event={event}
                                anchorId={timelineEventAnchorId(event.id)}
                                isReversed={
                                  (priorEventCount + bandEventOffset + eventIndex) % 2 === 1
                                }
                                isEditing={isEditing}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      isEditing &&
                      isLastBand && (
                        <div className="py-8 px-6">
                          <span className="is-empty-hint">{TIMELINE_LABELS.noEventsHint}</span>
                        </div>
                      )
                    )}
                  </div>
                </Fragment>
              );
            });
          })()}

          {showClosingTerminal && (
            <div
              className={cn(
                'relative z-20 mt-0 flex w-full justify-center',
                isGrayBand ? 'max-md:pb-[48px] md:pb-[80px]' : 'pb-0',
                'max-md:-ml-[66px] max-md:justify-start',
              )}
            >
              <div
                aria-hidden="true"
                className="h-[32.73px] w-[32.51px] shrink-0 rounded-full bg-orange max-md:ml-[calc(1rem+1.5px-16.255px)] md:ml-0"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
