import { FavoriteFolder } from '../FavoritesMenu.types';

export interface DeleteFolderMenuProps {
  folderId: string;
  favoriteIds?: string[];
  deleteFolderMenuOpen: boolean;
  defaultSitecoreFavoriteFolder?: FavoriteFolder;

  isFavoritesModifiedByUser: boolean;
  setIsFavoritesModifiedByUser: (v: boolean) => void;
  setFavoritesDataLoading: (v: boolean) => void;
  setDefaultSitecoreFavoriteFolder: (folder: FavoriteFolder) => void;

  handleCloseMenu: () => void;
  closeDeleteFavoriteFolderMenu: () => void;
  resetDeleteFolderVariables: () => void;
  resetFavoriteFolderVariables: () => void;
  deleteUserFavoriteFolder: (folderId: string, favoriteIds: string[]) => void;
  saveDefaultFavoritesToFirebase: (folder?: FavoriteFolder) => void;
}

export const DeleteFolderMenuStatics = {
  deleteFolderHeader: 'Delete Folder',
  deleteFolderContent: 'Are you sure you want to delete this folder and all items in it?',
  deleteFolderCancel: 'Cancel',
  deleteFolderDelete: 'Yes, Delete',
};
