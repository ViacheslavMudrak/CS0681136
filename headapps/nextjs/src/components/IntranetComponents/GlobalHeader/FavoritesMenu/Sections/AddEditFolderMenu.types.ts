import { FavoriteFolderInput } from 'lib/firebase/types';

import { FavoriteFolder } from '../FavoritesMenu.types';

export interface AddEditFolderMenuProps {
  favoriteFolders?: FavoriteFolder[];
  isCreateFolderMode: boolean;
  createFolderMenuOpen: boolean;
  editFolderMenuOpen: boolean;
  folderName?: string;
  folderId?: string;
  defaultSitecoreFavoriteFolder?: FavoriteFolder;

  isFavoritesModifiedByUser: boolean;
  setIsFavoritesModifiedByUser: (v: boolean) => void;
  setFavoritesDataLoading: (v: boolean) => void;
  setDefaultSitecoreFavoriteFolder: (folder: FavoriteFolder) => void;

  handleCloseMenu: () => void;
  closeCreateFolderMenu: () => void;
  closeEditFolderMenu: () => void;
  createUserFavoriteFolder: (input: FavoriteFolderInput) => void;
  updateUserFavoriteFolder: (id: string, input: Partial<FavoriteFolderInput>) => void;
  saveDefaultFavoritesToFirebase: () => void;
}

export const AddEditFolderMenuStatics = {
  createFolderHeader: 'Create Folder',
  createFolderContent: 'Folder Name',
  createFolderCancel: 'Cancel',
  createFolderSave: 'Save Changes',
  editFolderHeader: 'Edit Folder',
  editFolderContent: 'Folder Name',
  editFolderCancel: 'Cancel',
  editFolderSave: 'Save Changes',
};
