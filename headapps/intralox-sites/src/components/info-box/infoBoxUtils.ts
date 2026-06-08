import type { Field } from '@sitecore-content-sdk/nextjs';

import { getFieldStringValue } from '../divider/dividerUtils';
import type { InfoBoxFields } from './InfoBox.type';

export const INFOBOX_EMPTY_HINT = 'InfoBox';

/** Resolved visual + a11y context for the InfoBox. */
export type InfoBoxContextKey = 'info' | 'success' | 'none';

export const INFOBOX_REGION_ARIA: Record<InfoBoxContextKey, string> = {
  info: 'Information',
  success: 'Success',
  none: 'Notice',
};

/** Info glyph width (px); container rail = this + {@link INFOBOX_ICON_RAIL_END_PAD_PX} padding-right. */
export const INFOBOX_ICON_INFO_WIDTH_PX = 18.27;

/** Success glyph width (px); container rail = this + {@link INFOBOX_ICON_RAIL_END_PAD_PX} padding-right. */
export const INFOBOX_ICON_SUCCESS_WIDTH_PX = 27.43;

/** Icon glyph height (px); icon column matches this height. */
export const INFOBOX_ICON_HEIGHT_PX = 32;

/** Space between icon column and RTE (`padding-right` on the rail). */
export const INFOBOX_ICON_RAIL_END_PAD_PX = 24;

const INFOBOX_ICON_INFO_GLYPH_MEASURED_WIDTH_PX = 13.7;

/** Info icon horizontal scale — FA glyph is narrower than its em box. */
export const INFOBOX_ICON_INFO_SCALE_X =
  (INFOBOX_ICON_INFO_WIDTH_PX * INFOBOX_ICON_INFO_WIDTH_PX) /
  (INFOBOX_ICON_INFO_GLYPH_MEASURED_WIDTH_PX * INFOBOX_ICON_HEIGHT_PX);

/** @see {@link INFOBOX_ICON_INFO_SCALE_X} */
export const INFOBOX_ICON_SUCCESS_SCALE_X = INFOBOX_ICON_SUCCESS_WIDTH_PX / INFOBOX_ICON_HEIGHT_PX;

/**
 * Normalizes the Context droplink to a stable key (unknown → none).
 *
 * @param contextField - Raw Context field from flat or GraphQL layout
 */
export function resolveInfoBoxContext(contextField: unknown): InfoBoxContextKey {
  const raw = getFieldStringValue(contextField).trim().toLowerCase();
  if (raw === 'info') return 'info';
  if (raw === 'success') return 'success';
  return 'none';
}

/**
 * True when the author enabled "Hide icon" in Sitecore. Defaults to false when the field is absent.
 *
 * @param value - HideIcon field (boolean, string token, or `{ value }` wrapper)
 */
export function isHideIconChecked(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const t = value.toLowerCase();
    return t === '1' || t === 'true' || t === 'yes';
  }
  const o = value as Record<string, unknown>;
  const v = o?.value;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const t = v.toLowerCase();
    return t === '1' || t === 'true' || t === 'yes';
  }
  return false;
}

/**
 * Whether the decorative icon should render (Info/Success only, not hidden, not None).
 *
 * @param context - Resolved context
 * @param hideIcon - From {@link isHideIconChecked}
 */
export function shouldShowInfoBoxIcon(context: InfoBoxContextKey, hideIcon: boolean): boolean {
  if (context === 'none') return false;
  if (hideIcon) return false;
  return context === 'info' || context === 'success';
}

export interface ResolvedInfoBoxFields {
  textField: Field<string> | undefined;
  contextRaw: unknown;
  hideIconRaw: unknown;
}

/**
 * Reads Text, Context, and HideIcon from flat layout JSON or GraphQL-shaped fields.
 *
 * @param fields - InfoBox fields from the layout
 */
export function resolveInfoBoxFields(fields: InfoBoxFields): ResolvedInfoBoxFields {
  const flat = fields as {
    Text?: Field<string>;
    Context?: unknown;
    HideIcon?: unknown;
  };
  const gql = fields as {
    data?: {
      datasource?: {
        text?: { jsonValue?: Field<string> };
        Text?: { jsonValue?: Field<string> };
        context?: { jsonValue?: unknown };
        Context?: { jsonValue?: unknown };
        hideIcon?: { jsonValue?: unknown };
        HideIcon?: { jsonValue?: unknown };
      };
    };
  };
  const ds = gql.data?.datasource;

  const textField =
    flat.Text ??
    ds?.Text?.jsonValue ??
    ds?.text?.jsonValue;

  const contextRaw = flat.Context ?? ds?.Context?.jsonValue ?? ds?.context?.jsonValue;

  const hideIconRaw = flat.HideIcon ?? ds?.HideIcon?.jsonValue ?? ds?.hideIcon?.jsonValue;

  return { textField, contextRaw, hideIconRaw };
}
