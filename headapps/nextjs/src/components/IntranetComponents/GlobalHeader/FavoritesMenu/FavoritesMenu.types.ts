import { LinkField } from '@sitecore-content-sdk/nextjs';
import { Favorite, FavoritesFolder } from 'lib/firebase/types';

export interface FavoritesMenuProps {
  isOpen: boolean;
  onClose: () => void;
  browseAllApplicationsLink: LinkField;
}

export type FavoriteLink = {
  id?: string;
  label?: string;
  url?: string;
  icon?: string;
  order?: number;
  folderPath?: string;
  type?: string;
};

export type FavoriteFolder = {
  id?: string;
  name?: string;
  order?: number;
  links?: FavoriteLink[];
};

export type DraggableFavoriteLinkProps = {
  link: FavoriteLink;
  containerId: string; // 'unassigned' or folder.id
  onEditLink: (favorite: Favorite) => void;
  onDeleteLink: (favoriteId: string) => void;
};

export type FavoriteFolderNodeProps = {
  folder: FavoriteFolder;
  isDraggingLink?: boolean;
  onEditFolder: (folder: FavoritesFolder) => void;
  onEditLink: (favorite: Favorite) => void;
  onDeleteFolder: (folderId: string, linkIds: string[]) => void;
  onDeleteLink: (linkId: string) => void;
};

export type LinkRowProps = {
  link: FavoriteLink;
  containerId: string; // 'unassigned' or folder.id
  index: number;
  isDraggingLink?: boolean;
  onEditLink: (favorite: Favorite) => void;
  onDeleteLink: (favoriteId: string) => void;
};

// dnd data types

export type DndDataLink = {
  type: 'link';
  containerId: string; // 'unassigned' or folder.id
};

export type DndDataLinkTarget = {
  type: 'link-target';
  containerId: string; // 'unassigned' or folder.id
  index: number;
  linkId: string;
};

export type DndDataFolderReorder = {
  type: 'folder-reorder';
  folderId: string;
};

export type DndDataFolderBody = {
  type: 'folder-body';
  folderId: string;
};

export type DndDataUnassigned = {
  type: 'unassigned';
};

export type DndDataFolder = {
  type: 'folder';
};

export type DndData =
  | DndDataLink
  | DndDataLinkTarget
  | DndDataFolderReorder
  | DndDataFolderBody
  | DndDataUnassigned
  | DndDataFolder;

// For overlay state
export type ActiveDragItem = {
  type: 'link' | 'folder';
  id: string;
};

// ---- helpers ---------------------------------------------------------------

export type RemoveLinkResult = {
  folders: FavoriteFolder[];
  link: FavoriteLink | null;
};
