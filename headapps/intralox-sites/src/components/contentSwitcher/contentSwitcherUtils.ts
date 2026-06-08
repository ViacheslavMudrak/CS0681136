import type { ComponentRendering } from '@sitecore-content-sdk/nextjs';

import { patchCalloutDefaultInComponentMap } from '../callout/calloutUtils';
import type { ITabItemsFields } from './ContentSwitcher.type';

/**
 * Builds the dynamic placeholder name for Content Switcher tab panels.
 * Must match Sitecore keys under `rendering.placeholders`, e.g. `content-switcher-tab-1-{*}`.
 * Same `{*}` pattern as RowSplitter (`row-${n}-{*}`) and ColumnSplitter.
 */
export function contentSwitcherTabPlaceholderName(tabIndexOneBased: number): string {
  return `content-switcher-tab-${tabIndexOneBased}-{*}`;
}

/**
 * Whether the Content Switcher tab placeholder has at least one child rendering in layout data.
 * Used to avoid rendering the tab placeholder shell (border/background strip) when the placeholder is empty.
 */
export function contentSwitcherTabPlaceholderHasRenderings(
  rendering: ComponentRendering | null | undefined,
  placeholderName: string,
): boolean {
  const items = rendering?.placeholders?.[placeholderName];
  if (!Array.isArray(items) || items.length === 0) {
    return false;
  }
  return items.some(
    (item) =>
      item != null &&
      typeof item === 'object' &&
      'componentName' in item &&
      Boolean((item as { componentName?: string }).componentName),
  );
}

/**
 * Last path segment of a Sitecore item URL, lowercased, for stable `?solution=` values
 * (e.g. `/.../Modular-Plastic-Belting` → `modular-plastic-belting`).
 */
export function contentSwitcherSolutionKeyFromSitecorePath(
  sitecorePath: string | undefined | null,
): string | null {
  if (sitecorePath == null || !String(sitecorePath).trim()) {
    return null;
  }
  const parts = String(sitecorePath).split('/').filter(Boolean);
  const last = parts[parts.length - 1];
  if (!last) {
    return null;
  }
  try {
    return decodeURIComponent(last).toLowerCase();
  } catch {
    return last.toLowerCase();
  }
}

function tabLabelToFallbackSolutionKey(label: string | undefined | null): string {
  if (label == null || !String(label).trim()) {
    return '';
  }
  return String(label)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Canonical `solution` query value for a tab: prefer {@link contentSwitcherSolutionKeyFromSitecorePath}
 * from `item.url`, else a slug derived from {@link ITabItemsFields.fields.TabLabel}, else `tab-{id}`.
 */
export function getContentSwitcherTabSolutionKey(item: ITabItemsFields): string {
  const fromUrl = contentSwitcherSolutionKeyFromSitecorePath(item.url);
  if (fromUrl) {
    return fromUrl;
  }
  const fromLabel = tabLabelToFallbackSolutionKey(item.fields?.TabLabel?.value);
  if (fromLabel) {
    return fromLabel;
  }
  return `tab-${item.id}`;
}

/**
 * Whether `solutionParam` (raw `searchParams.get('solution')`) selects this tab.
 * Matches canonical key case-insensitively, or legacy exact {@link ITabItemsFields.fields.TabLabel}.
 */
export function contentSwitcherTabMatchesSolutionParam(
  item: ITabItemsFields,
  solutionParam: string,
): boolean {
  const trimmed = solutionParam.trim();
  if (!trimmed) {
    return false;
  }
  const key = getContentSwitcherTabSolutionKey(item);
  if (key === trimmed.toLowerCase()) {
    return true;
  }
  const label = item.fields?.TabLabel?.value;
  return label != null && label === trimmed;
}

/**
 * Normalizes known authoring typos in tab rich text (e.g. `<dv>` instead of `<div>`) so
 * padding wrappers and sanitizers behave like valid markup. Prefer fixing the source in Sitecore.
 */
export function fixContentSwitcherTabContentHtml(value: string | undefined | null): string | undefined {
  if (value == null) {
    return value ?? undefined;
  }
  return value.replace(/<dv(\s|>)/gi, '<div$1').replace(/<\/dv>/gi, '</div>');
}

/** Wraps tab Callout renderings with `contentSwitcherLayout` for strip chrome inside placeholders. */
export function patchComponentMapForContentSwitcherCallouts(componentMap: unknown): Map<string, unknown> {
  return patchCalloutDefaultInComponentMap(componentMap, { contentSwitcherLayout: true });
}
