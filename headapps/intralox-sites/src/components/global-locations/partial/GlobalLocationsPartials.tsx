import type { JSX } from 'react';

import type { Field, ImageField, TextField } from '@sitecore-content-sdk/nextjs';
import {
  Link as ContentSdkLink,
  NextImage,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ICON_CHEVRON_RIGHT_XS } from 'lib/chrome-icons';
import { cn } from 'lib/utils';

import type { MediaTileLinkItem } from 'components/media-tile/MediaTile.type';
import { focalPointToCssObjectPosition } from 'components/media-tile/mediaTileUtils';
import { isRichTextEffectivelyEmpty } from 'components/rich-text/richTextUtils';

import type { GlobalLocationsFields } from '../GlobalLocations.type';
import { GLOBAL_LOCATIONS_LABELS } from '../globalLocationsUtils';
import {
  GlobalLocationsDescriptionRichText,
  GlobalLocationsEyebrowText,
} from './GlobalLocationsAtoms';

const EMPTY_TEXT: TextField = { value: '' };
const EMPTY_RICH: Field<string> = { value: '' };

export const GLOBAL_LOCATIONS_HEADING_DOM_ID = 'global-locations-heading';

function linkItemStyleValue(item: MediaTileLinkItem): string {
  const v = item.fields?.Style?.fields?.Value?.value;
  if (v === undefined || v === null) return '';
  return String(v).trim();
}

function linkAccessibleName(
  linkText: string | undefined,
  item: MediaTileLinkItem,
  linkFallback: string,
): string | undefined {
  const text = linkText?.trim();
  if (text) return undefined;
  const fromItem = item.displayName?.trim() || item.name?.trim();
  if (fromItem) return fromItem;
  return linkFallback;
}

export interface GlobalLocationsCopyStackProps {
  fields: GlobalLocationsFields;
  isEditing: boolean;
  textAlignClass: string;
  flexAlignClass: string;
  colorSchemeRaw: string | undefined;
  isDarkSection: boolean;
}

/** Eyebrow, headline, and rich-text description (centered stack). */
export function GlobalLocationsCopyStack({
  fields,
  isEditing,
  textAlignClass,
  flexAlignClass,
  colorSchemeRaw,
  isDarkSection,
}: GlobalLocationsCopyStackProps): JSX.Element {
  const { Eyebrow, Headline, Description } = fields;
  const eyebrowField = Eyebrow ?? EMPTY_TEXT;
  const headlineField = Headline ?? EMPTY_TEXT;
  const descriptionField = Description ?? EMPTY_RICH;

  const hasEyebrow =
    Eyebrow?.value !== undefined &&
    Eyebrow?.value !== null &&
    String(Eyebrow.value).trim().length > 0;
  const hasHeadline =
    Headline?.value !== undefined &&
    Headline?.value !== null &&
    String(Headline.value).trim().length > 0;
  const hasDescription = !isRichTextEffectivelyEmpty(Description?.value?.toString());

  const showHeadlineAsH2 = Boolean(hasEyebrow && (hasHeadline || isEditing));
  /** When there is no eyebrow text, present `Headline` with eyebrow chrome (current CMS dataset). */
  const showHeadlineAsEyebrowOnly = Boolean(!hasEyebrow && (hasHeadline || isEditing));
  const showEyebrow = hasEyebrow || (isEditing && showHeadlineAsH2);

  const showDescriptionBlock = hasDescription || isEditing;

  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-col gap-[length:var(--margin-global-locations-copy-block)]',
        flexAlignClass,
      )}
    >
      {(showEyebrow || showHeadlineAsEyebrowOnly || showHeadlineAsH2) && (
        <div className={cn('flex w-full min-w-0 flex-col gap-0', flexAlignClass)}>
          {showEyebrow && (
            <GlobalLocationsEyebrowText
              field={eyebrowField}
              tag="p"
              textAlignClass={textAlignClass}
              isDarkSection={isDarkSection}
            />
          )}
          {showHeadlineAsEyebrowOnly && (
            <GlobalLocationsEyebrowText
              field={headlineField}
              tag="p"
              textAlignClass={textAlignClass}
              isDarkSection={isDarkSection}
            />
          )}
          {showHeadlineAsH2 && (
            <GlobalLocationsEyebrowText
              field={headlineField}
              tag="h2"
              id={GLOBAL_LOCATIONS_HEADING_DOM_ID}
              textAlignClass={textAlignClass}
              isDarkSection={isDarkSection}
            />
          )}
        </div>
      )}
      {showDescriptionBlock && (
        <GlobalLocationsDescriptionRichText
          field={descriptionField}
          textAlignClass={textAlignClass}
          isDarkSection={isDarkSection}
          colorSchemeRaw={colorSchemeRaw}
        />
      )}
    </div>
  );
}

export interface GlobalLocationsLinksRowProps {
  links: MediaTileLinkItem[] | undefined;
  isEditing: boolean;
  groupAriaLabel?: string;
  buttonRowJustifyClass: string;
  textAlignClass: string;
}

/**
 * CTA links: mirrors Media Tile “more” link styling; supports `ButtonAlignment` on the row.
 */
export function GlobalLocationsLinksRow({
  links,
  isEditing,
  groupAriaLabel,
  buttonRowJustifyClass,
  textAlignClass,
}: GlobalLocationsLinksRowProps): JSX.Element | null {
  const filtered = links?.filter((item) => item?.fields) ?? [];
  const visible = filtered.filter((item) => {
    const href = item.fields?.Link?.value?.href;
    return Boolean(href?.trim()) || isEditing;
  });

  if (visible.length === 0 && !isEditing) return null;

  const trimmedGroupLabel = groupAriaLabel?.trim();
  const groupA11y =
    trimmedGroupLabel ?
      { role: 'group' as const, 'aria-label': trimmedGroupLabel }
    : {};

  return (
    <div
      className={cn(
        'box-border !mt-0 !mb-0 !mx-0 !p-0 flex w-full min-w-0 flex-col gap-0',
        '[unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]',
        textAlignClass,
      )}
      {...groupA11y}
    >
      {visible.length === 0 && isEditing && (
        <span className="is-empty-hint text-font-normal text-ink-secondary">
          {GLOBAL_LOCATIONS_LABELS.noLinksConfigured}
        </span>
      )}
      {visible.length > 0 && (
        <div
          role="list"
          className={cn(
            'flex w-full min-w-0 flex-row flex-wrap items-center gap-x-4 gap-y-0 !p-0 !m-0',
            buttonRowJustifyClass,
          )}
        >
          {visible.map((item) => {
            const linkField = item.fields?.Link;
            if (!linkField) return null;

            const styleVal = linkItemStyleValue(item).toLowerCase();
            const isButton = styleVal === 'button';
            const target = linkField.value?.target;
            const text = linkField.value?.text?.trim();
            const ariaLabel = linkAccessibleName(text, item, GLOBAL_LOCATIONS_LABELS.linkFallback);

            return (
              <div key={item.id} role="listitem" className="flex items-center !m-0 !p-0">
                {isButton ?
                  <ContentSdkLink
                    field={linkField}
                    editable={isEditing}
                    className={cn(
                      'box-border block min-w-28 cursor-pointer rounded-full border-0 border-surface [border-style:none]',
                      'bg-link-strong p-3 text-center font-inherit text-font-media-tile-eyebrow font-normal',
                      'leading-font-media-tile-button text-ink-inverse no-underline',
                      'transition-[background-color] duration-150 [transition-timing-function:ease-in-out] motion-reduce:transition-none',
                      'hover:bg-link-hover focus:outline-none focus:ring-2 focus:ring-link-strong',
                      'focus:ring-offset-2 focus:ring-offset-surface',
                    )}
                    target={target || undefined}
                    rel={target === '_blank' ? 'noopener noreferrer' : undefined}
                    {...(ariaLabel ? { 'aria-label': ariaLabel } : {})}
                  />
                : <ContentSdkLink
                    field={linkField}
                    editable={isEditing}
                    showLinkTextWithChildrenPresent={false}
                    className={cn(
                      'box-border inline-flex cursor-pointer items-center gap-1 font-inherit font-media-tile text-[length:var(--text-font-medium)] font-normal leading-6',
                      'text-link no-underline',
                      '[unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]',
                      'transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none [-webkit-tap-highlight-color:transparent]',
                      'hover:text-link-strong hover:[&_span]:underline',
                      'focus:outline-none focus:ring-2 focus:ring-link focus:ring-offset-2 focus:ring-offset-surface',
                    )}
                    target={target || undefined}
                    rel={target === '_blank' ? 'noopener noreferrer' : undefined}
                    {...(ariaLabel ? { 'aria-label': ariaLabel } : {})}
                  >
                    <span className="min-w-0 shrink underline-offset-2">
                      {text && text.length > 0 ?
                        text
                      : isEditing ?
                        '\u00a0'
                      : GLOBAL_LOCATIONS_LABELS.linkFallback}
                    </span>
                    {ICON_CHEVRON_RIGHT_XS}
                  </ContentSdkLink>
                }
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export interface GlobalLocationsMapProps {
  image: ImageField | undefined;
  focalPointValue: string | undefined;
  isEditing: boolean;
}

/**
 * Full-width responsive map image with optional focal point.
 */
export function GlobalLocationsMap({
  image,
  focalPointValue,
  isEditing,
}: GlobalLocationsMapProps): JSX.Element | null {
  const src = image?.value?.src;
  const hasImage = Boolean(src);
  if (!hasImage && !isEditing) return null;

  const objectPosition = focalPointToCssObjectPosition(focalPointValue);

  return (
    <div className="mt-12 w-full min-w-0 md:mt-14">
      {image && (hasImage || isEditing) && (
        <div
          className="relative mx-auto box-border w-full max-w-full overflow-x-clip overflow-y-clip [aspect-ratio:var(--aspect-ratio-global-locations-map)]"
        >
          <NextImage
            field={image}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, min(1168px, 100vw)"
            className={cn(
              'absolute inset-0 box-border block h-full w-full max-w-full overflow-x-clip overflow-y-clip p-0 align-middle object-cover',
              '[overflow-clip-margin:content-box] [-webkit-tap-highlight-color:transparent]',
            )}
            style={{ objectPosition }}
          />
        </div>
      )}
    </div>
  );
}
