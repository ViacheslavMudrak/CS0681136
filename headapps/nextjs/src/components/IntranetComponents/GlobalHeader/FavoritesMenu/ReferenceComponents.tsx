import {
  DndDataFolder,
  DndDataFolderBody,
  DndDataFolderReorder,
  DndDataLink,
  DndDataUnassigned,
  DraggableFavoriteLinkProps,
  FavoriteFolder,
  FavoriteFolderNodeProps,
  FavoriteLink,
  LinkRowProps,
  RemoveLinkResult,
} from './FavoritesMenu.types';
import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { Favorite, FavoritesFolder } from 'lib/firebase/types';
import { useState } from 'react';
import React from 'react';

import { useDraggable, useDroppable } from '@dnd-kit/core';

import styles from '../GlobalHeader.module.scss';
import { defaultIconName } from './Constants';

const cx = classNames.bind(styles);

// Remove a link from all folder.links (no nesting)
function removeLinkFromFolders(folders: FavoriteFolder[], linkId: string): RemoveLinkResult {
  let removed: FavoriteLink | null = null;

  const newFolders = folders.map((folder) => {
    const remainingLinks: FavoriteLink[] = [];

    if (folder.links) {
      for (const link of folder.links) {
        if (!removed && link.id === linkId) {
          removed = link;
        } else {
          remainingLinks.push(link);
        }
      }
    }

    return {
      ...folder,
      links: remainingLinks,
    };
  });

  return { folders: newFolders, link: removed };
}

// remove a link from both folders and unassigned in one go
export function removeLinkEverywhere(
  linkId: string,
  folders?: FavoriteFolder[],
  unassigned?: FavoriteLink[]
): { folders: FavoriteFolder[]; unassigned: FavoriteLink[]; link: FavoriteLink | null } {
  const safeFolders = folders ?? [];
  const safeUnassigned = unassigned ?? [];

  // First, try to remove from folders
  const { folders: foldersWithout, link: linkFromFolders } = removeLinkFromFolders(
    safeFolders,
    linkId
  );

  let link = linkFromFolders;
  let newUnassigned = safeUnassigned;

  if (link) {
    // Ensure we also remove any stray copy from unassigned
    newUnassigned = safeUnassigned.filter((l) => l.id !== linkId);
  } else {
    // Maybe it's only in unassigned
    let found: FavoriteLink | null = null;

    newUnassigned = safeUnassigned.filter((l) => {
      if (!found && l.id === linkId) {
        found = l;
        return false;
      }

      return true;
    });

    link = found;
  }

  return { folders: foldersWithout, unassigned: newUnassigned, link };
}

const DraggableFavoriteLink = ({
  link,
  containerId,
  onEditLink,
  onDeleteLink,
}: DraggableFavoriteLinkProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: link?.id as string,
    data: {
      type: 'link',
      containerId,
    } as DndDataLink,
  });

  // Don't transform the original; just hide it while dragging.
  const style: React.CSSProperties = isDragging ? { opacity: 0 } : {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cx('global-header__favorite-link-row-inner', 'flex justify-between py-2')}
    >
      <div className={cx('global-header__favorite-link-custom-icon', 'flex')}>
        <MaterialIcon
          className={link?.icon ? 'mr-[20px]' : ''}
          name={link?.icon || defaultIconName}
        />

        <a
          target="_blank"
          href={link?.url || '/'}
          className={cx('global-header__favorite-link', 'truncate', {
            'global-header__favorite-link--dragging': isDragging,
          })}
        >
          {link.label}
        </a>
      </div>

      <div className="flex gap-4 items-center">
        <div className={cx('global-header__favorite-edit-hover', 'gap-4')}>
          {link.type !== 'directory-entry' && (
            <span
              className="flex"
              onClick={() => {
                const favorite: Favorite = {
                  id: link.id,
                  name: link?.label,
                  url: link?.url,
                  icon: link?.icon,
                };

                onEditLink(favorite);
              }}
            >
              <MaterialIcon name="Edit" />
            </span>
          )}

          <span className="flex" onClick={() => onDeleteLink(link?.id ?? '')}>
            <MaterialIcon name="DeleteOutlined" />
          </span>
        </div>

        <span
          className={cx('global-header__drag-handle', 'flex items-center')}
          {...attributes}
          {...listeners}
          style={{ cursor: 'grab', touchAction: 'none' }}
        >
          <MaterialIcon name="DragIndicatorOutlined" />
        </span>
      </div>
    </div>
  );
};

export const LinkRow = ({
  link,
  containerId,
  index,
  isDraggingLink,
  onEditLink,
  onDeleteLink,
}: LinkRowProps) => {
  const { setNodeRef: setBeforeRef, isOver: isOverBefore } = useDroppable({
    id: `link-target-${containerId}-${index}-before`,
    data: {
      type: 'link-target',
      containerId,
      index,
      position: 'before',
      linkId: link.id,
    },
  });

  const { setNodeRef: setAfterRef, isOver: isOverAfter } = useDroppable({
    id: `link-target-${containerId}-${index}-after`,
    data: {
      type: 'link-target',
      containerId,
      index,
      position: 'after',
      linkId: link.id,
    },
  });

  return (
    <div className={cx('global-header__favorite-link-row')}>
      <div
        ref={setBeforeRef}
        className={cx('global-header__favorite-link-drop-zone', {
          'global-header__favorite-link-drop-zone--active': isDraggingLink,
          'global-header__favorite-link-drop-zone--over': isOverBefore,
        })}
      />

      <DraggableFavoriteLink
        link={link}
        containerId={containerId}
        onEditLink={onEditLink}
        onDeleteLink={onDeleteLink}
      />

      <div
        ref={setAfterRef}
        className={cx('global-header__favorite-link-drop-zone', {
          'global-header__favorite-link-drop-zone--active': isDraggingLink,
          'global-header__favorite-link-drop-zone--over': isOverAfter,
        })}
      />
    </div>
  );
};

export const FavoriteFolderNode = ({
  folder,
  isDraggingLink,
  onEditFolder,
  onEditLink,
  onDeleteFolder,
  onDeleteLink,
}: FavoriteFolderNodeProps) => {
  // Folder draggable
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: folder.id as string,
    data: {
      type: 'folder',
    } as DndDataFolder,
  });

  // Header droppable - reorder among folders, and also accept links dropped on header
  const { setNodeRef: setReorderRef, isOver: isOverReorder } = useDroppable({
    id: `folder-reorder-${folder.id}`,
    data: {
      type: 'folder-reorder',
      folderId: folder.id,
    } as DndDataFolderReorder,
  });

  // Body droppable - accept links dropped into folder body (append at end)
  const { setNodeRef: setBodyRef, isOver: isOverBody } = useDroppable({
    id: `folder-body-${folder.id}`,
    data: {
      type: 'folder-body',
      folderId: folder.id,
    } as DndDataFolderBody,
  });

  const style: React.CSSProperties = isDragging ? { opacity: 0 } : {};

  // expand / collapse state for THIS folder instance
  const [favoriteFolderLinks, setFavoriteFolderLinks] = useState(false);

  const isEmptyFolder = !folder.links || folder.links.length === 0;

  const handleFavoriteFolderLinks = () => {
    setFavoriteFolderLinks((prev) => !prev);
  };

  return (
    <div
      ref={setDragRef}
      style={style}
      className={cx(
        'global-header__favorite-folder',
        folder.id === 'folder-1' && 'global-header__top-favorites-folder',
        {
          'global-header__favorite-folder--dragging': isDragging,
          'global-header__favorite-folder--over-reorder': isOverReorder,
        }
      )}
      {...attributes}
    >
      <div
        ref={setReorderRef}
        className={cx('global-header__favorite-folder-header', 'flex justify-between', {
          'global-header__favorite-folder-header--over': isOverReorder,
        })}
      >
        {/* Make the whole title area clickable, not just the text */}
        <div
          className={cx('global-header__favorite-folder-title', 'flex gap-2 items-center')}
          onClick={handleFavoriteFolderLinks}
        >
          <MaterialIcon name="FolderOpenOutlined" />

          <span className={cx('global-header__favorite-folder-name')}>{folder.name}</span>

          <span className={cx('global-header__favorite-link-count')}>
            {folder.links ? folder.links.length : 0}
          </span>
        </div>

        <div className="flex gap-4 items-center">
          {folder.id !== 'top-favorites' && (
            <div className={cx('global-header__favorite-folder-edit-hover', 'gap-4')}>
              <span
                className="flex"
                onClick={() => {
                  const favFolder: FavoritesFolder = {
                    id: folder.id,
                    name: folder.name,
                    order: folder.order,
                  };

                  onEditFolder(favFolder);
                }}
              >
                <MaterialIcon name="Edit" />
              </span>

              <span
                className="flex"
                onClick={() => {
                  const linkIds = folder?.links?.map((link) => link.id!) ?? [];
                  const folderId = folder?.id ?? '';

                  onDeleteFolder(folderId, linkIds);
                }}
              >
                <MaterialIcon name="DeleteOutlined" />
              </span>
            </div>
          )}

          <span
            className={cx('global-header__drag-handle', 'flex items-center')}
            {...listeners} // drag only on the handle
            style={{ cursor: 'grab', touchAction: 'none' }}
          >
            <MaterialIcon name="DragIndicatorOutlined" />
          </span>
        </div>
      </div>

      <div
        className={cx('global-header__favorite-folder-links', {
          'global-header__favorite-folder-links--expanded':
            favoriteFolderLinks || (isDraggingLink && isEmptyFolder),
        })}
      >
        {isEmptyFolder && (
          <div
            ref={setBodyRef}
            className={cx('global-header__favorite-folder-empty-drop-zone', {
              'global-header__favorite-folder-empty-drop-zone--active': isDraggingLink,
              'global-header__favorite-folder-empty-drop-zone--over': isOverBody,
            })}
          />
        )}
        {folder.id === 'folder-1' && (
          <div className={cx('global-header__top-favorite-info-message', 'flex')}>
            <span>These appear on your home page, with a max of 7.</span>
          </div>
        )}

        {folder?.links &&
          folder?.links.map((link, index) => (
            <LinkRow
              key={link.id}
              link={link}
              containerId={folder.id || ''}
              index={index}
              isDraggingLink={isDraggingLink}
              onEditLink={onEditLink}
              onDeleteLink={onDeleteLink}
            />
          ))}

        {!isEmptyFolder && (
          <div
            ref={setBodyRef}
            className={cx('global-header__favorite-folder-drop-end', {
              'global-header__favorite-folder-drop-end--active': isDraggingLink,
              'global-header__favorite-folder-drop-end--over': isOverBody,
            })}
          />
        )}
      </div>
    </div>
  );
};

export const OverlayLink = ({ link }: { link: FavoriteLink }) => {
  return (
    <div className={cx('global-header__favorite-link-overlay')}>
      <div className="flex justify-between py-2 px-4 min-w-[260px] max-w-[360px]">
        <div className="flex items-center gap-2 truncate">
          <MaterialIcon name={link.icon || defaultIconName} />
          <span className={cx('global-header__favorite-link', 'truncate')}>{link.label}</span>
        </div>

        <span className={cx('global-header__drag-handle')}>
          <MaterialIcon name="DragIndicatorOutlined" />
        </span>
      </div>
    </div>
  );
};

export const OverlayFolder = ({ folder }: { folder: FavoriteFolder }) => {
  return (
    <div
      className={cx(
        'global-header__favorite-folder-overlay',
        'global-header__favorite-folder',
        'flex flex-col'
      )}
    >
      <div
        className={cx('global-header__favorite-folder-header', 'flex justify-between items-center')}
      >
        <div className="flex gap-2 items-center">
          <MaterialIcon name="FolderOpenOutlined" />

          <span className={cx('global-header__favorite-folder-name')}>{folder.name}</span>

          <span className={cx('global-header__favorite-link-count')}>
            {folder.links ? folder.links.length : 0}
          </span>
        </div>

        <div className="flex gap-4 items-center">
          <MaterialIcon name="Edit" />
          <MaterialIcon name="DeleteOutlined" />

          <span className={cx('global-header__drag-handle')}>
            <MaterialIcon name="DragIndicatorOutlined" />
          </span>
        </div>
      </div>
    </div>
  );
};

export const UnassignedLinksZone = ({
  children,
  isDraggingLink,
}: {
  children: React.ReactNode;
  isDraggingLink: boolean;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'unassigned',
    data: {
      type: 'unassigned',
    } as DndDataUnassigned,
  });

  return (
    <div className={cx('global-header__favorite-unassigned-links')}>
      <div
        ref={setNodeRef}
        className={cx('global-header__favorite-unassigned-drop-zone', {
          'global-header__favorite-unassigned-drop-zone--active': isDraggingLink,
          'global-header__favorite-unassigned-drop-zone--over': isOver,
        })}
      />

      {children}
    </div>
  );
};
