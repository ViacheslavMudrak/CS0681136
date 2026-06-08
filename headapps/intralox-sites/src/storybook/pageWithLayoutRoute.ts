import type { Page } from '@sitecore-content-sdk/nextjs';

import { createMockPage } from './mockPage';

/**
 * `page` with `layout.sitecore.route.fields` for components that read route fallbacks (Title, PageContent, Banner).
 * Optional `itemPath` / `itemId` support Navigation active state and link matching in Storybook.
 */
export function createMockPageWithLayoutRoute(options: {
  isEditing?: boolean;
  routeFields?: Record<string, unknown>;
  /** `layout.sitecore.context.itemPath` — used by Navigation for “current” mega-menu / tab alignment. */
  itemPath?: string;
  /** `layout.sitecore.route.itemId` — optional route item GUID for nav link `id` matching. */
  itemId?: string;
} = {}): Page {
  const { isEditing = false, routeFields = {}, itemPath, itemId } = options;
  return {
    ...createMockPage({ isEditing }),
    layout: {
      sitecore: {
        route: {
          fields: routeFields,
          ...(itemId !== undefined && itemId !== '' ? { itemId } : {}),
        },
        context: {
          ...(itemPath !== undefined && itemPath !== '' ? { itemPath } : {}),
        },
      },
    },
  } as Page;
}
