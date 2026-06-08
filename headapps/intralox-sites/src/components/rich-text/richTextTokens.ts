/** Numeric layout tokens shared by {@link richTextUtils} (data) and {@link RichText} (Tailwind). */

/** Live DevTools `img.image-optim_image` frame (intralox.com/corporate/trademarks). */
export const RTE_IMAGE_GRID_LOGO_WIDTH_LG_PX = 130.79;
/** Live computed logo container / `img` height (intralox.com/corporate/trademarks). */
export const RTE_IMAGE_GRID_LOGO_HEIGHT_LG_PX = 87.3333;
/** Live computed line-height on trademark logo container. */
export const RTE_IMAGE_GRID_LOGO_CONTAINER_LINE_HEIGHT_PX = 24;
export const RTE_IMAGE_GRID_WIDTH_LG_PX = 774;
export const RTE_IMAGE_GRID_HEIGHT_LG_PX = 111.18;
/** Live trademarks band: `margin: 32px 0` around the logo row. */
export const RTE_IMAGE_GRID_BAND_MARGIN_Y_PX = 32;
/** Contained logo row height band (live ~110px). */
export const RTE_IMAGE_GRID_MIN_HEIGHT_PX = 110;
/** @deprecated Use {@link RTE_IMAGE_GRID_LOGO_HEIGHT_LG_PX} — kept for imports. */
export const RTE_IMAGE_GRID_LOGO_MAX_HEIGHT_PX = RTE_IMAGE_GRID_LOGO_HEIGHT_LG_PX;

/** Lone bottom trademark logo (e.g. unregistered CFS) — live intralox.com/corporate/trademarks. */
export const RTE_TRADEMARK_LONE_LOGO_WIDTH_DESKTOP_PX = 169.5;
export const RTE_TRADEMARK_LONE_LOGO_HEIGHT_DESKTOP_PX = 113.328;
export const RTE_TRADEMARK_LONE_LOGO_WIDTH_TABLET_PX = 356;
export const RTE_TRADEMARK_LONE_LOGO_HEIGHT_TABLET_PX = 237.328;
export const RTE_TRADEMARK_LONE_LOGO_WIDTH_MOBILE_PX = 272;
export const RTE_TRADEMARK_LONE_LOGO_HEIGHT_MOBILE_PX = 181.33;
/** Below this viewport width the lone logo scales with `45.33vw` (272px @ 600px). */
export const RTE_TRADEMARK_LONE_LOGO_FLUID_MAX_VIEWPORT_PX = 599;

export const RICH_TEXT_TABLE_FOOTER_PADDING_MOBILE_PX = 48;
export const RICH_TEXT_TABLE_FOOTER_PADDING_DESKTOP_PX = 80;

export const PATENTS_TABLE_ROW_HEIGHT_PX = 43.8447;
export const PATENTS_TABLE_ROW_MIN_HEIGHT_PX = PATENTS_TABLE_ROW_HEIGHT_PX;
export const PATENTS_TABLE_ROW_LINE_HEIGHT_PX = 19.25;
export const PATENTS_TABLE_ROW_PADDING_Y_PX = 12;

export const PATENTS_TABLE_WIDTH_DESKTOP_PX = 750;
export const PATENTS_TABLE_WIDTH_TABLET_PX = 750;
export const PATENTS_TABLE_WIDTH_MOBILE_PX = 665.88;

export const PATENTS_TABLE_COL1_WIDTH_PX = 191.76;
export const PATENTS_TABLE_COL2_WIDTH_PX = 306.13;
export const PATENTS_TABLE_COL3_WIDTH_PX = 252.12;

/** Live DevTools tablet (768–991px): `td` bands 188.49 / 304.93 / 242.58 × {@link PATENTS_TABLE_ROW_HEIGHT_MOBILE_PX}. */
export const PATENTS_TABLE_COL1_WIDTH_TABLET_PX = 188.49;
export const PATENTS_TABLE_COL2_WIDTH_TABLET_PX = 304.93;
export const PATENTS_TABLE_COL3_WIDTH_TABLET_PX = 242.58;

/** Live DevTools mobile (<768px): `td` bands 172.12 / 298.94 / 194.82 × 43.92; sum = {@link PATENTS_TABLE_WIDTH_MOBILE_PX}. */
export const PATENTS_TABLE_ROW_HEIGHT_MOBILE_PX = 43.92;
export const PATENTS_TABLE_COL1_WIDTH_MOBILE_PX = 172.12;
export const PATENTS_TABLE_COL2_WIDTH_MOBILE_PX = 298.94;
export const PATENTS_TABLE_COL3_WIDTH_MOBILE_PX = 194.82;
/** Vertical padding so 14px/19.25px line + padding = {@link PATENTS_TABLE_ROW_HEIGHT_MOBILE_PX}. */
export const PATENTS_TABLE_ROW_PADDING_Y_MOBILE_PX =
  (PATENTS_TABLE_ROW_HEIGHT_MOBILE_PX - PATENTS_TABLE_ROW_LINE_HEIGHT_PX) / 2;

export const PATENTS_BREAKPOINT_MOBILE_MAX_PX = 767;
export const PATENTS_BREAKPOINT_TABLET_MIN_PX = 768;
export const PATENTS_BREAKPOINT_TABLET_MAX_PX = 991;
export const PATENTS_BREAKPOINT_DESKTOP_MIN_PX = 992;
