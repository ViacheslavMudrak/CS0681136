import type { Field, ImageField, LinkField, TextField } from '@sitecore-content-sdk/nextjs';

import { extractMediaTileBrightcoveId } from 'components/media-tile/mediaTileUtils';
import type { MediaFields } from 'components/media/mediaUtils';
import {
  hasNonEmptyText,
  isVideoMediaType,
  resolveMediaLayoutFields,
  resolveMediaVideoCoverImage,
  unwrapSitecoreImageField,
} from 'components/media/mediaUtils';
import { isRichTextEffectivelyEmpty } from 'components/rich-text/richTextUtils';

import type { IntroductionFields } from './Introduction.type';
import type { IVideoFields } from 'src/utils/interface';
import type { SitecoreValueItem } from 'components/media-tile/MediaTile.type';

export const INTRODUCTION_LABELS = {
  emptyHint: 'Introduction',
  playVideoFallback: 'Play video',
  videoAriaFallback: 'Video',
  linkAriaFallback: 'Link',
  playerNotConfigured: 'Video player is not configured.',
} as const;
/**
 * Normalized Introduction fields after merging `data.datasource` and unwrapping envelopes.
 */
export interface ResolvedIntroductionFields {
  Headline?: TextField;
  Text?: Field<string>;
  Link?: LinkField;
  Image?: ImageField;
  Video?: IVideoFields | null;
  MediaType?: SitecoreValueItem;
}

function unwrapTextField(raw: unknown): TextField | undefined {
  if (raw == null || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  if ('jsonValue' in o && o.jsonValue != null) {
    return unwrapTextField(o.jsonValue);
  }
  if ('value' in o) {
    return raw as TextField;
  }
  return undefined;
}

function unwrapRichTextField(raw: unknown): Field<string> | undefined {
  if (raw == null || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  if ('jsonValue' in o && o.jsonValue != null) {
    return unwrapRichTextField(o.jsonValue);
  }
  if ('value' in o) {
    return raw as Field<string>;
  }
  return undefined;
}

function unwrapLinkField(raw: unknown): LinkField | undefined {
  if (raw == null || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  if ('jsonValue' in o && o.jsonValue != null) {
    return unwrapLinkField(o.jsonValue);
  }
  if ('value' in o) {
    return raw as LinkField;
  }
  return undefined;
}

/** Rich-text body on layout or `data.datasource` — `Text` or `Description` (and lowercase variants). */
type IntroductionRichTextSource = {
  Text?: unknown;
  text?: unknown;
  Description?: unknown;
  description?: unknown;
};

/**
 * Picks `Text` / `Description` (GraphQL `jsonValue` unwrapped). Prefers the first field with non-empty HTML;
 * otherwise the first defined field so Pages editing still binds to an empty `Text` when present.
 */
function resolveIntroductionRichTextBody(
  source: IntroductionRichTextSource | undefined,
): Field<string> | undefined {
  if (!source) return undefined;
  const candidates: Array<Field<string> | undefined> = [
    unwrapRichTextField(source.Text),
    unwrapRichTextField(source.text),
    unwrapRichTextField(source.Description),
    unwrapRichTextField(source.description),
  ];
  const withContent = candidates.find(
    (f) => f != null && !isRichTextEffectivelyEmpty(f.value?.toString()),
  );
  if (withContent != null) return withContent;
  return candidates.find((f) => f != null);
}

/**
 * Merges flat fields with integrated datasource for headline, body, link, and media.
 *
 * @param fields - Raw layout fields from Sitecore.
 * @returns Resolved fields for rendering.
 */
export function resolveIntroductionLayoutFields(fields: IntroductionFields): ResolvedIntroductionFields {
  const ds = fields.data?.datasource;

  let Headline = unwrapTextField(fields.Headline);
  if (!hasNonEmptyText(Headline?.value) && ds) {
    Headline = unwrapTextField(ds.Headline) ?? Headline;
  }

  let Text = resolveIntroductionRichTextBody(fields);
  if ((!Text || isRichTextEffectivelyEmpty(Text.value?.toString())) && ds) {
    const fromDs = resolveIntroductionRichTextBody(ds);
    if (fromDs) {
      Text = fromDs;
    }
  }

  let Link = unwrapLinkField(fields.Link);
  if (!Link && ds) {
    Link = unwrapLinkField(ds.Link);
  }

  const mediaPayload: MediaFields = {
    Image: fields.Image,
    Video: fields.Video,
    MediaType: fields.MediaType,
    Link: Link ?? fields.Link,
    data: fields.data,
  };
  const mediaMerged = resolveMediaLayoutFields(mediaPayload);

  return {
    Headline,
    Text,
    Link: Link ?? mediaMerged.Link,
    Image: mediaMerged.Image,
    Video: mediaMerged.Video,
    MediaType: mediaMerged.MediaType,
  };
}

/**
 * Video poster for Introduction: prefers the video item `CoverImage` when it has a src,
 * otherwise {@link resolveMediaVideoCoverImage} (layout Image, then video cover).
 *
 * @param layoutImage - Introduction / media layout `Image` field.
 * @param video - Referenced video item.
 */
export function resolveIntroductionVideoCoverImage(
  layoutImage: ImageField | undefined,
  video: IVideoFields | undefined,
): ImageField | undefined {
  const videoCover =
    unwrapSitecoreImageField(video?.fields?.CoverImage as unknown) ??
    (video?.fields?.CoverImage as ImageField | undefined);
  const vcSrc = videoCover?.value?.src;
  if (typeof vcSrc === 'string' && vcSrc.trim() !== '') {
    return videoCover;
  }
  return resolveMediaVideoCoverImage(layoutImage, video);
}

function mediaImageFieldHasSrc(image: ImageField | undefined): boolean {
  const src = image?.value?.src;
  return typeof src === 'string' && src.trim().length > 0;
}

/**
 * True when the media column should show visitor-visible image or video, or an editing placeholder.
 *
 * @param resolved - Normalized fields.
 * @param isEditing - XM Cloud Pages editing mode.
 */
export function introductionMediaColumnVisible(
  resolved: ResolvedIntroductionFields,
  isEditing: boolean,
): boolean {
  if (isVideoMediaType(resolved.MediaType)) {
    if (resolved.Video) {
      if (isEditing) {
        return true;
      }
      return Boolean(extractMediaTileBrightcoveId(resolved.Video));
    }
    return isEditing;
  }
  if (mediaImageFieldHasSrc(resolved.Image)) {
    return true;
  }
  return Boolean(isEditing && resolved.Image !== undefined);
}

/**
 * True when the section should render for a visitor or editor (after `fields` guard).
 *
 * @param resolved - Normalized fields.
 * @param isEditing - XM Cloud Pages editing mode.
 */
export function introductionShouldRenderSection(
  resolved: ResolvedIntroductionFields,
  isEditing: boolean,
): boolean {
  if (isEditing) {
    return true;
  }

  const hasHeadline = hasNonEmptyText(resolved.Headline?.value);
  const hasBody = resolved.Text && !isRichTextEffectivelyEmpty(resolved.Text.value?.toString());
  const href = resolved.Link?.value?.href;
  const hasLink = typeof href === 'string' && href.trim() !== '';

  if (isVideoMediaType(resolved.MediaType)) {
    const id = extractMediaTileBrightcoveId(resolved.Video);
    return Boolean(
      hasHeadline ||
        hasBody ||
        id ||
        hasLink ||
        mediaImageFieldHasSrc(resolved.Image),
    );
  }

  return Boolean(hasHeadline || hasBody || mediaImageFieldHasSrc(resolved.Image) || hasLink);
}
