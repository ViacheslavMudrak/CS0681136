import type { CSSProperties, JSX } from 'react';
import { cn } from 'lib/utils';

import { NextImage, RichText, Text } from '@sitecore-content-sdk/nextjs';

import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';
import type { TimelineProps } from './Timeline.type';
import {
  buildTimelineDecadeChipPlacements,
  buildTimelineNavigatorEntries,
  getLastRenderableTimelineGroupIndex,
  getPriorEventCountByGroup,
  getTimelineImageAspectRatioCss,
  getTimelineImageFrameVariant,
  timelineHasParseableEventYears,
  TIMELINE_LABELS,
} from './timelineUtils';
import { TimelineImageModalProvider } from './partial/TimelineImageModal.client';
import { TimelineYearNavigatorClient } from './partial/TimelineClient';
import { TimelineSection } from './partial/TimelineSection';

interface TimelineClosingYearProps {
  /** Calendar year label (defaults to runtime current year in the server render). */
  currentYear?: number;
}

/** Current-year label overlapping the summary block top padding (decade layout). */
function TimelineSummaryYearBand({ currentYear }: TimelineClosingYearProps): JSX.Element {
  const year = currentYear ?? new Date().getFullYear();
  const yearLabel = String(year);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-10 flex -translate-y-1/2 justify-center p-0 [-webkit-tap-highlight-color:transparent] [unicode-bidi:isolate]"
    >
      <p className="m-0 text-center text-[length:30px] font-black leading-none text-orange [unicode-bidi:isolate]">
        {yearLabel}
      </p>
    </div>
  );
}

/** Full-bleed current-year band when decades are active and there is no summary block. */
function TimelineClosingYear({ currentYear }: TimelineClosingYearProps): JSX.Element {
  const year = currentYear ?? new Date().getFullYear();
  const yearLabel = String(year);

  return (
    <section
      aria-label={`Timeline: ${yearLabel}`}
      className="relative z-10 box-border bg-surface p-0 font-media-tile [-webkit-tap-highlight-color:transparent] [unicode-bidi:isolate] w-full min-w-0 max-md:w-screen max-md:max-w-[100vw] max-md:shrink-0 max-md:ml-[calc(50%-50vw)] max-md:mr-[calc(50%-50vw)]"
    >
      <div className="flex w-full items-center justify-center">
        <p
          aria-hidden="true"
          className="m-0 text-center text-[length:30px] font-black leading-none text-orange [unicode-bidi:isolate]"
        >
          {yearLabel}
        </p>
      </div>
    </section>
  );
}

/**
 * Company history timeline: banner, intro, one section per Sitecore group, optional summary, and tablet/desktop year rail.
 *
 * @param fields - Datasource fields (flat Sitecore shape).
 * @param params - `styles` and `RenderingIdentifier`.
 * @param page - Includes `page.mode.isEditing`.
 * @returns Full-page timeline section or empty-hint fallback.
 */
export function Default({ fields, params, page }: TimelineProps): JSX.Element {
  const { isEditing } = page.mode;
  const { styles, RenderingIdentifier: id } = params;
  const anchor = renderingAnchorIdProps(id);

  if (!fields) {
    return (
      <section
        className={cn(
          'component timeline box-border flex-[0_0_100%] min-w-0 shrink-0 grow-0 basis-full p-0!',
          'w-screen max-w-[100vw] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]',
          styles,
        )}
        {...anchor}
      >
        <div className="component-content box-border m-0 min-w-0 w-full max-w-none p-0!">
          <div className="timeline-outer box-border mx-auto w-full min-w-0 max-w-full pt-12 px-4 pb-0 min-[600px]:max-[767px]:max-w-[600px] min-[768px]:max-w-[768px] min-[768px]:pt-20 min-[992px]:max-w-[992px] min-[1200px]:max-w-[1200px]">
            <span className="is-empty-hint">{TIMELINE_LABELS.emptyHint}</span>
          </div>
        </div>
      </section>
    );
  }

  const {
    Headline,
    Introduction,
    Summary,
    BannerImage,
    SummaryImage,
    TimelineGroup,
  } = fields;

  const groups = TimelineGroup?.filter((g) => g?.fields) ?? [];
  const referenceYear = new Date().getFullYear();
  const hasParseableYears = timelineHasParseableEventYears(groups);
  const lastRenderableGroupIndex = getLastRenderableTimelineGroupIndex(groups, isEditing);
  const navigatorEntries = buildTimelineNavigatorEntries(groups, isEditing);
  const priorEventCountByGroup = getPriorEventCountByGroup(groups);
  const decadeChipPlacementsByGroup = buildTimelineDecadeChipPlacements(groups);
  const hasBannerImage = Boolean(BannerImage?.value?.src) || isEditing;
  const hasSummary = Boolean(Summary?.value) || Boolean(SummaryImage?.value?.src) || isEditing;
  const summaryImageFrameVariant = getTimelineImageFrameVariant(SummaryImage);
  const summaryImageAspectCssVar = getTimelineImageAspectRatioCss(SummaryImage, summaryImageFrameVariant);
  const summaryImageAspectStyle = {
    ['--timeline-summary-ar']: summaryImageAspectCssVar,
  } as CSSProperties;
  const hasTimelineBody =
    Boolean(Headline?.value || Introduction?.value) ||
    isEditing ||
    groups.length > 0 ||
    hasSummary;
  const hasTimelineShell = hasBannerImage || hasTimelineBody;

  return (
    <section
      className={cn(
        'component timeline box-border flex-[0_0_100%] min-w-0 shrink-0 grow-0 basis-full p-0!',
        'w-screen max-w-[100vw] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]',
        styles,
      )}
      aria-label={Headline?.value?.trim() || TIMELINE_LABELS.emptyHint}
      {...anchor}
    >
      <div className="component-content box-border m-0 min-w-0 w-full max-w-none p-0!">

        {/* ── Single banded outer: top banner, intro, sections, summary (bottom banner) — featured news rhythm ── */}
        {hasTimelineShell && (
          <TimelineImageModalProvider isEditing={isEditing}>
            <div className="timeline-outer box-border mx-auto w-full min-w-0 max-w-full pt-12 px-4 pb-0 min-[600px]:max-[767px]:max-w-[600px] min-[768px]:max-w-[768px] min-[768px]:pt-20 min-[992px]:max-w-[992px] min-[1200px]:max-w-[1200px]">
            {hasBannerImage && (
              <div className="relative mb-4 aspect-[1168/456] w-full overflow-hidden lg:mb-20">
                {BannerImage?.value?.src ? (
                  <NextImage
                    field={BannerImage}
                    fill
                    className="object-cover object-center align-middle [overflow-clip-margin:content-box]"
                    priority
                    sizes="(max-width: 1200px) calc(100vw - 32px), 1168px"
                  />
                ) : (
                  isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface-muted">
                      <span className="is-empty-hint">{TIMELINE_LABELS.imageEmptyHint}</span>
                    </div>
                  )
                )}
              </div>
            )}

            {(Headline?.value || Introduction?.value || isEditing) && (
              <div className="mx-auto w-full max-w-[934.4px] text-center font-media-tile [-webkit-tap-highlight-color:transparent]">
                {(Headline?.value || isEditing) && (
                  <Text
                    field={Headline}
                    tag="h2"
                    className="mb-0 text-center text-[30px] font-bold leading-[37.5px] text-ink-primary [unicode-bidi:isolate]"
                  />
                )}
                {(Introduction?.value || isEditing) && (
                  <Text
                    field={Introduction}
                    tag="p"
                    className="box-border mx-0 mb-0 mt-4 max-w-full p-0 text-center text-font-big font-normal leading-[30px] text-ink-muted [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]"
                  />
                )}
              </div>
            )}

            {}
            {(groups.length > 0 || isEditing) && (
              <>
                <div className="relative mx-auto box-border w-full max-w-full pt-20 pb-0 text-center text-ink-primary [-webkit-tap-highlight-color:transparent] [unicode-bidi:isolate] min-[600px]:max-md:max-w-[600px] md:max-w-[1400px]">
                  <div className="min-w-0 md:px-4">
                    {groups.map((group, index) => (
                      <TimelineSection
                        key={group.id}
                        group={group}
                        priorEventCount={priorEventCountByGroup[index] ?? 0}
                        isEditing={isEditing}
                        decadeChipPlacements={decadeChipPlacementsByGroup[index]}
                        showClosingTerminal={
                          hasParseableYears && index === lastRenderableGroupIndex
                        }
                        isFirstSection={index === 0}
                      />
                    ))}
                    {hasParseableYears && !hasSummary && (
                      <TimelineClosingYear currentYear={referenceYear} />
                    )}

                    {!groups.length && isEditing && (
                      <div className="text-center">
                        <span className="is-empty-hint">{TIMELINE_LABELS.noGroupsHint}</span>
                      </div>
                    )}
                  </div>
                </div>

                {!isEditing && navigatorEntries.length > 0 && (
                  <TimelineYearNavigatorClient entries={navigatorEntries} />
                )}
              </>
            )}

            {hasSummary && (
              <section
                aria-label={
                  hasParseableYears ?
                    `Timeline summary: ${String(referenceYear)}`
                  : 'Timeline summary'
                }
                className={cn(
                  'mx-auto flex w-full max-w-5xl flex-col gap-0 font-media-tile',
                  hasParseableYears ? 'mt-0' : 'mt-10 pt-20 pb-12 lg:mt-12 lg:pb-20',
                )}
              >
                <div
                  className={cn(
                    'relative box-border flex w-full flex-col gap-6',
                    hasParseableYears ? 'px-0 pt-12 pb-12' : '',
                  )}
                >
                  {hasParseableYears && (
                    <TimelineSummaryYearBand currentYear={referenceYear} />
                  )}
                  {(Summary?.value || isEditing) && (
                    <RichText
                      field={Summary}
                      className="prose prose-gray mx-auto w-full max-w-[864px] text-center text-font-big font-normal leading-[30px] text-ink-muted [-webkit-tap-highlight-color:transparent] [unicode-bidi:isolate] prose-p:mt-0 prose-p:mb-0 prose-p:text-center prose-p:font-normal prose-p:leading-[30px] prose-p:text-ink-muted prose-headings:text-ink-primary"
                    />
                  )}
                  {(SummaryImage?.value?.src || isEditing) && (
                    <div className="relative mx-auto w-full max-w-[864px] text-center">
                      <div
                        style={summaryImageAspectStyle}
                        className={[
                          'relative mx-auto w-full max-w-[432px] max-md:max-w-full',
                          'max-md:[aspect-ratio:var(--timeline-summary-ar)]',
                          'md:h-[82px] md:max-h-[82px]',
                          'overflow-hidden align-middle text-center text-font-big leading-[30px] text-ink-muted [-webkit-tap-highlight-color:transparent]',
                        ].join(' ')}
                      >
                      {SummaryImage?.value?.src ? (
                        <NextImage
                          field={SummaryImage}
                          fill
                          className="absolute inset-0 box-border object-contain object-center align-middle md:object-cover [overflow-clip-margin:content-box] [-webkit-tap-highlight-color:transparent]"
                          sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1200px) min(432px, 100vw - 32px), 432px"
                        />
                      ) : (
                        isEditing && (
                          <div className="absolute inset-0 flex items-center justify-center bg-surface-muted">
                            <span className="is-empty-hint">{TIMELINE_LABELS.imageEmptyHint}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  )}
                </div>
              </section>
            )}
          </div>
          </TimelineImageModalProvider>
        )}

      </div>
    </section>
  );
}
