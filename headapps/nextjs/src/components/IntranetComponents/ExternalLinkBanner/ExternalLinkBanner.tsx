import { JSX } from 'react';
import { Image, Link, Text, useSitecore, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { ExternalLinkBannerProps } from './ExternalLinkBanner.types';
import { withJumplink } from 'lib/enhancers/withJumplink';

// CSS module styles
import styles from './ExternalLinkBanner.module.scss';

const cx = classNames.bind(styles);

const ExternalLinkBanner = (props: ExternalLinkBannerProps): JSX.Element => {
  const { fields, rendering, params } = props;
  const showLogos = params?.showIcons === '1';
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const hasIcon1 = fields.icon1Description?.value || fields.icon1Button?.value?.href;
  const hasIcon2 = fields.icon2Description?.value || fields.icon2Button?.value?.href;
  const hasOnlyOneIcon = ((hasIcon1 && !hasIcon2) || (!hasIcon1 && hasIcon2)) && !isPageEditing;

  return (
    <div
      className={cx(
        'external-link-banner',
        'component container flex flex-col md:flex-row gap-10',
        props.stylesSXA
      )}
      id={rendering.params?.RenderingIdentifier}
    >
      <div className={cx('external-link-banner__left', 'flex flex-col flex-[1_0_30%]')}>
        <Text
          className={cx('text-eyebrow eyebrow eyebrow-font-size')}
          field={fields.optionalEyebrow}
          tag="span"
        />
        <Text className={cx('external-link-banner__title', '')} tag="h2" field={fields.mainText} />
      </div>
      {(hasIcon1 || isPageEditing) && (
        <div
          className={cx(
            'external-link-banner__center',
            'flex flex-col gap-4',
            hasOnlyOneIcon
              ? 'md:flex-[1_0_60%] md:justify-center md:items-center'
              : 'flex-[1_0_30%]'
          )}
        >
          <div className={cx('flex flex-col gap-4', hasOnlyOneIcon && 'md:w-[calc(30%*100/60)]')}>
            {showLogos && (
              <div className={cx('external-link-banner__image-container', 'max-h-[40px]')}>
                <Image field={fields.icon1Image} />
              </div>
            )}
            <Text field={fields.icon1Description} tag="p" />
            <Link className={cx('asc-btn asc-btn--primary', 'w-max')} field={fields.icon1Button} />
          </div>
        </div>
      )}
      {(hasIcon2 || isPageEditing) && (
        <div
          className={cx(
            'external-link-banner__right',
            'flex flex-col gap-4',
            hasOnlyOneIcon
              ? 'md:flex-[1_0_60%] md:justify-center md:items-center'
              : 'flex-[1_0_30%]'
          )}
        >
          <div className={cx('flex flex-col gap-4', hasOnlyOneIcon && 'md:w-[calc(30%*100/60)]')}>
            {showLogos && (
              <div className={cx('external-link-banner__image-container', 'max-h-[40px]')}>
                <Image field={fields.icon2Image} />
              </div>
            )}
            <Text field={fields.icon2Description} tag="p" />
            <Link className={cx('asc-btn asc-btn--primary', 'w-max')} field={fields.icon2Button} />
          </div>
        </div>
      )}
    </div>
  );
};

export default compose<ExternalLinkBannerProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(ExternalLinkBanner);
