import { JSX, useState, useEffect, useMemo } from 'react';
import { useSitecore, RichText, Link } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';

import {
  NotificationBannerProps,
  BannerVariant,
  ProcessedBanner,
  NotificationBannerRenderingFields,
  AncestorWithBanners,
  NotificationBannerItem,
  BANNER_ICONS,
  NOTIFICATION_LEVEL_MAP,
} from './NotificationBanner.types';
import styles from './NotificationBanner.module.scss';

const cx = classNames.bind(styles);

const NotificationBanner = (props: NotificationBannerProps): JSX.Element | null => {
  const { rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  // Extract notification banners from Sitecore GraphQL structure

  const renderingFields = rendering.fields;

  // Memoize allBanners
  const allBanners = useMemo((): ProcessedBanner[] => {
    const fields = renderingFields as NotificationBannerRenderingFields;
    const ancestors = fields?.data?.matches?.ancestors || [];
    const currentBanners = fields?.data?.current?.notificationBanners?.targetItems || [];

    // Combine banners from ancestors
    const ancestorBanners = ancestors
      .filter((ancestor: AncestorWithBanners) => ancestor.notificationBanners?.targetItems)
      .flatMap((ancestor: AncestorWithBanners) => ancestor.notificationBanners!.targetItems);

    // Concatenate both arrays
    const allBannerItems = [...ancestorBanners, ...currentBanners];

    return allBannerItems.map((item: NotificationBannerItem) => {
      const notificationLevel = item.notificationLevel?.jsonValue?.value || 'Informational';

      return {
        id: item.id,
        name: item.name,
        bannerText: item.bannerText?.jsonValue || { value: '' },
        buttonLink: item.buttonLink?.jsonValue || { value: {} },
        bannerVariant: {
          value: NOTIFICATION_LEVEL_MAP[notificationLevel] || 'Informational',
        },
        allowUserToDismiss: item.allowUserToDismiss?.jsonValue?.value || false,
      };
    });
  }, [renderingFields]);

  // State to track dismissed banners
  const [dismissedBanners, setDismissedBanners] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load dismissed banners from localStorage after mount
    if (!isPageEditing) {
      const dismissed = new Set<string>();
      allBanners.forEach((banner) => {
        if (banner.allowUserToDismiss) {
          const storageKey = `banner-dismissed-${banner.id}`;
          if (localStorage.getItem(storageKey) === 'true') {
            dismissed.add(banner.id);
          }
        }
      });
      setDismissedBanners(dismissed);
    }
    setMounted(true);
  }, [allBanners, isPageEditing]);

  const handleDismiss = (bannerId: string) => {
    const storageKey = `banner-dismissed-${bannerId}`;
    localStorage.setItem(storageKey, 'true');
    setDismissedBanners((prev) => new Set([...prev, bannerId]));
  };

  // Filter out dismissed banners only after component has mounted (to avoid SSR mismatch)
  const visibleBanners =
    isPageEditing || !mounted
      ? allBanners
      : allBanners.filter((banner) => !dismissedBanners.has(banner.id));

  const bannersToRender = visibleBanners;

  // Don't render if no banners (unless in editing mode for component configuration)
  if (bannersToRender.length === 0 && !isPageEditing) {
    return null;
  }

  return (
    <div
      className={`${cx('notification-banner-container')} component global-notification-banner`}
      id={rendering.params?.RenderingIdentifier}
    >
      {bannersToRender.length === 0 && isPageEditing ? (
        <div
          className={cx('notification-banner', 'notification-banner--informational', 'component')}
        >
          <div className={cx('notification-banner__container', 'container')}>
            <p>
              No notification banners configured. Add banners to the Global Settings or Site
              Settings.
            </p>
          </div>
        </div>
      ) : (
        bannersToRender.map((banner) => {
          const variant = (banner.bannerVariant?.value || 'Informational') as BannerVariant;
          const shouldRenderButton = Boolean(banner.buttonLink?.value?.href) || isPageEditing;
          const iconName = BANNER_ICONS[variant];
          const canDismiss = banner.allowUserToDismiss;

          return (
            <div
              key={banner.id}
              className={cx(
                'notification-banner',
                variant === 'Negative' && 'notification-banner--negative',
                variant === 'Warning' && 'notification-banner--warning',
                variant === 'Informational' && 'notification-banner--informational',
                variant === 'Positive' && 'notification-banner--positive'
              )}
              role="alert"
              aria-live="polite"
            >
              <div className={cx('notification-banner__container', 'container')}>
                <div className={cx('notification-banner__content')}>
                  {/* Icon */}
                  <div className={cx('notification-banner__icon')}>
                    <MaterialIcon name={iconName} />
                  </div>

                  {/* Text and Link */}
                  <div className={cx('notification-banner__text-wrapper')}>
                    <RichText
                      tag="div"
                      className={cx('notification-banner__text')}
                      field={banner.bannerText}
                    />
                  </div>

                  {/* Button Link - always rendered to maintain grid position */}
                  <div className={cx('notification-banner__link-container')}>
                    {shouldRenderButton && (
                      <Link className={cx('notification-banner__link')} field={banner.buttonLink} />
                    )}
                  </div>

                  {/* Dismiss Button - always rendered to maintain grid position */}
                  <div className={cx('notification-banner__dismiss-container')}>
                    {canDismiss && (
                      <button
                        className={cx('notification-banner__dismiss')}
                        onClick={() => handleDismiss(banner.id)}
                        aria-label="Dismiss notification"
                        type="button"
                      >
                        <MaterialIcon name="close" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default compose<NotificationBannerProps>(withStyles())(NotificationBanner);
