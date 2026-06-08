/**
 * Fallback copy aligned with `lib/*-i18n` defaults. Defined here only — no imports from `lib/*-i18n`
 * (those modules pull `next-intl/server`; Storybook stories should not depend on them at runtime).
 */
export const storyQuickLinkLabels = {
  emptyHint: 'Quick Link',
  linkAriaFallback: 'Quick Link',
};

export const storyRichTextLabels = {
  emptyHint: 'Rich text',
};

export const storyCalloutLabels = {
  emptyHint: 'Callout',
};

export const storyMediaTileLabels = {
  emptyHint: 'Media Tile',
  noLinksConfigured: 'No links configured',
  linkFallback: 'Link',
};
