import type { Field } from "@sitecore-content-sdk/nextjs";

import type { PortalShellNavItem, PortalShellNavSection } from "./PortalShellSideNav.type";

/** Sitecore checkbox / boolean field (true, 1, "true", "1"). */
export function readPortalShellBooleanField(
  field: Field<boolean | string | number> | undefined
): boolean {
  const raw = field?.value;
  if (raw === true || raw === 1) return true;
  if (typeof raw === "string") {
    const t = raw.trim().toLowerCase();
    return t === "1" || t === "true";
  }
  return false;
}

export function readShowExpandMenu(item: PortalShellNavItem): boolean {
  return readPortalShellBooleanField(item.fields?.ShowExpandMenu);
}

/** Expandable groups pinned open by CMS (`ShowExpandMenu`); parent row click must not collapse them. */
export function collectPinnedExpandedNavItemIds(
  sections: PortalShellNavSection[]
): Set<string> {
  const set = new Set<string>();
  for (const section of sections) {
    for (const item of section.fields?.SubNavigationItems ?? []) {
      if ((item.fields?.SubNavigationItems ?? []).length === 0) continue;
      if (readShowExpandMenu(item)) {
        set.add(item.id);
      }
    }
  }
  return set;
}

/**
 * Nav groups that should render expanded: URL-active parent (child route match) or CMS `ShowExpandMenu`.
 * Active link styling remains URL-driven in the variant; this only controls submenu visibility.
 */
export function collectDefaultExpandedNavItemIds(
  sections: PortalShellNavSection[],
  isPathActive: (href: string) => boolean,
  getLinkHref: (item: PortalShellNavItem) => string
): Set<string> {
  const set = new Set<string>();
  for (const section of sections) {
    for (const item of section.fields?.SubNavigationItems ?? []) {
      const subItems = item.fields?.SubNavigationItems ?? [];
      if (subItems.length === 0) continue;
      const hasActiveChild = subItems.some((s) => isPathActive(getLinkHref(s)));
      if (hasActiveChild || readShowExpandMenu(item)) {
        set.add(item.id);
      }
    }
  }
  return set;
}
