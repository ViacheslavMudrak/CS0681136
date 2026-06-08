import { getTranslations } from 'next-intl/server';

/** Resolved UI strings for Callout empty datasource hints. */
export type CalloutLabels = {
  emptyHint: string;
};

/** Default English copy when Sitecore dictionary keys are missing. */
export const CALLOUT_LABEL_FALLBACKS: CalloutLabels = {
  emptyHint: 'Callout',
};

function readMessage(t: (key: string) => string, key: string, fallback: string): string {
  try {
    const value = t(key as never);
    if (typeof value !== 'string' || value.trim().length === 0) return fallback;
    if (value === key) return fallback;
    return value;
  } catch {
    return fallback;
  }
}

/**
 * Reads labels from the Sitecore dictionary (next-intl messages). Optional key at the message root:
 * `Callout_EmptyHint`.
 * Falls back to {@link CALLOUT_LABEL_FALLBACKS} when keys are missing or `getTranslations` fails.
 *
 * @returns Labels for empty datasource hints in the authoring experience.
 */
export async function getCalloutLabels(): Promise<CalloutLabels> {
  try {
    const t = await getTranslations();
    return {
      emptyHint: readMessage(t, 'Callout_EmptyHint', CALLOUT_LABEL_FALLBACKS.emptyHint),
    };
  } catch {
    return { ...CALLOUT_LABEL_FALLBACKS };
  }
}
