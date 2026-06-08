'use client';

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
  type KeyboardEvent,
} from 'react';

import { Link as ContentSdkLink, Text } from '@sitecore-content-sdk/nextjs';

import type { Swiper as SwiperType } from 'swiper';
import { Autoplay, EffectFade } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css/effect-fade';

import { extractMediaTileBrightcoveId } from 'components/media-tile/mediaTileUtils';
import {
  getCmsLinkAnchorProps,
  hasNonEmptyText,
  isVideoMediaType,
  MEDIA_LABELS,
  readMediaFormatFromResolvedFields,
  resolveMediaLayoutFields,
  resolveMediaPlaybackOptions,
  resolveMediaVideoCoverImage,
  resolveMediaVideoPresentation,
  type MediaFields,
} from 'components/media/mediaUtils';
import { MediaClient } from 'components/media/partial/MediaClient';
import { MediaImage } from 'components/media/partial/MediaImage';
import { TestimonialCard } from 'components/testimonial/partial/TestimonialPartials';
import type { TestimonialFigureSurface } from 'components/testimonial/Testimonial.type';
import { getNormalizedTestimonialFields } from 'components/testimonial/testimonialUtils';

import type { CarouselClientInput } from '../Carousel.type';
import { cn } from 'lib/utils';
import {
  CAROUSEL_ARIA_REGION_FALLBACK,
  CAROUSEL_DOT_LABEL,
  CAROUSEL_EMPTY_HINT,
  CAROUSEL_NEXT_LABEL,
  CAROUSEL_PREV_LABEL,
  formatCarouselLiveRegionMessage,
} from '../carouselUtils';

const AUTOPLAY_MS = 6000;
/** Swiper `speed` (ms) for testimonial fade transitions — longer than media slide for a softer cross-fade. */
const TESTIMONIAL_FADE_TRANSITION_MS = 900;

const MEDIA_TABLET_RAIL_MAX_PX = 768;
const MEDIA_TABLET_RAIL_MIN_PX = 480;

const MEDIA_PEEK_SLIDES_PER_VIEW = 1.35;
const MEDIA_PEEK_SPACE_BETWEEN_PX = 16;

const MEDIA_INACTIVE_WHITE_OVERLAY_OPACITY = 0.85;

type MediaSlideEntry = { kind: 'media'; item: CarouselClientInput['mediaItems'][number] };

/** Tablet peek uses bookend clones instead of Swiper loop (loop + fractional peek skips the right peek on the last slide). */
function mapMediaSwiperIndexToActive(
  swiperIndex: number,
  usesBookends: boolean,
  total: number,
): number {
  if (!usesBookends || total <= 0) return swiperIndex;
  if (swiperIndex <= 0) return total - 1;
  if (swiperIndex >= total + 1) return 0;
  return swiperIndex - 1;
}

function CarouselNavChevron({ direction }: { direction: 'left' | 'right' }): JSX.Element {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-ink-muted"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {direction === 'left' ?
        <path d="M15 18l-6-6 6-6" />
      : <path d="M9 18l6-6-6-6" />}
    </svg>
  );
}

export function CarouselClient({
  isEditing,
  renderingDisplayName,
  contentKind,
  backgroundClass,
  showControls,
  autoplay,
  mediaItems,
  testimonialItems,
  page,
}: CarouselClientInput): JSX.Element {
  void page;

  const reactId = useId();
  const regionLabel = renderingDisplayName?.trim() || CAROUSEL_ARIA_REGION_FALLBACK;

  const slides =
    contentKind === 'media' ? mediaItems.map((m) => ({ kind: 'media' as const, item: m })) : (
      testimonialItems.map((t) => ({ kind: 'testimonial' as const, item: t }))
    );

  const total = slides.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMediaTabletRailViewport, setIsMediaTabletRailViewport] = useState(false);

  const mediaSwiperRef = useRef<SwiperType | null>(null);
  const testimonialSwiperRef = useRef<SwiperType | null>(null);
  /** When jumping several slides on the media carousel, chain single-step moves so Swiper does not run one long translate (loop + peek showed every slide at once). */
  const mediaStepNavRef = useRef<{ pending: number; direction: 'next' | 'prev' } | null>(null);

  const mediaUseLoop = contentKind === 'media' && total > 1 && !reducedMotion;

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(Boolean(mq.matches));
    if (typeof mq.addEventListener !== 'function') return undefined;
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    setActiveIndex((i) => (total === 0 ? 0 : Math.min(i, total - 1)));
  }, [total]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const sync = () => {
      const w = window.innerWidth;
      setIsMediaTabletRailViewport(
        w >= MEDIA_TABLET_RAIL_MIN_PX && w < MEDIA_TABLET_RAIL_MAX_PX,
      );
    };
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  const useMediaCenteredPeek =
    contentKind === 'media' &&
    total > 1 &&
    isMediaTabletRailViewport &&
    !reducedMotion;

  const mediaBreakpoints = useMemo(
    () => ({
      0: { slidesPerView: 1, spaceBetween: 0, centeredSlides: false },
      480:
        useMediaCenteredPeek ?
          {
            slidesPerView: MEDIA_PEEK_SLIDES_PER_VIEW,
            spaceBetween: MEDIA_PEEK_SPACE_BETWEEN_PX,
            centeredSlides: true,
            centeredSlidesBounds: false,
          }
        : { slidesPerView: 1, spaceBetween: 0, centeredSlides: false },
      768: { slidesPerView: 1, spaceBetween: 0, centeredSlides: false },
    }),
    [useMediaCenteredPeek],
  );

  const mediaLoopEnabled = mediaUseLoop;

  const mediaSwiperUsesBookends =
    useMediaCenteredPeek && mediaLoopEnabled && total > 1;

  const mediaSwiperSlideEntries = useMemo((): MediaSlideEntry[] => {
    const media = slides.filter((e): e is MediaSlideEntry => e.kind === 'media');
    if (!mediaSwiperUsesBookends || media.length === 0) return media;
    const first = media[0];
    const last = media[media.length - 1];
    return [
      {
        kind: 'media',
        item: {
          ...last.item,
          id: `${last.item.id}-carousel-peek-before`,
        },
      },
      ...media,
      {
        kind: 'media',
        item: {
          ...first.item,
          id: `${first.item.id}-carousel-peek-after`,
        },
      },
    ];
  }, [slides, mediaSwiperUsesBookends]);

  const mediaSwiperUsesNativeLoop = mediaLoopEnabled && !mediaSwiperUsesBookends;

  const mediaAutoplay =
    autoplay && !reducedMotion && !isEditing && total > 1 && contentKind === 'media' ?
      { delay: AUTOPLAY_MS, disableOnInteraction: false, pauseOnMouseEnter: true }
    : false;

  const testimonialAutoplay =
    autoplay && !reducedMotion && !isEditing && total > 1 && contentKind === 'testimonial' ?
      { delay: AUTOPLAY_MS, disableOnInteraction: false, pauseOnMouseEnter: true }
    : false;

  const swiperSpeed = reducedMotion ? 0 : 500;
  const testimonialSwiperSpeed = reducedMotion ? 0 : TESTIMONIAL_FADE_TRANSITION_MS;

  const bindMediaSwiper = useCallback((instance: SwiperType) => {
    mediaSwiperRef.current = instance;
  }, []);

  const bindTestimonialSwiper = useCallback((instance: SwiperType) => {
    testimonialSwiperRef.current = instance;
  }, []);

  useEffect(() => {
    mediaSwiperRef.current?.update();
    testimonialSwiperRef.current?.update();
  }, [
    total,
    reducedMotion,
    isMediaTabletRailViewport,
    useMediaCenteredPeek,
    mediaSwiperSlideEntries.length,
  ]);

  const goMediaPrev = useCallback(() => {
    mediaStepNavRef.current = null;
    mediaSwiperRef.current?.slidePrev();
  }, []);

  const goMediaNext = useCallback(() => {
    mediaStepNavRef.current = null;
    mediaSwiperRef.current?.slideNext();
  }, []);

  const goTestimonialPrev = useCallback(() => {
    testimonialSwiperRef.current?.slidePrev();
  }, []);

  const goTestimonialNext = useCallback(() => {
    testimonialSwiperRef.current?.slideNext();
  }, []);

  const onMediaSlideChangeTransitionEnd = useCallback(
    (swiper: SwiperType) => {
      if (mediaSwiperUsesBookends && total > 0) {
        const idx = swiper.activeIndex;
        if (idx >= total + 1) {
          swiper.slideTo(1, 0, false);
          setActiveIndex(0);
          return;
        }
        if (idx <= 0) {
          swiper.slideTo(total, 0, false);
          setActiveIndex(total - 1);
          return;
        }
        setActiveIndex(mapMediaSwiperIndexToActive(idx, true, total));
      }

      const step = mediaStepNavRef.current;
      if (!step) return;
      if (step.pending > 0) {
        step.pending -= 1;
        const nav = mediaSwiperRef.current;
        if (!nav) {
          mediaStepNavRef.current = null;
          return;
        }
        if (step.direction === 'next') nav.slideNext();
        else nav.slidePrev();
      } else {
        mediaStepNavRef.current = null;
      }
    },
    [mediaSwiperUsesBookends, total],
  );

  const goMediaTo = useCallback(
    (idx: number) => {
      const s = mediaSwiperRef.current;
      if (!s || total === 0) return;
      const clamped = Math.max(0, Math.min(idx, total - 1));
      const cur = mediaSwiperUsesBookends
        ? mapMediaSwiperIndexToActive(s.activeIndex, true, total)
        : s.realIndex;
      if (clamped === cur) return;

      mediaStepNavRef.current = null;

      if (mediaSwiperUsesBookends) {
        s.slideTo(clamped + 1, reducedMotion ? 0 : swiperSpeed);
        return;
      }

      if (reducedMotion) {
        if (mediaSwiperUsesNativeLoop) s.slideToLoop(clamped);
        else s.slideTo(clamped);
        return;
      }

      if (!mediaSwiperUsesNativeLoop) {
        const diff = clamped - cur;
        const steps = Math.abs(diff);
        const direction: 'next' | 'prev' = diff > 0 ? 'next' : 'prev';
        if (steps <= 1) {
          if (direction === 'next') s.slideNext();
          else s.slidePrev();
          return;
        }
        mediaStepNavRef.current = { pending: steps - 1, direction };
        if (direction === 'next') s.slideNext();
        else s.slidePrev();
        return;
      }

      const forward = (clamped - cur + total) % total;
      const backward = (cur - clamped + total) % total;
      const useForward = forward <= backward;
      const steps = useForward ? forward : backward;
      const direction: 'next' | 'prev' = useForward ? 'next' : 'prev';

      if (steps <= 1) {
        if (direction === 'next') s.slideNext();
        else s.slidePrev();
        return;
      }
      mediaStepNavRef.current = { pending: steps - 1, direction };
      if (direction === 'next') s.slideNext();
      else s.slidePrev();
    },
    [
      mediaSwiperUsesBookends,
      mediaSwiperUsesNativeLoop,
      reducedMotion,
      swiperSpeed,
      total,
    ],
  );

  const goTestimonialTo = useCallback(
    (idx: number) => {
      const s = testimonialSwiperRef.current;
      if (!s) return;
      const clamped = total === 0 ? 0 : Math.max(0, Math.min(idx, total - 1));
      s.slideTo(clamped);
    },
    [total],
  );

  const onMediaSlideChange = useCallback(
    (swiper: SwiperType) => {
      if (mediaSwiperUsesBookends && total > 0) {
        const idx = swiper.activeIndex;
        if (idx >= total + 1) {
          setActiveIndex(0);
          return;
        }
        if (idx <= 0) {
          setActiveIndex(total - 1);
          return;
        }
        setActiveIndex(mapMediaSwiperIndexToActive(idx, true, total));
        return;
      }
      setActiveIndex(swiper.realIndex);
    },
    [mediaSwiperUsesBookends, total],
  );

  const onTestimonialSlideChange = useCallback((swiper: SwiperType) => {
    setActiveIndex(swiper.realIndex);
  }, []);

  const onRegionKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (total <= 1) return;
      const isMedia = contentKind === 'media';
      const s = isMedia ? mediaSwiperRef.current : testimonialSwiperRef.current;
      if (!s) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        s.slidePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        s.slideNext();
      } else if (e.key === 'Home') {
        e.preventDefault();
        if (isMedia) goMediaTo(0);
        else s.slideTo(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        if (isMedia) goMediaTo(Math.max(0, total - 1));
        else s.slideTo(Math.max(0, total - 1));
      }
    },
    [contentKind, goMediaTo, total],
  );

  const figureSurface: TestimonialFigureSurface =
    backgroundClass.includes('bg-surface-muted') ? 'inherit' : 'white';

  const isGrayCarouselChrome = backgroundClass.includes('bg-surface-muted');

  const showNav = showControls && total > 1;
  const showDots = total > 1;

  const mediaInactiveOverlayOpacity = MEDIA_INACTIVE_WHITE_OVERLAY_OPACITY;

  const carouselLiveIndex = activeIndex;

  /** 768–991px: modest inline gutter; lg+ keeps 750px rail. */
  const mediaCarouselShellClass =
    'mx-auto w-full max-w-[768px] box-border min-w-0 max-md:px-4 md:max-lg:px-4 lg:max-w-[750px] lg:px-0';

  const liveId = `${reactId}-live`;

  type MediaSlideParts = { viewport: JSX.Element | null; foot: JSX.Element | null };

  const getMediaSlideParts = (mediaFields: MediaFields | undefined): MediaSlideParts | null => {
    if (!mediaFields) return null;
    const resolvedFields = resolveMediaLayoutFields(mediaFields);
    const captionField = resolvedFields.MediaCaption;
    const showCaption =
      hasNonEmptyText(captionField?.value) || (isEditing && captionField !== undefined);

    if (isVideoMediaType(resolvedFields.MediaType)) {
      const video = resolvedFields.Video;
      if (!video && isEditing) {
        return {
          viewport: (
            <div className="flex h-full w-full items-center justify-center bg-surface-panel">
              <span className="is-empty-hint">{MEDIA_LABELS.videoEmptyHint}</span>
            </div>
          ),
          foot: null,
        };
      }
      if (!video) return null;
      const brightcoveId = extractMediaTileBrightcoveId(video);
      if (!brightcoveId && !isEditing) return null;

      const vf = video.fields;
      const playback = resolveMediaPlaybackOptions(
        undefined,
        Boolean(vf?.Autoplay?.value),
        Boolean(vf?.Loop?.value),
      );

      const formatRaw = readMediaFormatFromResolvedFields(resolvedFields);
      const presentation = resolveMediaVideoPresentation(formatRaw, false);

      const videoCaptionFromItem = vf?.Caption;
      const videoCaptionBlock =
        showCaption && captionField ?
          <Text
            field={captionField}
            tag="p"
            className="box-border m-0 mt-2 block w-full max-w-full text-left font-normal not-italic text-font-media-tile-eyebrow leading-[19.25px] font-media-tile [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] text-ink-muted border-0 p-0"
          />
        : !isEditing &&
            videoCaptionFromItem &&
            hasNonEmptyText(videoCaptionFromItem.value) ?
          <Text
            field={videoCaptionFromItem}
            tag="p"
            className="box-border m-0 mt-2 block w-full max-w-full text-left font-normal not-italic text-font-media-tile-eyebrow leading-[19.25px] font-media-tile [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] text-ink-muted border-0 p-0"
          />
        : null;

      const foot =
        videoCaptionBlock ?
          <div className="flex w-full flex-col gap-2 text-left">{videoCaptionBlock}</div>
        : null;

      return {
        viewport: (
          <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden [&_.laitram-bc-player]:pointer-events-none [&_.video-js]:pointer-events-none">
            <MediaClient
              isEditing={isEditing}
              video={video}
              coverImage={resolveMediaVideoCoverImage(resolvedFields.Image, video ?? undefined)}
              presentation={presentation}
              playback={playback}
              mediaCaption={resolvedFields.MediaCaption}
              link={resolvedFields.Link}
              focalPoint={undefined}
              objectFit="cover"
              region="default"
              hasDarkBackground={false}
              embeddedInCarousel
            />
          </div>
        ),
        foot,
      };
    }

    const image = resolvedFields.Image;
    const hasImageSrc = Boolean(image?.value?.src);
    const showImage = hasImageSrc || isEditing;
    const linkField = resolvedFields.Link;
    const href = linkField?.value?.href;
    const showLink =
      (typeof href === 'string' && href.trim() !== '') ||
      (isEditing && linkField !== undefined);

    const linkAnchorProps = linkField
      ? getCmsLinkAnchorProps(linkField, MEDIA_LABELS.linkAriaFallback)
      : null;

    const imageViewport =
      showImage && image && hasImageSrc ?
        <MediaImage
          image={image}
          focalPoint={undefined}
          objectFit="cover"
          region="default"
          fillHeight
          wrapperClassName="h-full min-h-0 w-full overflow-hidden rounded-none [&_img]:pointer-events-none [&_img]:select-none"
          cropWidth={1200}
        />
      : showImage && isEditing && !hasImageSrc ?
        <div className="flex h-full w-full items-center justify-center bg-surface-panel">
          <span className="is-empty-hint">{MEDIA_LABELS.imageEmptyHint}</span>
        </div>
      : null;

    const captionBlock =
      showCaption && captionField ?
        <Text
          field={captionField}
          tag="p"
          className="box-border m-0 mt-2 block w-full max-w-full text-left font-normal not-italic text-font-media-tile-eyebrow leading-[19.25px] font-media-tile [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] text-ink-muted border-0 p-0"
        />
      : null;

    const linkBlock =
      showLink && linkField ?
        <div className="mt-3">
          <ContentSdkLink
            field={linkField}
            className="font-roboto text-font-medium text-nav-link-hover underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2"
            aria-label={linkAnchorProps?.['aria-label']}
            target={linkAnchorProps?.target}
            rel={linkAnchorProps?.rel}
          />
        </div>
      : null;

    if (!imageViewport && !captionBlock && !linkBlock) return null;

    const foot =
      captionBlock || linkBlock ?
        <div className="flex w-full flex-col gap-2 text-left">
          {captionBlock}
          {linkBlock}
        </div>
      : null;

    return { viewport: imageViewport, foot };
  };

  const renderTestimonialSlide = (
    entry: (typeof slides)[number],
    index: number,
  ): JSX.Element => {
    const isActive = index === activeIndex;
    const baseSlideId = `${reactId}-slide-${entry.item.id}`;

    const normalized = getNormalizedTestimonialFields(entry.item.fields);
    const card =
      normalized ?
        <TestimonialCard
          fields={normalized}
          isEditing={isEditing}
          displayName={entry.item.displayName ?? entry.item.name}
          alignment="center"
          figureSurface={figureSurface}
        />
      : isEditing ?
        <span className="is-empty-hint">{CAROUSEL_EMPTY_HINT}</span>
      : null;

    return (
      <SwiperSlide key={entry.item.id} className="box-border h-auto min-h-0 !flex">
        <div
          id={baseSlideId}
          data-carousel-slide-id={entry.item.id}
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${total}`}
          aria-hidden={!isActive}
          {...(!isActive ? { inert: true as const } : {})}
          className={cn('box-border w-full pt-4 px-6', isActive && 'relative z-10')}
        >
          {card}
        </div>
      </SwiperSlide>
    );
  };

  if (total === 0 && isEditing) {
    return (
      <div className={cn('box-border w-full rounded-none', backgroundClass)}>
        <span className="is-empty-hint">{CAROUSEL_EMPTY_HINT}</span>
      </div>
    );
  }

  const mediaSwiperEl = (
    <Swiper
      key={`media-${reducedMotion}-${total}-${useMediaCenteredPeek ? 'peek' : 'full'}-${mediaSwiperUsesBookends ? 'bookends' : 'loop'}`}
      className="carousel-media-swiper h-full min-h-0 w-full min-w-0 overflow-hidden [&_.swiper-wrapper]:h-full [&_.swiper-wrapper]:items-stretch"
      modules={[Autoplay]}
      loop={mediaSwiperUsesNativeLoop}
      initialSlide={mediaSwiperUsesBookends ? 1 : 0}
      speed={swiperSpeed}
      allowTouchMove={total > 1}
      preventClicks={false}
      preventClicksPropagation={false}
      touchStartPreventDefault={false}
      threshold={8}
      breakpoints={mediaBreakpoints}
      autoplay={mediaAutoplay}
      onSwiper={bindMediaSwiper}
      onSlideChange={onMediaSlideChange}
      onSlideChangeTransitionEnd={onMediaSlideChangeTransitionEnd}
      onTouchStart={() => {
        mediaStepNavRef.current = null;
      }}
      grabCursor={total > 1}
      watchSlidesProgress={mediaSwiperUsesBookends}
      watchOverflow={!mediaSwiperUsesBookends}
    >
      {mediaSwiperSlideEntries.map((entry, index) => {
        const parts = getMediaSlideParts(entry.item.fields as MediaFields | undefined);
        const viewportNode =
          parts?.viewport ?? <div className="h-full w-full bg-surface-muted" aria-hidden />;

        const baseSlideId = `${reactId}-slide-${entry.item.id}`;
        const logicalIndex = mapMediaSwiperIndexToActive(
          index,
          mediaSwiperUsesBookends,
          total,
        );
        const isLogicalActive = logicalIndex === activeIndex;

        return (
          <SwiperSlide
            key={entry.item.id}
            className="group/slide h-full min-h-0 min-w-0 overflow-hidden box-border"
          >
            <div
              id={baseSlideId}
              data-carousel-slide-id={entry.item.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${logicalIndex + 1} of ${total}`}
              aria-hidden={!isLogicalActive}
              {...(!isLogicalActive ? { inert: true as const } : {})}
              className="relative h-full min-h-0 w-full overflow-hidden"
            >
              {viewportNode}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-[1] bg-surface opacity-0 transition-none motion-reduce:transition-none group-[:not(.swiper-slide-active)]/slide:opacity-[0.85]"
              />
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );

  const mediaOverlayNav =
    showNav ?
      <>
        <button
          type="button"
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 inline-flex h-10 w-10 shrink-0 cursor-default items-center justify-center rounded-full border border-stroke-default bg-surface text-ink-muted shadow-none transition-[box-shadow] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:transition-none min-[992px]:h-11 min-[992px]:w-11"
          onClick={goMediaPrev}
          aria-label={CAROUSEL_PREV_LABEL}
        >
          <CarouselNavChevron direction="left" />
        </button>
        <button
          type="button"
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 inline-flex h-10 w-10 shrink-0 cursor-default items-center justify-center rounded-full border border-stroke-default bg-surface text-ink-muted shadow-none transition-[box-shadow] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:transition-none min-[992px]:h-11 min-[992px]:w-11"
          onClick={goMediaNext}
          aria-label={CAROUSEL_NEXT_LABEL}
        >
          <CarouselNavChevron direction="right" />
        </button>
      </>
    : null;

  const mediaViewportNode = (
    <div
      className={cn(
        'relative box-border w-full min-h-0 min-w-0 shrink-0 overflow-hidden bg-surface',
        'max-[479px]:mx-auto max-[479px]:max-w-[375px]',
        'min-[480px]:max-md:mx-0 min-[480px]:max-md:max-w-none min-[480px]:max-md:h-[211px] min-[480px]:max-md:min-h-[211px] min-[480px]:max-md:max-h-[211px]',
        'md:mx-auto md:h-[422px] md:min-h-[422px] md:max-h-[422px] md:max-lg:w-full md:max-lg:min-w-0 md:max-lg:max-w-full',
        'lg:h-[422px] lg:min-h-[422px] lg:max-h-[422px] lg:w-[750px] lg:min-w-[750px] lg:max-w-[750px] lg:shrink-0 lg:flex-none',
        'max-[479px]:h-[211px] max-[479px]:min-h-[211px] max-[479px]:max-h-[211px]',
        contentKind === 'media' &&
          isGrayCarouselChrome &&
          'max-[479px]:shrink-0 max-[479px]:flex-none min-[480px]:max-md:min-h-0 min-[480px]:max-md:flex-1 min-[480px]:max-md:basis-0 min-[480px]:max-md:self-stretch',
      )}
    >
      {mediaSwiperEl}
      {mediaOverlayNav}
    </div>
  );

  const mediaDotsBlock =
    showDots ?
      <div
        className="mt-4 flex flex-wrap items-center justify-center gap-2"
        role="group"
        aria-label={`${regionLabel} slides`}
      >
        {slides.map((s, i) => (
          <button
            key={s.item.id}
            type="button"
            aria-label={`${CAROUSEL_DOT_LABEL} ${i + 1}`}
            aria-current={i === carouselLiveIndex ? 'true' : undefined}
            className={cn(
              'h-2.5 w-2.5 rounded-full border-0 p-0 transition-colors duration-150 motion-reduce:transition-none',
              i === carouselLiveIndex ?
                'bg-nav-link-hover'
              : 'bg-stroke-default hover:bg-surface-active',
            )}
            onClick={() => goMediaTo(i)}
          />
        ))}
      </div>
    : null;

  const mediaFootBlock = (
    <div className="mt-2 w-full text-left">
      {(() => {
        const activeEntry = slides[carouselLiveIndex];
        if (!activeEntry || activeEntry.kind !== 'media') return null;
        return getMediaSlideParts(activeEntry.item.fields as MediaFields | undefined)?.foot;
      })()}
    </div>
  );

  const testimonialSwiper = (
    <Swiper
      key={`testimonial-${total}`}
      className="carousel-testimonial-swiper w-full min-h-0 isolate overflow-hidden [&_.swiper-slide]:h-auto [&_.swiper-slide]:border-0 [&_.swiper-slide]:shadow-none [&_.swiper-slide]:ring-0 [&_.swiper-slide]:outline-none [&_.swiper-slide]:[backface-visibility:hidden] [&_.swiper-slide]:[transform:translateZ(0)] [&_.swiper-slide_img]:border-0 [&_.swiper-slide_img]:shadow-none [&_.swiper-slide_img]:ring-0 [&_.swiper-slide_img]:outline-none [&_.swiper-slide_picture]:border-0 [&_.swiper-slide_figure]:border-0 [&_.swiper-slide_figure]:shadow-none"
      loop={false}
      allowTouchMove={total > 1}
      preventClicks={false}
      slidesPerView={1}
      spaceBetween={0}
      autoplay={testimonialAutoplay}
      onSwiper={bindTestimonialSwiper}
      onSlideChange={onTestimonialSlideChange}
      grabCursor={total > 1}
      watchOverflow
      effect="fade"
      modules={[Autoplay, EffectFade]}
      speed={testimonialSwiperSpeed}
      fadeEffect={{
        crossFade: true,
      }}
    >
      {slides.map((entry, index) => renderTestimonialSlide(entry, index))}
    </Swiper>
  );

  return (
    <div
      className={cn(
        'box-border w-full rounded-none',
        !isGrayCarouselChrome && backgroundClass,
      )}
    >
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={regionLabel}
        tabIndex={0}
        onKeyDown={onRegionKeyDown}
        className={cn("outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2", isGrayCarouselChrome ?
            'focus-visible:ring-offset-surface-muted'
          : 'focus-visible:ring-offset-surface')}
      >
        <div className="sr-only" aria-live="polite" id={liveId}>
          {formatCarouselLiveRegionMessage(carouselLiveIndex + 1, total)}
        </div>

        {contentKind === 'media' ?
          isGrayCarouselChrome ?
            <>
              <div className="bg-surface-muted">
                <div
                  className={cn(
                    mediaCarouselShellClass,
                    'bg-surface max-[479px]:flex max-[479px]:h-[211px] max-[479px]:max-h-[211px] max-[479px]:flex-col max-[479px]:overflow-hidden min-[480px]:max-md:flex min-[480px]:max-md:flex-col min-[480px]:max-md:h-[211px] min-[480px]:max-md:max-h-[211px] min-[480px]:max-md:overflow-hidden',
                  )}
                >
                  {mediaViewportNode}
                </div>
              </div>
              <div className={mediaCarouselShellClass}>{mediaDotsBlock}</div>
              <div
                className={cn(
                  mediaCarouselShellClass,
                  'max-[479px]:mx-auto max-[479px]:max-w-[375px] min-[480px]:max-md:max-w-none pb-8 md:pb-4',
                )}
              >
                {mediaFootBlock}
              </div>
            </>
          : <div className={cn(mediaCarouselShellClass, 'pb-8 md:pb-4')}>
              {mediaViewportNode}
              <div className="box-border min-w-0">{mediaDotsBlock}</div>
              <div className="box-border min-w-0 max-[479px]:mx-auto max-[479px]:max-w-[375px] min-[480px]:max-md:max-w-none">
                {mediaFootBlock}
              </div>
            </div>
        : isGrayCarouselChrome ?
          <>
            <div className="bg-surface-muted">
              <div className="mx-auto w-full max-w-[750px] box-border min-w-0 max-md:px-4 md:max-lg:px-2 lg:px-4">
                <div className="relative min-h-[1px] w-full">
                  {testimonialSwiper}
                  {showNav ?
                    <>
                      <button
                        type="button"
                        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 inline-flex h-10 w-10 shrink-0 cursor-default items-center justify-center rounded-full border border-stroke-default bg-surface text-ink-muted shadow-none transition-[box-shadow] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:transition-none min-[992px]:h-11 min-[992px]:w-11"
                        onClick={goTestimonialPrev}
                        aria-label={CAROUSEL_PREV_LABEL}
                      >
                        <CarouselNavChevron direction="left" />
                      </button>
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 inline-flex h-10 w-10 shrink-0 cursor-default items-center justify-center rounded-full border border-stroke-default bg-surface text-ink-muted shadow-none transition-[box-shadow] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:transition-none min-[992px]:h-11 min-[992px]:w-11"
                        onClick={goTestimonialNext}
                        aria-label={CAROUSEL_NEXT_LABEL}
                      >
                        <CarouselNavChevron direction="right" />
                      </button>
                    </>
                  : null}
                </div>
              </div>
            </div>
            <div className="mx-auto w-full max-w-[750px] box-border min-w-0 max-md:px-4 md:max-lg:px-2 lg:px-4">
              {showDots ?
                <div
                  className="mt-4 pb-8 md:mt-6 md:pb-0 flex flex-wrap items-center justify-center gap-2"
                  role="group"
                  aria-label={`${regionLabel} slides`}
                >
                  {slides.map((s, i) => (
                    <button
                      key={s.item.id}
                      type="button"
                      aria-label={`${CAROUSEL_DOT_LABEL} ${i + 1}`}
                      aria-current={i === activeIndex ? 'true' : undefined}
                      className={cn(
                        'h-2.5 w-2.5 rounded-full border-0 p-0 transition-colors duration-150 motion-reduce:transition-none',
                        i === activeIndex ?
                          'bg-nav-link-hover'
                        : 'bg-stroke-default hover:bg-surface-active',
                      )}
                      onClick={() => goTestimonialTo(i)}
                    />
                  ))}
                </div>
              : null}
            </div>
          </>
        : <>
            <div className="relative min-h-[1px] w-full">
              {testimonialSwiper}
              {showNav ?
                <>
                  <button
                    type="button"
                    className="absolute left-4 top-1/2 z-20 -translate-y-1/2 inline-flex h-10 w-10 shrink-0 cursor-default items-center justify-center rounded-full border border-stroke-default bg-surface text-ink-muted shadow-none transition-[box-shadow] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:transition-none min-[992px]:h-11 min-[992px]:w-11"
                    onClick={goTestimonialPrev}
                    aria-label={CAROUSEL_PREV_LABEL}
                  >
                    <CarouselNavChevron direction="left" />
                  </button>
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 z-20 -translate-y-1/2 inline-flex h-10 w-10 shrink-0 cursor-default items-center justify-center rounded-full border border-stroke-default bg-surface text-ink-muted shadow-none transition-[box-shadow] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:transition-none min-[992px]:h-11 min-[992px]:w-11"
                    onClick={goTestimonialNext}
                    aria-label={CAROUSEL_NEXT_LABEL}
                  >
                    <CarouselNavChevron direction="right" />
                  </button>
                </>
              : null}
            </div>

            {showDots ?
              <div
                className="mt-4 pb-8 md:mt-6 md:pb-0 flex flex-wrap items-center justify-center gap-2"
                role="group"
                aria-label={`${regionLabel} slides`}
              >
                {slides.map((s, i) => (
                  <button
                    key={s.item.id}
                    type="button"
                    aria-label={`${CAROUSEL_DOT_LABEL} ${i + 1}`}
                    aria-current={i === activeIndex ? 'true' : undefined}
                    className={cn(
                      'h-2.5 w-2.5 rounded-full border-0 p-0 transition-colors duration-150 motion-reduce:transition-none',
                      i === activeIndex ?
                        'bg-nav-link-hover'
                      : 'bg-stroke-default hover:bg-surface-active',
                    )}
                    onClick={() => goTestimonialTo(i)}
                  />
                ))}
              </div>
            : null}
          </>
        }
      </div>
    </div>
  );
}
