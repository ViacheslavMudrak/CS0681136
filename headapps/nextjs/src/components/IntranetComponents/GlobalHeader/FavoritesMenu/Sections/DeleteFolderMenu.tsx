import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { useI18n } from 'next-localization';
import { JSX } from 'react';

import styles from '../../GlobalHeader.module.scss';
import { FavoriteFolder } from '../FavoritesMenu.types';
import { DeleteFolderMenuProps, DeleteFolderMenuStatics } from './DeleteFolderMenu.types';

const cx = classNames.bind(styles);

const DeleteFolderMenu = ({
  folderId,
  favoriteIds,
  deleteFolderMenuOpen,
  isFavoritesModifiedByUser,
  defaultSitecoreFavoriteFolder,
  setIsFavoritesModifiedByUser,
  setFavoritesDataLoading,
  setDefaultSitecoreFavoriteFolder,
  handleCloseMenu,
  closeDeleteFavoriteFolderMenu,
  resetDeleteFolderVariables,
  resetFavoriteFolderVariables,
  deleteUserFavoriteFolder,
  saveDefaultFavoritesToFirebase,
}: DeleteFolderMenuProps): JSX.Element => {
  const { t } = useI18n();
  const deleteFolderContent =
    t('DeleteFolderContent') || DeleteFolderMenuStatics.deleteFolderContent;
  const deleteFolderCancel = t('DeleteFolderCancel') || DeleteFolderMenuStatics.deleteFolderCancel;
  const deleteFolderDelete = t('DeleteFolderDelete') || DeleteFolderMenuStatics.deleteFolderDelete;

  const handleCancel = () => {
    resetDeleteFolderVariables();
    resetFavoriteFolderVariables();
    closeDeleteFavoriteFolderMenu();
  };

  const handleDeleteFavoriteFolder = () => {
    if (folderId || (favoriteIds && favoriteIds?.length > 0)) {
      if (isFavoritesModifiedByUser) {
        deleteUserFavoriteFolder(folderId, favoriteIds as string[]);
      } else if (defaultSitecoreFavoriteFolder) {
        const emptyFolder = {} as FavoriteFolder;
        setDefaultSitecoreFavoriteFolder(emptyFolder);
        setIsFavoritesModifiedByUser(true);
        saveDefaultFavoritesToFirebase(emptyFolder);
      }
      closeDeleteFavoriteFolderMenu();
      resetDeleteFolderVariables();
      resetFavoriteFolderVariables();
      setFavoritesDataLoading(true);
    }
  };

  return (
    <div
      className={cx('global-header__delete-folder-menu', 'flex flex-col', {
        'delete-folder-menu-open': deleteFolderMenuOpen,
      })}
    >
      <div
        className={cx(
          'global-header__menu-header',
          'favorites-menu-header',
          'flex items-center justify-end'
        )}
      >
        <div className={cx('global-header__close-menu', '')} onClick={handleCloseMenu}>
          <MaterialIcon name="Close" />
        </div>
      </div>
      <div
        className={cx(
          'global-header__delete-folder-content',
          'flex flex-col gap-4 text-center justify-center'
        )}
      >
        <span className={cx('global-header__delete-confirm-message')}>{deleteFolderContent}</span>
        <div
          className={cx(
            'global-header__delete-confirm-folder-name',
            'flex gap-2 justify-center items-center'
          )}
        >
          <MaterialIcon name="FolderOutlined" />
        </div>
      </div>
      <div className={cx('global-header__menu-footer', 'flex justify-end')}>
        <div
          className={cx('global-header__menu-footer-favorite-buttons', 'flex gap-8 items-center')}
        >
          <button className={cx('global-header__menu-footer-cancel-button')} onClick={handleCancel}>
            <span>{deleteFolderCancel}</span>
          </button>
          <button onClick={handleDeleteFavoriteFolder}>
            <span>{deleteFolderDelete}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteFolderMenu;
