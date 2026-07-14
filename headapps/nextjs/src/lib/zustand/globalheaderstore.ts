import { create } from 'zustand';

export interface GlobalHeaderState {
  favoritesMenuOpen: boolean;
  openFavoritesMenu: () => void;
  closeFavoritesMenu: () => void;
  addFavoriteMenuOpen: boolean;
  openAddFavoriteMenu: () => void;
  closeAddFavoriteMenu: () => void;
  createFolderMenuOpen: boolean;
  openCreateFolderMenu: () => void;
  closeCreateFolderMenu: () => void;
  editFolderMenuOpen: boolean;
  openEditFolderMenu: () => void;
  closeEditFolderMenu: () => void;
  editFavoriteLinkMenuOpen: boolean;
  openEditFavoriteLinkMenu: () => void;
  closeEditFavoriteLinkMenu: () => void;
  deleteFavoriteFolderMenuOpen: boolean;
  openDeleteFavoriteFolderMenu: () => void;
  closeDeleteFavoriteFolderMenu: () => void;
  deleteFavoriteLinkMenuOpen: boolean;
  openDeleteFavoriteLinkMenu: () => void;
  closeDeleteFavoriteLinkMenu: () => void;
  favoritesDataLoading: boolean;
  setFavoritesDataLoading: (loading: boolean) => void;
}

export const useGlobalHeaderStore = create<GlobalHeaderState>((set) => ({
  favoritesMenuOpen: false,
  openFavoritesMenu: () => set({ favoritesMenuOpen: true }),
  closeFavoritesMenu: () => set({ favoritesMenuOpen: false }),
  addFavoriteMenuOpen: false,
  openAddFavoriteMenu: () => set({ addFavoriteMenuOpen: true }),
  closeAddFavoriteMenu: () => set({ addFavoriteMenuOpen: false }),
  createFolderMenuOpen: false,
  openCreateFolderMenu: () => set({ createFolderMenuOpen: true }),
  closeCreateFolderMenu: () => set({ createFolderMenuOpen: false }),
  editFolderMenuOpen: false,
  openEditFolderMenu: () => set({ editFolderMenuOpen: true }),
  closeEditFolderMenu: () => set({ editFolderMenuOpen: false }),
  editFavoriteLinkMenuOpen: false,
  openEditFavoriteLinkMenu: () => set({ editFavoriteLinkMenuOpen: true }),
  closeEditFavoriteLinkMenu: () => set({ editFavoriteLinkMenuOpen: false }),
  deleteFavoriteFolderMenuOpen: false,
  openDeleteFavoriteFolderMenu: () => set({ deleteFavoriteFolderMenuOpen: true }),
  closeDeleteFavoriteFolderMenu: () => set({ deleteFavoriteFolderMenuOpen: false }),
  deleteFavoriteLinkMenuOpen: false,
  openDeleteFavoriteLinkMenu: () => set({ deleteFavoriteLinkMenuOpen: true }),
  closeDeleteFavoriteLinkMenu: () => set({ deleteFavoriteLinkMenuOpen: false }),
  favoritesDataLoading: false,
  setFavoritesDataLoading: (loading: boolean) => set({ favoritesDataLoading: loading }),
}));
