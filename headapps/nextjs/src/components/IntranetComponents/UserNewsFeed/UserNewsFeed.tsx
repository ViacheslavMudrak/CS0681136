import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import useEmblaCarousel from 'embla-carousel-react';
import compose from 'lib/enhancers/compose';
import { withJumplink } from 'lib/enhancers/withJumplink';
import withStyles from 'lib/enhancers/withStyles';
import { useUserPreferences } from 'lib/firebase';
import { useNewsFeed } from 'lib/news/use-news-feed';
import { useSession } from 'next-auth/react';
import { useI18n } from 'next-localization';
import { JSX, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MediaQueryConstants } from 'src/util/const/material';
import { formatDate } from 'src/util/helpers/date-helper';
import { log } from 'src/util/helpers/log-helper';
import { TagItem } from 'ts/common-sitecore-field-types';

import { withDatasourceCheck, Text, Image, useSitecore, Link } from '@sitecore-content-sdk/nextjs';
import type { ImageField } from '@sitecore-content-sdk/nextjs';
import Skeleton from '@mui/material/Skeleton';
import useMediaQuery from '@mui/material/useMediaQuery';

import styles from './UserNewsFeed.module.scss';
import { UserNewsFeedProps, UserNewsFeedStatics } from './UserNewsFeed.types';

const cx = classNames.bind(styles);

const UserNewsFeed = (props: UserNewsFeedProps): JSX.Element => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const { t } = useI18n();
  const newsLookupRange = fields?.newsLookupRange?.value || 14;

  const { data: session, status: sessionStatus } = useSession();
  const { newsFeedTags, saveNewsFeedTags } = useUserPreferences();

  const homePageId = page.layout.sitecore.context.homePageId;
  const contextSiteLanguage = page.layout.sitecore.context.language || 'en';

  const newsPlaceholderImage: ImageField = page.layout.sitecore.context.defaultImages
    ?.newsListingSearchPlaceholderImage ?? { value: {} };

  // Get system news tag IDs as fallback
  const systemNewsTagIds = useMemo(
    () => fields.systemNewsTags?.map((tag) => tag.id) || [],
    [fields.systemNewsTags]
  );

  // Fetch news articles using the custom hook
  const { articles: userNewsFeedArticles, isLoading: isLoadingArticles } = useNewsFeed({
    tags: newsFeedTags,
    homePageId: homePageId || '',
    language: contextSiteLanguage,
    lookupRange: newsLookupRange,
    systemNewsTags: systemNewsTagIds,
  });

  const count = userNewsFeedArticles.length;
  const isMobile = useMediaQuery(MediaQueryConstants.Mobile);

  const enableCarousel = (isMobile && count > 1) || (!isMobile && count > 4);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    dragFree: false,
    loop: false,
    containScroll: 'trimSnaps',
    align: 'start',
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const [selectedTags, setSelectedTags] = useState<TagItem[]>([]);
  const [tagsModal, setTagsModal] = useState(false);
  const shouldSyncFromFirestore = useRef(true); // Track if we should sync from Firestore
  const openTagsModal = () => {
    setTagsModal(true);
    shouldSyncFromFirestore.current = true; // Reset flag when modal opens
  };
  const closeTagsModal = () => setTagsModal(false);

  const allSelectableTags: TagItem[] = useMemo(() => {
    const orderedGlobalTags = [...(fields.globalTags ?? [])].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    const allTags = [...orderedGlobalTags];
    return allTags;
  }, [fields.globalTags]);

  // Get array of selectable tag IDs for comparison
  const selectableTagIds = useMemo(() => {
    return new Set(allSelectableTags.map((tag) => tag.id));
  }, [allSelectableTags]);

  const [isSaving, setIsSaving] = useState(false);

  // Clean up stale tags from Firestore if they no longer exist in selectable tags
  useEffect(() => {
    if (
      newsFeedTags &&
      Array.isArray(newsFeedTags) &&
      newsFeedTags.length > 0 &&
      selectableTagIds.size > 0 &&
      sessionStatus !== 'loading'
    ) {
      const staleTags = newsFeedTags.filter((tagId) => !selectableTagIds.has(tagId));

      if (staleTags.length > 0) {
        const cleanedTags = newsFeedTags.filter((tagId) => selectableTagIds.has(tagId));
        if (session?.user) {
          saveNewsFeedTags(cleanedTags).catch((error) => {
            log('ERROR', 'UserNewsFeed', 'Failed to clean up stale tags', {
              error: error instanceof Error ? error.message : String(error),
            });
          });
        }
      }
    }
  }, [newsFeedTags, selectableTagIds, session?.user, sessionStatus, saveNewsFeedTags]);

  // Load tags from Firestore when modal opens OR when newsFeedTags loads while modal is open
  // This handles the case where modal opens before newsFeedTags has loaded from SWR
  useEffect(() => {
    if (tagsModal && shouldSyncFromFirestore.current) {
      // Initialize selectedTags from saved tags when modal opens or when tags load
      if (newsFeedTags && Array.isArray(newsFeedTags) && newsFeedTags.length > 0) {
        const selectedTagItems = allSelectableTags.filter((tag) => newsFeedTags.includes(tag.id));
        setSelectedTags(selectedTagItems);
        shouldSyncFromFirestore.current = false; // Don't sync again until modal reopens
      } else if (newsFeedTags === null) {
        // Only clear if we know tags are null (not just undefined/loading)
        // This prevents clearing user selections while tags are still loading
        setSelectedTags([]);
        shouldSyncFromFirestore.current = false; // Don't sync again until modal reopens
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagsModal, newsFeedTags]); // Watch both modal state and tags - sync when tags load while modal is open

  const selectedCount = selectedTags.length;

  const updateSelectedTags = (tag: TagItem, checked: boolean) => {
    shouldSyncFromFirestore.current = false; // User is making changes, don't sync from Firestore
    if (checked) {
      setSelectedTags((prev) => {
        if (prev.some((t) => t.id === tag.id)) {
          return prev;
        }
        return [...prev, tag];
      });
    } else {
      setSelectedTags((prev) => prev.filter((t) => t.id !== tag.id));
    }
  };

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setActiveIndex(emblaApi.selectedScrollSnap());
      setAtStart(!emblaApi.canScrollPrev());
      setAtEnd(!emblaApi.canScrollNext());
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    if (isMobile) return emblaApi.scrollPrev();

    const current = emblaApi.selectedScrollSnap();
    emblaApi.scrollTo(Math.max(current - 4, 0));
  }, [emblaApi, isMobile]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    if (isMobile) return emblaApi.scrollNext();

    const snaps = emblaApi.scrollSnapList();
    const current = emblaApi.selectedScrollSnap();
    emblaApi.scrollTo(Math.min(current + 4, snaps.length - 1));
  }, [emblaApi, isMobile]);

  useEffect(() => {
    if (tagsModal) {
      const scrollY = window.scrollY;

      document.body.dataset.scrollY = String(scrollY);

      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
    } else {
      const storedY = document.body.dataset.scrollY;

      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';

      if (storedY) {
        window.scrollTo(0, parseInt(storedY));
        delete document.body.dataset.scrollY;
      }
    }
  }, [tagsModal]);

  useEffect(() => {
    const forceClose = () => closeTagsModal();
    window.addEventListener('resize', forceClose);
    return () => window.removeEventListener('resize', forceClose);
  }, []);

  if (page.mode.isEditing) {
    return (
      <div
        className={cx('user-news-feed', 'component container', props.stylesSXA)}
        id={rendering.params?.RenderingIdentifier}
      >
        <p>{t('UserNewsFeedEditModeMessage') || UserNewsFeedStatics.editingEmptyNote}</p>
      </div>
    );
  }
  return (
    <>
      <div
        className={cx('user-news-feed', 'component container', props.stylesSXA)}
        id={rendering.params?.RenderingIdentifier}
      >
        <div className={cx('user-news-feed__grid', 'gap-y-0 gap-x-8')}>
          <div className={cx('user-news-feed__header-left', 'flex gap-4 items-center')}>
            <MaterialIcon name="Campaign" />
            <Text className={cx('uppercase')} field={fields.newsFeedTitle} tag="h2" editable />

            <div className={cx('user-news-feed__edit')} onClick={openTagsModal}>
              <MaterialIcon name="Edit" />
            </div>
          </div>

          <div className={cx('user-news-feed__header-center', 'flex gap-4 justify-end')}>
            <a
              href={page.layout.sitecore.context.landingPageSettings?.newsLandingPage?.url}
              className={cx('flex items-center')}
            >
              {fields?.seeAllLinkText?.value}
              <MaterialIcon name="East" />
            </a>
          </div>

          <div
            className={cx(
              'user-news-feed__header-right',
              'flex gap-4 items-center justify-between'
            )}
          >
            {enableCarousel && (
              <>
                {isMobile && (
                  <span className="flex text-sm text-brand-gray-600">
                    {activeIndex + 1} of {count}
                  </span>
                )}

                <div className={cx('user-news-feed__controls-container', 'flex gap-4')}>
                  <button
                    onClick={scrollPrev}
                    className={cx('user-news-feed__control', { disabled: atStart })}
                  >
                    <MaterialIcon name="ChevronLeft" />
                  </button>

                  <button
                    onClick={scrollNext}
                    className={cx('user-news-feed__control', { disabled: atEnd })}
                  >
                    <MaterialIcon name="ChevronRight" />
                  </button>
                </div>
              </>
            )}
          </div>
          <div className={cx('user-news-feed__header-bottom', 'flex gap-4 items-center')}>
            <div>
              <Text className="mr-1" field={fields?.newsFeedSubtitle} tag="span" />
              <Link field={fields?.accountPageLInk} />
            </div>
          </div>

          {isLoadingArticles ? (
            // Loading skeleton state
            enableCarousel ? (
              <div
                ref={emblaRef}
                className={cx('user-news-feed__carousel-embla', 'overflow-hidden')}
              >
                <div className={cx('user-news-feed__carousel-track', 'flex')}>
                  {[...Array(4)].map((_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className={cx(
                        'user-news-feed__card',
                        'flex flex-col gap-4',
                        isMobile ? 'flex-[0_0_100%]' : 'flex-[0_0_25%]'
                      )}
                    >
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={200}
                        className={cx('user-news-feed__card-image')}
                      />
                      <Skeleton variant="text" width="100%" height={32} className="mt-6" />
                      <Skeleton variant="text" width="60%" height={24} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={cx('user-news-feed__card-container', 'flex gap-4')}>
                {[...Array(4)].map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className={cx('user-news-feed__card', 'flex flex-col gap-4 flex-[1_1_25%]')}
                  >
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={200}
                      className={cx('user-news-feed__card-image')}
                    />
                    <Skeleton variant="text" width="100%" height={32} className="mt-6" />
                    <Skeleton variant="text" width="60%" height={24} />
                  </div>
                ))}
              </div>
            )
          ) : enableCarousel ? (
            <div ref={emblaRef} className={cx('user-news-feed__carousel-embla', 'overflow-hidden')}>
              <div className={cx('user-news-feed__carousel-track', 'flex')}>
                {userNewsFeedArticles.map((newsItem, index) => (
                  <div
                    key={index}
                    className={cx(
                      'user-news-feed__card',
                      'flex flex-col gap-4',
                      isMobile ? 'flex-[0_0_100%]' : 'flex-[0_0_25%]'
                    )}
                  >
                    <a className={cx('user-news-feed__card-image')} href={newsItem.url.path}>
                      <Image
                        field={
                          newsItem.thumbnail?.jsonValue?.value?.src
                            ? newsItem.thumbnail.jsonValue
                            : newsPlaceholderImage
                        }
                      />
                    </a>

                    <h3>
                      <a className="hover:underline" href={newsItem.url.path}>
                        {newsItem.title.value}
                      </a>
                    </h3>

                    <span className={cx('user-news-feed__published-date')}>
                      {formatDate(newsItem.publishDate.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={cx('user-news-feed__card-container', 'flex gap-4')}>
              {userNewsFeedArticles.map((newsItem, index) => (
                <div
                  key={index}
                  className={cx('user-news-feed__card', 'flex flex-col gap-4 flex-[1_1_25%]')}
                >
                  <a className={cx('user-news-feed__card-image')} href={newsItem.url.path}>
                    <Image field={newsItem.thumbnail.jsonValue} />
                  </a>

                  <h3 className="mt-6">
                    <a className="hover:underline" href={newsItem.url.path}>
                      {newsItem.title.value}
                    </a>
                  </h3>

                  <span className={cx('user-news-feed__published-date')}>
                    {formatDate(newsItem.publishDate.value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {tagsModal && (
        <div className={cx('user-news-feed-modal', 'fixed')}>
          <div
            className={cx('user-news-feed-modal__content-container', 'flex flex-col gap-4 h-full')}
          >
            <div className={cx('user-news-feed-modal__header', 'flex flex-col gap-4')}>
              <Text tag="h5" field={fields.modalTitle} />
              <Text tag="p" field={fields.modalInstructions} />
              {selectedTags.length > 0 && (
                <div className={cx('user-news-feed-modal__filter-content', 'flex flex-col')}>
                  <div className={cx('user-news-feed-modal__selected', 'flex gap-2 items-center')}>
                    <h6>
                      {t('UserNewsFeedSelectedTagsTitle') ||
                        UserNewsFeedStatics.UserNewsFeedSelectedTagsTitle}
                    </h6>
                    {selectedCount > 0 && (
                      <span className={cx('user-news-feed-modal__selected-count')}>
                        {selectedCount}
                      </span>
                    )}
                  </div>
                  <div className={cx('user-news-feed-modal__filter-pills', 'flex flex-wrap gap-4')}>
                    {selectedTags.map((tag, i) => (
                      <div key={`selected-${tag.id}-${i}`} className="flex gap-2 items-center">
                        {tag.fields?.title?.value || tag.name}
                        <span onClick={() => updateSelectedTags(tag, false)}>
                          <MaterialIcon name="Close" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div
              className={cx('user-news-feed-modal__content', 'flex flex-col gap-6 overflow-auto')}
            >
              <div className={cx('user-news-feed-modal__filter', 'flex flex-col gap-2')}>
                <h6 className="font-semibold">{fields.tagsHeadingText?.value}</h6>

                {allSelectableTags.map((tag, tagIndex) => {
                  const value = tag.fields?.title?.value || tag.name;
                  const checked =
                    selectedTags?.some((selectedTag) => selectedTag.id === tag.id) || false;

                  return (
                    <label key={tagIndex} className="flex gap-2 items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          updateSelectedTags(tag, e.target.checked);
                        }}
                      />
                      <span
                        className={cx('user-news-feed-modal__filter-label', {
                          'user-news-feed-modal__filter-label--checked': checked,
                        })}
                      >
                        {value}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className={cx('user-news-feed-modal__footer', 'flex justify-end gap-8')}>
              <div className={cx('user-news-feed-modal__footer-buttons')}>
                <button className="asc-btn" onClick={closeTagsModal} disabled={isSaving}>
                  {t('UserNewsFeedCancelText') || UserNewsFeedStatics.UserNewsFeedCancelText}
                </button>

                <button
                  className="asc-btn"
                  onClick={async () => {
                    if (!session?.user) {
                      // Handle unauthenticated user - could show login modal
                      alert('Please sign in to save your preferences');
                      return;
                    }

                    try {
                      setIsSaving(true);
                      // Save tag IDs as string array for Firestore
                      const tagIds = selectedTags.map((tag) => tag.id);
                      await saveNewsFeedTags(tagIds);
                      // After successful save, the hook will update newsFeedTags, which will sync on next modal open
                      closeTagsModal();
                    } catch (error) {
                      // Error is already set in the hook
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving}
                >
                  {isSaving
                    ? t('UserNewsFeedSavingChangesText') ||
                      UserNewsFeedStatics.UserNewsFeedSavingChangesText
                    : t('UserNewsFeedSaveChangesText') ||
                      UserNewsFeedStatics.UserNewsFeedSaveChangesText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default compose<UserNewsFeedProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(UserNewsFeed);
