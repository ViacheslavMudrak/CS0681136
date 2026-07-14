import { JSX, useEffect, useState } from 'react';
import { useSitecore, RichText, Link, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';
import { useSession } from 'next-auth/react';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { ASCENSION_SITE_NONE, ASCENSION_SITE_UNKNOWN } from 'lib/home-site/types';

import {
  AnnouncementBannerProps,
  AnnouncementBannerFields,
  AnnouncementBannerStatics,
  AnnouncementBannerTheme,
} from './AnnouncementBanner.types';
import styles from './AnnouncementBanner.module.scss';
import { useI18n } from 'next-localization';

const cx = classNames.bind(styles);

const AnnouncementBanner = (
  props: AnnouncementBannerProps & { variant?: AnnouncementBannerTheme }
): JSX.Element | null => {
  const { rendering, variant = 'Light' } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const fields = rendering.fields as AnnouncementBannerFields;
  const { bannerContent, buttonLink } = fields || {};

  /**
   * When this rendering parameter is checked, the banner is gated to users whose
   * resolved News Home Site is None/Unknown (IE-1633). Once a user has either a
   * manually-selected or system-mapped home site, the banner is hidden.
   *
   * `useSession()` is a client-only hook, so its value can differ between SSR and
   * the first client render. To avoid a React hydration mismatch we defer the
   * session-dependent decision until after mount: SSR and the first client render
   * both render `null` for the gated case, then the post-mount re-render decides
   * based on the resolved session.
   */
  const showOnlyForUnknownHomeSiteUsers = rendering.params?.showOnlyForUnknownHomeSiteUsers === '1';
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const homeSiteId = session?.newsHomeSite?.itemId;
  const isHomeSiteUnknown =
    !homeSiteId ||
    homeSiteId === ASCENSION_SITE_UNKNOWN.itemId ||
    homeSiteId === ASCENSION_SITE_NONE.itemId;

  if (showOnlyForUnknownHomeSiteUsers && !isPageEditing) {
    if (!isMounted || !isHomeSiteUnknown) {
      return null;
    }
  }

  // Don't render if no banner content (unless in editing mode)
  const hasContent = bannerContent?.value;
  if (!hasContent && !isPageEditing) {
    return null;
  }

  const shouldRenderButton = Boolean(buttonLink?.value?.href) || isPageEditing;

  return (
    <div
      className={cx('announcement-banner-container', 'container', 'component', props.stylesSXA)}
      id={rendering.params?.RenderingIdentifier}
    >
      <div
        className={cx('announcement-banner', `announcement-banner--${variant.toLowerCase()}`)}
        role="alert"
        aria-live="polite"
      >
        <div className={cx('announcement-banner__container')}>
          <div className={cx('announcement-banner__content')}>
            {/* Text */}
            <div className={cx('announcement-banner__text-wrapper')}>
              <RichText
                tag="div"
                className={cx('announcement-banner__text')}
                field={bannerContent}
              />
            </div>

            {/* Button Link */}
            <div className={cx('announcement-banner__link-container')}>
              {shouldRenderButton && (
                <Link className={cx('announcement-banner__link')} field={buttonLink}>
                  <span>{buttonLink?.value?.text}</span>
                  <MaterialIcon name="ArrowForward" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function NoDatasourceComponent(): JSX.Element {
  const { t } = useI18n();

  return (
    <div className={cx('announcement-banner', 'component')}>
      <div className={cx('announcement-banner', 'component')}>
        <div className={cx('announcement-banner__container', 'container')}>
          <p>
            {t(AnnouncementBannerStatics.DictionaryKey_NoDatasource) ||
              AnnouncementBannerStatics.NoDatasourceFallbackMessage}
          </p>
        </div>
      </div>
    </div>
  );
}

export const LightTheme = compose<AnnouncementBannerProps>(
  withStyles(),
  withDatasourceCheck({
    editingErrorComponent: NoDatasourceComponent,
  })
)((props: AnnouncementBannerProps) => <AnnouncementBanner {...props} variant="Light" />);

export const DarkTheme = compose<AnnouncementBannerProps>(
  withStyles(),
  withDatasourceCheck({
    editingErrorComponent: NoDatasourceComponent,
  })
)((props) => <AnnouncementBanner {...props} variant="Dark" />);

export default LightTheme;
