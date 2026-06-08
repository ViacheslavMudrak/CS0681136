import { cn } from "@/lib/utils";

export const DASHBOARD_WIDGETS_PLACEHOLDER = "DashboardWidgets";

type DashboardWidgetRendering = {
  componentName?: string;
  params?: Record<string, unknown>;
};

const DASHBOARD_WIDGET_HIDE_PARAMS: Record<string, string> = {
  RecentOrderWidget: "HideWidget",
  RecentQuoteWidget: "HideWidget",
  SearchComponent: "HideComponent",
  FeaturedContentTile: "HideTile",
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

function readDashboardWidgetsPlaceholderRenderings(rendering: unknown): DashboardWidgetRendering[] {
  const items = (rendering as { placeholders?: Record<string, unknown> } | undefined)
    ?.placeholders?.[DASHBOARD_WIDGETS_PLACEHOLDER];
  if (!Array.isArray(items)) return [];

  return items.filter(
    (item): item is DashboardWidgetRendering =>
      item != null &&
      typeof item === "object" &&
      typeof (item as DashboardWidgetRendering).componentName === "string"
  );
}

/** Whether a dashboard widget rendering is shown on the live site (matches child `showSection` logic). */
export function isDashboardWidgetRenderingVisible(
  node: DashboardWidgetRendering,
  isEditing: boolean
): boolean {
  if (isEditing) return true;

  const componentName = String(node.componentName ?? "").trim();
  const hideParam = DASHBOARD_WIDGET_HIDE_PARAMS[componentName];
  if (!hideParam) return true;

  return !isHideParamTruthy(node.params, hideParam);
}

/** Count of widgets that render in the `DashboardWidgets` placeholder for layout purposes. */
export function countVisibleDashboardWidgets(rendering: unknown, isEditing: boolean): number {
  return readDashboardWidgetsPlaceholderRenderings(rendering).filter((node) =>
    isDashboardWidgetRenderingVisible(node, isEditing)
  ).length;
}

/**
 * Responsive grid classes for {@link DashboardSplitter}:
 * - mobile: single column
 * - md+: two columns when 2+ widgets; lone last row spans full width when count is odd (1 or 3)
 */
export function resolveDashboardSplitterGridClassName(visibleCount: number): string {
  const base = "grid grid-cols-1 gap-x-[20px] gap-y-[21px] items-stretch w-full [&>*]:min-w-0";

  if (visibleCount <= 1) {
    return cn(base, "md:grid-cols-1");
  }

  return cn(base, "lg:grid-cols-2", "lg:[&>*:last-child:nth-child(odd)]:col-span-2");
}
