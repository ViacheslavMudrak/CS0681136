import type { LinkField } from '@sitecore-content-sdk/nextjs';

import {
  calloutItemHasPreviewContent,
  coalesceCalloutGroupLinkFieldForSdk,
  normalizeLinkFieldNode,
  resolveCalloutConfig,
} from '../callout/calloutUtils';
import { contentSwitcherSolutionKeyFromSitecorePath } from '../contentSwitcher/contentSwitcherUtils';
import { extractMediaTileBrightcoveId } from '../media-tile/mediaTileUtils';
import { linkFieldHref } from '../shared/linkCtaChrome';

import type { CalloutConfig, CalloutFields, CalloutItem, SitecoreValueItem } from '../callout/Callout.type';
import type { IVideoFields } from '../../utils/interface';

import type {
  ProductModalItem,
  ProductSegmentApplicationFilter,
  ProductSegmentFields,
  ProductSegmentItem,
  ProductSegmentResolvedState,
  ProductSegmentTaxonomyItem,
} from './ProductSegment.type';

/** Last URL path segment as lowercase slug. */
export function getItemSlugFromUrl(url?: string | null): string | null {
  return contentSwitcherSolutionKeyFromSitecorePath(url);
}

/** Canonical segment slug for URL query param. */
export function getSegmentSlug(segment: ProductSegmentItem): string {
  return getItemSlugFromUrl(segment.url) ?? `segment-${segment.id}`;
}

/** Canonical product modal slug for URL query param. */
export function getModalSlug(modal: ProductModalItem): string {
  return getItemSlugFromUrl(modal.url) ?? `modal-${modal.id}`;
}

/** Canonical application filter slug. */
export function getApplicationSlug(app: ProductSegmentTaxonomyItem): string {
  const fromUrl = getItemSlugFromUrl(app.url);
  if (fromUrl) {
    return fromUrl;
  }
  const label = app.fields?.Value?.value ?? app.displayName ?? app.name ?? '';
  if (label) {
    return String(label)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  return app.id;
}

/** Visible segments with at least heading or modals. */
export function getVisibleSegments(
  segments: ProductSegmentItem[] | undefined,
): ProductSegmentItem[] {
  return (segments ?? []).filter((segment) => {
    const { Heading, ProductModal } = segment.fields ?? {};
    const hasHeading = Boolean(String(Heading?.value ?? '').trim());
    const hasModals = (ProductModal?.length ?? 0) > 0;
    return hasHeading || hasModals;
  });
}

/** Unique application filters linked to modals in the active segment (stable first-seen order). */
export function deriveApplicationFilters(
  modals: ProductModalItem[],
): ProductSegmentApplicationFilter[] {
  const seen = new Map<string, ProductSegmentApplicationFilter>();

  for (const modal of modals) {
    for (const app of modal.fields?.Application ?? []) {
      if (!app?.id) continue;
      const slug = getApplicationSlug(app);
      if (seen.has(slug)) continue;
      const label =
        app.fields?.Value?.value ??
        app.displayName ??
        app.name ??
        slug;
      seen.set(slug, { id: app.id, slug, label: String(label) });
    }
  }

  return Array.from(seen.values());
}

/** Filter modals by application slug; `null` means All (includes modals with no Application). */
export function filterModals(
  modals: ProductModalItem[],
  applicationSlug: string | null,
): ProductModalItem[] {
  if (!applicationSlug) {
    return modals;
  }

  return modals.filter((modal) => {
    const apps = modal.fields?.Application ?? [];
    if (apps.length === 0) {
      return false;
    }
    return apps.some((app) => getApplicationSlug(app) === applicationSlug);
  });
}

/** Primary application label for card footer (first linked application). */
export function getModalPrimaryApplicationLabel(
  modal: ProductModalItem,
): string | undefined {
  const app = modal.fields?.Application?.[0];
  if (!app) return undefined;
  const label = app.fields?.Value?.value ?? app.displayName ?? app.name;
  return label ? String(label) : undefined;
}

export interface ProductSegmentSearchParams {
  get(name: string): string | null;
}

/**
 * Resolves segment, application, and item from URL search params with silent fallbacks.
 * Without a valid `segment` param, no segment is selected and detail UI stays hidden.
 */
export function resolveProductSegmentState(
  segments: ProductSegmentItem[],
  searchParams: ProductSegmentSearchParams,
): ProductSegmentResolvedState {
  const visible = getVisibleSegments(segments);
  const emptyState: ProductSegmentResolvedState = {
    segmentIndex: -1,
    segmentSlug: '',
    applicationSlug: null,
    itemSlug: null,
    openModal: false,
    hasSegmentSelected: false,
  };

  if (!visible.length) {
    return emptyState;
  }

  const segmentParam = searchParams.get('segment')?.trim().toLowerCase() ?? '';
  if (!segmentParam) {
    return emptyState;
  }

  const segmentIndex = visible.findIndex(
    (segment) => getSegmentSlug(segment) === segmentParam,
  );
  if (segmentIndex < 0) {
    return emptyState;
  }

  const activeSegment = visible[segmentIndex];
  const segmentSlug = getSegmentSlug(activeSegment);
  const modals = activeSegment.fields?.ProductModal ?? [];
  const filters = deriveApplicationFilters(modals);

  const applicationParam =
    searchParams.get('application')?.trim().toLowerCase() ?? '';
  let applicationSlug: string | null = null;
  if (applicationParam) {
    const match = filters.find((f) => f.slug === applicationParam);
    applicationSlug = match ? match.slug : null;
  }

  const filteredModals = filterModals(modals, applicationSlug);
  const itemParam = searchParams.get('item')?.trim().toLowerCase() ?? '';
  let itemSlug: string | null = null;
  let openModal = false;
  if (itemParam) {
    const match = filteredModals.find((m) => getModalSlug(m) === itemParam);
    if (match) {
      itemSlug = getModalSlug(match);
      openModal = true;
    }
  }

  return {
    segmentIndex,
    segmentSlug,
    applicationSlug,
    itemSlug,
    openModal,
    hasSegmentSelected: true,
  };
}

/** Finds modal by slug within a list. */
export function findModalBySlug(
  modals: ProductModalItem[],
  slug: string | null | undefined,
): ProductModalItem | undefined {
  if (!slug) return undefined;
  return modals.find((modal) => getModalSlug(modal) === slug);
}

/** Whether media type field indicates video. */
export function isProductModalVideo(
  mediaType: ProductSegmentTaxonomyItem | SitecoreValueItem | undefined | null,
): boolean {
  const raw = mediaType?.fields?.Value?.value;
  return typeof raw === 'string' && raw.toLowerCase() === 'video';
}

/** Brightcove video id from a product modal Video droplink. */
export function getProductModalVideoId(
  video: NonNullable<ProductModalItem['fields']>['Video'],
): string {
  return extractMediaTileBrightcoveId(video) ?? '';
}

/**
 * True when featured media should render as video (cover + play, click to play).
 * Prefers a linked Video item with Brightcove id; falls back to MediaType in XM Pages.
 */
export function productModalShouldRenderVideo(
  fields: ProductModalItem['fields'],
  isEditing: boolean,
): boolean {
  if (!fields) {
    return false;
  }

  const videoId = fields.Video ? getProductModalVideoId(fields.Video) : '';
  if (videoId) {
    return true;
  }

  if (isEditing) {
    return Boolean(fields.Video) || isProductModalVideo(fields.MediaType);
  }

  return false;
}

/**
 * Visible callout child items for a product modal Callout folder (preview + editing rules).
 */
export function getProductModalVisibleCalloutItems(
  calloutFields: CalloutFields | undefined,
  isEditing: boolean,
): CalloutItem[] {
  return (calloutFields?.Callouts ?? calloutFields?.CalloutItems ?? []).filter(
    (item) => isEditing || calloutItemHasPreviewContent(item.fields),
  );
}

/**
 * Product modal callouts always render as Style `card`, Direction `column`, TextSize `sm`
 * (horizontal-split bands: 36px value, 12px uppercase label — see `@theme` sm tokens).
 * Colorscheme still comes from CMS when present.
 */
export function resolveProductModalCalloutConfig(
  calloutFields: CalloutFields | undefined,
): CalloutConfig {
  const base = resolveCalloutConfig({
    Style: calloutFields?.Style,
    ColorScheme: calloutFields?.Colorscheme,
  });

  return {
    ...base,
    style: 'card',
    direction: 'column',
    titleSize: 'sm',
  };
}

/** Flattens layout / GraphQL link shapes for Content SDK `Link`. */
export function resolveProductModalLinkField(
  link: LinkField | undefined,
): LinkField | undefined {
  return coalesceCalloutGroupLinkFieldForSdk(normalizeLinkFieldNode(link));
}

/** Whether the product modal download link should render. */
export function productModalLinkIsVisible(
  link: LinkField | undefined,
  isEditing: boolean,
): boolean {
  const resolved = resolveProductModalLinkField(link);
  if (!resolved) {
    return isEditing;
  }

  const href = linkFieldHref(resolved);
  const text = String(resolved.value?.text ?? '').trim();
  return Boolean(href || text || isEditing);
}

/** Safe segment field access for server normalization. */
export function normalizeProductSegmentFields(
  fields: ProductSegmentFields | undefined,
): ProductSegmentFields | undefined {
  if (!fields) return undefined;
  return {
    ...fields,
    Segments: fields.Segments?.filter(Boolean),
  };
}
