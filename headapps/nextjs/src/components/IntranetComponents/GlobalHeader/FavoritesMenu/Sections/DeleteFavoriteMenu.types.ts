import { FavoriteFolder } from '../FavoritesMenu.types';

export interface DeleteFavoriteMenuProps {
  favoriteId: string;
  deleteFavoriteMenuOpen: boolean;
  defaultSitecoreFavoriteFolder?: FavoriteFolder;

  isFavoritesModifiedByUser: boolean;
  setIsFavoritesModifiedByUser: (v: boolean) => void;
  setFavoritesDataLoading: (v: boolean) => void;
  setDefaultSitecoreFavoriteFolder: (folder: FavoriteFolder) => void;

  handleCloseMenu: () => void;
  closeDeleteFavoriteMenu: () => void;
  resetDeleteFolderVariables: () => void;
  resetFavoriteFolderVariables: () => void;
  saveDefaultFavoritesToFirebase: (folder?: FavoriteFolder) => void;
  deleteUserFavorite: (favoriteId: string) => void;
}

export const DeleteFavoriteMenuStatics = {
  deleteFavoriteContent: 'Are you sure you want to remove this page from your favorites list?',
  deleteFavoriteCancel: 'Cancel',
  deleteFavoriteDelete: 'Yes, Remove',
};
