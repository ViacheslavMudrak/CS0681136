import type { Field } from "@sitecore-content-sdk/nextjs";

import type { IUserActionTilesFields, IUserActionTileItem } from "@/components/core/UserActionTiles/UserActionTiles.type";


/** Numeric sort key from CMS; missing or invalid values sort as `0`. */
export function parseTileSortOrder(
  field?: Field<string> | Field<number>
): number {
  const v = field?.value;
  if (v == null) {
    return 0;
  }
  if (typeof v === "number" && Number.isFinite(v)) {
    return v;
  }
  const n = Number.parseInt(String(v).trim(), 10);
  return Number.isFinite(n) ? n : 0;
}

function parseTileSortOrderFromItem(tile: IUserActionTileItem): number {
  const f = tile.fields;
  if (!f) {
    return 0;
  }
  const spaced = (f as { "Sort Order"?: Field<string> | Field<number> })["Sort Order"];
  return parseTileSortOrder(f.SortOrder ?? spaced);
}

/** `true` when the tile should render for visitors (hidden only if explicitly `false`). */
export function isUserActionTileVisibleForVisitors(tile: IUserActionTileItem): boolean {
  return tile.fields?.Visible?.value !== false;
}

type IndexedTile = { tile: IUserActionTileItem; index: number };

/**
 * Filters to tiles with `fields`, visitor-visible when not editing, then sorts by `SortOrder` ascending with stable CMS order on ties.
 */
export function prepareUserActionTilesForDisplay(
  tiles: IUserActionTileItem[] | undefined,
  isEditing: boolean
): IUserActionTileItem[] {
  const list = (tiles ?? []).filter((t) => t?.fields);
  const indexed: IndexedTile[] = list.map((tile, index) => ({ tile, index }));
  const visible = indexed.filter(({ tile }) => {
    if (!tile?.fields) {
      return false;
    }
    if (isEditing) {
      return true;
    }
    return isUserActionTileVisibleForVisitors(tile);
  });
  visible.sort((a, b) => {
    const da = parseTileSortOrderFromItem(a.tile);
    const db = parseTileSortOrderFromItem(b.tile);
    if (da !== db) {
      return da - db;
    }
    return a.index - b.index;
  });
  return visible.map(({ tile }) => tile);
}
