import { getTranslations } from 'next-intl/server';

/** Resolved UI strings for Media Tile empty states and CTAs. */
export type MediaTileLabels = {
  emptyHint: string;
  noLinksConfigured: string;
  linkFallback: string;
};

/** Default English copy when Sitecore dictionary keys are missing (shared with link partials). */
export const MEDIA_TILE_LABELS_FALLBACK: MediaTileLabels = {
  emptyHint: 'Media Tile',
  noLinksConfigured: 'No links configured',
  linkFallback: 'Link',
};

/**
 * Reads labels from the Sitecore dictionary (next-intl messages). Optional keys at the message root:
 * `MediaTile_EmptyHint`, `MediaTile_NoLinksConfigured`, `MediaTile_LinkFallback`.
 * Falls back to {@link MEDIA_TILE_LABELS_FALLBACK} when keys are missing or `getTranslations` is unavailable.
 * @returns Label object for empty hints, link group copy, and link accessible names.
 */
export async function getMediaTileLabels(): Promise<MediaTileLabels> {
  try {
    const t = await getTranslations();
    return {
      emptyHint: readMessage(t, 'MediaTile_EmptyHint', MEDIA_TILE_LABELS_FALLBACK.emptyHint),
      noLinksConfigured: readMessage(
        t,
        'MediaTile_NoLinksConfigured',
        MEDIA_TILE_LABELS_FALLBACK.noLinksConfigured,
      ),
      linkFallback: readMessage(t, 'MediaTile_LinkFallback', MEDIA_TILE_LABELS_FALLBACK.linkFallback),
    };
  } catch {
    return { ...MEDIA_TILE_LABELS_FALLBACK };
  }
}

function readMessage(
  t: (key: string) => string,
  key: string,
  fallback: string,
): string {
  try {
    const value = t(key as never);
    if (typeof value !== 'string' || value.trim().length === 0) return fallback;
    if (value === key) return fallback;
    return value;
  } catch {
    return fallback;
  }
}
