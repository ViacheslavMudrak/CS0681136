import { JSX, useCallback, useState } from 'react';
import { Text, useSitecore, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';
import { useI18n } from 'next-localization';
import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { withJumplink } from 'lib/enhancers/withJumplink';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { Alert, Pagination, Skeleton, Snackbar } from '@mui/material';
import type { AlertColor } from '@mui/material';
import type {
  CollabSiteCard,
  CollabSiteSortOption,
  ExploreCollabSiteCard,
} from 'lib/collab-sites/collab-site.types';
import type { MyCollabSitesAreaProps } from './MyCollabSitesArea.types';
import { useMyCollabSites } from './use-my-collab-sites';
import styles from './MyCollabSitesArea.module.scss';

const cx = classNames.bind(styles);

const SORT_OPTIONS: { value: CollabSiteSortOption; dictKey: string; fallback: string }[] = [
  { value: 'newest', dictKey: 'CollabSitesSortByNewest', fallback: 'Newest' },
  { value: 'oldest', dictKey: 'CollabSitesSortByOldest', fallback: 'Oldest' },
  { value: 'alphabetical', dictKey: 'CollabSitesSortByAlphabetical', fallback: 'Alphabetical' },
];

const MyCollabSitesArea = (props: MyCollabSitesAreaProps): JSX.Element => {
  const { fields, params } = props;
  const { t } = useI18n();
  const { page } = useSitecore();
  const cardsPerPage = parseInt(params?.CardsPerPage, 10) || 15;
  const listingPageId = page.layout.sitecore.route?.itemId;

  const {
    myCollabSites,
    exploreCollabSites,
    myCount,
    exploreCount,
    myPage,
    setMyPage,
    myPageCount,
    explorePage,
    setExplorePage,
    explorePageCount,
    sortOption,
    handleSortChange,
    leaveCollabSite,
    requestToJoin,
    isLoading,
  } = useMyCollabSites(cardsPerPage, listingPageId);

  const [activeTab, setActiveTab] = useState(0);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [selectedCollabSite, setSelectedCollabSite] = useState<CollabSiteCard | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<AlertColor>('success');
  const [requestingCollabSiteId, setRequestingCollabSiteId] = useState<string | null>(null);

  const showFindCollabSites = !isLoading && myCount === 0;

  const sortByLabel = t('CollabSitesSortByLabel') || 'Sort by';
  const leaveButtonLabel = t('CollabSitesLeaveButton') || 'Leave';
  const leavingButtonLabel = t('CollabSitesLeavingButton') || 'Leaving...';
  const cancelButtonLabel = t('CollabSitesCancelButton') || 'Cancel';
  const leaveModalConfirmText =
    t('CollabSitesModalConfirmLeaveText') || 'Are you sure you want to leave ${site}?';
  const hiddenLabel = t('CollabSitesHiddenLabel') || 'Hidden Collaboration Site';
  const requestButtonLabel = t('CollabSitesRequestButton') || 'Request';
  const sendingButtonLabel = t('CollabSitesSendingButton') || 'Sending...';
  const requestedButtonLabel = t('CollabSitesRequestedButton') || 'Requested';

  // fallback images
  const fallbackCollabSiteCardImage =
    page.layout.sitecore.context.defaultImages?.collabSiteListingPlaceholderCardImage?.value;

  const handleOpenLeaveModal = (collabSite: CollabSiteCard) => {
    setSelectedCollabSite(collabSite);
    setLeaveModalOpen(true);
    document.body.classList.add('no-scroll');
  };

  const handleCloseLeaveModal = () => {
    setLeaveModalOpen(false);
    setSelectedCollabSite(null);
    document.body.classList.remove('no-scroll');
  };

  const handleConfirmLeave = async () => {
    if (!selectedCollabSite) return;
    setIsLeaving(true);
    const result = await leaveCollabSite(selectedCollabSite.groupEmails);
    setIsLeaving(false);
    handleCloseLeaveModal();
    if (result.isOwner) {
      setToastSeverity('error');
      setToastMessage(
        (
          t('MyCollabSitesToastMessageLeaveFailedOwner') ||
          'Unable to leave ${site} because you are the owner.'
        ).replace('${site}', selectedCollabSite.name)
      );
    } else if (result.success) {
      setToastSeverity('success');
      setToastMessage(
        (t('MyCollabSitesToastMessageLeaveSuccessful') || 'You have left ${site}.').replace(
          '${site}',
          selectedCollabSite.name
        )
      );
    } else {
      setToastSeverity('error');
      setToastMessage(
        (
          t('MyCollabSitesToastMessageLeaveFailed') || 'Failed to leave ${site}. Please try again.'
        ).replace('${site}', selectedCollabSite.name)
      );
    }
    setToastOpen(true);
  };

  const handleRequestToJoin = async (collabSite: ExploreCollabSiteCard) => {
    setRequestingCollabSiteId(collabSite.id);
    const result = await requestToJoin(collabSite.id);
    setRequestingCollabSiteId(null);

    if (result.success) {
      setToastSeverity('success');
      setToastMessage(
        fields.requestToJoinSuccessMessage?.value ||
          'Your request to join has been submitted. You will be notified when approved.'
      );
    } else {
      setToastSeverity('error');
      setToastMessage(
        fields.requestToJoinFailureMessage?.value ||
          'Something went wrong sending your request. Please try again later.'
      );
    }
    setToastOpen(true);
  };

  const handleToastClose = () => {
    setToastOpen(false);
  };

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    setMyPage(1);
    setExplorePage(1);
  };

  const scrollToTop = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleMyPageChange = (_event: unknown, nextPage: number) => {
    setMyPage(nextPage);
    scrollToTop();
  };

  const handleExplorePageChange = (_event: unknown, nextPage: number) => {
    setExplorePage(nextPage);
    scrollToTop();
  };

  const tabs = [
    { label: fields.tabLabelMyCollabSites },
    { label: fields.tabLabelExploreCollabSites },
  ];

  return (
    <div className={cx('my-collab-sites-area', 'component', props.stylesSXA)}>
      <div className={cx('my-collab-sites-area__container', 'flex flex-col container-sm')}>
        <div className={cx('my-collab-sites-area__header', 'flex items-center gap-4')}>
          <MaterialIcon iconItem={fields.pageHeaderIcon} />
          <Text tag="h1" field={fields.pageHeaderTitle} />
        </div>
        <div
          className={cx('my-collab-sites-area__tabs', 'flex flex-col sm:flex-row gap-4 md:gap-2')}
        >
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={cx(
                'my-collab-sites-area__tab',
                'flex gap-2',
                activeTab === index && 'my-collab-sites-area__tab--active'
              )}
              onClick={() => handleTabChange(index)}
            >
              <Text tag="span" field={tab.label} />
            </button>
          ))}
        </div>

        {isLoading && (
          <div className={cx('my-collab-sites-area__loading', 'flex flex-col gap-4')}>
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} variant="rectangular" width="100%" height={75} />
            ))}
          </div>
        )}

        {!isLoading && activeTab === 0 && (
          <div className="flex flex-col gap-8 md:gap-16">
            {showFindCollabSites && (
              <div
                className={cx(
                  'my-collab-sites-area__find-collab-sites',
                  'flex flex-col gap-4 justify-center'
                )}
              >
                <Text tag="h2" field={fields.emptyStateHeadline} />
                <Text tag="h3" field={fields.emptyStateSubheading} />
                <Text tag="p" field={fields.emptyStateDescription} />
                <button
                  className="asc-btn asc-btn--primary flex justify-center"
                  onClick={() => handleTabChange(1)}
                >
                  <Text tag="span" field={fields.emptyStateCTAButtonText} />
                </button>
              </div>
            )}
            {myCount > 0 && (
              <div
                className={cx(
                  'my-collab-sites-area__my-collab-sites-content',
                  'flex flex-col gap-6'
                )}
              >
                <div className="flex md:justify-end items-center gap-2">
                  <span className={cx('my-collab-sites-area__sort-label')}>{sortByLabel}</span>
                  <select
                    className={cx('my-collab-sites-area__sort-select')}
                    value={sortOption}
                    onChange={(e) => handleSortChange(e.target.value as CollabSiteSortOption)}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {t(opt.dictKey) || opt.fallback}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={cx('my-collab-sites-area__my-collab-sites', 'flex flex-col gap-4')}>
                  {myCollabSites.map((card) => (
                    <div
                      key={card.id}
                      className={cx(
                        'my-collab-sites-area__my-collab-site',
                        'flex gap-4 items-center'
                      )}
                    >
                      <div className={cx('my-collab-sites-area__card-image')}>
                        {card.thumbnailImage?.value?.src ? (
                          <img
                            src={card.thumbnailImage.value.src}
                            alt={
                              typeof card.thumbnailImage.value.alt === 'string'
                                ? card.thumbnailImage.value.alt
                                : card.name
                            }
                          />
                        ) : (
                          <img
                            src={fallbackCollabSiteCardImage?.src}
                            alt={(fallbackCollabSiteCardImage?.alt as string) || ''}
                          />
                        )}
                      </div>
                      <div className="flex flex-col flex-[1_1_80%]">
                        <a
                          href={card.url}
                          className={cx('my-collab-sites-area__my-collab-site-title')}
                        >
                          {card.name}
                        </a>
                        {card.isHidden && (
                          <span className={cx('my-collab-sites-area__hidden-label')}>
                            {hiddenLabel}
                          </span>
                        )}
                        {card.description && <p>{card.description}</p>}
                      </div>
                      <button
                        type="button"
                        className={cx('my-collab-sites-area__my-cta', 'flex items-center')}
                        onClick={() => handleOpenLeaveModal(card)}
                      >
                        <span>{leaveButtonLabel}</span>
                      </button>
                    </div>
                  ))}
                </div>
                {myCount > cardsPerPage && (
                  <div className="flex justify-center">
                    <Pagination count={myPageCount} page={myPage} onChange={handleMyPageChange} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!isLoading && activeTab === 1 && (
          <div
            className={cx('my-collab-sites-area__explore-collab-sites-content', 'flex flex-col')}
          >
            <div className="flex md:justify-end items-center gap-2 mb-4">
              <span className={cx('my-collab-sites-area__sort-label')}>{sortByLabel}</span>
              <select
                className={cx('my-collab-sites-area__sort-select')}
                value={sortOption}
                onChange={(e) => handleSortChange(e.target.value as CollabSiteSortOption)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.dictKey) || opt.fallback}
                  </option>
                ))}
              </select>
            </div>
            <div
              className={cx('my-collab-sites-area__explore-collab-sites', 'flex flex-col gap-4')}
            >
              {exploreCollabSites.map((card) => (
                <div
                  key={card.id}
                  className={cx(
                    'my-collab-sites-area__explore-collab-site',
                    'flex gap-4 items-center'
                  )}
                >
                  <div className={cx('my-collab-sites-area__card-image')}>
                    {card.thumbnailImage?.value?.src ? (
                      <img
                        src={card.thumbnailImage.value.src}
                        alt={
                          typeof card.thumbnailImage.value.alt === 'string'
                            ? card.thumbnailImage.value.alt
                            : card.name
                        }
                      />
                    ) : (
                      <img
                        src={fallbackCollabSiteCardImage?.src}
                        alt={(fallbackCollabSiteCardImage?.alt as string) || ''}
                      />
                    )}
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className={cx('my-collab-sites-area__explore-collab-site-title')}>
                      {card.name}
                    </span>
                    {card.description && <p>{card.description}</p>}
                  </div>
                  <div className="flex justify-end items-center">
                    {card.joinRequestEmails.length > 0 && card.joinRequestStatus === 'pending' ? (
                      <button
                        className={cx(
                          'my-collab-sites-area__explore-cta',
                          'my-collab-sites-area__explore-cta--requested'
                        )}
                        disabled
                      >
                        <span>{requestedButtonLabel}</span>
                      </button>
                    ) : card.joinRequestEmails.length > 0 ? (
                      <button
                        className={cx(
                          'my-collab-sites-area__explore-cta',
                          'asc-btn asc-btn--primary'
                        )}
                        onClick={() => handleRequestToJoin(card)}
                        disabled={requestingCollabSiteId === card.id}
                      >
                        <span>
                          {requestingCollabSiteId === card.id
                            ? sendingButtonLabel
                            : requestButtonLabel}
                        </span>
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
              {exploreCount > cardsPerPage && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    count={explorePageCount}
                    page={explorePage}
                    onChange={handleExplorePageChange}
                  />
                </div>
              )}
            </div>
            {/* Support Contact Banner area — rendered only on the Explore tab */}
            <div className={cx('my-collab-sites-area__support-banner')} />
          </div>
        )}
      </div>

      {leaveModalOpen && selectedCollabSite && (
        <div
          className={cx('my-collab-sites-area__modal-overlay', 'flex justify-center items-center')}
          onClick={handleCloseLeaveModal}
          role="presentation"
        >
          <div
            className={cx('my-collab-sites-area__modal', 'flex flex-col')}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="leave-collab-site-modal-title"
          >
            <div
              className={cx(
                'my-collab-sites-area__modal-header',
                'flex flex-row md:flex-col items-center md:justify-between'
              )}
            >
              <h3>{leaveModalConfirmText.replace('${site}', selectedCollabSite.name)}</h3>
            </div>
            <div
              className={cx('my-collab-sites-area__modal-actions', 'flex gap-10 justify-center')}
            >
              <button
                type="button"
                className={cx('my-collab-sites-area__modal-cancel')}
                onClick={handleCloseLeaveModal}
              >
                <span>{cancelButtonLabel}</span>
              </button>
              <button
                type="button"
                className={cx('my-collab-sites-area__modal-leave')}
                onClick={handleConfirmLeave}
                disabled={isLeaving}
              >
                <span>{isLeaving ? leavingButtonLabel : leaveButtonLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <Snackbar
        open={toastOpen}
        autoHideDuration={5000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          icon={
            <MaterialIcon
              name={toastSeverity === 'success' ? 'CheckCircleOutlined' : 'ErrorOutline'}
            />
          }
          onClose={handleToastClose}
          severity={toastSeverity}
          variant="filled"
        >
          <span>{toastMessage}</span>
        </Alert>
      </Snackbar>
    </div>
  );
};

export default compose<MyCollabSitesAreaProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(MyCollabSitesArea);
