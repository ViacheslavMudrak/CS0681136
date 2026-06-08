import type { Page } from '@sitecore-content-sdk/nextjs';

export type MockPageOptions = {
  /** XM Cloud Pages / preview editing surface */
  isEditing?: boolean;
  isPreview?: boolean;
};

/**
 * Minimal `page` for Storybook (and tests) aligned with `lib/component-props`.
 * `mode.isNormal` is required by Sitecore SDK client components (e.g. `NextImage`) when a full
 * `SitecoreProvider` page object is merged from story args.
 * Extend at call sites with `as Page` only when the SDK `Page` type gains required fields.
 */
export function createMockPage(options: MockPageOptions = {}): Page {
  const { isEditing = false, isPreview = false } = options;
  return {
    mode: {
      isEditing,
      isPreview,
      isNormal: !isEditing && !isPreview,
    },
  } as Page;
}
