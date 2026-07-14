import { JSX } from 'react';
import {
  Image,
  RichText,
  Text,
  useSitecore,
  withDatasourceCheck,
} from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';
import { useState } from 'react';
import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { HomeHeroBannerProps, HomeHeroBannerVariant } from './HomeHeroBanner.types';
import styles from './HomeHeroBanner.module.scss';
import { CustomLink } from 'components/common/CustomLink';
import { useMediaQuery } from '@mui/material';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import Button from '@mui/material/Button';
import { MediaQueryConstants } from 'src/util/const/material';

const cx = classNames.bind(styles);

const HomeHeroBanner = (
  props: HomeHeroBannerProps & { variant?: HomeHeroBannerVariant }
): JSX.Element => {
  const { fields, rendering, variant } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const backgroundImageSrc = props.fields.backgroundImage?.fields?.image?.value?.src;

  // state for showing quick links on mobile
  const [visibleCount, setVisibleCount] = useState(4);
  const isMobile = useMediaQuery(MediaQueryConstants.Mobile);
  const totalCount = fields.quickLinks?.length ?? 0;

  const handleToggle = () => {
    if (visibleCount >= totalCount) {
      setVisibleCount(4); // collapse back
    } else {
      setVisibleCount((prev) => Math.min(prev + 4, totalCount));
    }
  };

  return (
    <div
      style={{ backgroundImage: `url("${backgroundImageSrc}")` }}
      className={cx(
        'home-hero-banner',
        variant === 'FunctionHomeHero' && 'home-hero-banner--function',
        variant === 'ResourceHomeHero' && 'home-hero-banner--resource',
        'component py-8 md:py-16',
        props.stylesSXA
      )}
      id={rendering.params?.RenderingIdentifier}
    >
      <div
        className={`${cx('home-hero-banner__container', 'container flex !my-0 gap-10')} container`}
      >
        <div
          style={{ backgroundImage: `url("${backgroundImageSrc}")` }}
          className={`${cx('home-hero-banner__content', 'flex flex-col flex-[1_1_60%] justify-center')}`}
        >
          <Text
            field={fields.optionalEyebrow}
            className="eyebrow text-eyebrow eyebrow-font-size"
            tag="span"
          />
          <Text
            className={`${cx('home-hero-banner__title', '')}`}
            field={fields.bannerHeadlineText}
            tag="h2"
            editable={true}
          />
          <RichText className={`${cx('rich-text')}`} field={fields.bannerSubtext} tag="div" />
        </div>
        {variant === 'FunctionHomeHero' && (
          <div
            className={`${cx('home-hero-banner__image', 'flex flex-[1_1_40%] order-first md:order-last')}`}
          >
            <Image
              field={fields.desktopBannerImage}
              className={'hidden md:block w-50 object-cover w-full rounded-2xl'}
            />
            <Image
              field={fields.mobileBannerImage}
              className={'block md:hidden w-50 object-cover w-full rounded-2xl'}
            />
          </div>
        )}
        {variant === 'ResourceHomeHero' && (fields.quickLinks.length > 0 || isPageEditing) && (
          <div
            className={`${cx('home-hero-banner__tasks', 'bg-white rounded-2xl flex flex-col flex-[1_0_40%] shadow-var-md')}`}
          >
            <div className={`${cx('home-hero-banner__tasks-header', 'flex gap-1 items-center')}`}>
              <MaterialIcon name="Bolt" />
              <Text
                className={`${cx('home-hero-banner__tasks-title')}`}
                field={fields.additionalLinksSectionHeader}
                tag="h3"
                editable={true}
              />
            </div>

            <div className={`${cx('home-hero-banner__tasks-list', 'flex flex-col')}`}>
              {(isMobile ? fields.quickLinks.slice(0, visibleCount) : fields.quickLinks).map(
                (linkItem, index) => (
                  <div
                    key={index}
                    className={`${cx('home-hero-banner__tasks-custom-link', 'flex items-center')}`}
                  >
                    <CustomLink
                      item={linkItem}
                      iconClassName={cx('home-hero-banner__tasks-custom-link-icon')}
                    />
                    <MaterialIcon name="KeyboardArrowRight" />
                  </div>
                )
              )}
              {/* Show button only on mobile and if >4 items */}
              {isMobile && totalCount > 4 && (
                <Button
                  variant="plainText"
                  onClick={(e) => {
                    handleToggle();
                    e.currentTarget.blur(); // immediately remove focus
                  }}
                >
                  {visibleCount >= totalCount ? 'Show Less' : 'Show More'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const FunctionHomeHero = compose<HomeHeroBannerProps>(
  withDatasourceCheck(),
  withStyles()
)((props: HomeHeroBannerProps) => <HomeHeroBanner {...props} variant="FunctionHomeHero" />);

export const ResourceHomeHero = compose<HomeHeroBannerProps>(
  withDatasourceCheck(),
  withStyles()
)((props: HomeHeroBannerProps) => <HomeHeroBanner {...props} variant="ResourceHomeHero" />);

export default FunctionHomeHero;
