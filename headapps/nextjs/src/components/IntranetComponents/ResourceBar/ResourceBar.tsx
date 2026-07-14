import { JSX, useCallback, useEffect, useState } from 'react';
import { Text, useSitecore, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaCarouselType } from 'embla-carousel';
import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { ResourceBarProps } from './ResourceBar.types';
import styles from './ResourceBar.module.scss';
import { CustomLink } from 'components/common/CustomLink';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { withJumplink } from 'lib/enhancers/withJumplink';

const cx = classNames.bind(styles);

const ResourceBar = (props: ResourceBarProps): JSX.Element | null => {
  const { fields } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const itemsCount = fields.items?.length ?? 0;

  const [isMobile, setIsMobile] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // Embla setup
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    dragFree: isMobile, // free scroll on mobile
    slidesToScroll: isMobile ? 1 : 5, // pages of 5 on desktop
  });

  // handle resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // re-init when isMobile changes
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit({
        align: 'start',
        loop: false,
        dragFree: isMobile,
        slidesToScroll: isMobile ? 1 : 5,
      });
    }
  }, [isMobile, emblaApi]);

  // update state when Embla moves
  const onSelect = useCallback(
    (api: EmblaCarouselType) => {
      if (!api) return;
      const index = api.selectedScrollSnap();
      const slidesPerView = isMobile ? 1 : 5;
      const totalPages = Math.ceil(itemsCount / slidesPerView);
      setPageCount(totalPages);
      setActivePage(index);
      setAtStart(index === 0);
      setAtEnd(index === totalPages - 1);
    },
    [itemsCount, isMobile]
  );

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on('select', () => onSelect(emblaApi));
    emblaApi.on('reInit', () => onSelect(emblaApi));
  }, [emblaApi, onSelect]);

  // controls
  const scrollPrev = () => emblaApi && emblaApi.scrollTo(Math.max(activePage - 1, 0));
  const scrollNext = () => emblaApi && emblaApi.scrollTo(Math.min(activePage + 1, pageCount - 1));
  const scrollToPage = (i: number) => emblaApi && emblaApi.scrollTo(i);

  if (itemsCount === 0) return null;
  const sliderDisabled = fields.items?.length && fields.items.length < 6;

  const validTiles = !isPageEditing
    ? fields.items?.filter((tile) => {
        return (
          !!tile.fields.tileName?.value &&
          tile.fields.tileLinkReference != null &&
          tile.fields.tileLinkReference.length > 0
        );
      })
    : fields.items;

  const hideComponent = !validTiles || validTiles.length === 0;

  if (!hideComponent) {
    return (
      <div className={cx('resource-bar', 'component relative', props.stylesSXA)}>
        <div className={cx('resource-bar__wrapper', '')}>
          <div className="overflow-hidden container" ref={emblaRef}>
            <div className="flex">
              {validTiles?.map((tile, index) => (
                <div
                  key={index}
                  className={cx(
                    'resource-bar__card-container',
                    'flex-[0_0_auto] w-[calc(100%/2.25)] md:w-[calc(100%/5)] px-2',
                    `${sliderDisabled ? 'resource-bar__card-container--disabled' : ''}`
                  )}
                >
                  <CustomLink
                    className={cx('resource-bar__card', 'bg-white rounded-2xl')}
                    item={tile.fields.tileLinkReference?.[0] ?? null}
                    isPageEditing={isPageEditing}
                    customLinkContent={({ iconField }) => (
                      <div className="flex md:flex-col items-center md:items-start gap-2 md:gap-0">
                        <MaterialIcon iconItem={iconField} className={cx('resource-bar__icon')} />
                        <Text
                          className={cx('resource-bar__title')}
                          field={tile.fields.tileName}
                          tag="h3"
                          editable
                        />
                        <Text
                          className={cx({ title: true })}
                          field={tile.fields.tileDescription}
                          tag="p"
                          editable
                        />
                      </div>
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Controls + custom dots */}
          {pageCount > 1 && (
            <div
              className={cx(
                'resource-bar__controls',
                'my-4 flex justify-center items-center gap-6'
              )}
            >
              <button onClick={scrollPrev} disabled={atStart}>
                <MaterialIcon name="ChevronLeft" className={cx(`${atStart ? 'at-start' : ''}`)} />
              </button>
              <div className={cx('resource-bar__dots', '')}>
                {Array.from({ length: pageCount }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToPage(i)}
                    className={cx('dot', i === activePage && 'dot--active')}
                  />
                ))}
              </div>
              <button onClick={scrollNext} disabled={atEnd}>
                <MaterialIcon name="ChevronRight" className={cx(`${atEnd ? 'at-end' : ''}`)} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  } else {
    return null;
  }
};

export const Default = compose<ResourceBarProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(ResourceBar);

export default Default;
