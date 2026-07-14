import { withDatasourceCheck, Text, Image, useSitecore } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { useMarketNewsHero } from 'lib/market-news/hooks/use-market-news-hero';
import { JSX, useCallback, useEffect, useState } from 'react';
import { useMediaQuery } from '@mui/material';
import { MediaQueryConstants } from 'src/util/const/material';
import useEmblaCarousel from 'embla-carousel-react';

import styles from './MarketNewsHero.module.scss';
import { MarketNewsHeroProps } from './MarketNewsHero.types';

const cx = classNames.bind(styles);

const MarketNewsHero = (props: MarketNewsHeroProps): JSX.Element => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing;
  const isMobile = useMediaQuery(MediaQueryConstants.Mobile);

  const language = page.layout.sitecore.context.language || 'en';
  const nonMarketSiteAreaItemId = fields?.nonMarketNewsSiteArea?.id;

  const { data, isLoading, sessionStatus } = useMarketNewsHero({
    nonMarketSiteAreaItemId,
    language,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    slidesToScroll: 1,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateEmblaButtons = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    updateEmblaButtons();
    emblaApi.on('select', updateEmblaButtons);
    emblaApi.on('reInit', updateEmblaButtons);
  }, [emblaApi, updateEmblaButtons]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  // Hide component if required fields are missing to prevent ghost elements (but not in edit mode)
  const hasRequiredFields = fields.featuredLinkText?.value && fields.nonFeaturedLinkText?.value;

  if (!hasRequiredFields && !isEditing) {
    return <></>;
  }

  const newsLandingPageBaseUrl =
    page.layout.sitecore.context.landingPageSettings?.newsLandingPage?.url;
  const seeMoreUrl =
    newsLandingPageBaseUrl && data?.seeMoreFilterParams
      ? `${newsLandingPageBaseUrl}?${data.seeMoreFilterParams}`
      : newsLandingPageBaseUrl;

  const featuredNewsArticles = data?.featured?.results ?? [];
  const nonFeaturedNewsArticles = data?.nonFeatured?.results ?? [];
  const mobileSlides = [...featuredNewsArticles, ...nonFeaturedNewsArticles];

  if (isLoading || sessionStatus === 'loading') {
    return (
      <div
        className={cx(
          'market-news-hero',
          'market-news-hero--loading',
          'component flex flex-col md:flex-row gap-10 md:gap-12',
          props.stylesSXA
        )}
        id={rendering.params?.RenderingIdentifier}
      />
    );
  }

  return (
    <div
      className={cx(
        'market-news-hero',
        'component flex flex-col md:flex-row gap-10 md:gap-12',
        props.stylesSXA
      )}
      id={rendering.params?.RenderingIdentifier}
    >
      {!isMobile && (
        <>
          <div
            className={cx(
              'market-news-hero__featured',
              'flex flex-col md:flex-row gap-4 md:gap-12 text-white md:flex-[0_0_60%]'
            )}
          >
            {featuredNewsArticles.length > 0 && (
              <>
                <div className={cx('market-news-hero__featured-image', 'flex md:flex-[1_1_40%]')}>
                  <Image
                    field={
                      featuredNewsArticles[0].thumbnail.jsonValue?.value?.src
                        ? featuredNewsArticles[0].thumbnail.jsonValue
                        : fields.placeholderImage?.value
                    }
                  />
                </div>
                <div
                  className={cx(
                    'market-news-hero__featured-info-container',
                    'flex md:flex-[1_1_60%]'
                  )}
                >
                  <div className={cx('market-news-hero__featured-info', 'flex flex-col gap-4')}>
                    <Text
                      tag="span"
                      field={fields?.optionalEyebrow}
                      className={cx('market-news-hero__featured-eyebrow')}
                    />
                    <a
                      href={featuredNewsArticles[0].url?.path}
                      className={cx('market-news-hero__featured-headline-link')}
                    >
                      <Text
                        tag="h2"
                        field={featuredNewsArticles[0].title}
                        className={cx('market-news-hero__featured-headline')}
                      />
                    </a>
                    <Text
                      tag="p"
                      field={featuredNewsArticles[0].pageIntroduction}
                      className={cx('market-news-hero__featured-excerpt')}
                    />
                    <a
                      href={featuredNewsArticles[0].url?.path}
                      className={cx('market-news__featured')}
                    >
                      {fields?.featuredLinkText?.value}
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
          <div
            className={cx(
              'market-news-hero__article-links-container',
              'flex items-center flex-[0_1_40%]'
            )}
          >
            <div className={cx('market-news-hero__article-links', 'flex flex-col gap-4')}>
              {nonFeaturedNewsArticles.length > 0 &&
                nonFeaturedNewsArticles.map((article, index) => (
                  <a
                    key={index}
                    href={article?.url?.path}
                    className={cx('market-news__article-card')}
                  >
                    <Text
                      tag="span"
                      field={article.title}
                      className={cx('market-news__article-headline')}
                    />
                    <MaterialIcon name="ChevronRight" />
                  </a>
                ))}
              <div className={cx('market-news-hero__see-all')}>
                {fields?.nonFeaturedLinkText?.value && (
                  <a href={seeMoreUrl} className={cx('market-news__see-all-link', 'desktop-only')}>
                    {fields?.nonFeaturedLinkText?.value}
                    <MaterialIcon name="East" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      {isMobile && (
        <div className={cx('market-news-hero__mobile', 'flex flex-col gap-4')}>
          <div className={cx('market-new-hero__carousel')} ref={emblaRef}>
            <div className={cx('market-news-hero__embla-container')}>
              {mobileSlides.map((article, index) => {
                const isFeatured = index === 0;

                return (
                  <div className={cx('market-news-hero__embla-slide')} key={index}>
                    {isFeatured ? (
                      <div
                        className={cx(
                          'market-news-hero__featured-info-container',
                          'flex justify-between gap-4'
                        )}
                      >
                        <div
                          className={cx('market-news-hero__featured-info', 'flex flex-col gap-4')}
                        >
                          <Text
                            tag="span"
                            field={fields?.optionalEyebrow}
                            className={cx('market-news-hero__featured-eyebrow')}
                          />
                          <a href={article.url?.path}>
                            <Text tag="h2" field={article.title} />
                          </a>
                        </div>
                        <div className={cx('market-news-hero__featured-image')}>
                          <Image
                            field={
                              article.thumbnail?.jsonValue?.value?.src
                                ? article.thumbnail.jsonValue
                                : fields.placeholderImage?.value
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <div
                        className={cx(
                          'market-news-hero__mobile-article-card-container',
                          'flex gap-4 justify-between'
                        )}
                      >
                        <div className="flex flex-col gap-4">
                          {/* Below is where the eyebrow goes for nonfeatured articles. If a Text element, just make sure the class remains the same */}
                          {/* <span className={cx('market-news-hero__featured-eyebrow')}>Eyebrow</span> */}
                          <a
                            href={article?.url?.path}
                            className={cx('market-news-hero__article-card-link-mobile')}
                          >
                            <Text tag="h2" field={article.title} />
                          </a>
                        </div>
                        <div className={cx('market-news-hero__nonfeatured-image')}>
                          <Image
                            field={
                              article.thumbnail?.jsonValue?.value?.src
                                ? article.thumbnail.jsonValue
                                : fields.placeholderImage?.value
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={cx('market-news-hero__nav', 'flex justify-between')}>
            <div className={cx('market-news-hero__see-all')}>
              {fields?.nonFeaturedLinkText?.value && (
                <a href={seeMoreUrl}>
                  {fields?.nonFeaturedLinkText?.value}
                  <MaterialIcon name="East" />
                </a>
              )}
            </div>

            <div className={cx('market-news-hero__arrows', 'flex items-center')}>
              <div className={cx('market-news-hero__arrows', 'flex items-center')}>
                <button
                  onClick={scrollPrev}
                  disabled={!canScrollPrev}
                  className={cx(
                    'market-news-hero__arrow',
                    !canScrollPrev && 'market-news-hero__arrow--disabled'
                  )}
                  aria-label="Previous slide"
                >
                  <MaterialIcon name="ChevronLeft" />
                </button>

                <button
                  onClick={scrollNext}
                  disabled={!canScrollNext}
                  className={cx(
                    'market-news-hero__arrow',
                    !canScrollNext && 'market-news-hero__arrow--disabled'
                  )}
                  aria-label="Next slide"
                >
                  <MaterialIcon name="ChevronRight" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default compose<MarketNewsHeroProps>(withDatasourceCheck(), withStyles())(MarketNewsHero);
