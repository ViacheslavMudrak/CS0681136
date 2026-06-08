'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type JSX,
  type KeyboardEvent,
} from 'react';

import { BrightcoveModalPlayer } from 'components/shared/video/BrightcoveModalPlayer';
import Modal from 'components/shared/Modal';
import type { BrightcovePlayer } from 'components/shared/video/Video.type';

import type { TimelineNavigatorEntry } from '../Timeline.type';
import {
  TIMELINE_EVENT_SCROLL_MARGIN_PX,
  TIMELINE_LABELS,
  TIMELINE_SPINE_DOT_DATA_ATTR,
  getTimelineYearRailFixedUpChevronCenterY,
} from '../timelineUtils';

interface TimelineVideoClientProps {
  /** Brightcove video ID to play in the modal. */
  videoId: string;
  /** Accessible label for the modal (usually the video title). */
  videoTitle: string;
  /** Label for the CTA button that opens the modal. */
  ctaText: string;
}

/** Brightcove CTA and modal for a single timeline event. */
export function TimelineVideoClient({
  videoId,
  videoTitle,
  ctaText,
}: TimelineVideoClientProps): JSX.Element {
  const [showModal, setShowModal] = useState(false);
  const [playerMounted, setPlayerMounted] = useState(false);
  const playerRef = useRef<BrightcovePlayer | null>(null);

  useEffect(() => {
    setPlayerMounted(true);
  }, []);

  const openModal = () => setShowModal(true);

  const handleModalChange = (open: boolean) => {
    if (!open) {
      setShowModal(false);
      playerRef.current = null;
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal();
    }
  };

  const ariaLabel = videoTitle || TIMELINE_LABELS.videoAriaFallback;

  return (
    <>
      <button
        aria-label={`${ctaText} – ${ariaLabel}`}
        className='group box-border inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 font-media-tile text-[length:18.67px] font-normal leading-[28px] text-link no-underline underline-offset-2 transition-[color,text-decoration-color] duration-150 ease-in-out motion-reduce:transition-none [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] hover:text-link-strong hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-surface'
        onClick={openModal}
        onKeyDown={handleKeyDown}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="shrink-0 text-link transition-colors group-hover:text-link-strong"
          fill="none"
          height={19}
          viewBox="0 0 24 24"
          width={18.67}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.25 7.75v8.5l6.375-4.25-6.375-4.25Z" fill="currentColor" />
        </svg>
        <span>{ctaText}</span>
      </button>

      <Modal
        ariaLabel={ariaLabel}
        isOpen={showModal}
        modalSize="lg"
        onChange={handleModalChange}
        variant="media"
      >
        <div
          aria-label={ariaLabel}
          className="relative mx-auto box-border block aspect-[256/144] overflow-clip p-0 [-webkit-tap-highlight-color:transparent] max-md:!w-[256px] max-md:!max-w-[256px] max-md:min-w-0 max-md:shrink-0 md:aspect-[720/405] md:w-full md:max-w-[720px] md:!max-w-[720px] lg:aspect-[718/403.88] lg:max-w-[718px] lg:!max-w-[718px]"
          role="region"
        >
          {playerMounted && showModal ? (
            <div className="absolute inset-0 z-0 h-full w-full">
              <BrightcoveModalPlayer
                autoplayOnLoad={true}
                loop={false}
                onReady={(p) => {
                  playerRef.current = p;
                  p.muted(false);
                  p.play();
                }}
                playerClassName="laitram-bc-player laitram-bc-player--contain"
                playerNotConfigured={TIMELINE_LABELS.playerNotConfigured}
                videoId={videoId}
              />
            </div>
          ) : null}
        </div>
      </Modal>
    </>
  );
}

interface TimelineYearNavigatorClientProps {
  /** Chronological targets matching rendered event card anchors. */
  entries: TimelineNavigatorEntry[];
}

function ChevronUpIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      className={className}
      width={20}
      height={20}
      viewBox="0 0 24 24"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 15 6-6 6 6" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      className={className}
      width={20}
      height={20}
      viewBox="0 0 24 24"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function replaceYear(template: string, year: string): string {
  return template.replace('{year}', year);
}

function getElementViewportCenterY(el: Element): number {
  const r = el.getBoundingClientRect();
  return r.top + r.height / 2;
}

/** Viewport Y of the desktop spine disc center inside an event anchor, if present. */
function getTimelineEventSpineDotCenterY(anchorEl: HTMLElement): number | null {
  const dot = anchorEl.querySelector(`[${TIMELINE_SPINE_DOT_DATA_ATTR}]`);
  if (!dot) return null;
  return getElementViewportCenterY(dot);
}

/**
 * Scroll target so the event spine disc center meets the **fixed** year-rail up-chevron (viewport center).
 * Falls back to `scroll-mt-24` anchor offset when the spine disc node is unavailable.
 */
function computeTimelineEventScrollTargetY(anchorEl: HTMLElement): number {
  const dotCenterY = getTimelineEventSpineDotCenterY(anchorEl);
  const upChevronY = getTimelineYearRailFixedUpChevronCenterY(window.innerHeight);
  if (dotCenterY != null) {
    return window.scrollY + dotCenterY - upChevronY;
  }
  return window.scrollY + anchorEl.getBoundingClientRect().top - TIMELINE_EVENT_SCROLL_MARGIN_PX;
}

/**
 * Active event index: spine disc whose center is closest to the fixed up-chevron alignment line.
 */
function measureTimelineActiveEventIndex(
  list: TimelineNavigatorEntry[],
  alignY: number,
): number | null {
  if (typeof window === 'undefined' || list.length === 0) return null;
  let bestIdx = 0;
  let bestDist = Infinity;
  let found = false;

  for (let i = 0; i < list.length; i += 1) {
    const el = document.getElementById(list[i]!.anchorId);
    if (!el) continue;
    found = true;
    const r = el.getBoundingClientRect();
    const dotY = getTimelineEventSpineDotCenterY(el) ?? r.top + r.height / 2;
    const d = Math.abs(dotY - alignY);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }

  return found ? bestIdx : null;
}

/** Ease-in-out cubic — smoother perceived motion between distant cards than browser `scroll-behavior: smooth`. */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * Scroll duration scales with distance (clamped) so short hops stay snappy and long jumps do not feel like a single lunge.
 */
function timelineScrollAnimationDurationMs(distancePx: number): number {
  const raw = Math.abs(distancePx) * 0.5;
  return Math.min(1000, Math.max(320, raw));
}

/**
 * Animates `window` scroll with rAF + easing (fixed start/target). Cancels prior frames by replacing `animFrameRef`.
 * Optional `onFrame` updates the active year label each tick (scroll events are not guaranteed every frame).
 */
function runTimelineWindowScrollAnimation(
  targetY: number,
  startY: number,
  prefersReducedMotion: boolean,
  animFrameRef: { current: number },
  onFrame?: () => void,
  onComplete?: () => void,
): void {
  if (typeof window === 'undefined') return;

  const endY = Math.max(0, targetY);
  const distance = endY - startY;

  if (prefersReducedMotion || Math.abs(distance) < 2) {
    window.scrollTo({ top: endY, behavior: 'auto' });
    animFrameRef.current = 0;
    onFrame?.();
    onComplete?.();
    return;
  }

  const durationMs = timelineScrollAnimationDurationMs(distance);
  const t0 = performance.now();

  const tick = (now: number): void => {
    const elapsed = now - t0;
    const t = Math.min(1, elapsed / durationMs);
    const eased = easeInOutCubic(t);
    window.scrollTo({ top: startY + distance * eased, behavior: 'auto' });
    onFrame?.();

    if (t < 1) {
      animFrameRef.current = requestAnimationFrame(tick);
    } else {
      animFrameRef.current = 0;
      window.scrollTo({ top: endY, behavior: 'auto' });
      onFrame?.();
      onComplete?.();
    }
  };

  animFrameRef.current = requestAnimationFrame(tick);
}

/**
 * Tablet/desktop vertical rail: pinned to viewport vertical center; hidden below `md` (phone). From `md` up
 * Fixed `md:right-[max(1.5rem,calc((100vw-min(100vw,87.5rem))/2+1.5rem))]` places it on the right edge of the centered bands column.
 * Only the timeline scrolls — spine discs move to the fixed up-chevron line. Arrow clicks use rAF scroll.
 */
export function TimelineYearNavigatorClient({
  entries,
}: TimelineYearNavigatorClientProps): JSX.Element | null {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollAnimRef = useRef(0);
  const activeIndexRef = useRef(0);
  activeIndexRef.current = activeIndex;

  const cancelTimelineScrollAnimation = useCallback(() => {
    if (scrollAnimRef.current !== 0) {
      cancelAnimationFrame(scrollAnimRef.current);
      scrollAnimRef.current = 0;
    }
  }, []);

  const entryKey = entries.map((e) => e.anchorId).join('|');

  useEffect(() => {
    setActiveIndex((i) => Math.max(0, Math.min(i, Math.max(0, entries.length - 1))));
  }, [entries.length]);

  const applyViewportScrollState = useCallback(() => {
    if (entries.length === 0 || typeof window === 'undefined') return;

    const alignY = getTimelineYearRailFixedUpChevronCenterY(window.innerHeight);
    const bestIndex = measureTimelineActiveEventIndex(entries, alignY);
    if (bestIndex == null) return;

    const prev = activeIndexRef.current;
    activeIndexRef.current = bestIndex;
    if (bestIndex !== prev) {
      setActiveIndex(bestIndex);
    }
  }, [entries]);

  useLayoutEffect(() => {
    if (entries.length === 0 || typeof window === 'undefined') return;
    applyViewportScrollState();
  }, [activeIndex, entryKey, entries.length, applyViewportScrollState]);

  useEffect(() => {
    if (entries.length === 0 || typeof window === 'undefined') return;

    let raf = 0;
    const onScrollOrResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        applyViewportScrollState();
      });
    };

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });
    window.addEventListener('scrollend', onScrollOrResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scrollend', onScrollOrResize);
      cancelAnimationFrame(raf);
    };
  }, [entries.length, entryKey, applyViewportScrollState]);

  useEffect(() => () => cancelTimelineScrollAnimation(), [cancelTimelineScrollAnimation]);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= entries.length) return;
      const { anchorId } = entries[index]!;
      const el = typeof document !== 'undefined' ? document.getElementById(anchorId) : null;
      if (!el || typeof window === 'undefined') return;

      cancelTimelineScrollAnimation();

      const startY = window.scrollY;
      const targetY = computeTimelineEventScrollTargetY(el);
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      runTimelineWindowScrollAnimation(
        targetY,
        startY,
        reduceMotion,
        scrollAnimRef,
        applyViewportScrollState,
        () => {
          activeIndexRef.current = index;
          setActiveIndex(index);
          applyViewportScrollState();
          const fineTuneY = computeTimelineEventScrollTargetY(el);
          if (Math.abs(window.scrollY - fineTuneY) > 1) {
            window.scrollTo({ top: fineTuneY, behavior: 'auto' });
          }
          applyViewportScrollState();
        },
      );
    },
    [entries, applyViewportScrollState, cancelTimelineScrollAnimation],
  );

  if (entries.length === 0) return null;

  const safeIndex = Math.min(activeIndex, entries.length - 1);
  const current = entries[safeIndex]!;
  const atFirst = safeIndex <= 0;
  const atLast = safeIndex >= entries.length - 1;

  const prevTarget = !atFirst ? entries[safeIndex - 1] : null;
  const nextTarget = !atLast ? entries[safeIndex + 1] : null;

  return (
    <div
      className="pointer-events-none fixed top-1/2 z-40 hidden -translate-y-1/2 md:block md:right-[max(1.5rem,calc((100vw-min(100vw,87.5rem))/2+1.5rem))]"
    >
      <nav
        aria-label={TIMELINE_LABELS.yearRailNavLabel}
        className="pointer-events-auto box-border mb-0 ml-0 mr-4 mt-0 flex h-32 w-14 flex-col items-center justify-center gap-1 border-0 p-0 font-media-tile leading-6 text-ink-primary [tab-size:4] [text-size-adjust:100%] [-webkit-tap-highlight-color:transparent] [unicode-bidi:isolate]"
      >
        <button
          type="button"
          disabled={atFirst}
          onClick={() => scrollToIndex(safeIndex - 1)}
          data-timeline-year-rail-up
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-0 bg-transparent text-ink-primary transition-colors duration-150 enabled:cursor-pointer enabled:hover:bg-surface-muted-light disabled:cursor-default"
          aria-label={
            atFirst
              ? TIMELINE_LABELS.yearRailPreviousDisabled
              : replaceYear(TIMELINE_LABELS.yearRailPreviousAria, prevTarget!.yearLabel)
          }
        >
          <ChevronUpIcon className="shrink-0 text-ink-primary" />
        </button>

        <div
          className="box-border flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-solid border-stroke-default bg-[rgb(57,67,72)] p-0 text-center font-media-tile font-bold leading-[24px] text-ink-inverse [-webkit-tap-highlight-color:transparent] [unicode-bidi:isolate]"
          aria-live="polite"
          aria-atomic
        >
          <span className="max-w-[3.25rem] truncate text-center text-[length:15px] tabular-nums [unicode-bidi:isolate]">
            {current.yearLabel}
          </span>
        </div>

        <button
          type="button"
          disabled={atLast}
          onClick={() => scrollToIndex(safeIndex + 1)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-0 bg-transparent text-ink-primary transition-colors duration-150 enabled:cursor-pointer enabled:hover:bg-surface-muted-light disabled:cursor-default"
          aria-label={
            atLast
              ? TIMELINE_LABELS.yearRailNextDisabled
              : replaceYear(TIMELINE_LABELS.yearRailNextAria, nextTarget!.yearLabel)
          }
        >
          <ChevronDownIcon className="shrink-0 text-ink-primary" />
        </button>
      </nav>
    </div>
  );
}
