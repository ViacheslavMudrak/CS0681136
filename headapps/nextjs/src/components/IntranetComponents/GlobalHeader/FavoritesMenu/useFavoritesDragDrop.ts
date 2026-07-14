import { FavoriteFolderInput, FavoriteInput } from 'lib/firebase/types';
import { useState, useCallback } from 'react';

import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';

import {
  ActiveDragItem,
  DndData,
  DndDataLinkTarget,
  FavoriteFolder,
  FavoriteLink,
} from './FavoritesMenu.types';
import { removeLinkEverywhere } from './ReferenceComponents';

interface UseFavoritesDragDropParams {
  favoriteFolders: FavoriteFolder[] | undefined;
  unassignedLinks: FavoriteLink[] | undefined;
  isFavoritesModifiedByUser: boolean;
  setDefaultSitecoreFavoriteFolder: (folder: FavoriteFolder) => void;
  saveDefaultFavoritesToFirebase: (folder?: FavoriteFolder) => void;
  setFavoriteFolders: React.Dispatch<React.SetStateAction<FavoriteFolder[] | undefined>>;
  setUnassignedLinks: React.Dispatch<React.SetStateAction<FavoriteLink[] | undefined>>;
  updateUserFavorite: (id: string, input: Partial<FavoriteInput>) => void;
  updateUserFavoriteFolder: (id: string, input: Partial<FavoriteFolderInput>) => void;
}

type LinkTargetWithPosition = DndDataLinkTarget & {
  position?: 'before' | 'after';
};

interface UseFavoritesDragDropReturn {
  activeDragItem: ActiveDragItem | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  findLinkById: (id: string) => FavoriteLink | null;
  findFolderById: (id: string) => FavoriteFolder | null;
}

export const useFavoritesDragDrop = ({
  favoriteFolders,
  unassignedLinks,
  isFavoritesModifiedByUser,
  setDefaultSitecoreFavoriteFolder,
  saveDefaultFavoritesToFirebase,
  setFavoriteFolders,
  setUnassignedLinks,
  updateUserFavorite,
  updateUserFavoriteFolder,
}: UseFavoritesDragDropParams): UseFavoritesDragDropReturn => {
  const [activeDragItem, setActiveDragItem] = useState<ActiveDragItem | null>(null);

  const updateFolderOrder = useCallback(
    (id: string, order: number) => {
      if (id && order > 0) {
        updateUserFavoriteFolder(id, { order });
      }
    },
    [updateUserFavoriteFolder]
  );

  const updateFavoriteOrder = useCallback(
    (id: string, order: number, folderId?: string) => {
      if (id && order > 0) {
        updateUserFavorite(id, {
          order,
          ...(typeof folderId === 'string' && { folder: folderId }),
        });
      }
    },
    [updateUserFavorite]
  );

  const updateSitecoreFavoriteFolderToFirebase = (folder: FavoriteFolder) => {
    if (!isFavoritesModifiedByUser && folder?.id) {
      setDefaultSitecoreFavoriteFolder(folder);
      saveDefaultFavoritesToFirebase(folder);
    }
  };

  const findLinkById = useCallback(
    (id: string): FavoriteLink | null => {
      if (favoriteFolders?.length) {
        for (const folder of favoriteFolders) {
          const link = folder.links?.find((l) => l.id === id);
          if (link) return link;
        }
      }

      return unassignedLinks?.find((l) => l.id === id) || null;
    },
    [favoriteFolders, unassignedLinks]
  );

  const findFolderById = useCallback(
    (id: string): FavoriteFolder | null => favoriteFolders?.find((f) => f.id === id) || null,
    [favoriteFolders]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = String(event.active.id);
    const activeData = (event.active.data.current || null) as DndData | null;

    if (!activeData) return;

    if (activeData.type === 'link') {
      setActiveDragItem({ type: 'link', id: activeId });
    }

    if (activeData.type === 'folder') {
      setActiveDragItem({ type: 'folder', id: activeId });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveDragItem(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    const activeData = (active.data.current || null) as DndData | null;
    const overData = (over.data.current || null) as DndData | null;

    if (!activeData || !overData) return;

    if (activeData.type === 'link') {
      const linkId = activeId;

      const {
        folders: foldersWithoutLink,
        unassigned: unassignedWithoutLink,
        link,
      } = removeLinkEverywhere(linkId, favoriteFolders, unassignedLinks);

      if (!link) return;

      let newFolders = foldersWithoutLink;
      let newUnassigned = unassignedWithoutLink;

      if (overData.type === 'link-target') {
        const targetData = overData as LinkTargetWithPosition;
        const targetContainerId = targetData.containerId;
        const targetIndex = targetData.index;
        const position = targetData.position;

        const insertIndex = position === 'after' ? targetIndex + 1 : targetIndex;

        if (targetContainerId === 'unassigned') {
          const updated = [...newUnassigned];
          const index = Math.min(Math.max(insertIndex, 0), updated.length);

          updated.splice(index, 0, link);

          newUnassigned = updated;

          newUnassigned.forEach((item, itemIndex) => {
            if (item.id) {
              updateFavoriteOrder(item.id, itemIndex + 1, '');
            }
          });
        } else {
          let targetFolder: FavoriteFolder | undefined;
          let newIndex = 0;

          const updatedFolders = newFolders.map((folder) => {
            if (folder.id !== targetContainerId) return folder;

            const links = folder.links ? [...folder.links] : [];
            const index = Math.min(Math.max(insertIndex, 0), links.length);

            newIndex = index;
            links.splice(index, 0, link);

            const updatedFolder = { ...folder, links };
            targetFolder = updatedFolder;

            return updatedFolder;
          });

          newFolders = updatedFolders;

          if (!isFavoritesModifiedByUser && targetFolder) {
            updateSitecoreFavoriteFolderToFirebase(targetFolder);
          } else {
            const updatedTargetFolder = newFolders.find(
              (folder) => folder.id === targetContainerId
            );

            updatedTargetFolder?.links?.forEach((item, itemIndex) => {
              if (item.id) {
                updateFavoriteOrder(item.id, itemIndex + 1, targetContainerId);
              }
            });

            updateFavoriteOrder(linkId, newIndex + 1, targetContainerId);
          }
        }
      } else if (overData.type === 'unassigned') {
        newUnassigned = [...newUnassigned, link];

        newUnassigned.forEach((item, index) => {
          if (item.id) {
            updateFavoriteOrder(item.id, index + 1, '');
          }
        });
      } else if (overData.type === 'folder-body' || overData.type === 'folder-reorder') {
        const targetFolderId = overData.folderId;

        let targetFolder: FavoriteFolder | undefined;

        const updatedFolders = newFolders.map((folder) => {
          if (folder.id !== targetFolderId) return folder;

          const links = folder.links ? [...folder.links, link] : [link];
          const updatedFolder = { ...folder, links };

          targetFolder = updatedFolder;

          return updatedFolder;
        });

        newFolders = updatedFolders;

        if (!isFavoritesModifiedByUser && targetFolder) {
          updateSitecoreFavoriteFolderToFirebase(targetFolder);
        } else {
          targetFolder?.links?.forEach((item, index) => {
            if (item.id) {
              updateFavoriteOrder(item.id, index + 1, targetFolderId);
            }
          });
        }
      } else {
        newUnassigned = [...newUnassigned, link];

        newUnassigned.forEach((item, index) => {
          if (item.id) {
            updateFavoriteOrder(item.id, index + 1, '');
          }
        });
      }

      setFavoriteFolders(newFolders);
      setUnassignedLinks(newUnassigned);
      return;
    }

    if (activeData.type === 'folder' && overData.type === 'folder-reorder') {
      const sourceFolderId = activeId;
      const targetFolderId = overData.folderId;

      if (sourceFolderId === targetFolderId) return;

      const fromIndex = favoriteFolders?.findIndex((folder) => folder.id === sourceFolderId);
      const toIndex = favoriteFolders?.findIndex((folder) => folder.id === targetFolderId);

      if (
        favoriteFolders &&
        typeof fromIndex === 'number' &&
        typeof toIndex === 'number' &&
        fromIndex >= 0 &&
        toIndex >= 0
      ) {
        const updated = [...favoriteFolders];
        const [moved] = updated.splice(fromIndex, 1);

        updated.splice(toIndex, 0, moved);

        updated.forEach((folder, index) => {
          if (folder.id) {
            updateFolderOrder(folder.id, index + 1);
          }
        });

        setFavoriteFolders(updated);
      }
    }
  };

  return {
    activeDragItem,
    handleDragStart,
    handleDragEnd,
    findLinkById,
    findFolderById,
  };
};
