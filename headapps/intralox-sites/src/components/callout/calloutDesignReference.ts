import type { CalloutConfig } from './Callout.type';

/** Frozen typography baseline for Callout text elements; extend as new `CalloutConfig` combos are shared. */

/** Rendering parameters this baseline snapshot applies to (authoring / Figma key set). */
export const CALLOUT_DESIGN_BASELINE_PARAMS = {
  colorScheme: 'dark',
  direction: 'row',
  textAlignment: 'left',
  titleSize: 'base',
  style: 'text',
} as const satisfies CalloutConfig;

export const CALLOUT_DESIGN_BASELINE_TEXT = {
  value: {
    fontSizePx: 48,
    lineHeightPx: 48,
    fontWeight: 700,
    colorRgb: 'rgb(71, 158, 188)' as const,
    hexNote: '#479ebc',
    flexShrink: 0,
    fontFamilyNote:
      'NeueHelvetica, "TeX Gyre Heros", ui-sans-serif, system-ui, sans-serif (+ emoji fallbacks)',
  },
  prepend: {
    fontSizePx: 16,
    lineHeightPx: 16,
    fontWeight: 700,
    letterSpacingPx: 0.4,
    textTransform: 'uppercase' as const,
    colorRgb: 'rgb(34, 34, 34)' as const,
    hexNote: '#222',
  },
  append: {
    fontSizePx: 16,
    lineHeightPx: 16,
    fontWeight: 700,
    letterSpacingPx: 0.4,
    textTransform: 'uppercase' as const,
    colorRgb: 'rgb(34, 34, 34)' as const,
    hexNote: '#222',
    alignSelf: 'flex-end' as const,
    paddingBottomPx: 2,
  },
  label: {
    fontSizePx: 16,
    lineHeightPx: 20,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    colorRgb: 'rgb(34, 34, 34)' as const,
    hexNote: '#222222',
  },
} as const;

/** ColorScheme `light`, Style `text`, TextSize `base` — colors differ from dark baseline. */
export const CALLOUT_DESIGN_LIGHT_TEXT_BASE_PARAMS = {
  colorScheme: 'light',
  direction: 'row',
  textAlignment: 'left',
  titleSize: 'base',
  style: 'text',
} as const satisfies CalloutConfig;

export const CALLOUT_DESIGN_LIGHT_TEXT_BASE_COLORS = {
  prepend: { colorRgb: 'rgb(34, 34, 34)' as const, hexNote: '#222' },
  value: { colorRgb: 'rgb(71, 158, 188)' as const, hexNote: '#479ebc' },
  append: { colorRgb: 'rgb(34, 34, 34)' as const, hexNote: '#222' },
  label: { colorRgb: 'rgb(100, 100, 103)' as const, hexNote: '#646467' },
} as const;

export const CALLOUT_DESIGN_SINGLE_STANDALONE_SHELL = {
  maxWidthPx: 1280,
  paddingPx: 16,
  minHeightPx: 116,
  lineHeightPx: 24,
  fontFamilyNote:
    'NeueHelvetica, TeX Gyre Heros, ui-sans-serif, system-ui, sans-serif (+ emoji fallbacks) — `--font-callout`',
} as const;

export const CALLOUT_DESIGN_SINGLE_STANDALONE_SHELL_CARD = {
  ...CALLOUT_DESIGN_SINGLE_STANDALONE_SHELL,
  minHeightPx: 210,
} as const;

export const CALLOUT_DESIGN_TEXT_STYLE_SM_PARAMS = {
  colorScheme: 'dark',
  direction: 'row',
  textAlignment: 'left',
  titleSize: 'sm',
  style: 'text',
} as const satisfies CalloutConfig;

export const CALLOUT_DESIGN_TEXT_STYLE_SM_TEXT = {
  value: {
    fontSizePx: 36,
    lineHeightPx: 36,
    fontWeight: 700,
    colorRgb: 'rgb(71, 158, 188)' as const,
    hexNote: '#479ebc',
    flexShrink: 0,
  },
  prepend: {
    fontSizePx: 16,
    lineHeightPx: 16,
    fontWeight: 700,
    letterSpacingPx: 0.4,
    textTransform: 'uppercase' as const,
    colorRgb: 'rgb(34, 34, 34)' as const,
    hexNote: '#222',
  },
  append: {
    fontSizePx: 16,
    lineHeightPx: 16,
    fontWeight: 700,
    letterSpacingPx: 0.4,
    textTransform: 'uppercase' as const,
    colorRgb: 'rgb(34, 34, 34)' as const,
    hexNote: '#222',
    alignSelf: 'flex-end' as const,
    paddingBottomPx: 2,
  },
  label: {
    fontSizePx: 14,
    lineHeightPx: 17.5,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    colorRgb: 'rgb(34, 34, 34)' as const,
    hexNote: '#222',
  },
} as const;

/** TextSize `xs`, Style `text`. */
export const CALLOUT_DESIGN_TEXT_STYLE_XS_PARAMS = {
  colorScheme: 'dark',
  direction: 'row',
  textAlignment: 'left',
  titleSize: 'xs',
  style: 'text',
} as const satisfies CalloutConfig;

export const CALLOUT_DESIGN_TEXT_STYLE_XS_TEXT = {
  value: {
    fontSizePx: 24,
    lineHeightPx: 24,
    fontWeight: 700,
    colorRgb: 'rgb(71, 158, 188)' as const,
    hexNote: '#479ebc',
    flexShrink: 0,
  },
  prepend: {
    fontSizePx: 16,
    lineHeightPx: 16,
    fontWeight: 700,
    letterSpacingPx: 0.4,
    textTransform: 'uppercase' as const,
    colorRgb: 'rgb(34, 34, 34)' as const,
    hexNote: '#222',
  },
  append: {
    fontSizePx: 16,
    lineHeightPx: 16,
    fontWeight: 700,
    letterSpacingPx: 0.4,
    textTransform: 'uppercase' as const,
    colorRgb: 'rgb(34, 34, 34)' as const,
    hexNote: '#222',
    alignSelf: 'flex-end' as const,
    paddingBottomPx: 2,
  },
  label: {
    fontSizePx: 12,
    lineHeightPx: 15,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    colorRgb: 'rgb(34, 34, 34)' as const,
    hexNote: '#222',
  },
} as const;
