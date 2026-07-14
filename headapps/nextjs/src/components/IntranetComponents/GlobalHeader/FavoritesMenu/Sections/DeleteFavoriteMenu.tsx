import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { useI18n } from 'next-localization';
import { JSX } from 'react';

import styles from '../../GlobalHeader.module.scss';
import { DeleteFavoriteMenuProps, DeleteFavoriteMenuStatics } from './DeleteFavoriteMenu.types';

const cx = classNames.bind(styles);

const DeleteFavoriteMenu = ({
  favoriteId,
  deleteFavoriteMenuOpen,
  defaultSitecoreFavoriteFolder,
  isFavoritesModifiedByUser,
  setIsFavoritesModifiedByUser,
  setFavoritesDataLoading,
  setDefaultSitecoreFavoriteFolder,
  handleCloseMenu,
  closeDeleteFavoriteMenu,
  resetDeleteFolderVariables,
  resetFavoriteFolderVariables,
  saveDefaultFavoritesToFirebase,
  deleteUserFavorite,
}: DeleteFavoriteMenuProps): JSX.Element => {
  const { t } = useI18n();
  const deleteFavoriteCancel =
    t('DeleteFavoriteCancel') || DeleteFavoriteMenuStatics.deleteFavoriteCancel;
  const deleteFavoriteDelete =
    t('DeleteFavoriteDelete') || DeleteFavoriteMenuStatics.deleteFavoriteDelete;
  const deleteFavoriteContent =
    t('DeleteFavoriteContent') || DeleteFavoriteMenuStatics.deleteFavoriteContent;

  const handleCancel = () => {
    resetDeleteFolderVariables();
    resetFavoriteFolderVariables();
    closeDeleteFavoriteMenu();
  };

  const handleDeleteFavorite = () => {
    if (favoriteId && favoriteId !== '') {
      if (isFavoritesModifiedByUser) {
        deleteUserFavorite(favoriteId);
      } else if (defaultSitecoreFavoriteFolder) {
        const updatedFolder = {
          ...defaultSitecoreFavoriteFolder,
          links: defaultSitecoreFavoriteFolder.links?.filter((link) => link.id !== favoriteId),
        };
        setDefaultSitecoreFavoriteFolder(updatedFolder);
        setIsFavoritesModifiedByUser(true);
        saveDefaultFavoritesToFirebase(updatedFolder);
      }
      resetDeleteFolderVariables();
      resetFavoriteFolderVariables();
      closeDeleteFavoriteMenu();
      setFavoritesDataLoading(true);
    }
  };

  return (
    <div
      className={cx('global-header__delete-link-menu', 'flex flex-col', {
        'delete-link-menu-open': deleteFavoriteMenuOpen,
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
          'global-header__delete-link-content',
          'flex flex-col gap-4 text-center justify-center'
        )}
      >
        <span className={cx('global-header__delete-confirm-message')}>{deleteFavoriteContent}</span>
        <div
          className={cx(
            'global-header__delete-confirm-link-name',
            'flex gap-2 justify-center items-center'
          )}
        >
          <MaterialIcon name="LinkOutlined" />
        </div>
      </div>
      <div className={cx('global-header__menu-footer', 'flex justify-end')}>
        <div
          className={cx('global-header__menu-footer-favorite-buttons', 'flex gap-8 items-center')}
        >
          <button className={cx('global-header__menu-footer-cancel-button')} onClick={handleCancel}>
            <span>{deleteFavoriteCancel}</span>
          </button>
          <button onClick={handleDeleteFavorite}>
            <span>{deleteFavoriteDelete}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteFavoriteMenu;
