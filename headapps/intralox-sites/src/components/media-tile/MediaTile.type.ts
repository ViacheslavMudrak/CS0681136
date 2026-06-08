import type { CSSProperties } from 'react';

import type { Field, ImageField, LinkField, TextField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from 'lib/component-props';
import type { CalloutItem } from '../callout/Callout.type';
import type { IVideoFields } from '../../utils/interface';

/** Sitecore item reference with a nested Value field (dropdowns, checkboxes) */
export interface SitecoreValueItem {
  id?: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: {
    Value?: Field<string>;
  };
}

/** A link row item under Media Tile `Links` */
export interface MediaTileLinkItem {
  id: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: {
    Link?: LinkField;
    Style?: SitecoreValueItem;
    Colorscheme?: SitecoreValueItem;
    Icon?: SitecoreValueItem;
    IconPosition?: SitecoreValueItem | null;
  };
}

/** Datasource fields for Media Tile */
export interface MediaTileFields {
  Eyebrow?: TextField;
  Headline?: TextField;
  /** Sitecore Rich Text (HTML); rendered with app rich-text field styles + tile link colors. */
  Description?: Field<string>;
  /** Alternate Sitecore field names; merged into `Description` at runtime when needed. */
  Body?: Field<string>;
  Content?: Field<string>;
  Copy?: Field<string>;
  /** GraphQL / integrated datasource wrapper (optional). */
  data?: { datasource?: Record<string, unknown> };
  Image?: ImageField;
  /** Brightcove-backed video item (same shape as Billboard `Video`). */
  Video?: IVideoFields | null;
  MediaType?: SitecoreValueItem;
  ButtonAlignment?: SitecoreValueItem;
  Links?: MediaTileLinkItem[];
  FocalPoint?: SitecoreValueItem;
  /** Inline callout stats (same CMS shape as the Callout component datasource). */
  Callouts?: CalloutItem[];
  /** Some templates expose the multilist as `CalloutItems`; merged into `Callouts` in resolveMediaTileFields. */
  CalloutItems?: CalloutItem[];
  Footnote?: Field<string>;
  Link?: LinkField;
  /** Checkbox field: when true, renders a horizontal rule at the bottom of the tile. */
  IncludeDivider?: Field<boolean>;
}

export type MediaTileProps = ComponentProps & {
  fields?: MediaTileFields;
};

/** Sitecore rendering param shape (`{ Value: { value } }` or plain string). */
export interface MediaTileParamValueShape {
  Value?: {
    value?: string;
  };
}

/** CMS Theme param values mapped to headline presentation (live intralox.com computed styles). */
export type MediaTileHeadlineThemeKey = 'base' | 'article' | 'compact' | 'landing';

/** Tile surface color from the `Color` rendering param. */
export type MediaTileSurfaceColor = 'default' | 'dark' | 'gray';

/** Resolved media frame aspect mode from `MediaRatio`. */
export type MediaTileMediaAspectKey = 'landscape' | 'square' | 'portrait';

/** Resolved layout and presentation for Media Tile (semantic tokens only — classes live on JSX). */
export interface MediaTileLayoutConfig {
  mediaOnRight: boolean;
  mediaWidthPercent: 50 | 40;
  mediaAspectKey: MediaTileMediaAspectKey;
  /** `null` = use Tailwind aspect only (square/portrait); object = inline 560/371.84 frame. */
  mediaFrameStyle: CSSProperties | null;
  headingTag: 'h2' | 'h3' | 'h4';
  themeKey: MediaTileHeadlineThemeKey;
  headlineSizeKey: 'base' | 'sm' | 'lg';
  /** When false, headline uses `max-w-xl`; when true, `max-w-none`. */
  headlineWidthFull: boolean;
  surfaceColor: MediaTileSurfaceColor;
  isCard: boolean;
  /**
   * When the rendering param `HasWhiteBackground` / `hasWhiteBackground` is present and checked (`1`, etc.),
   * the outer section strip and default media letterbox use `bg-surface` instead of `bg-surface-subtle`.
   * When the key is omitted, behavior matches the legacy gray strip.
   */
  hasWhiteBackground: boolean;
  /** Raw `ColorScheme` param for description RTE color flow and list markers. */
  colorSchemeRaw: string | undefined;
}
