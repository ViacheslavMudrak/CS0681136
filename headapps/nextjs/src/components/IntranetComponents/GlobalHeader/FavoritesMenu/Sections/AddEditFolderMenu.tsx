import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { useI18n } from 'next-localization';
import { JSX, useState } from 'react';

import styles from '../../GlobalHeader.module.scss';
import { AddEditFolderMenuProps, AddEditFolderMenuStatics } from './AddEditFolderMenu.types';

const cx = classNames.bind(styles);

const AddEditFolderMenu = ({
  favoriteFolders,
  isCreateFolderMode,
  createFolderMenuOpen,
  editFolderMenuOpen,
  folderName,
  folderId,
  defaultSitecoreFavoriteFolder,
  isFavoritesModifiedByUser,
  setIsFavoritesModifiedByUser,
  setFavoritesDataLoading,
  setDefaultSitecoreFavoriteFolder,
  handleCloseMenu,
  closeCreateFolderMenu,
  closeEditFolderMenu,
  createUserFavoriteFolder,
  updateUserFavoriteFolder,
  saveDefaultFavoritesToFirebase,
}: AddEditFolderMenuProps): JSX.Element => {
  const { t } = useI18n();
  const editFolderHeader = t('EditFolderHeader') || AddEditFolderMenuStatics.editFolderHeader;
  const editFolderContent = t('EditFolderContent') || AddEditFolderMenuStatics.editFolderContent;
  const editFolderCancel = t('EditFolderCancel') || AddEditFolderMenuStatics.editFolderCancel;
  const editFolderSave = t('EditFolderSave') || AddEditFolderMenuStatics.editFolderSave;
  const createFolderHeader = t('CreateFolderHeader') || AddEditFolderMenuStatics.createFolderHeader;
  const createFolderContent =
    t('CreateFolderContent') || AddEditFolderMenuStatics.createFolderContent;
  const createFolderCancel = t('CreateFolderCancel') || AddEditFolderMenuStatics.createFolderCancel;
  const createFolderSave = t('CreateFolderSave') || AddEditFolderMenuStatics.createFolderSave;

  const [favoriteFolderName, setFavoriteFolderName] = useState(folderName || '');
  const folderNameValid = favoriteFolderName && favoriteFolderName.trim().length > 0;

  const handleCancelFolderMenu = () => {
    setFavoriteFolderName('');
    if (isCreateFolderMode) {
      closeCreateFolderMenu();
    } else {
      closeEditFolderMenu();
    }
  };

  const handleSaveFolder = () => {
    if (favoriteFolderName) {
      const order =
        isFavoritesModifiedByUser && favoriteFolders
          ? favoriteFolders?.length + 1
          : isCreateFolderMode &&
              defaultSitecoreFavoriteFolder &&
              defaultSitecoreFavoriteFolder?.order
            ? defaultSitecoreFavoriteFolder?.order + 1
            : 1;
      if (folderId && !isCreateFolderMode) {
        updateUserFavoriteFolder(folderId, { name: favoriteFolderName });
      } else {
        createUserFavoriteFolder({ name: favoriteFolderName, order });
      }
      if (!isFavoritesModifiedByUser && defaultSitecoreFavoriteFolder) {
        defaultSitecoreFavoriteFolder.name = isCreateFolderMode
          ? defaultSitecoreFavoriteFolder.name
          : favoriteFolderName;
        setDefaultSitecoreFavoriteFolder(defaultSitecoreFavoriteFolder);
        setIsFavoritesModifiedByUser(true);
        saveDefaultFavoritesToFirebase();
      }
      setFavoriteFolderName('');
      if (isCreateFolderMode) {
        closeCreateFolderMenu();
      } else {
        closeEditFolderMenu();
      }
      setFavoritesDataLoading(true);
    }
  };

  return (
    <div
      className={cx(
        isCreateFolderMode
          ? 'global-header__create-folder-menu'
          : 'global-header__edit-folder-menu',
        'flex flex-col',
        isCreateFolderMode
          ? {
              'create-folder-menu-open': createFolderMenuOpen,
            }
          : {
              'edit-folder-menu-open': editFolderMenuOpen,
            }
      )}
    >
      <div
        className={cx(
          'global-header__menu-header',
          'favorites-menu-header',
          'flex items-center justify-between'
        )}
      >
        <div className="flex gap-2 items-center">
          <span>{isCreateFolderMode ? createFolderHeader : editFolderHeader}</span>
        </div>
        <div className={cx('global-header__close-menu', '')} onClick={handleCloseMenu}>
          <MaterialIcon name="Close" />
        </div>
      </div>
      <div
        className={cx(
          isCreateFolderMode
            ? 'global-header__create-folder-content'
            : 'global-header__edit-folder-content',
          'flex flex-col gap-4'
        )}
      >
        {isCreateFolderMode ? (
          <span className={cx('global-header__create-content-header')}>{createFolderContent}</span>
        ) : (
          <span className={cx('global-header__edit-content-header')}>{editFolderContent}</span>
        )}

        <input
          value={favoriteFolderName}
          onChange={(e) => setFavoriteFolderName(e.target.value as string)}
          type="text"
          placeholder="Enter folder name..."
        />
      </div>
      <div className={cx('global-header__menu-footer', 'flex justify-end')}>
        <div
          className={cx('global-header__menu-footer-favorite-buttons', 'flex gap-8 items-center')}
        >
          <button
            className={cx('global-header__menu-footer-cancel-button')}
            onClick={handleCancelFolderMenu}
          >
            <span>{isCreateFolderMode ? createFolderCancel : editFolderCancel}</span>
          </button>
          <button
            onClick={handleSaveFolder}
            disabled={!folderNameValid}
            className={`${!folderNameValid ? 'cursor-not-allowed opacity-50 pointer-events-none' : ''}`}
          >
            <span>{isCreateFolderMode ? createFolderSave : editFolderSave}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEditFolderMenu;
