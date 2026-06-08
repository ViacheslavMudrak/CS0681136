import type { ComponentProps } from "@/lib/component-props";
import { getPathWithoutLocale } from "@/lib/locale-cookie";

type RenderingWalkNode = {
  componentName?: string;
  params?: Record<string, unknown>;
  placeholders?: Record<string, unknown>;
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

function collectRenderings(
  node: unknown,
  componentName: string,
  out: RenderingWalkNode[]
): void {
  if (!node || typeof node !== "object") return;

  if (Array.isArray(node)) {
    for (const item of node) {
      collectRenderings(item, componentName, out);
    }
    return;
  }

  const r = node as RenderingWalkNode;
  if (r.componentName === componentName) {
    out.push(r);
  }

  const placeholders = r.placeholders;
  if (!placeholders || typeof placeholders !== "object") return;

  for (const value of Object.values(placeholders)) {
    collectRenderings(value, componentName, out);
  }
}

function isComponentPlaced(rendering: unknown, componentName: string): boolean {
  const matches: RenderingWalkNode[] = [];
  collectRenderings(rendering, componentName, matches);
  return matches.length > 0;
}

/**
 * True when the current Sitecore page is the personalized dashboard home (not Experience Editor).
 */
export function isPersonalizedDashboardHomePage(page: ComponentProps["page"]): boolean {
  if (page.mode.isEditing) return false;

  const route = page.layout?.sitecore?.route as
    | { name?: string; displayName?: string }
    | undefined;
  const routeName = String(route?.name ?? route?.displayName ?? "").trim();
  if (routeName === "Home") return true;

  const itemPath = String(
    (page.layout?.sitecore?.context as { itemPath?: string } | undefined)?.itemPath ?? ""
  ).trim();
  if (!itemPath) return false;

  const normalized = itemPath.startsWith("/") ? itemPath : `/${itemPath}`;
  return getPathWithoutLocale(normalized) === "/";
}

/** Whether the dashboard URL path is home (locale-stripped). */
export function isDashboardHomePathname(pathname: string): boolean {
  return getPathWithoutLocale(pathname) === "/";
}

export function resolveDashboardInfoPanelVisible(
  rendering: unknown,
  isEditing: boolean
): boolean {
  if (!isComponentPlaced(rendering, "DashboardInfoBanner")) return false;
  if (isEditing) return true;
  const nodes: RenderingWalkNode[] = [];
  collectRenderings(rendering, "DashboardInfoBanner", nodes);
  const hidden = nodes.some((n) => isHideParamTruthy(n.params, "HideBanner"));
  return !hidden;
}

export function resolveDashboardPillsVisible(rendering: unknown, isEditing: boolean): boolean {
  if (!isComponentPlaced(rendering, "UserActionTiles")) return false;
  if (isEditing) return true;
  const nodes: RenderingWalkNode[] = [];
  collectRenderings(rendering, "UserActionTiles", nodes);
  const hidden = nodes.some((n) => isHideParamTruthy(n.params, "HideUserActionTiles"));
  return !hidden;
}

export function resolveDashboardUserType(email: string | undefined): "internal" | "external" {
  const normalized = String(email ?? "").trim().toLowerCase();
  return normalized.endsWith("@intralox.com") ? "internal" : "external";
}
