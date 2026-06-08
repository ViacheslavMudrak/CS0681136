import type { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import type { ComponentProps } from 'lib/component-props';

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

/** Visual style for the callout group */
export type CalloutStyle = 'text' | 'base' | 'card';

/** Layout direction for the callout group */
export type CalloutDirection = 'row' | 'column';

/** Title/value text size */
export type CalloutTitleSize = 'xs' | 'sm' | 'base';

/** Text alignment within each callout */
export type CalloutTextAlignment = 'left' | 'center';

/** Color scheme for callout text */
export type CalloutColorScheme = 'light' | 'dark';

/** Resolved rendering parameters passed to sub-components */
export interface CalloutConfig {
  style: CalloutStyle;
  direction: CalloutDirection;
  titleSize: CalloutTitleSize;
  textAlignment: CalloutTextAlignment;
  colorScheme: CalloutColorScheme;
}

/** Fields for a single callout child item */
export interface CalloutItemFields {
  /** Plain text; layout service returns `{ value: string }` only — no per-field color. */
  PrependValue?: Field<string>;
  Value?: Field<string>;
  /** Plain text; `{ value: string }` only — no per-field color. */
  AppendValue?: Field<string>;
  Label?: Field<string>;
  Link?: LinkField;
  Style?: SitecoreValueItem;
  Colorscheme?: SitecoreValueItem;
  Icon?: SitecoreValueItem;
  IconPosition?: SitecoreValueItem | null;
}

/** A single callout child item from the Callouts array */
export interface CalloutItem {
  id: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: CalloutItemFields;
}

/** Top-level fields for the Callout component datasource */
export interface CalloutFields {
  Callouts?: CalloutItem[];
  /** Some templates expose the multilist as `CalloutItems`; merged into `Callouts` at runtime. */
  CalloutItems?: CalloutItem[];
  /** Optional section title above the stat list (same for single- or multi-callout datasources). */
  Heading?: Field<string>;
  Footnote?: Field<string>;
  Link?: LinkField;
  Style?: SitecoreValueItem;
  Colorscheme?: SitecoreValueItem;
  Icon?: SitecoreValueItem;
  IconPosition?: SitecoreValueItem | null;
  /** GraphQL / integrated datasource wrapper (optional). */
  data?: { datasource?: Record<string, unknown> };
}

/** Props for the Callout component */
export type CalloutProps = ComponentProps & {
  /** Omitted when the rendering has no datasource bound yet (empty state in Pages). */
  fields?: CalloutFields;
  /** Media Tile or padded parent: no standalone full-bleed; align with parent column. */
  embeddedLayout?: boolean;
  /**
   * Content Switcher tab: padded strip, stack then `lg` row; per-item params honored.
   * Preview hides item links (group link only). Injected by tab placeholder wrapper.
   */
  contentSwitcherLayout?: boolean;
  /**
   * Text-and-Aside aside: full column width; 2+ stats stack vertically (no md+ row grid).
   * Pass with `embeddedLayout` from aside map patch.
   */
  textAsideAsideLayout?: boolean;
  /**
   * Global Locations: embedded stats band, centered wrap row, Global Locations item chrome.
   * Optional parent alignment classes for TextAlignment parity.
   */
  globalLocationsLayout?: boolean;
  /** Parent flex alignment (e.g. `items-center justify-center`) on stats shell and list. */
  globalLocationsFlexAlignClass?: string;
  /** Parent text-align utility (e.g. `text-center`) on the stats list. */
  globalLocationsTextAlignClass?: string;
  /** XM Pages hint when stats list is empty (omitted in visitor preview). */
  globalLocationsStatsEmptyHint?: string;
};
