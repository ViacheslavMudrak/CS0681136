import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { useUserPreferences } from 'lib/firebase/hooks/use-user-preferences';
import { useUserSettings } from 'lib/hooks/use-user-settings';
import { useSwrWithAuth } from 'lib/swr';
import { useI18n } from 'next-localization';
import { JSX, useEffect, useMemo, useState } from 'react';

import { Skeleton } from '@mui/material';

import type { NewsSiteOptionsResponse } from 'lib/news-preferences/types';

import styles from './MyNewsPreferenceSettings.module.scss';
import { MyNewsPreferenceSettingsStatics } from './MyNewsPreferenceSettings.types';
import { MyNewsPreferenceSettingsProps } from './MyNewsPreferenceSettings.types';

const cx = classNames.bind(styles);

const MyNewsPreferenceSettings = (props: MyNewsPreferenceSettingsProps): JSX.Element => {
  const { fields, rendering } = props;
  const { t } = useI18n();
  const maxSupplementalDisplay = fields?.maxSupplementalSites?.jsonValue?.value ?? 3;
  const unknownSiteLabel =
    t('UnknownSiteLabel') || MyNewsPreferenceSettingsStatics.unknownSiteLabel;

  const { preferredNewsHomeSiteId, isLoading, savePreferredNewsHomeSite } = useUserSettings();
  const { preferredNewsSupplementalSites, savePreferredNewsSupplementalSites } =
    useUserPreferences();

  const {
    data: siteOptions,
    isLoading: optionsLoading,
    sessionStatus,
  } = useSwrWithAuth<NewsSiteOptionsResponse>({
    key: '/api/user-preferences/news-site-options',
  });

  const siteSelectionOptions = useMemo(() => siteOptions?.home ?? [], [siteOptions?.home]);
  const supplementalSiteOptions = useMemo(
    () => siteOptions?.supplemental ?? [],
    [siteOptions?.supplemental]
  );

  const preferredNewsHomeSiteName = useMemo(() => {
    if (!preferredNewsHomeSiteId || !siteSelectionOptions?.length) {
      return unknownSiteLabel;
    }
    const matchingSite = siteSelectionOptions.find((site) => site.id === preferredNewsHomeSiteId);
    return matchingSite?.title?.value ?? unknownSiteLabel;
  }, [preferredNewsHomeSiteId, siteSelectionOptions, unknownSiteLabel]);

  // Build the selected news sites display
  const selectedNewsSupplementalSitesDisplay = useMemo(() => {
    if (!preferredNewsSupplementalSites?.length || !supplementalSiteOptions?.length) return null;
    const selectedNames = preferredNewsSupplementalSites
      .map((id: string) => supplementalSiteOptions.find((site) => site.id === id)?.title?.value)
      .filter(Boolean);
    const visible = selectedNames.slice(0, maxSupplementalDisplay);
    const overflow = selectedNames.length - maxSupplementalDisplay;
    const base = visible.join(', ');
    if (overflow <= 0) return base;
    return `${base}, and ${overflow} other${overflow > 1 ? 's' : ''}`;
  }, [maxSupplementalDisplay, preferredNewsSupplementalSites, supplementalSiteOptions]);

  // Labels — Sitecore field value first, static default as fallback
  const settingsTitle =
    fields.newsPrefsSectionHeading?.jsonValue?.value ||
    MyNewsPreferenceSettingsStatics.settingsTitle;
  const homepageNewsTitle =
    fields.newsHomeSiteLabel?.jsonValue?.value || MyNewsPreferenceSettingsStatics.homepageNewsTitle;
  const homepageNewsDescription =
    fields.newsHomeSiteDescription?.jsonValue?.value ||
    MyNewsPreferenceSettingsStatics.homepageNewsDescription;
  const myNewsFeedTitle =
    fields.newsSupplementalSitesLabel?.jsonValue?.value ||
    MyNewsPreferenceSettingsStatics.myNewsFeedTitle;
  const myNewsFeedDescription =
    fields.newsSupplementalSitesDescription?.jsonValue?.value ||
    MyNewsPreferenceSettingsStatics.myNewsFeedDescription;

  // Button labels change based on whether a selection exists
  const homeSiteButtonLabel = preferredNewsHomeSiteId
    ? fields.newsHomeSiteChangeLinkText?.jsonValue?.value ||
      MyNewsPreferenceSettingsStatics.homepageNewsChangeLinkText
    : fields.newsHomeSiteUnknownChangeLinkText?.jsonValue?.value ||
      MyNewsPreferenceSettingsStatics.homepageNewsUnknownChangeLinkText;

  const supplementalButtonLabel = preferredNewsSupplementalSites?.length
    ? fields.newsSupplementalSitesChangeLinkText?.jsonValue?.value ||
      MyNewsPreferenceSettingsStatics.myNewsFeedChangeLinkText
    : fields.newsSupplementalSitesNoneChangeLinkText?.jsonValue?.value ||
      MyNewsPreferenceSettingsStatics.myNewsFeedNoneChangeLinkText;

  const [myNewsSitesModalOpen, setMyNewsSitesModalOpen] = useState(false);
  const [homepageSitesModalOpen, setHomepageSitesModalOpen] = useState(false);
  const [selectedHomeSite, setSelectedHomeSite] = useState<string | null>(null);
  const [selectedMyNewsFeedSites, setSelectedMyNewsFeedSites] = useState<string[]>([]);

  // Track if homepage selection has changed from saved preference
  const isHomePageChanged = useMemo(() => {
    return selectedHomeSite !== preferredNewsHomeSiteId;
  }, [selectedHomeSite, preferredNewsHomeSiteId]);

  // Track if my news feed selection has changed from saved preferences
  const isMyNewsFeedChanged = useMemo(() => {
    if (selectedMyNewsFeedSites.length !== (preferredNewsSupplementalSites?.length ?? 0)) {
      return true;
    }
    return !selectedMyNewsFeedSites.every((id) => preferredNewsSupplementalSites?.includes(id));
  }, [selectedMyNewsFeedSites, preferredNewsSupplementalSites]);

  /**
   * Gate rendering until after client-side mount to avoid hydration mismatches.
   * The component's rendered output depends on client-only hooks (useSession,
   * useUserSettings, useUserPreferences) whose data is unavailable during SSR.
   */
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Modal labels
  const homepageModalLabels = {
    title: t('HomePageNewsModalTitle') || MyNewsPreferenceSettingsStatics.homePageNewsModalTitle,
    description:
      t('HomePageNewsModalDescription') ||
      MyNewsPreferenceSettingsStatics.homePageNewsModalDescription,
    warning:
      t('HomePageNewsModalWarning') || MyNewsPreferenceSettingsStatics.homePageNewsModalWarning,
    cancelButton:
      t('HomePageNewsModalCancelButton') ||
      MyNewsPreferenceSettingsStatics.homePageNewsModalCancelButton,
    saveButton:
      t('HomePageNewsModalSaveButton') ||
      MyNewsPreferenceSettingsStatics.homePageNewsModalSaveButton,
  };

  const newsFeedModalLabels = {
    title: t('MyNewsFeedModalTitle') || MyNewsPreferenceSettingsStatics.myNewsFeedModalTitle,
    description:
      t('MyNewsFeedModalDescription') || MyNewsPreferenceSettingsStatics.myNewsFeedModalDescription,
    cancelButton:
      t('MyNewsFeedModalCancelButton') ||
      MyNewsPreferenceSettingsStatics.myNewsFeedModalCancelButton,
    saveButton:
      t('MyNewsFeedModalSaveButton') || MyNewsPreferenceSettingsStatics.myNewsFeedModalSaveButton,
  };

  const [scrollY, setScrollY] = useState(0);

  const lockBodyScroll = () => {
    const currentScrollY = window.scrollY;

    setScrollY(currentScrollY);
    document.body.style.position = 'fixed';
    document.body.style.top = `-${currentScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  };

  const unlockBodyScroll = () => {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';

    window.scrollTo(0, scrollY);
  };

  const handleOpenMyNewsSiteModal = () => {
    setSelectedMyNewsFeedSites(preferredNewsSupplementalSites ?? []);
    setMyNewsSitesModalOpen(true);
    lockBodyScroll();
  };

  const handleCloseMyNewsSiteModal = () => {
    setMyNewsSitesModalOpen(false);
    unlockBodyScroll();
  };

  const handleOpenHomepageSitesModal = () => {
    setSelectedHomeSite(preferredNewsHomeSiteId ?? null);
    setHomepageSitesModalOpen(true);
    lockBodyScroll();
  };

  const handleCloseHomepageSitesModal = () => {
    setHomepageSitesModalOpen(false);
    unlockBodyScroll();
  };

  const handleSaveHomePageSite = async () => {
    if (selectedHomeSite) {
      await savePreferredNewsHomeSite(selectedHomeSite);
    }
    handleCloseHomepageSitesModal();
  };

  const handleSaveMyNewsFeedSites = async () => {
    await savePreferredNewsSupplementalSites(selectedMyNewsFeedSites);
    handleCloseMyNewsSiteModal();
  };

  // Modal body content helpers
  const renderHomepageModalBody = () => (
    <div className={cx('my-news-preference-settings__modal-body', 'flex flex-col gap-4')}>
      {siteSelectionOptions?.map((site, index) => (
        <label key={index} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="homepage-site"
            value={site?.id}
            checked={selectedHomeSite === site?.id}
            onChange={() => setSelectedHomeSite(site?.id as string)}
            data-selected={selectedHomeSite}
          />
          <span>{site?.title?.value}</span>
        </label>
      ))}
    </div>
  );

  const renderNewsFeedModalBody = () => (
    <div className={cx('my-news-preference-settings__modal-body', 'flex flex-col gap-4')}>
      {supplementalSiteOptions?.map((site, index) => (
        <label key={index} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            value={site?.id}
            checked={selectedMyNewsFeedSites.includes(site?.id as string)}
            onChange={() =>
              setSelectedMyNewsFeedSites((prev) =>
                prev.includes(site?.id as string)
                  ? prev.filter((id) => id !== site?.id)
                  : [...prev, site?.id as string]
              )
            }
          />
          <span>{site?.title?.value}</span>
        </label>
      ))}
    </div>
  );

  const awaitingOptions =
    sessionStatus === 'loading' ||
    (sessionStatus === 'authenticated' && (optionsLoading || !siteOptions));

  if (!mounted || isLoading || awaitingOptions) {
    return (
      <div
        className={cx('my-news-preference-settings', 'component', props.stylesSXA)}
        id={rendering.params?.RenderingIdentifier}
      >
        <Skeleton variant="text" width={240} height={32} />
        <div
          className={cx(
            'my-news-preference-settings__preferences',
            'flex flex-col md:flex-row gap-8 md:gap-12'
          )}
        >
          <Skeleton
            variant="rectangular"
            height={150}
            className={cx('flex-1', 'md:flex-[1_0_45%]')}
          />
          <Skeleton
            variant="rectangular"
            height={150}
            className={cx('flex-1', 'md:flex-[1_0_45%]')}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cx('my-news-preference-settings', 'component', props.stylesSXA)}
      id={rendering.params?.RenderingIdentifier}
    >
      <h3>{settingsTitle}</h3>
      <div
        className={cx(
          'my-news-preference-settings__preferences',
          'flex flex-col md:flex-row gap-8 md:gap-12'
        )}
      >
        {/* Homepage News */}
        <div
          className={cx(
            'my-news-preference-settings__homepage-news',
            'flex flex-col md:flex-[1_0_45%]'
          )}
        >
          <div className="flex gap-2 items-center">
            <MaterialIcon name="NewspaperOutlined" />
            <h4>{homepageNewsTitle}</h4>
          </div>
          <p>{homepageNewsDescription}</p>
          <div className={cx('my-news-preference-settings__homepage-site', 'flex flex-col')}>
            <span>{preferredNewsHomeSiteName}</span>
          </div>
          <div className={cx('my-news-preference-settings__homepage-button')}>
            <button
              type="button"
              className="flex gap-2 items-center"
              onClick={handleOpenHomepageSitesModal}
            >
              <MaterialIcon name="CreateOutlined" />
              <span>{homeSiteButtonLabel}</span>
            </button>
          </div>
        </div>

        {/* My News Feed */}
        <div
          className={cx(
            'my-news-preference-settings__my-news-feed',
            'flex flex-col md:flex-[1_0_45%]'
          )}
        >
          <div className="flex gap-2 items-center">
            <MaterialIcon name="CampaignOutlined" />
            <h4>{myNewsFeedTitle}</h4>
          </div>
          <p>{myNewsFeedDescription}</p>
          {selectedNewsSupplementalSitesDisplay && (
            <div className={cx('my-news-preference-settings__my-news-feed-sites', 'flex flex-col')}>
              <span>{selectedNewsSupplementalSitesDisplay}</span>
            </div>
          )}

          <div className={cx('my-news-preference-settings__my-news-feed-button')}>
            <button
              type="button"
              className="flex gap-2 items-center"
              onClick={handleOpenMyNewsSiteModal}
            >
              <MaterialIcon name="CreateOutlined" />
              <span>{supplementalButtonLabel}</span>
            </button>
          </div>
        </div>
      </div>

      {homepageSitesModalOpen && (
        <div
          className={cx(
            'my-news-preference-settings__modal-overlay',
            'flex justify-center items-center'
          )}
          onClick={handleCloseHomepageSitesModal}
          role="presentation"
        >
          <div
            className={cx('my-news-preference-settings__modal', 'flex flex-col')}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className={cx('my-news-preference-settings__modal-header', 'flex flex-col gap-2')}>
              <h3>{homepageModalLabels.title}</h3>
              <p>{homepageModalLabels.description}</p>
              {!selectedHomeSite && <p>{homepageModalLabels.warning}</p>}
            </div>
            {renderHomepageModalBody()}
            <div
              className={cx(
                'my-news-preference-settings__modal-actions',
                'flex gap-10 justify-center'
              )}
            >
              <button
                type="button"
                className={cx('my-news-preference-settings__modal-cancel')}
                onClick={handleCloseHomepageSitesModal}
              >
                {homepageModalLabels.cancelButton}
              </button>
              <button
                type="button"
                className={cx(
                  'my-news-preference-settings__modal-save',
                  'asc-btn asc-btn--primary',
                  `${!isHomePageChanged ? 'cursor-not-allowed opacity-50 pointer-events-none' : ''}`
                )}
                onClick={handleSaveHomePageSite}
                disabled={!isHomePageChanged}
              >
                {homepageModalLabels.saveButton}
              </button>
            </div>
          </div>
        </div>
      )}
      {myNewsSitesModalOpen && (
        <div
          className={cx(
            'my-news-preference-settings__modal-overlay',
            'flex justify-center items-center'
          )}
          onClick={handleCloseMyNewsSiteModal}
          role="presentation"
        >
          <div
            className={cx('my-news-preference-settings__modal', 'flex flex-col')}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className={cx('my-news-preference-settings__modal-header', 'flex flex-col gap-2')}>
              <h3>{newsFeedModalLabels.title}</h3>
              <p>{newsFeedModalLabels.description}</p>
            </div>
            {renderNewsFeedModalBody()}
            <div
              className={cx(
                'my-news-preference-settings__modal-actions',
                'flex gap-10 justify-center'
              )}
            >
              <button
                type="button"
                className={cx('my-news-preference-settings__modal-cancel')}
                onClick={handleCloseMyNewsSiteModal}
              >
                {newsFeedModalLabels.cancelButton}
              </button>
              <button
                type="button"
                className={cx(
                  'my-news-preference-settings__modal-save',
                  'asc-btn asc-btn--primary',
                  `${!isMyNewsFeedChanged ? 'cursor-not-allowed opacity-50 pointer-events-none' : ''}`
                )}
                onClick={handleSaveMyNewsFeedSites}
                disabled={!isMyNewsFeedChanged}
              >
                {newsFeedModalLabels.saveButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default compose<MyNewsPreferenceSettingsProps>(withStyles())(MyNewsPreferenceSettings);
