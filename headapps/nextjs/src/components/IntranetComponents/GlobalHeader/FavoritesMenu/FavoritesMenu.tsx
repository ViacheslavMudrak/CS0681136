import {
  DndContext,
  pointerWithin,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
  FavoriteFolderNode,
  LinkRow,
  OverlayFolder,
  OverlayLink,
  UnassignedLinksZone,
} from './ReferenceComponents';
import {
  defaultSitecoreFavoriteFolderId,
  defaultSitecoreFavoriteFolderName,
  favoriteIcons,
} from './Constants';
import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { useUserFavorites } from 'lib/firebase/hooks/use-user-favorites';
import { Favorite, Favorites, FavoritesFolder } from 'lib/firebase/types';
import { useGlobalHeaderStore } from 'lib/zustand/globalheaderstore';
import { useI18n } from 'next-localization';
import { JSX, useState, useEffect, useCallback } from 'react';

import { useSitecore } from '@sitecore-content-sdk/nextjs';
import { Skeleton } from '@mui/material';

import AddEditFolderMenu from './Sections/AddEditFolderMenu';
import AddFavoriteMenu from './Sections/AddFavoriteMenu';
import DeleteFavoriteMenu from './Sections/DeleteFavoriteMenu';
import DeleteFolderMenu from './Sections/DeleteFolderMenu';
import EditFavoriteMenu from './Sections/EditFavoriteMenu';
import styles from '../GlobalHeader.module.scss';
import { GlobalHeaderStatics } from '../GlobalHeader.types';
import { FavoriteFolder, FavoriteLink } from './FavoritesMenu.types';
import { FavoritesMenuProps } from './FavoritesMenu.types';
import Loading from './Loading';
import { useFavoritesDragDrop } from './useFavoritesDragDrop';

const cx = classNames.bind(styles);

const FavoritesMenu = ({
  isOpen,
  onClose,
  browseAllApplicationsLink,
}: FavoritesMenuProps): JSX.Element => {
  const { page } = useSitecore();
  const { t } = useI18n();

  const userDefaultSettings = page?.layout?.sitecore?.context?.userDefaultSettings;
  const recommendedFavorites = userDefaultSettings?.targetItem?.recommendedFavorites;
  const defaultFavorites = userDefaultSettings?.targetItem?.defaultFavorites;

  let icons = favoriteIcons;
  if (userDefaultSettings?.targetItem?.iconsForFavorites?.targetItems) {
    icons = userDefaultSettings.targetItem.iconsForFavorites.targetItems.map(
      (i) => i.value?.value
    ) as string[];
  }

  const favoritesMenuHeader = t('FavoritesMenuHeader') || GlobalHeaderStatics.favoritesMenuHeader;
  const addFavoriteButtonText =
    t('AddFavoriteButtonText') || GlobalHeaderStatics.addFavoriteButtonText;
  const newFolderButtonText = t('NewFolderButtonText') || GlobalHeaderStatics.newFolderButtonText;

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 4,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200,
      tolerance: 6,
    },
  });

  const sensors = useSensors(pointerSensor, touchSensor);

  const {
    favorites,
    isLoadingFavorites,
    createUserFavorite,
    updateUserFavorite,
    deleteUserFavorite,
    createUserFavoriteFolder,
    updateUserFavoriteFolder,
    deleteUserFavoriteFolder,
    setFavoriteFlag,
    saveSitecoreDefaultsToFirebase,
  } = useUserFavorites();

  const {
    closeFavoritesMenu,
    addFavoriteMenuOpen,
    openAddFavoriteMenu,
    closeAddFavoriteMenu,
    createFolderMenuOpen,
    openCreateFolderMenu,
    closeCreateFolderMenu,
    editFolderMenuOpen,
    openEditFolderMenu,
    closeEditFolderMenu,
    editFavoriteLinkMenuOpen,
    openEditFavoriteLinkMenu,
    closeEditFavoriteLinkMenu,
    deleteFavoriteFolderMenuOpen,
    openDeleteFavoriteFolderMenu,
    closeDeleteFavoriteFolderMenu,
    deleteFavoriteLinkMenuOpen,
    openDeleteFavoriteLinkMenu,
    closeDeleteFavoriteLinkMenu,
    favoritesDataLoading,
    setFavoritesDataLoading,
  } = useGlobalHeaderStore();

  const [favoriteFolders, setFavoriteFolders] = useState<FavoriteFolder[]>();
  const [unassignedLinks, setUnassignedLinks] = useState<FavoriteLink[]>();
  const [isFavoritesModifiedByUser, setIsFavoritesModifiedByUser] = useState(false);
  const [defaultSitecoreFavoriteFolder, setDefaultSitecoreFavoriteFolder] =
    useState<FavoriteFolder>();
  const [isCreateFolderMode, setIsCreateFolderMode] = useState(true);
  const [editFavorite, setEditfavorite] = useState<Favorite>();
  const [favoriteFolderName, setFavoriteFolderName] = useState('');
  const [favoriteFolderId, setFavoriteFolderId] = useState('');
  const [deleteFolderId, setDeleteFolderId] = useState('');
  const [deletefavoriteIds, setDeletefavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;

      // store scroll on body (or you can use a ref)
      document.body.dataset.scrollY = String(scrollY);

      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
    } else {
      const storedY = document.body.dataset.scrollY;

      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';

      if (storedY) {
        window.scrollTo(0, parseInt(storedY));
      }
    }
  }, [isOpen]);

  /**
   * Reset all sub-menus whenever the drawer opens so it always lands on the
   * favorites list, regardless of where the user left off. The sub-menu flags
   * live in the Zustand store and persist across the drawer's open/close
   * lifecycle, so closing via the grey overlay (which bypasses the drawer's own
   * close handler) would otherwise reopen to the last sub-step.
   */
  useEffect(() => {
    if (isOpen) {
      closeAddFavoriteMenu();
      closeCreateFolderMenu();
      closeEditFolderMenu();
      closeEditFavoriteLinkMenu();
      closeDeleteFavoriteFolderMenu();
      closeDeleteFavoriteLinkMenu();
    }
  }, [
    isOpen,
    closeAddFavoriteMenu,
    closeCreateFolderMenu,
    closeEditFolderMenu,
    closeEditFavoriteLinkMenu,
    closeDeleteFavoriteFolderMenu,
    closeDeleteFavoriteLinkMenu,
  ]);

  const formatFirebaseFavorites = (favorites: Favorites) => {
    if (favorites && (favorites?.favorites || favorites?.folders)) {
      const folders =
        favorites?.folders
          ?.slice()
          .sort(
            (a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)
          ) ?? [];

      const favoritesList = favorites?.favorites ?? [];

      const favoriteFolders: FavoriteFolder[] = folders.map((folder: FavoritesFolder) => {
        const folderFavorites: Favorite[] = favoritesList.filter(
          (fav: Favorite) => fav.folder === folder.id
        );

        const links = folderFavorites
          .slice()
          .sort(
            (a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)
          )
          .map<FavoriteLink>((link: Favorite) => ({
            id: link?.id,
            label: link?.name,
            url: link?.url,
            order: link?.order,
            icon: link?.icon,
            folderPath: link?.folder,
            type: link?.type,
          }));

        return {
          id: folder.id,
          name: folder.name,
          order: folder.order,
          favorites: folderFavorites,
          links: links,
        };
      });

      return favoriteFolders;
    }

    return undefined;
  };

  const setUnassignedFavorites = (favorites: Favorites) => {
    if (favorites && favorites?.favorites && favorites?.favorites?.length > 0) {
      const noFolderFavorites: Favorite[] = favorites?.favorites?.filter(
        (fav: Favorite) => !fav?.folder || fav?.folder === ''
      );

      if (noFolderFavorites && noFolderFavorites?.length > 0) {
        const links: FavoriteLink[] = noFolderFavorites
          .slice()
          .sort(
            (a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)
          )
          .map<FavoriteLink>((fav) => ({
            id: fav?.id,
            label: fav?.name,
            url: fav?.url,
            icon: fav?.icon,
            order: fav?.order,
            folderPath: fav?.folder,
            type: fav?.type,
          }));

        setUnassignedLinks(links);
      } else {
        setUnassignedLinks(undefined);
      }
    }
  };

  const saveDefaultFavoritesToFirebase = async (folder?: FavoriteFolder) => {
    setFavoritesDataLoading(true);

    if (folder?.id && folder?.links) {
      // Folder with links: save the folder and its remaining links to Firebase
      const folderId = folder.id;
      const savePromises = folder.links.map((link, index) =>
        createUserFavorite({
          name: link?.label,
          url: link?.url,
          icon: link?.icon,
          folder: folderId,
          order: index + 1,
          type: link?.type,
        })
      );

      await Promise.all([
        ...savePromises,
        updateUserFavoriteFolder(folderId, { name: folder.name, order: 1 }),
      ]);
      await setFavoriteFlag(true);
    } else if (folder) {
      // Empty folder passed explicitly (e.g. all items or folder deleted) — just mark as modified
      await setFavoriteFlag(true);
    } else {
      // No folder provided — first-time migration of all Sitecore defaults
      if (defaultFavorites) {
        await saveSitecoreDefaultsToFirebase(defaultFavorites);
      }
    }
  };
  // Load favorites on mount and when favorites change
  useEffect(() => {
    const getDefaultSitecoreFavorites = () => {
      const favoriteItems = defaultFavorites?.targetItems;

      if (favoriteItems && favoriteItems.length > 0) {
        const links = favoriteItems?.map<FavoriteLink>((link) => ({
          id: link?.name,
          label: link?.name ?? '',
          url: link?.url?.url ?? '',
          icon: link?.icon?.targetItem?.value?.value ?? '',
          folderPath: defaultSitecoreFavoriteFolderId,
        }));

        const topFavorites: FavoriteFolder = {
          id: defaultSitecoreFavoriteFolderId,
          name: defaultSitecoreFavoriteFolderName,
          order: 1,
          links,
        };

        setDefaultSitecoreFavoriteFolder(topFavorites);
        return [topFavorites];
      }

      return undefined;
    };

    if (!isLoadingFavorites) {
      if (favorites?.isFavoritesModified) {
        setIsFavoritesModifiedByUser(true);

        if (!favorites.favorites && !favorites.folders) {
          setFavoriteFolders([] as FavoriteFolder[]);
          setUnassignedLinks(undefined);
        } else {
          const userFavorites = formatFirebaseFavorites(favorites);

          if (userFavorites) {
            setFavoriteFolders(userFavorites);
          }

          setUnassignedFavorites(favorites);
        }

        setFavoritesDataLoading(false);
      } else {
        const sitecoreFavorites = getDefaultSitecoreFavorites();

        if (sitecoreFavorites) {
          setFavoriteFolders(sitecoreFavorites);
        }
      }
    }
  }, [
    defaultFavorites,
    favorites,
    isLoadingFavorites,
    recommendedFavorites,
    setFavoritesDataLoading,
  ]);

  // Drag-and-drop handlers extracted to custom hook
  const { activeDragItem, handleDragStart, handleDragEnd, findLinkById, findFolderById } =
    useFavoritesDragDrop({
      favoriteFolders,
      unassignedLinks,
      isFavoritesModifiedByUser,
      setDefaultSitecoreFavoriteFolder,
      saveDefaultFavoritesToFirebase,
      setFavoriteFolders,
      setUnassignedLinks,
      updateUserFavorite,
      updateUserFavoriteFolder,
    });

  const handleAddFavoriteMenu = () => {
    if (addFavoriteMenuOpen) {
      closeAddFavoriteMenu();
    } else {
      openAddFavoriteMenu();
    }
  };

  const handleCloseMenu = useCallback(() => {
    closeFavoritesMenu();
    closeAddFavoriteMenu();
    closeCreateFolderMenu();
    closeEditFolderMenu();
    closeEditFavoriteLinkMenu();
    closeDeleteFavoriteFolderMenu();
    closeDeleteFavoriteLinkMenu();
    onClose();
  }, [
    closeFavoritesMenu,
    closeAddFavoriteMenu,
    closeCreateFolderMenu,
    closeEditFolderMenu,
    closeEditFavoriteLinkMenu,
    closeDeleteFavoriteFolderMenu,
    closeDeleteFavoriteLinkMenu,
    onClose,
  ]);

  const resetFavoriteFolderVariables = () => {
    setFavoriteFolderName('');
    setFavoriteFolderId('');
  };

  const resetDeleteFolderVariables = () => {
    setDeleteFolderId('');
    setDeletefavoriteIds([]);
  };

  const handleCreateFolderMenu = () => {
    if (createFolderMenuOpen) {
      closeCreateFolderMenu();
    } else {
      setIsCreateFolderMode(true);
      setFavoriteFolderId('');
      setFavoriteFolderName('');
      openCreateFolderMenu();
    }
  };

  const handleEditFolderMenu = (folder: FavoritesFolder) => {
    if (editFolderMenuOpen) {
      closeEditFolderMenu();
    } else {
      setIsCreateFolderMode(false);

      if (folder && folder?.id) {
        setFavoriteFolderId(folder?.id);
      }
      if (folder && folder?.name) {
        setFavoriteFolderName(folder?.name);
      }

      openEditFolderMenu();
    }
  };

  const handleDeleteFavoriteFolderMenu = (folderId: string, favoriteIds: string[]) => {
    if (deleteFavoriteFolderMenuOpen) {
      closeDeleteFavoriteFolderMenu();
    } else {
      openDeleteFavoriteFolderMenu();

      if (folderId || favoriteIds?.length > 0) {
        setDeleteFolderId(folderId);
        setDeletefavoriteIds(favoriteIds);
      }
    }
  };

  const handleEditFavorite = (favorite: Favorite) => {
    if (editFavoriteLinkMenuOpen) {
      closeEditFavoriteLinkMenu();
    } else {
      if (favorite) {
        setEditfavorite(favorite);
      }

      openEditFavoriteLinkMenu();
    }
  };

  const handleDeleteFavoriteLinkMenu = (favoriteId: string) => {
    if (deleteFavoriteLinkMenuOpen) {
      closeDeleteFavoriteLinkMenu();
    } else {
      openDeleteFavoriteLinkMenu();

      if (favoriteId) {
        setDeletefavoriteIds([favoriteId]);
      }
    }
  };

  const isMenuDisabled = isLoadingFavorites || favoritesDataLoading;
  const isDraggingLink = activeDragItem?.type === 'link';

  const folderSortableIds: UniqueIdentifier[] =
    favoriteFolders
      ?.map((folder) => folder.id)
      .filter((id): id is string => typeof id === 'string' && id.length > 0) ?? [];

  const unassignedLinkSortableIds: UniqueIdentifier[] =
    unassignedLinks
      ?.map((link) => link.id)
      .filter((id): id is string => typeof id === 'string' && id.length > 0) ?? [];

  return (
    <>
      <div
        className={cx(
          'global-header__favorite-menu',
          'utility-menu',
          'flex-col absolute',
          isMenuDisabled && 'cursor-not-allowed pointer-events-none',
          {
            'utility-menu-open': isOpen,
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
            <span>{favoritesMenuHeader}</span>
          </div>

          <div className={cx('global-header__close-menu')} onClick={handleCloseMenu}>
            <MaterialIcon name="Close" />
          </div>
        </div>

        <div className={cx('global-header__favorites-item-container', 'flex flex-col gap-2 mt-4')}>
          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* Folders first */}
            {isLoadingFavorites || favoritesDataLoading ? (
              // show two skeleton folder placeholders while loading
              <Loading isVisible={true} />
            ) : (
              <>
                <SortableContext items={folderSortableIds} strategy={verticalListSortingStrategy}>
                  {favoriteFolders?.map((folder) => {
                    if (!folder.id) return null;

                    return (
                      <FavoriteFolderNode
                        key={folder.id}
                        folder={folder}
                        isDraggingLink={isDraggingLink}
                        onEditFolder={handleEditFolderMenu}
                        onEditLink={handleEditFavorite}
                        onDeleteFolder={handleDeleteFavoriteFolderMenu}
                        onDeleteLink={handleDeleteFavoriteLinkMenu}
                      />
                    );
                  })}
                </SortableContext>

                {/* Then unassigned links */}
                <UnassignedLinksZone isDraggingLink={isDraggingLink}>
                  <SortableContext
                    items={unassignedLinkSortableIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {unassignedLinks?.map((link, index) => {
                      if (!link.id) return null;

                      return (
                        <LinkRow
                          key={link.id}
                          link={link}
                          containerId="unassigned"
                          index={index}
                          isDraggingLink={isDraggingLink}
                          onEditLink={handleEditFavorite}
                          onDeleteLink={handleDeleteFavoriteLinkMenu}
                        />
                      );
                    })}
                  </SortableContext>
                </UnassignedLinksZone>
              </>
            )}

            {/* Drag Overlay */}
            <DragOverlay>
              {activeDragItem
                ? activeDragItem.type === 'link'
                  ? (() => {
                      const link = findLinkById(activeDragItem.id);
                      return link ? <OverlayLink link={link} /> : null;
                    })()
                  : (() => {
                      const folder = findFolderById(activeDragItem.id);
                      return folder ? <OverlayFolder folder={folder} /> : null;
                    })()
                : null}
            </DragOverlay>
          </DndContext>
        </div>

        <div className={cx('global-header__menu-footer', 'flex')}>
          <div
            className={cx('global-header__menu-footer-favorite-buttons', 'flex gap-8 items-center')}
          >
            {isMenuDisabled ? (
              <>
                <Skeleton variant="rectangular" width={80} height={40} />
                <Skeleton variant="rectangular" width={120} height={40} />
              </>
            ) : (
              <>
                <button className="flex gap-2 items-center" onClick={handleAddFavoriteMenu}>
                  <MaterialIcon name="Add" />
                  <span>{addFavoriteButtonText}</span>
                </button>

                <button className="flex gap-2 items-center" onClick={handleCreateFolderMenu}>
                  <MaterialIcon name="FolderOpenOutlined" />
                  <span>{newFolderButtonText}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Add a favorite menu */}
        <AddFavoriteMenu
          recommendedFavorites={recommendedFavorites}
          favoriteFolders={favoriteFolders}
          unassignedLinks={unassignedLinks}
          icons={icons}
          addFavoriteMenuOpen={addFavoriteMenuOpen}
          browseAllApplicationsLink={browseAllApplicationsLink}
          isFavoritesModifiedByUser={isFavoritesModifiedByUser}
          setIsFavoritesModifiedByUser={setIsFavoritesModifiedByUser}
          setFavoritesDataLoading={setFavoritesDataLoading}
          handleCloseMenu={handleCloseMenu}
          closeAddFavoriteMenu={closeAddFavoriteMenu}
          createUserFavorite={createUserFavorite}
          saveDefaultFavoritesToFirebase={saveDefaultFavoritesToFirebase}
        />

        {/* Create or Update a folder menu */}
        {(createFolderMenuOpen || editFolderMenuOpen) && (
          <AddEditFolderMenu
            isCreateFolderMode={isCreateFolderMode}
            createFolderMenuOpen={createFolderMenuOpen}
            editFolderMenuOpen={editFolderMenuOpen}
            folderName={favoriteFolderName}
            folderId={favoriteFolderId}
            defaultSitecoreFavoriteFolder={defaultSitecoreFavoriteFolder}
            isFavoritesModifiedByUser={isFavoritesModifiedByUser}
            setIsFavoritesModifiedByUser={setIsFavoritesModifiedByUser}
            setFavoritesDataLoading={setFavoritesDataLoading}
            setDefaultSitecoreFavoriteFolder={setDefaultSitecoreFavoriteFolder}
            handleCloseMenu={handleCloseMenu}
            closeCreateFolderMenu={closeCreateFolderMenu}
            closeEditFolderMenu={closeEditFolderMenu}
            createUserFavoriteFolder={createUserFavoriteFolder}
            updateUserFavoriteFolder={updateUserFavoriteFolder}
            saveDefaultFavoritesToFirebase={saveDefaultFavoritesToFirebase}
          />
        )}

        {/* Edit a favorite link menu */}
        {editFavorite && editFavoriteLinkMenuOpen && (
          <EditFavoriteMenu
            favorite={editFavorite}
            editFavoriteLinkMenuOpen={editFavoriteLinkMenuOpen}
            defaultSitecoreFavoriteFolder={defaultSitecoreFavoriteFolder}
            icons={icons}
            isFavoritesModifiedByUser={isFavoritesModifiedByUser}
            setIsFavoritesModifiedByUser={setIsFavoritesModifiedByUser}
            setFavoritesDataLoading={setFavoritesDataLoading}
            setDefaultSitecoreFavoriteFolder={setDefaultSitecoreFavoriteFolder}
            handleCloseMenu={handleCloseMenu}
            closeEditFavoriteLinkMenu={closeEditFavoriteLinkMenu}
            saveDefaultFavoritesToFirebase={saveDefaultFavoritesToFirebase}
            updateUserFavorite={updateUserFavorite}
          />
        )}

        {/*Delete a folder menu */}
        {deleteFavoriteFolderMenuOpen && (
          <DeleteFolderMenu
            folderId={deleteFolderId}
            favoriteIds={deletefavoriteIds}
            defaultSitecoreFavoriteFolder={defaultSitecoreFavoriteFolder}
            deleteFolderMenuOpen={deleteFavoriteFolderMenuOpen}
            isFavoritesModifiedByUser={isFavoritesModifiedByUser}
            setIsFavoritesModifiedByUser={setIsFavoritesModifiedByUser}
            setFavoritesDataLoading={setFavoritesDataLoading}
            setDefaultSitecoreFavoriteFolder={setDefaultSitecoreFavoriteFolder}
            resetDeleteFolderVariables={resetDeleteFolderVariables}
            resetFavoriteFolderVariables={resetFavoriteFolderVariables}
            handleCloseMenu={handleCloseMenu}
            closeDeleteFavoriteFolderMenu={closeDeleteFavoriteFolderMenu}
            deleteUserFavoriteFolder={deleteUserFavoriteFolder}
            saveDefaultFavoritesToFirebase={saveDefaultFavoritesToFirebase}
          />
        )}

        {/*Delete a link menu */}
        {deleteFavoriteLinkMenuOpen && deletefavoriteIds.length > 0 && (
          <DeleteFavoriteMenu
            favoriteId={deletefavoriteIds[0] || ''}
            deleteFavoriteMenuOpen={deleteFavoriteLinkMenuOpen}
            defaultSitecoreFavoriteFolder={defaultSitecoreFavoriteFolder}
            isFavoritesModifiedByUser={isFavoritesModifiedByUser}
            setIsFavoritesModifiedByUser={setIsFavoritesModifiedByUser}
            setFavoritesDataLoading={setFavoritesDataLoading}
            setDefaultSitecoreFavoriteFolder={setDefaultSitecoreFavoriteFolder}
            handleCloseMenu={handleCloseMenu}
            closeDeleteFavoriteMenu={closeDeleteFavoriteLinkMenu}
            resetDeleteFolderVariables={resetDeleteFolderVariables}
            resetFavoriteFolderVariables={resetFavoriteFolderVariables}
            saveDefaultFavoritesToFirebase={saveDefaultFavoritesToFirebase}
            deleteUserFavorite={deleteUserFavorite}
          />
        )}
      </div>
    </>
  );
};

export default FavoritesMenu;
