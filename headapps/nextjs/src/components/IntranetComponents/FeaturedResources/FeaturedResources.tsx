import { JSX } from 'react';
import {
  useSitecore,
  withDatasourceCheck,
  Text,
  RichText,
  Link,
  LinkField,
} from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { FeaturedResourcesProps, FeaturedResourcesVariant } from './FeaturedResources.types';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';

import styles from './FeaturedResources.module.scss';
import { resolveLinkAndIcon } from 'src/util/helpers/customLinkHelpers';
import useMediaQuery from '@mui/material/useMediaQuery';
import { MediaQueryConstants } from 'src/util/const/material';
import { withJumplink } from 'lib/enhancers/withJumplink';

const cx = classNames.bind(styles);

const FeaturedResources = (
  props: FeaturedResourcesProps & { variant?: FeaturedResourcesVariant }
): JSX.Element | null => {
  const { fields, rendering, variant = 'Light' } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const isMobile = useMediaQuery(MediaQueryConstants.Mobile);
  const imageOnLeft = rendering.params?.imageOnLeft === '1';
  const hideImageInMobile = rendering.params?.hideImageInMobile === '1';
  const datasource = fields?.data?.datasource;

  if ((!datasource || !datasource.children) && !isPageEditing) return null;
  if (!datasource) return null;

  const {
    headlineTitle,
    featuredResourceOptionalEyebrow,
    featuredResourceHeadlineText,
    featuredResourceSubtext,
    featuredResourceImage,
    featuredResourceMobileCtaText,
    children,
  } = datasource;

  const darkBackgroundImage =
    page.layout.sitecore.context.defaultImages?.featuredResourcesDarkBackground?.value?.src;
  const lightBackgroundImage =
    page.layout.sitecore.context.defaultImages?.featuredResourcesLightBackground?.value?.src;
  const shouldRenderSubtext = Boolean(featuredResourceSubtext?.jsonValue?.value) || isPageEditing;

  const nonFeaturedList = isPageEditing
    ? (children?.results ?? [])
    : (children?.results ?? []).filter((item) => {
        const { linkField } =
          resolveLinkAndIcon(item.nonFeaturedResourceLink?.jsonValue?.[0]) ?? {};
        return (
          item.nonFeaturedResourceName?.jsonValue?.value &&
          item.nonFeaturedResourceDescription?.jsonValue?.value &&
          linkField?.value?.href
        );
      });
  const featuredResourceLinkItem = fields.data.datasource.featuredResourceUrl.jsonValue?.[0];
  const resolvedLinkFromCustomLink = resolveLinkAndIcon(featuredResourceLinkItem);
  const featuredResourceLink = resolvedLinkFromCustomLink?.linkField;

  const FeaturedBlock = () => {
    const fallbackImageSrc = variant === 'Dark' ? darkBackgroundImage : lightBackgroundImage;
    const customImageSrc = featuredResourceImage?.jsonValue?.value?.src;
    const imageSrc = customImageSrc || fallbackImageSrc;
    const hasCustomImage = Boolean(customImageSrc);
    const mobileCTAText = featuredResourceMobileCtaText?.jsonValue?.value;
    const isMobileCTAValid = isMobile && mobileCTAText;
    const roundCorners = hideImageInMobile || !hasCustomImage;

    const content = (
      <div
        className={cx(
          'featured-resources__text',
          isMobile && 'bg-brand-blue-bglight',
          isMobile && roundCorners && 'no-image'
        )}
      >
        <Text
          tag="span"
          className={cx('featured-resources__eyebrow', 'eyebrow text-eyebrow')}
          field={featuredResourceOptionalEyebrow.jsonValue}
        />
        <Text tag="h3" field={featuredResourceHeadlineText.jsonValue} />
        {shouldRenderSubtext && (
          <RichText
            field={featuredResourceSubtext.jsonValue}
            tag="div"
            className={cx('featured-resources__subtext')}
          />
        )}
        {isMobileCTAValid && featuredResourceLink && (
          <Link
            className="asc-btn asc-btn--primary inline-block mb-12"
            field={featuredResourceLink}
          >
            {mobileCTAText}
          </Link>
        )}
      </div>
    );

    if (isMobile) {
      const shouldShowImage = !hideImageInMobile && hasCustomImage;

      return shouldShowImage ? (
        <>
          <div
            className={cx(
              'featured-resources__featured',
              variant === 'Dark' && 'featured-resources__featured--overlay-dark'
            )}
            style={{ backgroundImage: `url("${imageSrc}")` }}
          >
            <div className={cx('featured-resources__overlay-gradient')} />
          </div>
          {content}
        </>
      ) : (
        content
      );
    }

    return (
      <div
        className={cx(
          'featured-resources__featured',
          variant === 'Dark' && 'featured-resources__featured--overlay-dark',
          variant === 'Light' && 'featured-resources__featured--overlay-light'
        )}
        style={{ backgroundImage: `url("${imageSrc}")` }}
      >
        {featuredResourceLink ? (
          <Link
            className={cx('featured-resources__featured-link', '')}
            field={featuredResourceLink as LinkField}
          >
            <div className={cx('featured-resources__overlay-gradient')} />
            <div className={cx('featured-resources__featured-link-content')}>
              <div className={cx('featured-resources__icon-link')}>
                <MaterialIcon name="ArrowOutward" />
              </div>
              {content}
            </div>
          </Link>
        ) : isPageEditing ? (
          <a className={cx('featured-resources__featured-link', '')} href="#">
            <div className={cx('featured-resources__overlay-gradient')} />
            <div className={cx('featured-resources__featured-link-content')}>
              <div className={cx('featured-resources__icon-link')}>
                <MaterialIcon name="ArrowOutward" />
              </div>
              {content}
            </div>
          </a>
        ) : (
          <></>
        )}
      </div>
    );
  };

  const CardsBlock = () => (
    <div className={cx('flex flex-col gap-10')}>
      {nonFeaturedList.map((item, i) => {
        const { linkField, iconField } =
          resolveLinkAndIcon(item.nonFeaturedResourceLink?.jsonValue?.[0]) ?? {};

        const shouldRenderResource =
          Boolean(item.nonFeaturedResourceLinkText?.jsonValue?.value) || isPageEditing;

        return shouldRenderResource ? (
          <div key={i} className={cx('flex flex-col gap-3')}>
            <div className={cx('flex items-center gap-2')}>
              {iconField && (
                <div className={cx('featured-resources__icon-wrapper')}>
                  <MaterialIcon iconItem={iconField} />
                </div>
              )}
              <Text field={item.nonFeaturedResourceName.jsonValue} tag="h6" />
            </div>

            <Text
              field={item.nonFeaturedResourceDescription.jsonValue}
              tag="p"
              className={cx('featured-resources__description')}
            />

            {linkField?.value?.href && (
              <Link
                field={linkField}
                className={cx('featured-resources__text-link', 'flex items-center gap-1')}
              >
                {item.nonFeaturedResourceLinkText.jsonValue.value}
                <MaterialIcon name="East" />
              </Link>
            )}
          </div>
        ) : (
          <></>
        );
      })}
    </div>
  );

  const hideComponent =
    (featuredResourceHeadlineText?.jsonValue?.value === '' ||
      featuredResourceMobileCtaText?.jsonValue?.value === '' ||
      !featuredResourceLink) &&
    !isPageEditing;

  return !hideComponent ? (
    <div className={cx('featured-resources', 'component container', props.stylesSXA)}>
      <Text tag="h2" field={headlineTitle.jsonValue} className={cx('headline')} />

      <div className={cx('featured-resources__container', 'md:items-center')}>
        {isMobile ? (
          <>
            <div className={cx('featured-resources__column')}>
              <FeaturedBlock />
            </div>
            <div className={cx('featured-resources__column')}>
              <CardsBlock />
            </div>
          </>
        ) : (
          <>
            <div className={cx('featured-resources__column')}>
              {imageOnLeft ? <FeaturedBlock /> : <CardsBlock />}
            </div>
            <div className={cx('featured-resources__column')}>
              {imageOnLeft ? <CardsBlock /> : <FeaturedBlock />}
            </div>
          </>
        )}
      </div>
    </div>
  ) : (
    <></>
  );
};

export const Light = compose<FeaturedResourcesProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(FeaturedResources);

export const Dark = compose<FeaturedResourcesProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)((props) => <FeaturedResources {...props} variant="Dark" />);

export default Dark;
