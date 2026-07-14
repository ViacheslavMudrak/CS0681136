import { JSX, useCallback, useEffect, useState } from 'react';
import {
  withDatasourceCheck,
  Text,
  Link,
  RichText,
  NextImage,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaCarouselType } from 'embla-carousel';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import {
  PhotoGalleryProps,
  PhotoGalleryVariant,
  LightboxProps,
  PhotoGalleryStatics,
} from './PhotoGallery.types';
import styles from './PhotoGallery.module.scss';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { useI18n } from 'next-localization';
import { withJumplink } from 'lib/enhancers/withJumplink';

const cx = classNames.bind(styles);

// ---------- LIGHTBOX COMPONENT ----------
const Lightbox = ({ images, startIndex = 0, onClose }: LightboxProps) => {
  const [index, setIndex] = useState(startIndex);
  const total = images.length;

  const atStart = index === 0;
  const atEnd = index === total - 1;

  const prev = useCallback(() => setIndex((i) => (i === 0 ? total - 1 : i - 1)), [total]);
  const next = useCallback(() => setIndex((i) => (i === total - 1 ? 0 : i + 1)), [total]);

  const current = images[index];

  // Get rid of the scroll bar when the lightbox is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // ESC and arrows
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && !atEnd) next();
      if (e.key === 'ArrowLeft' && !atStart) prev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev, atStart, atEnd, onClose]);

  return (
    <div className={cx('lightbox__overlay')} onClick={onClose}>
      <div
        className={cx('lightbox__inner', 'flex justify-center')}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={cx('lightbox__close')} onClick={onClose}>
          <MaterialIcon name="Close" />
        </button>
        <div className={cx('lightbox__image-wrapper')}>
          <img src={current.src} alt={current.caption || ''} className={cx('lightbox__image')} />
          <div
            className={cx(
              'lightbox__content',
              'flex flex-col md:flex-row items-start mt-[50px] md:my-6 gap-6 justify-between'
            )}
          >
            {current.caption && <p className={cx('lightbox__caption')}>{current.caption}</p>}
            <div className={cx('lightbox__button-container', 'flex gap-4')}>
              <button className={cx('lightbox__prev')} onClick={prev} disabled={atStart}>
                <MaterialIcon name="ChevronLeft" />
              </button>
              <button className={cx('lightbox__next')} onClick={next} disabled={atEnd}>
                <MaterialIcon name="ChevronRight" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- MAIN GALLERY COMPONENT ----------
const PhotoGallery = (
  props: PhotoGalleryProps & { variant?: PhotoGalleryVariant }
): JSX.Element => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const { t } = useI18n();
  const isPageEditing = page.mode.isEditing;
  const hideCaptions = rendering.params?.hideCaptions === '1';
  const itemsCount = fields.mediaItems?.length ?? 0;

  const [isMobile, setIsMobile] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [thumbAtStart, setThumbAtStart] = useState(true);
  const [thumbAtEnd, setThumbAtEnd] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const getSlidesToScroll = (variant: PhotoGalleryVariant | undefined, isMobile: boolean) => {
    if (isMobile) return 1;
    switch (variant) {
      case 'FourImageDisplay':
        return 4;
      case 'CarouselDisplay':
        return 1;
      default:
        return 1;
    }
  };

  const slidesToScroll = getSlidesToScroll(props.variant, isMobile);

  const [mainEmblaRef, mainEmblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    dragFree: true,
    slidesToScroll,
  });

  const [thumbsEmblaRef, thumbsEmblaApi] = useEmblaCarousel({
    containScroll: 'trimSnaps',
    dragFree: true,
    align: 'start',
  });

  // Responsive check
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update embla on resize
  useEffect(() => {
    if (mainEmblaApi) {
      mainEmblaApi.reInit({
        align: 'start',
        loop: false,
        dragFree: isMobile,
        slidesToScroll: isMobile ? 1 : slidesToScroll,
      });
    }
  }, [isMobile, mainEmblaApi, slidesToScroll]);

  // Pagination
  const onSelect = useCallback(
    (api: EmblaCarouselType) => {
      if (!api) return;
      const index = api.selectedScrollSnap();
      const slidesPerView = props.variant === 'FourImageDisplay' && !isMobile ? 4 : 1;
      const totalPages = Math.ceil(itemsCount / slidesPerView);
      setPageCount(totalPages);
      setActivePage(index);
      setAtStart(index === 0);
      setAtEnd(index === totalPages - 1);
    },
    [props.variant, isMobile, itemsCount]
  );

  useEffect(() => {
    if (!mainEmblaApi) return;
    onSelect(mainEmblaApi);
    mainEmblaApi.on('select', () => onSelect(mainEmblaApi));
    mainEmblaApi.on('reInit', () => onSelect(mainEmblaApi));
  }, [mainEmblaApi, onSelect]);

  // Link thumbs to main embla
  useEffect(() => {
    if (props.variant !== 'CarouselDisplay') return;
    if (!mainEmblaApi || !thumbsEmblaApi) return;

    const onThumbClick = (index: number) => mainEmblaApi.scrollTo(index);
    const onSelectThumbs = () => {
      const selected = mainEmblaApi.selectedScrollSnap();
      thumbsEmblaApi.scrollTo(selected);
      thumbsEmblaApi
        .slideNodes()
        .forEach((thumb, i) => thumb.classList.toggle('is-selected', i === selected));
    };

    onSelectThumbs();
    mainEmblaApi.on('select', onSelectThumbs);
    thumbsEmblaApi.on('reInit', onSelectThumbs);
    thumbsEmblaApi
      .slideNodes()
      .forEach((thumb, index) => thumb.addEventListener('click', () => onThumbClick(index)));

    return () => {
      if (mainEmblaApi) {
        mainEmblaApi.off('select', onSelectThumbs);
      }
    };
  }, [mainEmblaApi, thumbsEmblaApi, props.variant]);

  // Control the arrows on the thumbnail carousel
  useEffect(() => {
    if (!thumbsEmblaApi) return;

    const onThumbSelect = () => {
      setThumbAtStart(!thumbsEmblaApi.canScrollPrev());
      setThumbAtEnd(!thumbsEmblaApi.canScrollNext());
    };

    onThumbSelect(); // initial state
    thumbsEmblaApi.on('select', onThumbSelect);
    thumbsEmblaApi.on('reInit', onThumbSelect);

    return () => {
      thumbsEmblaApi.off('select', onThumbSelect);
      thumbsEmblaApi.off('reInit', onThumbSelect);
    };
  }, [thumbsEmblaApi]);

  // Lightbox handlers
  const openLightbox = (index: number) => {
    if (!isPageEditing) {
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  };

  const closeLightbox = () => setLightboxOpen(false);

  // Carousel navigation
  const scrollPrev = () => mainEmblaApi && mainEmblaApi.scrollTo(Math.max(activePage - 1, 0));
  const scrollNext = () =>
    mainEmblaApi && mainEmblaApi.scrollTo(Math.min(activePage + 1, pageCount - 1));

  const images = fields.mediaItems.map((item) => ({
    src: item.value?.src || '',
    caption: item.description?.value || '',
  }));

  const authoringNote = t('PhotoGalleryEditModeMessageNoMedia') || PhotoGalleryStatics.noImagesNote;
  if ((!images || images.length == 0) && !isPageEditing) {
    return <></>;
  }

  return (
    <div className={cx('photo-gallery', 'component container', props.stylesSXA)}>
      <div className={cx('photo-gallery__header', 'flex flex-col')}>
        <div className={cx('photo-gallery__header-content')}>
          <Text
            tag="span"
            className="text-eyebrow eyebrow eyebrow-font-size"
            field={props.fields.datasource.optionalEyebrow}
          />
          <Text tag="h2" field={props.fields.datasource.headlineText} />
          <RichText tag="div" className={cx('rich-text')} field={props.fields.datasource.subtext} />
        </div>

        <div className={cx('photo-gallery__grid')}>
          <div className={cx('photo-gallery__buttons', 'flex gap-4')}>
            <Link
              field={props.fields.datasource.buttonLinkOne}
              className={cx('asc-btn', 'asc-btn--primary h-fit')}
            />
            <Link
              field={props.fields.datasource.buttonLinkTwo}
              className={cx('asc-btn', 'asc-btn--outline h-fit')}
            />
          </div>

          {/* ---------- SINGLE IMAGE DISPLAY ---------- */}
          {props.variant === 'SingleImageDisplay' && (
            <div
              className={cx('photo-gallery__carousel', 'embla', 'overflow-hidden')}
              ref={mainEmblaRef}
            >
              <div className="embla__container flex gap-6">
                {fields.mediaItems.map((mediaItem, index) => (
                  <div
                    key={index}
                    className={cx(
                      'flex w-full flex-[1_0_100%] flex-col embla__slide cursor-pointer'
                    )}
                    onClick={() => openLightbox(index)}
                  >
                    <div className={cx('embla__image-container')}>
                      <NextImage field={mediaItem} className={cx('embla__slide-image')} />
                      <div className={cx('embla__hover-gradient')}></div>
                    </div>
                    {!hideCaptions && (
                      <Text
                        className={cx('photo-gallery__caption')}
                        tag="p"
                        field={mediaItem.description}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------- CAROUSEL DISPLAY ---------- */}
          {props.variant === 'CarouselDisplay' && (
            <>
              <div
                className={cx(
                  'photo-gallery__carousel',
                  'photo-gallery__carousel--carousel',
                  'embla overflow-hidden'
                )}
                ref={mainEmblaRef}
              >
                <div className="embla__container flex gap-6">
                  {fields.mediaItems.map((mediaItem, index) => (
                    <div
                      key={index}
                      className={cx(
                        'embla__slide',
                        'flex w-full flex-[1_0_100%] flex-col cursor-pointer'
                      )}
                      onClick={() => openLightbox(index)}
                    >
                      <div className={cx('embla__image-container')}>
                        <NextImage field={mediaItem} className={cx('embla__slide-image')} />
                        <div className={cx('embla__hover-gradient')}></div>
                      </div>
                      {!hideCaptions && (
                        <Text
                          className={cx('photo-gallery__caption', 'test')}
                          tag="p"
                          field={mediaItem.description}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div
                className={cx('photo-gallery__thumbs-wrapper', 'flex gap-6 items-center relative')}
              >
                <button
                  className={cx(
                    'photo-gallery__thumbs-prev',
                    thumbAtStart && 'cursor-not-allowed',
                    isMobile && 'hidden'
                  )}
                  onClick={() => thumbsEmblaApi?.scrollPrev()}
                  disabled={thumbAtStart}
                >
                  <MaterialIcon name="ChevronLeft" />
                </button>
                <div
                  className={cx('photo-gallery__thumbs', 'embla overflow-hidden')}
                  ref={thumbsEmblaRef}
                >
                  <div className="embla__container flex gap-3">
                    {fields.mediaItems.map((mediaItem, index) => (
                      <div
                        key={index}
                        className={cx('embla__slide', 'photo-gallery__thumb', 'cursor-pointer')}
                        onClick={() => mainEmblaApi?.scrollTo(index)}
                      >
                        <NextImage
                          field={mediaItem}
                          width={100}
                          height={70}
                          className={cx('embla__thumb-image', 'rounded-md')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  className={cx(
                    'photo-gallery__thumbs-next',
                    thumbAtEnd && 'cursor-not-allowed',
                    isMobile && 'hidden'
                  )}
                  onClick={() => thumbsEmblaApi?.scrollNext()}
                  disabled={thumbAtEnd}
                >
                  <MaterialIcon name="ChevronRight" />
                </button>
              </div>
            </>
          )}

          {/* ---------- FOUR IMAGE DISPLAY ---------- */}
          {props.variant === 'FourImageDisplay' && (
            <div
              className={cx(
                'photo-gallery__carousel',
                'photo-gallery__carousel--four-image',
                'embla overflow-hidden'
              )}
              ref={mainEmblaRef}
            >
              <div className="embla__container flex gap-4">
                {fields.mediaItems.map((mediaItem, index) => (
                  <div
                    key={index}
                    className={cx(
                      'embla__slide',
                      'flex w-full flex-[1_0_100%] md:flex-[0_0_calc(25%-1rem)] flex-col cursor-pointer'
                    )}
                    onClick={() => openLightbox(index)}
                  >
                    <div className={cx('embla__image-container')}>
                      <NextImage field={mediaItem} className={cx('embla__slide-image')} />
                      <div className={cx('embla__hover-gradient')}></div>
                    </div>
                    {!hideCaptions && (
                      <Text
                        className={cx('photo-gallery__caption')}
                        tag="p"
                        field={mediaItem.description}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------- CONTROLS ---------- */}
          <div
            className={cx(
              'photo-gallery__controls',
              'flex items-center justify-between md:justify-center gap-6'
            )}
          >
            {!(props.variant === 'FourImageDisplay' && !isMobile) && (
              <span className="text-sm text-brand-gray-600">
                {activePage + 1} of {pageCount || itemsCount}
              </span>
            )}
            <div className="flex gap-4">
              <button onClick={scrollPrev} disabled={atStart}>
                <MaterialIcon name="ChevronLeft" className={cx(atStart && 'opacity-40')} />
              </button>
              <button onClick={scrollNext} disabled={atEnd}>
                <MaterialIcon name="ChevronRight" className={cx(atEnd && 'opacity-40')} />
              </button>
            </div>
          </div>

          {/* ---------- No Media Authoring Note ---------- */}
          {isPageEditing && (!images || images.length == 0) && (
            <p className="text-sm italic text-gray-600">{authoringNote}</p>
          )}
        </div>
      </div>

      {/* ---------- LIGHTBOX ---------- */}
      {lightboxOpen && (
        <Lightbox images={images} startIndex={lightboxIndex} onClose={closeLightbox} />
      )}
    </div>
  );
};

export const Default = compose<PhotoGalleryProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(PhotoGallery);
export const SingleImageDisplay = compose<PhotoGalleryProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)((props) => <PhotoGallery {...props} variant="SingleImageDisplay" />);
export const CarouselDisplay = compose<PhotoGalleryProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)((props) => <PhotoGallery {...props} variant="CarouselDisplay" />);
export const FourImageDisplay = compose<PhotoGalleryProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)((props) => <PhotoGallery {...props} variant="FourImageDisplay" />);

export default SingleImageDisplay;
