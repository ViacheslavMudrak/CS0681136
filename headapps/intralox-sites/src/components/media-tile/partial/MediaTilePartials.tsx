import type { JSX, ReactNode } from "react";

import type {
  Field,
  ImageField,
  TextField,
} from "@sitecore-content-sdk/nextjs";
import {
  Link as ContentSdkLink,
  NextImage,
  RichText as ContentSdkRichText,
  Text,
} from "@sitecore-content-sdk/nextjs";

import { isRichTextEffectivelyEmpty } from "components/rich-text/richTextUtils";
import {
  MEDIA_TILE_LABELS_FALLBACK,
  type MediaTileLabels,
} from "lib/media-tile-i18n";

import type {
  MediaTileFields,
  MediaTileLayoutConfig,
  MediaTileLinkItem,
} from "../MediaTile.type";
import {
  focalPointToCssObjectPosition,
  isMediaTileDarkColorScheme,
  isMediaTileDefaultLandscapeFrame,
  isMediaTileGrayColorScheme,
  isMediaTileLightOrDarkColorScheme,
  MEDIA_TILE_LANDSCAPE_FRAME_STYLE,
  resolveMediaTileImageSizes,
} from "../mediaTileUtils";
import { ICON_CHEVRON_RIGHT_16PX } from "lib/chrome-icons";
import { cn } from "lib/utils";

const EMPTY_TEXT: TextField = { value: "" };
const EMPTY_RICH: Field<string> = { value: "" };

export interface MediaTileDescriptionRichTextProps {
  field: Field<string>;
  isEditing: boolean;
  layout: MediaTileLayoutConfig;
}

/**
 * Media tile body copy as Sitecore rich text with theme and ColorScheme-driven typography.
 */
export const MediaTileDescriptionRichText = ({
  field,
  isEditing,
  layout,
}: MediaTileDescriptionRichTextProps): JSX.Element | null => {
  const hasValue = !isRichTextEffectivelyEmpty(field?.value?.toString());
  if (!hasValue && !isEditing) {
    return null;
  }

  const isDarkSurface = layout.surfaceColor === "dark";
  const colorSchemeRaw = layout.colorSchemeRaw;

  return (
    <ContentSdkRichText
      field={field}
      className={cn(
        "media-tile-description box-border block w-full max-w-full border-0 border-solid border-stroke-default p-0 font-media-tile [-webkit-tap-highlight-color:transparent] max-sm:!max-w-none !mt-4 !mb-0 mx-0 max-sm:!p-0 [unicode-bidi:isolate] text-left prose font-divider text-font-normal leading-relaxed text-ink-primary [&>*:first-child]:!m-0 [&>*+*]:!mt-[16px] [&>*+*]:!mb-0 [&>*+*]:!mx-0 [&_li>p]:!block [&_li>p]:!m-0 [&_li>p:not(:last-child)]:!mb-1 [&_ul]:!m-0 [&_ul]:!list-none [&_ul]:!pl-0 [&_ul]:!space-y-2 [&_ul]:!text-ink-primary [&_ul>li]:!relative [&_ul>li]:!m-0 [&_ul>li]:!list-none [&_ul>li]:!pl-5 md:[&_ul>li]:!pl-6 [&_ul>li]:!leading-6 md:[&_ul>li]:!leading-8 [&_ul>li]:before:!absolute [&_ul>li]:before:!left-[0.15rem] [&_ul>li]:before:!top-[calc((1lh-6px)/2)] [&_ul>li]:before:!h-[6px] [&_ul>li]:before:!w-[6px] [&_ul>li]:before:!shrink-0 [&_ul>li]:before:!rounded-full [&_ul>li]:before:!content-[''] [&_ol]:!m-0 [&_ol]:!pl-6 md:[&_ol]:!pl-7 [&_ol]:!space-y-2 [&_ol]:!text-ink-primary [&_ol>li]:!list-decimal [&_ol>li]:!list-outside [&_ol>li]:!m-0 [&_ol>li]:!pl-2 [&_ol>li]:!leading-6 md:[&_ol>li]:!leading-8 [&_a]:!text-nav-link-hover [&_a]:!underline [&_a:hover]:!text-[rgb(0,40,123)] [&_a:hover]:!no-underline [&_a]:focus-visible:outline-none [&_a]:focus-visible:ring-2 [&_a]:focus-visible:ring-nav-link-hover [&_a]:focus-visible:ring-offset-2 [&_strong]:!font-bold [&_em]:!italic",
        layout.themeKey === "landing"
          ? "!text-font-big !leading-[length:var(--leading-font-media-tile-description-landing)] [&_ul>li]:!text-font-big [&_ul>li]:!leading-[length:var(--leading-font-media-tile-description-landing)] [&_ul>li]:!list-item [&_ul>li]:!list-outside [&_ul>li:not(:first-child)]:!mt-[8px] [&_ol>li:not(:first-child)]:!mt-[8px] [&_ol>li]:!text-font-big [&_ol>li]:!leading-[length:var(--leading-font-media-tile-description-landing)] [&_li>p]:!text-font-big [&_li>p]:!leading-[length:var(--leading-font-media-tile-description-landing)] [&_p]:!mb-0 [&_li>p]:!mb-0 [&_li>p:not(:last-child)]:!mb-0"
          : "!text-font-medium !leading-6 [&_ul>li]:!text-font-medium [&_ol>li]:!text-font-medium [&_li>p]:!text-font-medium",
        "[&_a]:!text-link [&_a]:!no-underline hover:[&_a]:!text-link-strong hover:[&_a]:!underline [&_a]:focus-visible:outline-none [&_a]:focus-visible:ring-2 [&_a]:focus-visible:ring-link [&_a]:focus-visible:ring-offset-2",
        isDarkSurface ? "text-ink-inverse" : "text-ink-primary",
        isDarkSurface
          ? "[&_p]:!text-current [&_ul]:!text-current [&_ol]:!text-current [&_li]:!text-current"
          : isMediaTileGrayColorScheme(colorSchemeRaw)
            ? "!text-ink-muted [&_p]:!text-ink-muted [&_ul]:!text-ink-muted [&_ol]:!text-ink-muted [&_li]:!text-ink-muted [&_strong]:!text-ink-primary [&_b]:!text-ink-primary [&_em]:!text-ink-primary [&_i]:!text-ink-primary [&_code]:!text-ink-primary"
            : isMediaTileLightOrDarkColorScheme(colorSchemeRaw)
              ? "!text-ink [&_p]:!text-ink [&_ul]:!text-ink [&_ol]:!text-ink [&_li]:!text-ink [&_strong]:!text-ink-primary [&_b]:!text-ink-primary [&_em]:!text-ink-primary [&_i]:!text-ink-primary [&_code]:!text-ink-primary"
              : layout.themeKey === "landing"
                ? "!text-ink-primary [&_p]:!text-ink-primary [&_ul]:!text-ink-primary [&_ol]:!text-ink-primary [&_li]:!text-ink-primary [&_strong]:!text-ink-primary [&_b]:!text-ink-primary [&_em]:!text-ink-primary [&_i]:!text-ink-primary [&_code]:!text-ink-primary"
                : "!text-ink [&_p]:!text-ink [&_ul]:!text-ink [&_ol]:!text-ink [&_li]:!text-ink [&_strong]:!text-ink-primary [&_b]:!text-ink-primary [&_em]:!text-ink-primary [&_i]:!text-ink-primary [&_code]:!text-ink-primary",
        isMediaTileDarkColorScheme(colorSchemeRaw)
          ? "[&_ul>li]:before:!bg-[var(--color-accent-warning)] [&_ol>li::marker]:!text-[var(--color-accent-warning)]"
          : "[&_ul>li]:before:!bg-[var(--color-nav-link-hover)] [&_ol>li::marker]:!text-nav-link-hover",
      )}
    />
  );
};

export interface MediaTileBodyProps {
  fields: MediaTileFields;
  isEditing: boolean;
  layout: MediaTileLayoutConfig;
}

/**
 * Eyebrow, headline, and description with no extra gaps when fields are empty.
 */
export const MediaTileBody = ({
  fields,
  isEditing,
  layout,
}: MediaTileBodyProps): JSX.Element => {
  const { Eyebrow, Headline, Description } = fields;
  const eyebrowField = Eyebrow ?? EMPTY_TEXT;
  const headlineField = Headline ?? EMPTY_TEXT;
  const descriptionField = Description ?? EMPTY_RICH;

  const isDarkSurface = layout.surfaceColor === "dark";

  const hasEyebrow =
    Eyebrow?.value !== undefined &&
    Eyebrow?.value !== null &&
    String(Eyebrow.value).trim().length > 0;
  const hasHeadline =
    Headline?.value !== undefined &&
    Headline?.value !== null &&
    String(Headline.value).trim().length > 0;
  const hasDescription = !isRichTextEffectivelyEmpty(
    Description?.value?.toString(),
  );

  const showEyebrow = hasEyebrow || isEditing;
  const showHeadline = hasHeadline || isEditing;
  const showEyebrowHeadlineBlock = showEyebrow || showHeadline;

  return (
    <div className="flex w-full min-w-0 flex-col gap-0 items-start text-left">
      {showEyebrowHeadlineBlock && (
        <div className="w-full min-w-0 max-w-full md:max-lg:max-w-[var(--width-media-tile-eyebrow-headline-md-split)] lg:max-xl:max-w-[var(--width-media-tile-eyebrow-headline-lg-band)] xl:max-w-[var(--width-media-tile-eyebrow-headline-xl-up)]">
          {showEyebrow && (
            <Text
              field={eyebrowField}
              tag="p"
              className={cn(
                "box-border block w-full max-w-full border-0 border-solid border-stroke-default p-0 font-media-tile [-webkit-tap-highlight-color:transparent] !mb-[7px] !mt-0 mx-0 font-bold uppercase tracking-[0.35px] text-font-media-tile-eyebrow leading-font-media-tile-eyebrow",
                isDarkSurface ? "text-ink-inverse" : "text-ink-muted",
              )}
            />
          )}
          {showHeadline && (
            <Text
              field={headlineField}
              tag={layout.headingTag}
              className={cn(
                "box-border block w-full max-w-full border-0 border-solid border-stroke-default p-0 font-media-tile [-webkit-tap-highlight-color:transparent] !m-0 [unicode-bidi:isolate] font-inherit",
                layout.headlineWidthFull ? "max-w-none" : "max-w-xl",
                layout.themeKey === "article"
                  ? "text-font-big font-bold leading-font-media-tile-headline uppercase"
                  : layout.themeKey === "compact"
                    ? "text-font-big font-bold leading-font-media-tile-headline-compact"
                    : layout.headlineSizeKey === "sm"
                      ? "max-sm:text-font-media-tile-headline max-sm:leading-font-media-tile-headline max-sm:font-bold sm:text-font-big sm:font-bold sm:leading-tight"
                      : "text-font-media-tile-headline font-bold leading-font-media-tile-headline",
                isDarkSurface
                  ? "text-ink-inverse"
                  : layout.themeKey === "article"
                    ? "text-accent-cyan"
                    : "text-ink-primary",
              )}
            />
          )}
        </div>
      )}
      {(hasDescription || isEditing) && (
        <MediaTileDescriptionRichText
          field={descriptionField}
          isEditing={isEditing}
          layout={layout}
        />
      )}
    </div>
  );
};

export interface MediaTileLinksProps {
  links: MediaTileLinkItem[] | undefined;
  isEditing: boolean;
  groupAriaLabel?: string;
  labels?: Pick<MediaTileLabels, "noLinksConfigured" | "linkFallback">;
  showVerticalLinkDividers?: boolean;
}

function linkItemStyleValue(item: MediaTileLinkItem): string {
  const v = item.fields?.Style?.fields?.Value?.value;
  if (v === undefined || v === null) return "";
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

/** CTA row: pill button and text links in one horizontal row. */
export const MediaTileLinks = ({
  links,
  isEditing,
  groupAriaLabel,
  labels,
  showVerticalLinkDividers = true,
}: MediaTileLinksProps): JSX.Element | null => {
  const resolvedLabels = { ...MEDIA_TILE_LABELS_FALLBACK, ...labels };
  const filtered = links?.filter((item) => item?.fields) ?? [];
  const visible = filtered.filter((item) => {
    const href = item.fields?.Link?.value?.href;
    return Boolean(href?.trim()) || isEditing;
  });

  if (visible.length === 0 && !isEditing) return null;

  const trimmedGroupLabel = groupAriaLabel?.trim();
  const groupA11y = trimmedGroupLabel
    ? { role: "group" as const, "aria-label": trimmedGroupLabel }
    : {};

  return (
    <div
      className="mt-6 flex w-full min-w-0 flex-col items-start text-left max-sm:mt-8 sm:mt-5"
      {...groupA11y}
    >
      {visible.length === 0 && isEditing && (
        <span className="is-empty-hint text-font-normal text-ink-secondary">
          {resolvedLabels.noLinksConfigured}
        </span>
      )}
      {visible.length > 0 && (
        <div
          role="list"
          className={cn(
            "flex w-full min-w-0 flex-row flex-wrap items-center justify-start",
            showVerticalLinkDividers
              ? "divide-x divide-stroke-default"
              : "gap-x-4",
          )}
        >
          {visible.map((item) => {
            const linkField = item.fields?.Link;
            if (!linkField) return null;

            const styleVal = linkItemStyleValue(item).toLowerCase();
            const isButton = styleVal === "button";
            const target = linkField.value?.target;
            const text = linkField.value?.text?.trim();
            const ariaLabel = linkAccessibleName(
              text,
              item,
              resolvedLabels.linkFallback,
            );

            return (
              <div
                key={item.id}
                role="listitem"
                className="flex min-h-11 items-center justify-start px-4 lg:px-5 first:shrink-0 first:pl-0 last:pr-0 [&:not(:first-child)]:min-w-0"
              >
                {isButton ? (
                  <ContentSdkLink
                    field={linkField}
                    editable={isEditing}
                    className="box-border block min-w-28 cursor-pointer rounded-full border-0 border-surface [border-style:none] bg-link-strong p-3 text-center font-inherit text-font-media-tile-eyebrow font-normal leading-font-media-tile-button text-ink-inverse no-underline [-webkit-tap-highlight-color:transparent] transition-[background-color] duration-150 [transition-timing-function:ease-in-out] motion-reduce:transition-none hover:bg-link-hover focus:outline-none focus:ring-2 focus:ring-link-strong focus:ring-offset-2 focus:ring-offset-surface"
                    target={target || undefined}
                    rel={
                      target === "_blank" ? "noopener noreferrer" : undefined
                    }
                    {...(ariaLabel ? { "aria-label": ariaLabel } : {})}
                  />
                ) : (
                  <ContentSdkLink
                    field={linkField}
                    editable={isEditing}
                    showLinkTextWithChildrenPresent={false}
                    className="box-border inline-flex cursor-pointer items-center gap-1 font-inherit text-font-medium font-normal leading-6 text-link no-underline [-webkit-tap-highlight-color:transparent] transition-[color,text-decoration-color] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none hover:text-link-strong hover:[&_.media-tile-link-label]:underline focus:outline-none focus:ring-2 focus:ring-link focus:ring-offset-2 focus:ring-offset-surface"
                    target={target || undefined}
                    rel={
                      target === "_blank" ? "noopener noreferrer" : undefined
                    }
                    {...(ariaLabel ? { "aria-label": ariaLabel } : {})}
                  >
                    <span className="media-tile-link-label min-w-0 shrink underline-offset-2">
                      {text && text.length > 0
                        ? text
                        : isEditing
                          ? "\u00a0"
                          : resolvedLabels.linkFallback}
                    </span>
                    {ICON_CHEVRON_RIGHT_16PX}
                  </ContentSdkLink>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export interface MediaTileMediaProps {
  image: ImageField | undefined;
  focalPointValue: string | undefined;
  layout: MediaTileLayoutConfig;
  backdropClass?: string;
  sizes?: string;
  isEditing: boolean;
  emptyStateLabel?: string;
}

/**
 * Fixed-aspect frame under the split column width; `fill` + `sizes` align decoded pixels with layout.
 */
export const MediaTileMedia = ({
  image,
  focalPointValue,
  layout,
  backdropClass = "bg-surface-muted",
  sizes = resolveMediaTileImageSizes(50),
  isEditing,
  emptyStateLabel = "Media Tile",
}: MediaTileMediaProps): JSX.Element | null => {
  const src = image?.value?.src;
  const hasImage = Boolean(src);
  if (!hasImage && !isEditing) return null;

  const objectPosition = focalPointToCssObjectPosition(focalPointValue);

  const mediaFrameStyle = layout.mediaFrameStyle;
  const inlineAspectStyle =
    mediaFrameStyle === undefined
      ? MEDIA_TILE_LANDSCAPE_FRAME_STYLE
      : mediaFrameStyle === null
        ? undefined
        : mediaFrameStyle;

  const useResponsiveLandscape = isMediaTileDefaultLandscapeFrame(
    mediaFrameStyle,
    inlineAspectStyle,
  );

  const innerFrameStyle = useResponsiveLandscape
    ? undefined
    : inlineAspectStyle;

  return (
    <div
      className={cn(
        "box-border w-full",
        layout.isCard && "max-sm:px-0 sm:flex sm:h-full sm:min-h-0 sm:flex-col",
      )}
    >
      <div
        className={cn(
          "relative box-border min-h-0 min-w-0 w-full max-w-full overflow-x-clip overflow-y-clip",
          backdropClass,
          useResponsiveLandscape && "max-sm:[aspect-ratio:560/371.84]",
          useResponsiveLandscape && layout.isCard
            ? "sm:aspect-auto sm:min-h-[506.667px] sm:h-full sm:flex-1 sm:w-full sm:max-w-full sm:shrink-0"
            : useResponsiveLandscape
              ? "sm:max-lg:box-border sm:max-lg:h-[436px] sm:max-lg:min-h-[436px] sm:max-lg:max-h-[436px] sm:max-lg:aspect-auto sm:max-lg:w-full sm:max-lg:max-w-full sm:max-lg:shrink-0 lg:w-full lg:max-w-full lg:h-auto lg:min-h-0 lg:max-h-none lg:[aspect-ratio:560/371.84]"
              : layout.mediaAspectKey === "square"
                ? "aspect-square"
                : layout.mediaAspectKey === "portrait"
                  ? "aspect-[2/3]"
                  : "w-full max-w-full",
          !useResponsiveLandscape &&
            "sm:max-lg:box-border sm:max-lg:h-[436px] sm:max-lg:min-h-[436px] sm:max-lg:max-h-[436px] sm:max-lg:aspect-auto",
          "max-sm:min-h-48",
        )}
        style={innerFrameStyle}
      >
        {image && (hasImage || isEditing) && (
          <NextImage
            field={image}
            fill
            sizes={sizes}
            className="absolute inset-0 bottom-0 left-0 right-0 top-0 box-border m-0 block h-full w-full max-w-full min-h-0 overflow-x-clip overflow-y-clip p-0 align-middle object-cover object-center font-media-tile text-font-medium leading-6 text-ink-primary [overflow-clip-margin:content-box] [-webkit-tap-highlight-color:transparent] border-0 border-solid border-stroke-default"
            style={{ objectPosition }}
          />
        )}
        {isEditing && !image && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <span className="is-empty-hint text-center text-font-normal text-ink-secondary">
              {emptyStateLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export interface MediaTileSplitProps {
  layout: MediaTileLayoutConfig;
  textColumn: ReactNode;
  mediaColumn: ReactNode | null;
}

/** Inner chrome + responsive split row. */
export const MediaTileSplit = ({
  layout,
  textColumn,
  mediaColumn,
}: MediaTileSplitProps): JSX.Element => (
  <div className="relative box-border w-full [unicode-bidi:isolate] px-4 !mx-auto max-sm:mx-0 max-sm:max-w-full sm:max-md:mx-auto sm:max-md:w-full sm:max-md:max-w-[600px] md:max-lg:mx-[72px] !mx-auto md:max-lg:max-w-[768px] lg:mx-auto lg:w-full lg:max-xl:max-w-[992px] xl:max-w-[var(--width-media-tile-split-max)]">
    <div
      className={cn(
        layout.surfaceColor === "dark"
          ? "bg-surface-inverse"
          : layout.surfaceColor === "gray"
            ? "bg-surface-muted"
            : "bg-transparent",
        layout.isCard &&
          "block overflow-hidden rounded-lg border border-stroke-default bg-surface shadow-md",
      )}
    >
      <div
        className={cn(
          "flex w-full flex-col max-sm:gap-[1.6rem] sm:flex-row sm:flex-nowrap sm:items-stretch sm:gap-0",
          layout.mediaOnRight ? "" : "sm:flex-row-reverse",
        )}
      >
        {textColumn}
        {mediaColumn}
      </div>
    </div>
  </div>
);
