import { Favorite, FavoriteInput } from 'lib/firebase/types';

import { FavoriteFolder } from '../FavoritesMenu.types';

export interface EditFavoriteMenuProps {
  favorite: Favorite;
  editFavoriteLinkMenuOpen: boolean;
  defaultSitecoreFavoriteFolder?: FavoriteFolder;
  icons?: string[];

  isFavoritesModifiedByUser: boolean;
  setIsFavoritesModifiedByUser: (v: boolean) => void;
  setFavoritesDataLoading: (v: boolean) => void;
  setDefaultSitecoreFavoriteFolder: (folder: FavoriteFolder) => void;

  handleCloseMenu: () => void;
  closeEditFavoriteLinkMenu: () => void;
  saveDefaultFavoritesToFirebase: (folder?: FavoriteFolder) => void;
  updateUserFavorite: (id: string, input: Partial<FavoriteInput>) => void;
}

export const EditFavoriteMenuStatics = {
  editFavoriteHeader: 'Edit Favorite',
  editFavoriteUrlContent: 'URL*',
  editFavoriteCancel: 'Cancel',
  editFavoriteSave: 'Save',
};
