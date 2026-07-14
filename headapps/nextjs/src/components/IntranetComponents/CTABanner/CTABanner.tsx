import { JSX } from 'react';
import { Link, Text, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { CTABannerProps, CTABannerVariant } from './CTABanner.types';

// CSS module styles
import styles from './CTABanner.module.scss';
import { withJumplink } from 'lib/enhancers/withJumplink';

const cx = classNames.bind(styles);
const CTABanner = (props: CTABannerProps & { variant?: CTABannerVariant }): JSX.Element => {
  const { fields, variant = 'pencil' } = props;
  const backgroundImageSrc = props.fields.backgroundImage?.fields?.image?.value?.src;

  const backgroundImageName =
    props.fields.backgroundImage?.name || props.fields.backgroundImage?.fields?.image?.value?.alt;

  const isLightBlueBackground =
    backgroundImageName === 'Light Blue Abstract' || backgroundImageName === 'Light Blue';

  const bannerClass = isLightBlueBackground ? 'cta-banner--pencillightblue' : '';

  const isLightBlueOutlined = backgroundImageName === 'Light Blue';

  const isWhiteBackground = backgroundImageName === 'White';
  const isPencilWhiteBackground = variant === 'pencil' && isWhiteBackground;
  const isDetailedWhiteBackground = variant === 'detailed' && isWhiteBackground;

  const backgroundStyle =
    !isWhiteBackground && backgroundImageSrc
      ? { backgroundImage: `url("${backgroundImageSrc}")` }
      : undefined;

  return (
    <div
      style={backgroundStyle}
      className={cx(
        'cta-banner',
        bannerClass && 'cta-banner--pencillightblue',
        variant === 'detailed' && 'cta-banner--detailed',
        isPencilWhiteBackground && 'cta-banner--pencil-white-background',
        isDetailedWhiteBackground && 'cta-banner--detailed-white-background',
        'component container flex rounded-xl items-center',
        props.stylesSXA
      )}
    >
      <div className={`${cx('cta-banner__content', 'flex flex-col')}`}>
        <Text
          tag="span"
          className={`eyebrow ${isLightBlueBackground || isWhiteBackground ? '' : 'text-white'}`}
          field={fields.eyebrow}
        />
        <Text tag="h2" field={fields.headline} />
        {variant !== 'pencil' && (
          <Text
            tag="p"
            className={`${isLightBlueBackground || isWhiteBackground ? '' : 'text-white'}`}
            field={fields.subtext}
          />
        )}
      </div>

      <div className={`${cx('cta-banner__cta', 'flex')}`}>
        <Link
          field={fields.buttonLink}
          className={cx(
            'asc-btn',
            isLightBlueOutlined
              ? 'asc-btn--outlined'
              : isLightBlueBackground
                ? 'asc-btn--primary'
                : isWhiteBackground
                  ? 'asc-btn--outline'
                  : 'asc-btn--white'
          )}
        ></Link>
      </div>
    </div>
  );
};

// default (no value) variant is 'pencil'
export default compose<CTABannerProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(CTABanner);

export const Pencil = compose<CTABannerProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(CTABanner);

export const Detailed = compose<CTABannerProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)((props: CTABannerProps) => <CTABanner {...props} variant="detailed" />);
