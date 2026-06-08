import { cn } from "@/lib/utils";

export const COLUMN_SPLITTER_LEFT_PLACEHOLDER = "ColumnSplitterLeft";
export const COLUMN_SPLITTER_RIGHT_PLACEHOLDER = "ColumnSplitterRight";

const UTILITY_LINKS_COMPONENT_NAME = "UtilityLinks";
const UTILITY_LINKS_HIDE_PARAM = "HideTile";

type PlaceholderRendering = {
  componentName?: string;
  params?: Record<string, unknown>;
};

function isHideParamTruthy(params: Record<string, unknown> | undefined, key: string): boolean {
  const raw = params?.[key];
  if (raw === true || raw === 1) return true;
  if (typeof raw === "string") {
    const t = raw.trim().toLowerCase();
    return t === "1" || t === "true";
  }
  return false;
}

function readPlaceholderRenderings(rendering: unknown, placeholderName: string): PlaceholderRendering[] {
  const items = (rendering as { placeholders?: Record<string, unknown> } | undefined)?.placeholders?.[
    placeholderName
  ];
  if (!Array.isArray(items)) return [];

  return items.filter(
    (item): item is PlaceholderRendering =>
      item != null && typeof item === "object" && typeof (item as PlaceholderRendering).componentName === "string"
  );
}

/** Matches {@link UtilityLinksDefaultVariant} `showSection` for a single rendering node. */
export function isUtilityLinksRenderingVisible(
  node: PlaceholderRendering,
  isEditing: boolean
): boolean {
  if (isEditing) return true;

  const componentName = String(node.componentName ?? "").trim();
  if (componentName !== UTILITY_LINKS_COMPONENT_NAME) return true;

  return !isHideParamTruthy(node.params, UTILITY_LINKS_HIDE_PARAM);
}

/** Whether a column placeholder should occupy layout space on the live site. */
export function isColumnSplitterSideVisible(
  rendering: unknown,
  placeholderName: string,
  isEditing: boolean
): boolean {
  const items = readPlaceholderRenderings(rendering, placeholderName);
  if (items.length === 0) return false;
  if (isEditing) return true;

  return items.some((item) => isUtilityLinksRenderingVisible(item, false));
}

export function countVisibleColumnSplitterSides(rendering: unknown, isEditing: boolean): number {
  return Number(isColumnSplitterSideVisible(rendering, COLUMN_SPLITTER_LEFT_PLACEHOLDER, isEditing))
    + Number(isColumnSplitterSideVisible(rendering, COLUMN_SPLITTER_RIGHT_PLACEHOLDER, isEditing));
}

/** Responsive grid classes for {@link ColumnSpiltterClientSideDefault}. */
export function resolveColumnSplitterGridClassName(visibleSideCount: number): string {
  const base =
    "grid grid-cols-1 gap-x-[20px] gap-y-[21px] mt-[21px] mb-[21px] md:mb-[0px] w-full [&>*]:min-w-0";

  if (visibleSideCount <= 1) {
    return cn(base, "md:grid-cols-1");
  }

  return cn(base, "md:grid-cols-2");
}
