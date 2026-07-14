import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { FavoriteInput } from 'lib/firebase/types';
import { useI18n } from 'next-localization';
import { JSX, useEffect, useState } from 'react';

import styles from '../../GlobalHeader.module.scss';
import FavoritesIconList from '../Common/FavoritesIconList';
import { AddFavoriteMenuProps, AddFavoriteMenuStatics } from './AddFavoriteMenu.types';
import { Link } from '@sitecore-content-sdk/nextjs';

const cx = classNames.bind(styles);

const AddFavoriteMenu = ({
  recommendedFavorites,
  favoriteFolders,
  unassignedLinks,
  icons = [],
  addFavoriteMenuOpen,
  isFavoritesModifiedByUser,
  browseAllApplicationsLink,
  setIsFavoritesModifiedByUser,
  setFavoritesDataLoading,
  handleCloseMenu,
  closeAddFavoriteMenu,
  createUserFavorite,
  saveDefaultFavoritesToFirebase,
}: AddFavoriteMenuProps): JSX.Element => {
  const { t } = useI18n();
  const addFavoriteHeader = t('AddFavoriteHeader') || AddFavoriteMenuStatics.addFavoriteHeader;
  const addFavoriteCancel = t('AddFavoriteCancel') || AddFavoriteMenuStatics.addFavoriteCancel;
  const addFavoriteSave = t('AddFavoriteSave') || AddFavoriteMenuStatics.addFavoriteSave;
  const addFavoriteTab1 = t('AddFavoriteTab1') || AddFavoriteMenuStatics.addFavoriteTab1;
  const addFavoriteTab2 = t('AddFavoriteTab2') || AddFavoriteMenuStatics.addFavoriteTab2;
  const addFavoriteTab3 = t('AddFavoriteTab3') || AddFavoriteMenuStatics.addFavoriteTab3;
  const addFavoriteDisplayname =
    t('AddFavoriteDisplayname') || AddFavoriteMenuStatics.addFavoriteDisplayname;
  const addFavoriteFolderLabel =
    t('AddFavoriteFolderLabel') || AddFavoriteMenuStatics.addFavoriteFolderLabel;
  const addFavoriteFolderOptional =
    t('AddFavoriteFolderOptional') || AddFavoriteMenuStatics.addFavoriteFolderOptional;
  const addFavoriteUrlLabel =
    t('AddFavoriteUrlLabel') || AddFavoriteMenuStatics.addFavoriteUrlLabel;
  const selectIconHelperText =
    t('SelectIconHelperText') || AddFavoriteMenuStatics.selectIconHelperText;
  const selectFolderDefaultOption =
    t('SelectFolderDefaultOption') || AddFavoriteMenuStatics.selectFolderDefaultOption;
  const favoriteUrlTextboxPlaceholderText =
    t('FavoriteUrlTextboxPlaceholderText') ||
    AddFavoriteMenuStatics.favoriteUrlTextboxPlaceholderText;
  const favoriteNameTextboxPlaceholderText =
    t('FavoriteNameTextboxPlaceholderText') ||
    AddFavoriteMenuStatics.favoriteNameTextboxPlaceholderText;
  const urlInavalidMessage =
    t('FavoriteUrlInvalidMessage') || AddFavoriteMenuStatics.favoriteUrlInvalidMessage;

  const [activeTab, setActiveTab] = useState<'current' | 'recommended' | 'custom'>('current');
  const currentPageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const [currentFavTabUrl, setCurrentFavTabUrl] = useState(currentPageUrl);
  const [currentFavTabName, setCurrentFavTabName] = useState('');
  const [currentFavTabIcon, setCurrentFavTabIcon] = useState('FavoriteBorderOutlined');
  const [currentFavTabFolder, setCurrentFavTabFolder] = useState('');

  const [customFavTabUrl, setCustomFavTabUrl] = useState('');
  const [customFavTabName, setCustomFavTabName] = useState('');
  const [customFavTabIcon, setCustomFavTabIcon] = useState('FavoriteBorderOutlined');
  const [customFavTabFolder, setCustomFavTabFolder] = useState('');

  const isValidUrl = (value: string) => {
    if (!value) return false;
    try {
      new URL(value);
      return true;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    const updateUrl = () => setCurrentFavTabUrl(window.location.href);

    window.addEventListener('popstate', updateUrl);

    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = (...args) => {
      originalPushState(...args);
      updateUrl();
    };
    history.replaceState = (...args) => {
      originalReplaceState(...args);
      updateUrl();
    };

    return () => {
      window.removeEventListener('popstate', updateUrl);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  // Derived validation for Add Favorite (current/custom tabs)
  const canSaveFavorite = (() => {
    if (activeTab === 'recommended') return false;
    const isCurrent = activeTab === 'current';
    const name = isCurrent ? currentFavTabName : customFavTabName;
    const url = isCurrent ? currentFavTabUrl : customFavTabUrl;
    const icon = isCurrent ? currentFavTabIcon : customFavTabIcon;
    return !!(
      name &&
      name.trim().length > 0 &&
      url &&
      url.trim().length > 0 &&
      icon &&
      icon.trim().length > 0 &&
      isValidUrl(url)
    );
  })();

  // show validation only after the user has left (blur) the field
  const [customUrlTouched, setCustomUrlTouched] = useState(false);

  const customUrlInvalid = !!(
    customUrlTouched &&
    customFavTabUrl &&
    customFavTabUrl.trim().length > 0 &&
    !isValidUrl(customFavTabUrl)
  );

  const [customFavoriteIconList, setCustomFavoriteIconList] = useState(false);
  const [currentFavoriteIconList, setCurrentFavoriteIconList] = useState(false);
  const handleAddFavoriteIconListMenu = () => setCurrentFavoriteIconList((prev) => !prev);
  const handleCustomFavoriteIconListMenu = () => setCustomFavoriteIconList((prev) => !prev);

  const handleEditFavoriteUrl = (tab: string, url: string) => {
    if (tab === 'current') {
      setCurrentFavTabUrl(url);
    } else if (tab === 'custom') {
      setCustomFavTabUrl(url);
    }
  };

  const handleEditFavoriteName = (tab: string, name: string) => {
    if (tab === 'current') {
      setCurrentFavTabName(name);
    } else if (tab === 'custom') {
      setCustomFavTabName(name);
    }
  };

  const handleEditFavoriteFolder = (tab: string, folder: string) => {
    if (tab === 'current') {
      setCurrentFavTabFolder(folder);
    } else if (tab === 'custom') {
      setCustomFavTabFolder(folder);
    }
  };

  const handleEditFavoriteIcon = (tab: string, icon: string) => {
    if (tab === 'current') {
      setCurrentFavTabIcon(icon);
    } else if (tab === 'custom') {
      setCustomFavTabIcon(icon);
    }
  };

  const handleRecommendedFavorite = (name: string, url: string) => {
    setActiveTab('custom');
    setCustomFavTabName(name ?? '');
    setCustomFavTabUrl(url ?? '');
  };

  const resetFavoriteTab = (tab: string) => {
    if (tab === 'current') {
      setCurrentFavTabUrl(currentPageUrl);
      setCurrentFavTabName('');
      setCurrentFavTabIcon('FavoriteBorderOutlined');
      setCurrentFavTabFolder('');
    } else if (tab === 'custom') {
      setCustomFavTabUrl('');
      setCustomFavTabName('');
      setCustomFavTabIcon('FavoriteBorderOutlined');
      setCustomFavTabFolder('');
    }
  };

  const resetAddFavoriteState = () => {
    resetFavoriteTab(activeTab);
    setActiveTab('current');
  };

  const handleHeaderClose = () => {
    resetAddFavoriteState();
    handleCloseMenu();
  };

  const handleCancel = () => {
    resetAddFavoriteState();
    closeAddFavoriteMenu();
  };

  const handleFavoriteSave = (tab: string) => {
    let myFavorite: FavoriteInput;
    if (tab === 'current' || tab === 'custom') {
      const isCurrentTab = tab === 'current';
      const name = isCurrentTab ? currentFavTabName : customFavTabName;
      const url = isCurrentTab ? currentFavTabUrl : customFavTabUrl;
      const icon = isCurrentTab ? currentFavTabIcon : customFavTabIcon;
      const folder = isCurrentTab ? currentFavTabFolder : customFavTabFolder;
      let order = unassignedLinks ? unassignedLinks?.length + 1 : 1;
      if (folder) {
        const favFolder = favoriteFolders?.find((f) => f.id === folder);
        if (favFolder && favFolder.links && favFolder.links?.length > 0) {
          order = favFolder.links?.length;
        }
      }
      if (name && url && icon) {
        myFavorite = {
          name: name,
          url: url,
          icon: icon,
          order: order,
          folder: folder,
        };
        createUserFavorite(myFavorite);
        if (!isFavoritesModifiedByUser) {
          setIsFavoritesModifiedByUser(true);
          saveDefaultFavoritesToFirebase();
        }
      }
    }
    resetFavoriteTab(tab);
    closeAddFavoriteMenu();
    setFavoritesDataLoading(true);
  };

  return (
    <div
      className={cx('global-header__add-favorite-menu', 'flex flex-col', {
        'add-favorite-menu-open': addFavoriteMenuOpen,
      })}
    >
      <div
        className={cx(
          'global-header__menu-header',
          'favorites-menu-header',
          'flex items-center justify-between'
        )}
      >
        <div className="flex gap-2 items-center">
          <span>{addFavoriteHeader}</span>
        </div>
        <div className={cx('global-header__close-menu', '')} onClick={handleHeaderClose}>
          <MaterialIcon name="Close" />
        </div>
      </div>
      <div className={cx('global-header__add-favorite-content', 'flex flex-col')}>
        {/* this is the add favorite tabs*/}
        <ul className={cx('global-header__add-favorite-tabs', 'flex justify-between items-center')}>
          <li
            className={cx({ active: activeTab === 'current' })}
            onClick={() => setActiveTab('current')}
          >
            {addFavoriteTab1}
          </li>

          <li
            className={cx({ active: activeTab === 'recommended' })}
            onClick={() => setActiveTab('recommended')}
          >
            {addFavoriteTab2}
          </li>

          <li
            className={cx({ active: activeTab === 'custom' })}
            onClick={() => setActiveTab('custom')}
          >
            {addFavoriteTab3}
          </li>
        </ul>
        {/* this is the add favorite tab content*/}
        {activeTab === 'current' && (
          <div className={cx('global-header__current-page-content', 'flex flex-col gap-8')}>
            <div className="flex flex-col gap-4">
              <span className={cx('global-header__current-page-content-header')}>{}</span>
              <input
                value={currentFavTabUrl}
                type="text"
                readOnly
                aria-readonly="true"
                className={cx('global-header__input-readonly')}
                placeholder={favoriteUrlTextboxPlaceholderText}
              />
            </div>

            <div className="flex flex-col gap-4">
              <span className={cx('global-header__current-page-content-header')}>
                {addFavoriteDisplayname}
              </span>
              <div className={cx('global-header__add-favorite-icon', 'flex w-full')}>
                <span className="flex items-center" onClick={handleAddFavoriteIconListMenu}>
                  <MaterialIcon name={currentFavTabIcon} />
                </span>
                <input
                  type="text"
                  placeholder={favoriteNameTextboxPlaceholderText}
                  value={currentFavTabName}
                  onChange={(e) => handleEditFavoriteName(activeTab, e.target.value as string)}
                />
              </div>
              <span className={cx('global-header__add-favorite-icon-content')}>
                {selectIconHelperText}
              </span>
            </div>

            {currentFavoriteIconList && (
              <>
                <FavoritesIconList
                  icons={icons}
                  onSelect={(iconName: string) => {
                    handleEditFavoriteIcon(activeTab, iconName);
                    setCurrentFavoriteIconList(false); // close the icon list
                  }}
                />
              </>
            )}

            <div className="flex flex-col gap-4">
              <label
                className={cx('global-header__current-page-content-header')}
                htmlFor="optional-folder"
              >
                {addFavoriteFolderLabel} <span>{addFavoriteFolderOptional}</span>
              </label>
              <select
                className={cx('global-header__add-favorite-optional-folder')}
                name="optional-folder"
                id="optional-folder"
                value={currentFavTabFolder}
                onChange={(e) => handleEditFavoriteFolder(activeTab, e.target.value)}
              >
                <option value="">{selectFolderDefaultOption}</option>
                {favoriteFolders &&
                  favoriteFolders.map((item, index) => (
                    <option key={index} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        )}

        {activeTab === 'recommended' && (
          <div className={cx('global-header__recommended-content')}>
            {browseAllApplicationsLink && (
              <div className={cx('global-header__browse-all-container')}>
                <Link
                  field={browseAllApplicationsLink}
                  className={cx('global-header__browse-all-applications-link')}
                  onClick={handleHeaderClose}
                >
                  <>
                    {browseAllApplicationsLink?.value?.text}
                    <span className={cx('global-header__browse-all-applications-link-icon')}>
                      <MaterialIcon name="East" />
                    </span>
                  </>
                </Link>
              </div>
            )}
            {recommendedFavorites &&
              recommendedFavorites.targetItems &&
              recommendedFavorites.targetItems.length > 0 &&
              recommendedFavorites.targetItems.map((_item, index) => {
                return (
                  <div
                    key={index}
                    className={cx('global-header__recommended-favorite', 'flex justify-between')}
                  >
                    <div className="flex gap-2">
                      <MaterialIcon name={_item?.icon?.targetItem?.value?.value ?? ''} />
                      <span>{_item?.name}</span>
                    </div>
                    <div
                      onClick={() =>
                        handleRecommendedFavorite(_item?.name ?? '', _item?.url?.url ?? '')
                      }
                    >
                      <MaterialIcon name="FavoriteBorderOutlined" />
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {activeTab === 'custom' && (
          <div className={cx('global-header__current-page-content', 'flex flex-col gap-8')}>
            <div className="flex flex-col gap-4">
              <span
                className={cx('global-header__current-page-content-header', {
                  'global-header__error-label': customUrlInvalid,
                })}
              >
                {addFavoriteUrlLabel}
              </span>
              <input
                type="text"
                placeholder={favoriteUrlTextboxPlaceholderText}
                value={customFavTabUrl}
                onChange={(e) => handleEditFavoriteUrl(activeTab, e.target.value as string)}
                onBlur={() => setCustomUrlTouched(true)}
                aria-invalid={customUrlInvalid}
                className={`${customUrlInvalid ? 'border' : ''} ${customUrlInvalid ? cx('global-header__error-input') : ''}`}
              />
              {customUrlInvalid && (
                <span className={`text-sm mt-1 ${cx('global-header__error-message')}`}>
                  {urlInavalidMessage}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <span className={cx('global-header__current-page-content-header')}>
                {addFavoriteDisplayname}
              </span>
              <div className={cx('global-header__add-favorite-icon', 'flex w-full')}>
                <span className="flex items-center" onClick={handleCustomFavoriteIconListMenu}>
                  <MaterialIcon name={customFavTabIcon} />
                </span>
                <input
                  type="text"
                  placeholder={favoriteNameTextboxPlaceholderText}
                  value={customFavTabName}
                  onChange={(e) => handleEditFavoriteName(activeTab, e.target.value as string)}
                />
              </div>
              <span className={cx('global-header__custom-favorite-icon-content')}>
                {selectIconHelperText}
              </span>
            </div>

            {customFavoriteIconList && (
              <>
                <FavoritesIconList
                  icons={icons}
                  onSelect={(iconName: string) => {
                    handleEditFavoriteIcon(activeTab, iconName);
                    setCustomFavoriteIconList(false); // close the icon list
                  }}
                />
              </>
            )}

            <div className="flex flex-col gap-4">
              <label
                className={cx('global-header__current-page-content-header')}
                htmlFor="optional-folder"
              >
                {addFavoriteFolderLabel} <span>{addFavoriteFolderOptional}</span>
              </label>
              <select
                className={cx('global-header__custom-favorite-optional-folder')}
                name="optional-folder"
                id="optional-folder"
                value={customFavTabFolder}
                onChange={(e) => handleEditFavoriteFolder(activeTab, e.target.value)}
              >
                <option value="">{selectFolderDefaultOption}</option>
                {favoriteFolders &&
                  favoriteFolders.map((item, index) => (
                    <option key={index} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        )}
      </div>
      <div className={cx('global-header__menu-footer', 'flex justify-end')}>
        <div
          className={cx('global-header__menu-footer-favorite-buttons', 'flex gap-8 items-center')}
        >
          <button className={cx('global-header__menu-footer-cancel-button')} onClick={handleCancel}>
            <span>{addFavoriteCancel}</span>
          </button>
          {activeTab !== 'recommended' && (
            <button
              disabled={!canSaveFavorite}
              className={`${!canSaveFavorite ? 'cursor-not-allowed opacity-50 pointer-events-none' : ''}`}
              onClick={() => {
                handleFavoriteSave(activeTab);
              }}
            >
              <span>{addFavoriteSave}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddFavoriteMenu;
