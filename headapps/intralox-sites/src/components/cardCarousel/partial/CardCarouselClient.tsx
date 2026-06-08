"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Container } from "components/shared/BaseContainer";
import { RichText } from "@sitecore-content-sdk/nextjs";
import { ICardCarouselFields } from "../CardCarousel.type";
import { cx } from "@laitram-l-l-c/intralox-ui-components";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { ImageView } from "components/shared/ImageView/ImageView";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import LinkView from "components/callToAction/partial/LinkVIew";
import { Navigation } from "swiper/modules";
import { cn } from "lib/utils";
interface ICardCarouselClientProps {
  fields: ICardCarouselFields;
}
const CardCarouselClientBase = ({ fields }: ICardCarouselClientProps) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [endSpacerWidth, setEndSpacerWidth] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);
  const resizeTimeoutRef = useRef<number | null>(null);
  const refreshRafRef = useRef<number | null>(null);
  const cards = fields.Cards;
  const slideCards = useMemo(() => {
    if (cards.length <= 1) return cards;

    return [...cards, null];
  }, [cards]);

  const scheduleLayoutRefresh = () => {
    if (refreshRafRef.current) {
      window.cancelAnimationFrame(refreshRafRef.current);
    }

    refreshRafRef.current = window.requestAnimationFrame(() => {
      refreshRafRef.current = null;
      window.requestAnimationFrame(() => {
        refreshSliderLayout();
      });
    });
  };

  const handleButtonClick = (index: number) => {
    if (!swiperRef.current) return;

    if (cards.length > 1 && index === cards.length - 1) {
      // Ensure spacer width and translate limits are up-to-date before
      // trying to align the last real slide to the leading edge.
      scheduleLayoutRefresh();
      window.requestAnimationFrame(() => {
        swiperRef.current?.slideTo(index);
      });
      return;
    }

    swiperRef.current.slideTo(index);
  };

  const updateEndSpacerWidth = (swiper: SwiperType) => {
    if (cards.length <= 1) {
      setEndSpacerWidth(0);
      return;
    }

    const lastRealCardIndex = cards.length - 1;
    const lastRealCardOffset = swiper.slidesGrid[lastRealCardIndex] ?? 0;
    const maxOffset = Math.abs(swiper.maxTranslate());
    const spacerSlide = swiper.slides[cards.length];
    const currentSpacerWidth = spacerSlide
      ? Math.ceil(spacerSlide.getBoundingClientRect().width)
      : 0;
    const spacerDeficit = Math.max(
      0,
      Math.ceil(lastRealCardOffset - maxOffset),
    );
    const requiredSpacer = Math.max(0, currentSpacerWidth + spacerDeficit);

    setEndSpacerWidth((previousWidth) => {
      if (Math.abs(previousWidth - requiredSpacer) < 1) {
        return previousWidth;
      }

      return requiredSpacer;
    });
  };

  const refreshSliderLayout = () => {
    if (!swiperRef.current) return;

    swiperRef.current.update();
    updateEndSpacerWidth(swiperRef.current);
  };

  useEffect(() => {
    scheduleLayoutRefresh();

    const handleWindowResize = () => {
      if (resizeTimeoutRef.current) {
        window.clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = window.setTimeout(() => {
        window.requestAnimationFrame(() => {
          refreshSliderLayout();
        });
      }, 120);
    };

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);

      if (resizeTimeoutRef.current) {
        window.clearTimeout(resizeTimeoutRef.current);
      }

      if (refreshRafRef.current) {
        window.cancelAnimationFrame(refreshRafRef.current);
      }
    };
  }, [cards.length]);

  return (
    <>
      <Container width="lg">
        <RichText
          className="font-bold text-ink-primary text-2xl leading-tight"
          field={fields.Headline}
          tag="h2"
        />
        <RichText
          className="mt-2 text-2xl font-bold leading-tight text-ink-muted"
          field={fields.Description}
        />
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-8">
          {cards.map((card, index) => (
            <button
              key={card.id}
              className={cx(
                "text-ink-muted transition-colors duration-150 text-sm md:text-base px-3 py-3 leading-tight rounded-full focus:outline-none focus:ring",
                activeSlideIndex === index
                  ? "bg-link-strong text-surface"
                  : "bg-neutral-200 hover:bg-stroke-default text-ink-muted",
              )}
              onClick={() => handleButtonClick(index)}
              aria-pressed={activeSlideIndex === index}
            >
              {card.fields?.Heading?.value}
            </button>
          ))}
        </div>
      </Container>
      <div className="relative overflow-hidden py-8 [&_.swiper-button-disabled]:!bg-neutral-200 [&_.swiper-button-disabled]:!cursor-default [&_.swiper-button-disabled]:!text-ink">
        <button className="btn-prev inline-flex items-center justify-center ml-[max(50vw-560px,8px)] absolute cursor-pointer left-0  transition-all duration-150 h-10 w-10 rounded-full z-10 top-1/2 translate -translate-y-1/2 focus:outline-none focus:ring bg-link-strong hover:bg-link-strong-link text-surface">
          <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
        </button>
        <button className="btn-next inline-flex items-center justify-center mr-[max(50vw-560px,8px)] absolute cursor-pointer right-0  transition-all duration-150 h-10 w-10 rounded-full z-10 top-1/2 translate -translate-y-1/2 focus:outline-none focus:ring bg-link-strong hover:bg-link-strong-link text-surface">
          <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
        </button>
        <Swiper
          slidesPerView="auto"
          modules={[Navigation]}
          spaceBetween={32}
          speed={1000}
          loop={false}
          navigation={{
            nextEl: ".btn-next",
            prevEl: ".btn-prev",
          }}
          breakpoints={{
            320: {
              spaceBetween: 16,
            },
            768: {
              spaceBetween: 32,
            },
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            updateEndSpacerWidth(swiper);
            scheduleLayoutRefresh();
            const normalizedIndex =
              cards.length > 1 && swiper.activeIndex >= cards.length
                ? cards.length - 1
                : swiper.activeIndex;

            setActiveSlideIndex(normalizedIndex);
          }}
          onSlideChange={(swiper) => {
            const normalizedIndex =
              cards.length > 1 && swiper.activeIndex >= cards.length
                ? cards.length - 1
                : swiper.activeIndex;

            setActiveSlideIndex(normalizedIndex);
          }}
          onResize={updateEndSpacerWidth}
          onBreakpoint={refreshSliderLayout}
          className="!pt-2 !pb-2 [&_.swiper-slide-active]:opacity-100 !pl-4 md:!pl-[max(calc(50vw-48rem/2+8px),16px)] lg:!pl-[max(calc(50vw-61rem/2+8px),16px)] xl:!pl-[max(calc(50vw-64rem/2+8px),16px)]"
        >
          {slideCards.map((card, index) => (
            <SwiperSlide
              key={card ? `card-${card.id}-${index}` : `card-empty-${index}`}
              className={cn(
                "rounded-lg overflow-hidden h-full shrink-0 max-w-full transition-opacity duration-150 !flex flex-wrap opacity-50",
                {
                  "shadow-md border border-stroke-default !w-[calc(100vw-48px)] sm:!w-[552px] md:!w-[620px]":
                    !!card,
                  "md:!w-[563px]": card?.fields?.ImageOnTop?.value,
                  "border-0 shadow-none !mr-0 !h-25":
                    index === cards.length && cards.length > 1,
                },
              )}
              style={
                index === cards.length && cards.length > 1
                  ? {
                      width: `${endSpacerWidth}px`,
                      minWidth: `${endSpacerWidth}px`,
                      maxWidth: `${endSpacerWidth}px`,
                      flexBasis: `${endSpacerWidth}px`,
                    }
                  : undefined
              }
            >
              {!card ? (
                <div className="w-full h-full bg-transparent" />
              ) : (
                <>
                  <div
                    className={cn("w-full relative", {
                      " sm:w-2/5": !card?.fields?.ImageOnTop?.value,
                    })}
                  >
                    <ImageView
                      image={card.fields?.Image}
                      className="pb-[52.5%] md:pb-0"
                      imageClass="w-full md:h-full md:object-cover md:relative"
                      objectFit="cover"
                    />
                  </div>
                  <div
                    className={cn("w-full px-10 pb-10 pt-8", {
                      " sm:w-3/5 pt-10": !card?.fields?.ImageOnTop?.value,
                    })}
                  >
                    <RichText
                      tag="h3"
                      className="font-bold uppercase tracking-wide text-ink-muted"
                      field={card.fields?.Heading}
                    />
                    <RichText
                      className="prose mt-2 text-ink-primary"
                      field={card.fields?.Description}
                    />
                    <LinkView
                      link={card.fields?.Link}
                      className="inline-block text-sm leading-snug hover:no-underline mt-4"
                    >
                      {card.fields?.Link?.value?.text}
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="text-[10px]"
                      />
                    </LinkView>
                  </div>
                </>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
};

export const CardCarouselClient = CardCarouselClientBase;
