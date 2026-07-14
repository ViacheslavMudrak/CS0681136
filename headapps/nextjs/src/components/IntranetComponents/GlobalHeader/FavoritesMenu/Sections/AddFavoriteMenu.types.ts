import { LinkField } from '@sitecore-content-sdk/nextjs';
import { FavoriteInput } from 'lib/firebase/types';
import { FavoritesModel } from 'ts/user-default-settings';
import { FavoriteFolder, FavoriteLink } from '../FavoritesMenu.types';

export interface AddFavoriteMenuProps {
  recommendedFavorites?: FavoritesModel;
  favoriteFolders?: FavoriteFolder[];
  unassignedLinks?: FavoriteLink[];
  icons?: string[];
  browseAllApplicationsLink?: LinkField;

  addFavoriteMenuOpen: boolean;
  isFavoritesModifiedByUser: boolean;
  setIsFavoritesModifiedByUser: (v: boolean) => void;
  setFavoritesDataLoading: (v: boolean) => void;

  handleCloseMenu: () => void;
  closeAddFavoriteMenu: () => void;
  saveDefaultFavoritesToFirebase: () => void;
  createUserFavorite: (input: FavoriteInput) => void;
}

export const AddFavoriteMenuStatics = {
  addFavoriteHeader: 'Add a Favorite',
  addFavoriteCancel: 'Cancel',
  addFavoriteSave: 'Save',
  addFavoriteButtonText: 'Add',
  newFolderButtonText: 'New Folder',
  addFavoriteTab1: 'Current Page',
  addFavoriteTab2: 'Recommended',
  addFavoriteTab3: 'Custom',
  addFavoriteDisplayname: 'Display Name*',
  addFavoriteFolderLabel: 'Add to Folder',
  addFavoriteFolderOptional: '(optional)',
  addFavoriteUrlLabel: 'URL*',
  selectIconHelperText: 'Click on icon and text to edit',
  selectFolderDefaultOption: 'Choose a Folder',
  favoriteUrlTextboxPlaceholderText: 'Enter URL ...',
  favoriteNameTextboxPlaceholderText: 'Enter Display Name ...',
  favoriteUrlInvalidMessage: 'Not a valid link',
  browseAllApplicationsLinkText: 'Browse All Applications',
  browseAllApplicationsLinkUrl: '/browse-all-applications',
};
