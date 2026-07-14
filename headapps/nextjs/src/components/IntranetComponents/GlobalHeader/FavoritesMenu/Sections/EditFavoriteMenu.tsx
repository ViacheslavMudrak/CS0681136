import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { useI18n } from 'next-localization';
import { JSX, useState } from 'react';

import styles from '../../GlobalHeader.module.scss';
import FavoritesIconList from '../Common/FavoritesIconList';
import { defaultSitecoreFavoriteFolderName } from '../Constants';
import { EditFavoriteMenuProps, EditFavoriteMenuStatics } from './EditFavoriteMenu.types';

const cx = classNames.bind(styles);

const EditFavoriteMenu = ({
  favorite,
  editFavoriteLinkMenuOpen,
  defaultSitecoreFavoriteFolder,
  icons = [],
  isFavoritesModifiedByUser,
  setIsFavoritesModifiedByUser,
  setFavoritesDataLoading,
  setDefaultSitecoreFavoriteFolder,
  handleCloseMenu,
  closeEditFavoriteLinkMenu,
  updateUserFavorite,
  saveDefaultFavoritesToFirebase,
}: EditFavoriteMenuProps): JSX.Element => {
  const { t } = useI18n();
  const editFavoriteCancel = t('EditFavoriteCancel') || EditFavoriteMenuStatics.editFavoriteCancel;
  const editFavoriteSave = t('EditFavoriteSave') || EditFavoriteMenuStatics.editFavoriteSave;

  const [iconList, setIconList] = useState(false);
  const editFavTabId = favorite.id;
  const [editFavTabUrl, setEditFavTabUrl] = useState(favorite.url || '');
  const [editFavTabName, setEditFavTabName] = useState(favorite.name || '');
  const [editFavTabIcon, setEditFavTabIcon] = useState(favorite.icon || 'FavoriteBorderOutlined');

  // URL validator
  const isValidUrl = (value: string) => {
    if (!value) return false;
    try {
      new URL(value);
      return true;
    } catch (e) {
      return false;
    }
  };

  const editFavoriteValid = !!(
    editFavTabName &&
    editFavTabName.trim().length > 0 &&
    editFavTabUrl &&
    editFavTabUrl.trim().length > 0 &&
    isValidUrl(editFavTabUrl)
  );
  const [editUrlTouched, setEditUrlTouched] = useState(false);
  const editUrlInvalid = !!(
    editUrlTouched &&
    editFavTabUrl &&
    editFavTabUrl.trim().length > 0 &&
    !isValidUrl(editFavTabUrl)
  );

  const handleIconListMenu = () => setIconList((prev) => !prev);

  const updateDefaultSitecoreFavoriteFolder = () => {
    if (defaultSitecoreFavoriteFolder && defaultSitecoreFavoriteFolder.links) {
      defaultSitecoreFavoriteFolder.links = defaultSitecoreFavoriteFolder.links.map((link) => {
        if (link.id === editFavTabId) {
          return {
            ...link,
            label: editFavTabName,
            name: editFavTabName,
            url: editFavTabUrl,
            icon: editFavTabIcon,
          };
        }
        return link;
      });
      defaultSitecoreFavoriteFolder.name = defaultSitecoreFavoriteFolderName;
      setDefaultSitecoreFavoriteFolder(defaultSitecoreFavoriteFolder);
    }
  };

  const handleSaveEditedFavorite = () => {
    if (editFavTabId) {
      if (isFavoritesModifiedByUser) {
        updateUserFavorite(editFavTabId, {
          name: editFavTabName,
          url: editFavTabUrl,
          icon: editFavTabIcon,
        });
      } else if (defaultSitecoreFavoriteFolder) {
        updateDefaultSitecoreFavoriteFolder();
        setIsFavoritesModifiedByUser(true);
        saveDefaultFavoritesToFirebase(defaultSitecoreFavoriteFolder);
      }
      closeEditFavoriteLinkMenu();
      setFavoritesDataLoading(true);
    }
  };

  return (
    <div
      className={cx('global-header__edit-favorite-link-menu', 'flex flex-col', {
        'edit-favorite-link-menu-open': editFavoriteLinkMenuOpen,
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
          <span>Edit Favorite</span>
        </div>
        <div className={cx('global-header__close-menu', '')} onClick={handleCloseMenu}>
          <MaterialIcon name="Close" />
        </div>
      </div>
      <div className={cx('global-header__edit-favorite-content', 'flex flex-col gap-8')}>
        <div className="flex flex-col gap-4">
          <span
            className={cx('global-header__edit-content-header', {
              'global-header__error-label': editUrlInvalid,
            })}
          >
            URL*
          </span>
          <input
            type="text"
            placeholder="Enter url..."
            value={editFavTabUrl}
            onChange={(e) => setEditFavTabUrl(e.target.value as string)}
            onBlur={() => setEditUrlTouched(true)}
            aria-invalid={editUrlInvalid}
            className={`${editUrlInvalid ? 'border' : ''} ${editUrlInvalid ? cx('global-header__error-input') : ''}`}
          />
          {editUrlInvalid && (
            <span className={`text-sm mt-1 ${cx('global-header__error-message')}`}>
              {t('NotAValidLink') || 'Not a valid link'}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <span className={cx('global-header__edit-content-header')}>Display name*</span>
          <div className={cx('global-header__edit-favorite-icon', 'flex w-full')}>
            <span className="flex items-center" onClick={handleIconListMenu}>
              <MaterialIcon name={editFavTabIcon} />
            </span>
            <input
              type="text"
              placeholder="Enter display name..."
              value={editFavTabName}
              onChange={(e) => setEditFavTabName(e.target.value as string)}
            />
          </div>
          <span className={cx('global-header__edit-favorite-icon-content')}>
            Click on icon and text to edit
          </span>
        </div>
        {iconList && (
          <>
            <FavoritesIconList
              icons={icons}
              onSelect={(iconName: string) => {
                setEditFavTabIcon(iconName); // update icon
                setIconList(false); // close the icon list
              }}
            />
          </>
        )}
      </div>
      <div className={cx('global-header__menu-footer', 'flex justify-end')}>
        <div
          className={cx('global-header__menu-footer-favorite-buttons', 'flex gap-8 items-center')}
        >
          <button
            className={cx('global-header__menu-footer-cancel-button')}
            onClick={closeEditFavoriteLinkMenu}
          >
            <span>{editFavoriteCancel}</span>
          </button>
          <button
            onClick={() => handleSaveEditedFavorite()}
            disabled={!editFavoriteValid}
            className={`${!editFavoriteValid ? 'cursor-not-allowed opacity-50 pointer-events-none' : ''}`}
          >
            <span>{editFavoriteSave}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFavoriteMenu;
