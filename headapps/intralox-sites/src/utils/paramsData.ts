/**
 * Billboard component params structure from Sitecore
 */
interface ParamValue<T = string> {
  Value?: {
    value?: T;
  };
}

export interface IParamsFields {
  TextAlignment?: ParamValue;
  VerticalPosition?: ParamValue;
  TextPosition?: ParamValue;
  TextSize?: ParamValue;
  TextWidth?: ParamValue;
  HeadlineSize?: ParamValue;
  HeadlineWidth?: ParamValue;
  HeadlineLevel?: ParamValue;
  Divider?: ParamValue;
  PreferredRatio?: ParamValue;
  MediaRatio?: ParamValue;
  [key: string]: ParamValue | string | undefined;
}

/**
 * Extracts the string value from a param field
 */
function getParamValue<T = string>(
  param: ParamValue<T> | undefined,
): T | undefined {
  return param?.Value?.value;
}

/**
 * Returns heading-related params (HeadlineSize, HeadlineWidth)
 */
export function getHeadingParams(params: IParamsFields | undefined) {
  if (!params) return undefined;

  return {
    size: getParamValue(params.HeadlineSize)?.toString().toLowerCase(),
    width: getParamValue(params.HeadlineWidth)?.toString().toLowerCase(),
    tag: getParamValue(params.HeadlineLevel)?.toString().toLowerCase(),
  };
}

/**
 * Returns text-related params (TextSize, TextWidth, TextAlignment, TextPosition)
 */
export function getTextParams(params: IParamsFields | undefined) {
  if (!params) return undefined;

  const textAlignment = getParamValue(params.TextAlignment)
    ?.toString()
    .toLowerCase();
  const textPosition = getParamValue(params.TextPosition)
    ?.toString()
    .toLowerCase();
  const textVerticalPosition = getParamValue(params.VerticalPosition)
    ?.toString()
    .toLowerCase();
  const textWidth = getParamValue(params.TextWidth)?.toString().toLowerCase();

  return {
    size: getParamValue(params.TextSize)?.toString().toLowerCase(),
    width: textWidth,
    textAlignment,
    textPosition,
    textVerticalPosition,
  };
}

/**
 * Returns position-related params (TextAlignment, VerticalPosition, TextPosition)
 */
export function getPositionParams(params: IParamsFields | undefined) {
  if (!params) return undefined;

  return {
    vertical: getParamValue(params.VerticalPosition)?.toString().toLowerCase(),
  };
}

/**
 * Returns position-related params (TextAlignment, VerticalPosition, TextPosition)
 */
export function getDividerParams(params: IParamsFields | undefined) {
  if (!params) return undefined;

  return {
    divider: getParamValue(params.Divider)?.toLowerCase() as
      | "fade"
      | "border"
      | undefined,
  };
}

/**
 * Converts aspect ratio string (e.g. "16:9") to decimal for padding-bottom.
 * "16:9" = width:height → height/width = 9/16 = 0.5625
 *
 * @param ratioStr - Aspect ratio like "16:9", "4:3", "1:1"
 * @returns Decimal ratio (height/width) or undefined if invalid
 */
export function parseAspectRatioToDecimal(
  ratioStr: string | undefined,
): number | undefined {
  if (!ratioStr || typeof ratioStr !== "string") return undefined;
  const parts = ratioStr.trim().split(":");
  if (parts.length !== 2) return undefined;
  const width = Number(parts[0]);
  const height = Number(parts[1]);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0)
    return undefined;
  return height / width;
}

/**
 * Returns ratio-related params (PreferredRatio from Sitecore).
 * - ratio: decimal (height/width) for Video padding-bottom
 * - ratioVw: vw key for billboard height classes
 */
export function getRatioParams(params: IParamsFields | undefined) {
  if (!params) return undefined;
  const paramRatio = params.PreferredRatio || params.MediaRatio
  const raw = getParamValue(paramRatio)?.toString();
  const decimal = parseAspectRatioToDecimal(raw);
  return {
    ratio: decimal,
  };
}
