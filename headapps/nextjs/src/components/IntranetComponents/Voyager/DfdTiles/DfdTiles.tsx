import React, { JSX, useEffect, useMemo, useState, useRef, useCallback } from 'react';
import {
  Link,
  RichText,
  Text,
  useSitecore,
  withDatasourceCheck,
} from '@sitecore-content-sdk/nextjs';
import type { LinkField } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';
import { useSession } from 'next-auth/react';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { withJumplink } from 'lib/enhancers/withJumplink';

import useMediaQuery from '@mui/material/useMediaQuery';
import { MediaQueryConstants } from 'src/util/const/material';
import { useI18n } from 'next-localization';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import styles from './DfdTiles.module.scss';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { useDfdTilesPreferences } from 'lib/firebase/hooks/use-dfd-tiles-preferences';
import {
  DFDTileDictionary,
  type GqlTile,
  type DfdTilesProps,
  type CardItem,
} from './DfdTiles.types';

const cx = classNames.bind(styles);

const TilesLoader = (): JSX.Element => (
  <div className={cx('dfd-tiles__tiles-loading')}>
    <span className={cx('dfd-tiles__spinner')} aria-label="Loading" />
  </div>
);

type ColumnsState = Record<'col1' | 'col2' | 'col3', CardItem[]>;

type ModalTileItem = {
  id: string;
  name: string;
  isVisible: boolean;
  order?: number;
};

const asBool = (v: unknown): boolean => {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v === 1;
  if (typeof v === 'string') {
    const s = v.toLowerCase();
    return s === 'true' || s === '1' || s === 'yes';
  }
  return false;
};

const tileLabel = (tile: GqlTile): string => tile.tileName?.jsonValue?.value || tile.name;

type LinkValue = { href?: string; text?: string };

const getLinkValue = (lf?: LinkField): LinkValue => {
  const raw = lf?.value as unknown;
  if (!raw || typeof raw !== 'object') return {};
  const v = raw as Partial<LinkValue>;
  return {
    href: v.href,
    text: v.text,
  };
};

const hasHref = (lf?: LinkField): boolean => {
  const { href } = getLinkValue(lf);
  return Boolean(href);
};

const DraggableCheckboxRow = ({
  item,
  onToggle,
}: {
  item: ModalTileItem;
  onToggle: (id: string) => void;
}): JSX.Element => {
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({
    id: item.id,
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: item.id,
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={(node) => {
        setDragRef(node);
        setDropRef(node);
      }}
      style={style}
      className={cx(
        'dfd-tiles__checkbox-row',
        'flex items-center gap-2',
        isOver && !isDragging ? 'dfd-tiles__checkbox-row--over' : ''
      )}
    >
      <button
        type="button"
        className={cx('dfd-tiles__drag-handle')}
        aria-label={`Reorder ${item.name}`}
        {...attributes}
        {...listeners}
      >
        <MaterialIcon name="DragIndicator" />
      </button>
      <label className={cx('dfd-tiles__checkbox', 'flex gap-2 items-center')}>
        <input type="checkbox" checked={item.isVisible} onChange={() => onToggle(item.id)} />
        <span>{item.name}</span>
      </label>
    </div>
  );
};

const SortableCard = ({ card, isEditing }: { card: CardItem; isEditing: boolean }): JSX.Element => {
  const { attributes, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    disabled: isEditing,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useMediaQuery(MediaQueryConstants.Mobile);

  const iconItem = card.raw.tileIcon?.jsonValue;
  const buttonField = card.raw.buttonLink?.jsonValue;
  const linkedSystems = card.raw.linkedSystems?.targetItems;
  // Jumplink support — mimics withJumplink rendering parameter at datasource field level
  const jumpLinkIcon = (card.raw.tileIcon?.jsonValue as unknown as { name?: string })?.name;
  const renderingId = `dfd-${tileLabel(card.raw).toLowerCase().replace(/\s+/g, '-')}`;

  useEffect(() => {
    if (!isMobile) return;

    const handleJumpLinkClicked = (event: Event) => {
      const customEvent = event as CustomEvent<{ id: string }>;

      if (customEvent.detail?.id === renderingId) {
        setIsExpanded(true);
      }
    };

    window.addEventListener('jump-link-clicked', handleJumpLinkClicked);

    return () => {
      window.removeEventListener('jump-link-clicked', handleJumpLinkClicked);
    };
  }, [isMobile, renderingId]);

  return (
    <section id={renderingId} data-jumplink="true" data-jump-icon={jumpLinkIcon}>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={cx('dfd-tiles__card', isDragging && 'is-dragging')}
      >
        <div
          className={cx(
            'dfd-tiles__card-header',
            'flex justify-between gap-4',
            isMobile && !isExpanded && 'no-border',
            isMobile && 'dfd-tiles__card-header--clickable'
          )}
          onClick={isMobile ? () => setIsExpanded((prev) => !prev) : undefined}
        >
          <div className={cx('dfd-tiles__card-header-title', 'flex gap-2 items-center')}>
            {iconItem ? (
              <MaterialIcon iconItem={iconItem} className={cx('dfd-tiles__icon')} />
            ) : (
              <MaterialIcon name="ChecklistRtlOutlined" className={cx('dfd-tiles__icon')} />
            )}

            <Text
              tag="span"
              field={card.raw.tileName?.jsonValue}
              className={cx('dfd-tiles__title')}
              editable={isEditing}
            />
          </div>

          {isMobile && (
            <button
              type="button"
              className={cx('dfd-tiles__card-mobile-expand')}
              aria-expanded={isExpanded}
            >
              <MaterialIcon name={isExpanded ? 'ExpandLessOutlined' : 'ExpandMoreOutlined'} />
            </button>
          )}
        </div>

        <div className={cx('dfd-tiles__card-content', (isExpanded || !isMobile) && 'is-expanded')}>
          <RichText
            tag="div"
            field={card.raw.tileDescription?.jsonValue}
            className={cx('dfd-tiles__description')}
            editable={isEditing}
          />

          {buttonField && hasHref(buttonField) ? (
            <div className={cx('dfd-tiles__button-row')}>
              <Link
                field={buttonField}
                className={cx('dfd-tiles__card-button')}
                editable={isEditing}
              />
            </div>
          ) : isEditing ? (
            <div className={cx('dfd-tiles__button-row')}>
              <Link
                field={buttonField || { value: { href: '', text: 'Add Button Link' } }}
                className={cx('dfd-tiles__card-button', 'dfd-tiles__card-button--placeholder')}
                editable={true}
              />
            </div>
          ) : null}

          {linkedSystems && linkedSystems.length > 0 && (
            <div className={cx('dfd-tiles__linked-systems')}>
              {linkedSystems.map((system) => {
                const linkValue = system.generalLink?.jsonValue?.value;
                const href = linkValue?.href;
                if (!href) return null;
                const text = linkValue?.text || system.name;
                const target = linkValue?.target || '_blank';
                const rel = target === '_blank' ? 'noopener noreferrer' : undefined;
                return (
                  <a
                    key={system.id}
                    href={href}
                    className={cx('dfd-tiles__system-link')}
                    target={target}
                    rel={rel}
                  >
                    <span className={cx('dfd-tiles__system-link-text')}>{text}</span>
                    <span className={cx('dfd-tiles__system-link-icon')} aria-hidden="true">
                      <MaterialIcon name="Launch" />
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const DfdTiles = (props: DfdTilesProps): JSX.Element | null => {
  const { page } = useSitecore();
  const { data: session, status: sessionStatus } = useSession();
  const { t } = useI18n();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isEditing = mounted && (page?.mode?.isEditing || false);

  const datasource = props.rendering?.fields?.data?.datasource;

  const tiles = useMemo(() => datasource?.children?.results ?? [], [datasource]);

  const currentPageId = (page?.layout?.sitecore?.route?.itemId as string) || '';

  const {
    tilePreferences,
    saveTilePreferences,
    isLoading: isLoadingPreferences,
  } = useDfdTilesPreferences(currentPageId);

  const allCards: CardItem[] = useMemo(() => tiles.map((t) => ({ id: t.id, raw: t })), [tiles]);

  const [columns, setColumns] = useState<ColumnsState>({ col1: [], col2: [], col3: [] });
  const [activeCard, setActiveCard] = useState<CardItem | null>(null);

  // Tile preferences modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTiles, setModalTiles] = useState<ModalTileItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const shouldSyncFromFirestore = useRef(true);
  const restoreScrollYRef = useRef<number | null>(null);

  // Info accordion state
  const [isInfoExpanded, setIsInfoExpanded] = useState(true);
  const isTilesLoading = !isEditing && (isLoadingPreferences || sessionStatus === 'loading');
  const isMobile = useMediaQuery(MediaQueryConstants.Mobile);

  const openModal = () => {
    setIsModalOpen(true);
    shouldSyncFromFirestore.current = true;
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const selectableTileIds = useMemo(() => new Set(tiles.map((tile) => tile.id)), [tiles]);

  useEffect(() => {
    if (
      tilePreferences &&
      Array.isArray(tilePreferences) &&
      tilePreferences.length > 0 &&
      selectableTileIds.size > 0 &&
      sessionStatus !== 'loading' &&
      !isEditing
    ) {
      const staleTiles = tilePreferences.filter((pref) => !selectableTileIds.has(pref.id));
      if (staleTiles.length > 0) {
        const cleanedPreferences = tilePreferences.filter((pref) => selectableTileIds.has(pref.id));
        if (session?.user) {
          saveTilePreferences(cleanedPreferences).catch((error) => {
            console.error('Failed to clean up stale tile preferences:', error);
          });
        }
      }
    }
  }, [
    tilePreferences,
    selectableTileIds,
    session?.user,
    sessionStatus,
    saveTilePreferences,
    isEditing,
  ]);

  const getMergedTileState = useMemo((): ModalTileItem[] => {
    if (isEditing) {
      return tiles.map((tile) => ({
        id: tile.id,
        name: tileLabel(tile),
        isVisible: asBool(tile.showAsDefaultTile?.jsonValue?.value),
      }));
    }

    if (isLoadingPreferences) return [];

    if (tilePreferences && Array.isArray(tilePreferences) && tilePreferences.length > 0) {
      const firestoreMap = new Map(
        tilePreferences.map((p) => [p.id, { isVisible: p.isVisible, order: p.order }])
      );

      const merged = tiles.map((tile) => {
        const saved = firestoreMap.get(tile.id);
        return {
          id: tile.id,
          name: tileLabel(tile),
          isVisible: saved?.isVisible ?? asBool(tile.showAsDefaultTile?.jsonValue?.value),
          order: saved?.order ?? 999,
        };
      });

      return merged.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    }

    return tiles.map((tile) => ({
      id: tile.id,
      name: tileLabel(tile),
      isVisible: asBool(tile.showAsDefaultTile?.jsonValue?.value),
    }));
  }, [tiles, tilePreferences, isEditing, isLoadingPreferences]);

  useEffect(() => {
    if (isModalOpen && shouldSyncFromFirestore.current) {
      if (getMergedTileState.length > 0) {
        setModalTiles(getMergedTileState);
        shouldSyncFromFirestore.current = false;
      }
    }
  }, [isModalOpen, getMergedTileState]);

  useEffect(() => {
    if (isTilesLoading) {
      setColumns({ col1: [], col2: [], col3: [] });
      return;
    }

    if (getMergedTileState.length === 0) {
      setColumns({ col1: [], col2: [], col3: [] });
      return;
    }

    const visibleTiles = getMergedTileState.filter((t) => t.isVisible);
    if (visibleTiles.length === 0) {
      setColumns({ col1: [], col2: [], col3: [] });
      return;
    }

    const visibleCards = visibleTiles
      .map((t) => allCards.find((c) => c.id === t.id))
      .filter((c): c is CardItem => c !== undefined);

    if (isMobile) {
      setColumns({ col1: visibleCards, col2: [], col3: [] });
      return;
    }

    const next: ColumnsState = { col1: [], col2: [], col3: [] };
    visibleCards.forEach((card, index) => {
      const colIndex = (index % 3) + 1;
      next[`col${colIndex}` as keyof ColumnsState].push(card);
    });

    setColumns(next);
  }, [isTilesLoading, getMergedTileState, allCards, isMobile]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent): void => {
    if (isEditing) return;
    const card = allCards.find((c) => c.id === String(event.active.id));
    if (card) setActiveCard(card);
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over || isEditing || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const findCol = (id: string): keyof ColumnsState | undefined => {
      if (columns.col1.some((c) => c.id === id)) return 'col1';
      if (columns.col2.some((c) => c.id === id)) return 'col2';
      if (columns.col3.some((c) => c.id === id)) return 'col3';
      return undefined;
    };

    const sourceCol = findCol(activeId);
    const destCol =
      overId === 'col1' || overId === 'col2' || overId === 'col3'
        ? (overId as keyof ColumnsState)
        : findCol(overId);

    if (!sourceCol || !destCol) return;

    setColumns((prev) => {
      const sourceItems = [...prev[sourceCol]];
      const destItems = sourceCol === destCol ? sourceItems : [...prev[destCol]];

      if (sourceCol === destCol) {
        return {
          ...prev,
          [sourceCol]: arrayMove(
            sourceItems,
            sourceItems.findIndex((c) => c.id === activeId),
            sourceItems.findIndex((c) => c.id === overId)
          ),
        };
      }

      const [moved] = sourceItems.splice(
        sourceItems.findIndex((c) => c.id === activeId),
        1
      );

      const overIndex = destItems.findIndex((c) => c.id === overId);
      destItems.splice(overIndex >= 0 ? overIndex : destItems.length, 0, moved);

      return { ...prev, [sourceCol]: sourceItems, [destCol]: destItems };
    });
  };

  const handleModalDragEnd = ({ active, over }: DragEndEvent): void => {
    if (!over || active.id === over.id) return;

    shouldSyncFromFirestore.current = false;

    setModalTiles((items) => {
      const oldIndex = items.findIndex((t) => t.id === active.id);
      const newIndex = items.findIndex((t) => t.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return items;
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const handleToggleTile = (id: string): void => {
    shouldSyncFromFirestore.current = false;

    setModalTiles((prev) =>
      prev.map((tile) => (tile.id === id ? { ...tile, isVisible: !tile.isVisible } : tile))
    );
  };

  const handleSaveChanges = async (): Promise<void> => {
    const storedY = document.body.dataset.scrollY;
    restoreScrollYRef.current = storedY ? parseInt(storedY, 10) : window.scrollY;

    if (isEditing) {
      closeModal();
      return;
    }

    if (!session?.user) {
      return;
    }

    try {
      setIsSaving(true);

      const preferencesToSave = modalTiles.map((t, index) => ({
        id: t.id,
        isVisible: t.isVisible,
        order: index + 1,
      }));

      closeModal();

      await saveTilePreferences(preferencesToSave);
    } catch (error) {
      console.error('Error saving tile preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelModal = useCallback((): void => {
    setModalTiles(getMergedTileState);
    closeModal();
  }, [getMergedTileState]);

  useEffect(() => {
    if (isModalOpen) {
      const scrollY = window.scrollY;

      document.body.dataset.scrollY = String(scrollY);
      document.body.classList.add('global-header-menu-open');

      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') handleCancelModal();
      };

      window.addEventListener('keydown', onKeyDown);

      return () => {
        window.removeEventListener('keydown', onKeyDown);
      };
    } else {
      const storedY = document.body.dataset.scrollY;
      document.body.classList.remove('global-header-menu-open');

      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';

      const y = restoreScrollYRef.current ?? (storedY ? parseInt(storedY, 10) : null);

      if (y !== null) {
        requestAnimationFrame(() => {
          window.scrollTo(0, y);
          restoreScrollYRef.current = null;
        });
      }

      delete document.body.dataset.scrollY;
    }
    return undefined;
  }, [handleCancelModal, isModalOpen]);

  const modalSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    if (isTilesLoading) return;

    const getCards = () =>
      Array.from(document.getElementsByClassName(styles['dfd-tiles__card'])) as HTMLElement[];

    const reset = () => {
      getCards().forEach((card) => (card.style.height = 'auto'));
    };

    if (isMobile) {
      reset();
      return;
    }

    const measure = () => {
      const cards = getCards();
      if (!cards.length) return;

      reset();

      const tallest = Math.max(...cards.map((card) => card.offsetHeight));
      cards.forEach((card) => (card.style.height = `${tallest}px`));
    };

    const raf = requestAnimationFrame(measure);

    const observer = new ResizeObserver(measure);
    getCards().forEach((card) => observer.observe(card));

    window.addEventListener('resize', measure);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [isTilesLoading, columns, isMobile]);

  const headline = datasource?.headline?.jsonValue;
  const infoHeadline = datasource?.informationalNoteHeadline?.jsonValue;
  const infoContent = datasource?.informationalNoteContent?.jsonValue;

  const modalTitle = datasource?.modalTitle?.jsonValue;
  const modalDirections = datasource?.modalDirections?.jsonValue;
  const selectTwoModulesErrorMessage = datasource?.selectTwoModulesErrorMessage?.jsonValue;
  const selectOneMoreModulesErrorMessage = datasource?.selectOneMoreModulesErrorMessage?.jsonValue;

  const visibleCount = modalTiles.filter((t) => t.isVisible).length;
  const isInvalid = visibleCount < 2;
  const errorMessage =
    visibleCount === 0
      ? selectTwoModulesErrorMessage?.value
      : visibleCount === 1
        ? selectOneMoreModulesErrorMessage?.value
        : null;

  const modalTileIds = useMemo(() => modalTiles.map((t) => t.id), [modalTiles]);

  if (!datasource && !isEditing) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className={cx(
          'dfd-tiles',
          'component',
          'container',
          'flex',
          'flex-col',
          'gap-8',
          props.stylesSXA
        )}
        id={props.rendering?.params?.RenderingIdentifier}
      >
        <div className={cx('dfd-tiles__header', 'flex gap-3 items-center')}>
          <Text tag="h2" field={headline} editable={isEditing} />
          {session && (
            <button
              type="button"
              onClick={openModal}
              className={cx('dfd-tiles__edit', 'flex')}
              aria-label="Customize tiles"
            >
              <MaterialIcon name="ModeEditOutlined" />
            </button>
          )}
        </div>

        <div className={cx('dfd-tiles__tile-container', 'grid gap-6 mb-2 pb-10')}>
          {isTilesLoading ? (
            <TilesLoader />
          ) : (
            (Object.entries(columns) as [keyof ColumnsState, CardItem[]][]).map(
              ([colId, cards]) => (
                <SortableContext
                  key={colId}
                  items={cards.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className={cx('dfd-tiles__column')}>
                    {cards.map((card) => (
                      <SortableCard key={card.id} card={card} isEditing={isEditing} />
                    ))}
                  </div>
                </SortableContext>
              )
            )
          )}
        </div>

        {(infoHeadline?.value || infoContent?.value || isEditing) && (
          <div className={cx('dfd-tiles__updates', 'flex flex-col')}>
            <div className={cx('dfd-tiles__updates-header', 'flex items-center justify-between')}>
              <div className={cx('dfd-tiles__updates-title', 'flex gap-2 items-center')}>
                <MaterialIcon name="InfoOutlined" />
                <Text tag="span" field={infoHeadline} editable={isEditing} />
              </div>

              <button
                type="button"
                className={cx('dfd-tiles__updates-toggle')}
                onClick={() => setIsInfoExpanded((prev) => !prev)}
                aria-expanded={isInfoExpanded}
              >
                {isInfoExpanded
                  ? t('Collapse') || DFDTileDictionary.Collapse
                  : t('Expand') || DFDTileDictionary.Expand}
              </button>
            </div>

            {isInfoExpanded && (
              <RichText
                field={infoContent}
                className={cx('dfd-tiles__updates-description', 'rich-text')}
                editable={isEditing}
              />
            )}
          </div>
        )}

        {isModalOpen && (
          <div className={cx('dfd-tiles__modal-overlay')} role="dialog" aria-modal="true">
            <div
              className={cx('dfd-tiles__modal', 'flex flex-col gap-4')}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={cx('dfd-tiles__modal-header', 'flex flex-col')}>
                <Text tag="span" className={cx('dfd-tiles__modal-title')} field={modalTitle} />
                {errorMessage && (
                  <div className={cx('dfd-tiles__modal-warning', 'flex items-center gap-2')}>
                    <MaterialIcon name="InfoOutlined" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              <div className={cx('dfd-tiles__modal-body', 'flex flex-col gap-4')}>
                <Text tag="p" field={modalDirections} />

                <DndContext
                  sensors={modalSensors}
                  collisionDetection={closestCorners}
                  onDragEnd={handleModalDragEnd}
                >
                  <fieldset className={cx('dfd-tiles__checkbox-group', 'flex flex-col gap-4')}>
                    <legend className="sr-only">Reorder options</legend>
                    {modalTileIds.map((id) => {
                      const item = modalTiles.find((i) => i.id === id);
                      if (!item) return null;
                      return (
                        <DraggableCheckboxRow
                          key={item.id}
                          item={item}
                          onToggle={handleToggleTile}
                        />
                      );
                    })}
                  </fieldset>
                </DndContext>
              </div>

              <div className={cx('dfd-tiles__modal-footer', 'flex justify-end gap-8')}>
                <button
                  type="button"
                  className={cx('dfd-tiles__modal-cancel')}
                  onClick={handleCancelModal}
                  aria-label="Close"
                  disabled={isSaving}
                >
                  {t('Cancel') || DFDTileDictionary.Cancel}
                </button>
                <button
                  type="button"
                  className={cx(
                    'dfd-tiles__modal-save',
                    (isInvalid || isSaving) && 'dfd-tiles__modal-save--disabled'
                  )}
                  aria-label="Save Changes"
                  disabled={isInvalid || isSaving}
                  onClick={handleSaveChanges}
                >
                  {isSaving
                    ? t('Saving') || DFDTileDictionary.Saving
                    : t('SaveChanges') || DFDTileDictionary.SaveChanges}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <DragOverlay>
        {activeCard && (
          <div className={cx('dfd-tiles__card', 'dfd-tiles__card--overlay')}>
            <div className={cx('dfd-tiles__card-header')}>
              <span>{tileLabel(activeCard.raw)}</span>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default compose<DfdTilesProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(DfdTiles);
