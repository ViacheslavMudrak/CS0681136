import type { Field, LinkField } from "@sitecore-content-sdk/nextjs";

import type {
  CalloutConfig,
  CalloutStyle,
  CalloutDirection,
  CalloutTitleSize,
  CalloutTextAlignment,
  CalloutColorScheme,
  CalloutItemFields,
  CalloutFields,
  CalloutItem,
} from "./Callout.type";

/**
 * True when a Sitecore text field value is non-empty after trim (supports numeric stats from the CMS).
 */
export function calloutFieldValueIsVisible(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  return String(value).trim().length > 0;
}

/**
 * True when a Sitecore Link field has a non-empty `href` after trim (layout, Edge, or SDK `{ value }` shape).
 */
export function calloutLinkFieldHasHref(link: LinkField | undefined): boolean {
  const href = link?.value?.href;
  if (href === undefined || href === null) return false;
  return String(href).trim().length > 0;
}

/**
 * Whether a callout child item has any visitor-visible content (preview mode).
 */
export function calloutItemHasPreviewContent(
  fields: CalloutItemFields | undefined,
): boolean {
  const f = fields ?? {};
  return Boolean(
    calloutFieldValueIsVisible(f.PrependValue?.value) ||
    calloutFieldValueIsVisible(f.Value?.value) ||
    calloutFieldValueIsVisible(f.AppendValue?.value) ||
    calloutFieldValueIsVisible(f.Label?.value) ||
    calloutLinkFieldHasHref(f.Link),
  );
}

interface ParamValue {
  Value?: {
    value?: string;
  };
  value?: string;
}

/**
 * Extracts a string value from a Sitecore rendering parameter.
 * Handles plain strings, `{ Value: { value } }`, and flat `{ value }` (layout / Edge variants).
 */
function getParamValue(
  param: ParamValue | string | undefined | null,
): string | undefined {
  if (param == null) return undefined;
  if (typeof param === "string") return param;
  if (typeof param !== "object") return undefined;
  const o = param as Record<string, unknown>;
  if (typeof o.value === "string" || typeof o.value === "number") {
    return String(o.value);
  }
  const nested = o.Value as { value?: unknown } | undefined;
  if (nested != null && typeof nested === "object" && nested.value != null) {
    const nv = nested.value;
    if (typeof nv === "string" || typeof nv === "number") return String(nv);
  }
  /** Item-backed droplist (REST / some layout shapes): `{ id, fields: { Value: { value } } }`. */
  const fieldsObj = o.fields as Record<string, unknown> | undefined;
  if (fieldsObj != null && typeof fieldsObj === "object") {
    const fieldValueNode = fieldsObj.Value;
    if (fieldValueNode != null) {
      const fromFields = getParamValue(fieldValueNode as ParamValue | string);
      if (fromFields != null && String(fromFields).trim() !== "") {
        return fromFields;
      }
    }
  }
  return undefined;
}

/**
 * Returns the first `params[key]` whose {@link getParamValue} is non-empty (trimmed).
 */
function firstParamNodeWithValue(
  params: Record<string, unknown>,
  keys: readonly string[],
): unknown {
  for (const k of keys) {
    const node = params[k];
    const s = getParamValue(node as ParamValue | string | undefined);
    if (s != null && String(s).trim() !== "") {
      return node;
    }
  }
  return undefined;
}

/**
 * Media Tile uses `CalloutStyle`, `CalloutDirection`, … while the shared Callout resolves `Style`, `Direction`, …
 * If both exist, **prefixed keys win** so tile `Style` (`Default` / `Card`) does not override `CalloutStyle` (`Text`).
 * Also checks camelCase and kebab-case key spellings from Edge / GraphQL payloads.
 *
 * @param params - Rendering params (merged layout + optional maps).
 * @returns Shallow clone with standard Callout keys coalesced from prefixed variants when those carry content.
 */
export function coalesceMediaTileCalloutPrefixedParams(
  params: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...params };

  const styleSrc = firstParamNodeWithValue(out, [
    "CalloutStyle",
    "calloutStyle",
    "callout-style",
  ]);
  if (styleSrc !== undefined) {
    out.Style = styleSrc as ParamValue;
  }

  const dirSrc = firstParamNodeWithValue(out, [
    "CalloutDirection",
    "calloutDirection",
    "callout-direction",
  ]);
  if (dirSrc !== undefined) {
    out.Direction = dirSrc as ParamValue;
  }

  const sizeSrc = firstParamNodeWithValue(out, [
    "CalloutTextSize",
    "calloutTextSize",
    "callout-text-size",
  ]);
  if (sizeSrc !== undefined) {
    out.TextSize = sizeSrc as ParamValue;
  }

  const alignSrc = firstParamNodeWithValue(out, [
    "CalloutTextAlign",
    "calloutTextAlign",
    "callout-text-align",
  ]);
  if (alignSrc !== undefined) {
    out.TextAlign = alignSrc as ParamValue;
  }

  const colorSrc = firstParamNodeWithValue(out, [
    "CalloutColorScheme",
    "calloutColorScheme",
    "callout-color-scheme",
  ]);
  if (colorSrc !== undefined) {
    out.ColorScheme = colorSrc as ParamValue;
  }

  return out;
}

/**
 * Resolves the visual style from rendering params.
 * Accepts compound CMS values such as `card/base` (uses the segment before `/`).
 * @returns Normalized style — defaults to 'text' if unrecognized.
 */
export function resolveCalloutStyle(
  params: Record<string, unknown>,
): CalloutStyle {
  const raw = (
    getParamValue(params?.Style as ParamValue | string | undefined) ??
    getParamValue(params?.style as ParamValue | string | undefined)
  )
    ?.trim()
    .toLowerCase();
  if (!raw) return "text";
  const head = raw.includes("/") ? raw.split("/")[0]?.trim() : raw;
  if (head === "text" || head === "base" || head === "card") return head;
  return "text";
}

/**
 * Resolves the layout direction from rendering params (`Direction` / `direction`).
 * Maps Sitecore values directly: `row` → horizontal stat bar, `column` → vertical stack.
 * @returns 'row' or 'column' — defaults to 'row' when unset or unrecognized.
 */
export function resolveCalloutDirection(
  params: Record<string, unknown>,
): CalloutDirection {
  const raw =
    getParamValue(params?.Direction as ParamValue | string | undefined) ??
    getParamValue(params?.direction as ParamValue | string | undefined);
  const v = raw?.trim().toLowerCase();
  if (v === "row") return "row";
  if (v === "column") return "column";
  return "row";
}

/**
 * Resolves the title/value text size from Sitecore rendering param `TextSize`.
 * @returns 'xs', 'sm', or 'base' — defaults to 'base'.
 */
export function resolveCalloutTitleSize(
  params: Record<string, unknown>,
): CalloutTitleSize {
  const raw =
    getParamValue(params?.TextSize as ParamValue | string | undefined) ??
    getParamValue(params?.textSize as ParamValue | string | undefined);
  const v = raw?.trim().toLowerCase();
  if (v === "xs" || v === "sm" || v === "base") return v;
  return "base";
}

/**
 * Merges layout `rendering.params` with the `params` object passed to the component.
 * Placeholder / SDK paths often pass only `styles` and `RenderingIdentifier` on `params` while
 * droplist values (e.g. TextAlign) remain on `rendering.params` only — without merging, alignment
 * always falls back to `left`.
 *
 * @param rendering - Layout component rendering (may carry full `params`)
 * @param params - Props from the renderer (wins on key collisions)
 * @returns Merged parameter record.
 */
export function mergeCalloutRenderingParams(
  rendering: unknown,
  params: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...getCalloutRenderingParamsOnly(rendering) };
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) {
      out[k] = v;
    }
  }
  return out;
}

/**
 * Resolves the text alignment from Sitecore rendering param `TextAlign`.
 * @returns 'left' or 'center' — defaults to 'left'.
 */
export function resolveCalloutTextAlignment(
  params: Record<string, unknown>,
): CalloutTextAlignment {
  const raw =
    getParamValue(params?.TextAlign as ParamValue | string | undefined) ??
    getParamValue(params?.textAlign as ParamValue | string | undefined);
  const v = raw?.trim().toLowerCase();
  if (v === "left" || v === "center") return v;
  return "left";
}

/**
 * Copies defined rendering-parameter entries only (`undefined` / `null` are skipped so they never wipe keys).
 */
function assignDefinedCalloutParams(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): void {
  for (const [k, v] of Object.entries(source)) {
    if (v !== undefined && v !== null) {
      target[k] = v;
    }
  }
}

/**
 * Raw rendering parameters from layout: merges `rendering.parameters` first, then `rendering.params`
 * (layout `params` wins on conflicts). Skips `undefined`/`null` values so a sparse `parameters` object
 * cannot erase droplist values that only exist on `params` (common with placeholder / SDK payloads).
 */
export function getCalloutRenderingParamsOnly(
  rendering: unknown,
): Record<string, unknown> {
  const r = rendering as Record<string, unknown> | null | undefined;
  if (r == null || typeof r !== "object") return {};
  const out: Record<string, unknown> = {};
  const p2 = r.parameters;
  if (p2 != null && typeof p2 === "object" && !Array.isArray(p2)) {
    assignDefinedCalloutParams(out, p2 as Record<string, unknown>);
  }
  const p = r.params;
  if (p != null && typeof p === "object" && !Array.isArray(p)) {
    assignDefinedCalloutParams(out, p as Record<string, unknown>);
  }
  return out;
}

/**
 * Logs TextAlignment-related data from Sitecore (server terminal in dev, or browser if you move this to a client boundary).
 * Enable on preview builds with `NEXT_PUBLIC_DEBUG_CALLOUT_ALIGNMENT=1`.
 *
 * @param rendering - Layout rendering (may hold `params.TextAlign`).
 * @param paramsFromProps - `params` passed into the component.
 * @param mergedParams - Result of {@link mergeCalloutRenderingParams}.
 * @param config - Resolved callout config.
 * @param meta - Rendering id / name / UI class for correlation.
 */
export function logCalloutTextAlignmentDebug(
  rendering: unknown,
  paramsFromProps: Record<string, unknown>,
  mergedParams: Record<string, unknown>,
  config: CalloutConfig,
  meta: {
    renderingIdentifier?: string;
    componentName?: string;
    embeddedLayout: boolean;
    containerTextAlignClass: string;
  },
): void {
  const enabled =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_DEBUG_CALLOUT_ALIGNMENT === "1";
  if (!enabled) return;

  const fromRendering = getCalloutRenderingParamsOnly(rendering);
  const pickAlign = (rec: Record<string, unknown>) =>
    Object.fromEntries(Object.entries(rec).filter(([k]) => /align/i.test(k)));
}

/**
 * Resolves the color scheme from rendering params.
 * @returns 'light' or 'dark' — defaults to 'light'.
 */
export function resolveCalloutColorScheme(
  params: Record<string, unknown>,
): CalloutColorScheme {
  const raw = (
    getParamValue(params?.ColorScheme as ParamValue | string | undefined) ??
    getParamValue(params?.colorScheme as ParamValue | string | undefined)
  )?.toLowerCase();
  if (raw === "light" || raw === "dark") return raw;
  return "light";
}

/**
 * Resolves all rendering params into a single config object.
 * Applies {@link coalesceMediaTileCalloutPrefixedParams} first so Media Tile CMS keys
 * (`CalloutDirection`, `CalloutStyle`, `CalloutTextSize`, `CalloutTextAlign`, `CalloutColorScheme`, plus camel/kebab aliases)
 * map onto the standard keys {@link resolveCalloutStyle} and siblings read.
 *
 * @param params - The component rendering parameters from Sitecore (may include prefixed Media Tile keys).
 * @returns A fully resolved CalloutConfig with safe defaults.
 */
export function resolveCalloutConfig(
  params: Record<string, unknown>,
): CalloutConfig {
  const p = coalesceMediaTileCalloutPrefixedParams({ ...params });
  return {
    style: resolveCalloutStyle(p),
    direction: resolveCalloutDirection(p),
    titleSize: resolveCalloutTitleSize(p),
    textAlignment: resolveCalloutTextAlignment(p),
    colorScheme: resolveCalloutColorScheme(p),
  };
}

/**
 * Alignment used for layout and footnote. Direction `column` (vertical stack) is always left,
 * regardless of Sitecore `TextAlign`.
 */
export function resolveCalloutDisplayTextAlignment(
  config: CalloutConfig,
): CalloutTextAlignment {
  if (config.direction === "column") return "left";
  return config.textAlignment;
}

/** Any style `card` layout: CMS `TextAlign` does not affect list / chrome alignment (fixed `left`). */
export function isCalloutCardIgnoresCmsTextAlign(
  config: CalloutConfig,
): boolean {
  return config.style === "card";
}

export function isCalloutCardColumnLayout(config: CalloutConfig): boolean {
  return config.style === "card" && config.direction === "column";
}

export function isCalloutCardColumnHorizontalSplit(
  config: CalloutConfig,
): boolean {
  return (
    isCalloutCardColumnLayout(config) &&
    (config.titleSize === "base" ||
      config.titleSize === "sm" ||
      config.titleSize === "xs")
  );
}

export function isCalloutCardColumnSplitXs(config: CalloutConfig): boolean {
  return (
    isCalloutCardColumnHorizontalSplit(config) && config.titleSize === "xs"
  );
}

export function isCalloutCardColumnSplitSm(config: CalloutConfig): boolean {
  return (
    isCalloutCardColumnHorizontalSplit(config) && config.titleSize === "sm"
  );
}

export function isCalloutCardColumnBaseTypography(
  config: CalloutConfig,
): boolean {
  return isCalloutCardColumnLayout(config) && config.titleSize === "base";
}

export function isCalloutCardRowLockedLayout(config: CalloutConfig): boolean {
  return config.style === "card" && config.direction === "row";
}

export function isCalloutCardRowFixedTypography(
  config: CalloutConfig,
): boolean {
  return isCalloutCardRowLockedLayout(config);
}

export function fieldFromGraphqlNode(node: unknown): Field<string> | undefined {
  if (node === undefined || node === null || typeof node !== "object")
    return undefined;
  const rec = node as Record<string, unknown>;
  if (typeof rec.value === "string") return node as Field<string>;
  const jv = rec.jsonValue;
  if (jv && typeof jv === "object" && jv !== null && "value" in jv) {
    return jv as Field<string>;
  }
  return undefined;
}

/**
 * Resolves a text field from Pascal/camel keys or GraphQL `jsonValue` wrappers.
 */
export function pickTextFieldBlock(
  fr: Record<string, unknown>,
  pascal: string,
  camel: string,
): Field<string> | undefined {
  const raw = fr[pascal] ?? fr[camel];
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw === "object" && raw !== null && "value" in raw) {
    return raw as Field<string>;
  }
  return fieldFromGraphqlNode(raw);
}

/**
 * Normalizes a link field from layout or GraphQL shapes.
 */
export function normalizeLinkFieldNode(node: unknown): LinkField | undefined {
  if (node === undefined || node === null || typeof node !== "object")
    return undefined;
  const rec = node as Record<string, unknown>;
  const val = rec.value;
  if (val && typeof val === "object" && val !== null && "href" in val) {
    return node as LinkField;
  }
  const jv = rec.jsonValue;
  if (jv && typeof jv === "object" && jv !== null) {
    const jvRec = jv as Record<string, unknown>;
    if (jvRec.href !== undefined) return jv as LinkField;
    const inner = jvRec.value;
    if (
      inner &&
      typeof inner === "object" &&
      inner !== null &&
      "href" in inner
    ) {
      return jv as LinkField;
    }
  }
  return undefined;
}

/**
 * Flattens GraphQL `jsonValue` link shapes into `{ value: { href, text, … } }` for Content SDK `Link`.
 */
export function coalesceCalloutGroupLinkFieldForSdk(
  link: LinkField | undefined,
): LinkField | undefined {
  if (link === undefined || link === null) return undefined;
  const rec = link as unknown as Record<string, unknown>;
  const direct = rec.value;
  if (
    direct &&
    typeof direct === "object" &&
    direct !== null &&
    "href" in direct
  ) {
    return link;
  }
  const jv = rec.jsonValue;
  if (jv && typeof jv === "object" && jv !== null) {
    const j = jv as Record<string, unknown>;
    const inner = j.value;
    if (
      inner &&
      typeof inner === "object" &&
      inner !== null &&
      "href" in inner
    ) {
      return { value: inner } as LinkField;
    }
    if ("href" in j) {
      return { value: j } as LinkField;
    }
  }
  return link;
}

/** Builds callout row fields from Sitecore layout or GraphQL child shape (Pascal or camel keys, jsonValue). */
export function normalizeCalloutItemFields(
  fr: Record<string, unknown> | undefined,
): CalloutItemFields | undefined {
  if (!fr) return undefined;
  const out: CalloutItemFields = {
    PrependValue: pickTextFieldBlock(fr, "PrependValue", "prependValue"),
    Value: pickTextFieldBlock(fr, "Value", "value"),
    AppendValue: pickTextFieldBlock(fr, "AppendValue", "appendValue"),
    Label: pickTextFieldBlock(fr, "Label", "label"),
    Link: normalizeLinkFieldNode(fr.Link ?? fr.link),
    Style: (fr.Style ?? fr.style) as CalloutItemFields["Style"],
    Colorscheme: (fr.Colorscheme ??
      fr.colorscheme) as CalloutItemFields["Colorscheme"],
    Icon: (fr.Icon ?? fr.icon) as CalloutItemFields["Icon"],
    IconPosition: (fr.IconPosition ??
      fr.iconPosition) as CalloutItemFields["IconPosition"],
  };
  const hasAny = Object.values(out).some((v) => v !== undefined && v !== null);
  return hasAny ? out : undefined;
}

function resolveCalloutListItemId(
  o: Record<string, unknown>,
  fallbackIndex: number,
): string {
  const rawId = o.id ?? o.itemId;
  if (typeof rawId === "string" && rawId.trim() !== "") return rawId;
  if (typeof rawId === "number" && Number.isFinite(rawId)) return String(rawId);
  if (typeof o.url === "string" && o.url.trim() !== "") return o.url;
  if (typeof o.name === "string" && o.name.trim() !== "")
    return `callout-${o.name}`;
  return `callout-item-${fallbackIndex}`;
}

/**
 * Normalizes one callout row from layout JSON, integrated GraphQL, or flat child nodes.
 */
export function normalizeCalloutListItem(
  raw: unknown,
  fallbackIndex = 0,
): CalloutItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = resolveCalloutListItemId(o, fallbackIndex);

  const fieldsObject =
    o.fields && typeof o.fields === "object"
      ? (o.fields as Record<string, unknown>)
      : o.field && typeof o.field === "object"
        ? (o.field as Record<string, unknown>)
        : undefined;

  if (fieldsObject) {
    const normalized = normalizeCalloutItemFields(fieldsObject);
    return {
      id,
      url: typeof o.url === "string" ? o.url : undefined,
      name: typeof o.name === "string" ? o.name : undefined,
      displayName:
        typeof o.displayName === "string" ? o.displayName : undefined,
      fields: normalized ?? (fieldsObject as CalloutItemFields),
    };
  }

  const flatFields = normalizeCalloutItemFields(o);
  if (flatFields) {
    return {
      id,
      url: typeof o.url === "string" ? o.url : undefined,
      name: typeof o.name === "string" ? o.name : undefined,
      displayName:
        typeof o.displayName === "string" ? o.displayName : undefined,
      fields: flatFields,
    };
  }

  return { id, fields: {} };
}

function isCalloutLikeRecord(o: Record<string, unknown>): boolean {
  return (
    typeof o.id === "string" ||
    o.fields !== undefined ||
    typeof o.url === "string" ||
    typeof o.name === "string" ||
    typeof o.displayName === "string"
  );
}

/**
 * Normalizes `Callouts` from layout JSON or GraphQL: plain array, `{ results: [...] }`, or a single row object.
 * Use this before iterating so one datasource supports one or many callout rows with the same field keys.
 *
 * @param raw - `fields.Callouts`, `CalloutItems`, or equivalent from `data.datasource`.
 * @returns Stable {@link CalloutItem} list (may be empty).
 */
export function normalizeCalloutsField(raw: unknown): CalloutItem[] {
  if (raw === undefined || raw === null) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((item, index) => normalizeCalloutListItem(item, index))
      .filter((x): x is CalloutItem => x !== null);
  }
  if (typeof raw === "object" && raw !== null) {
    const o = raw as Record<string, unknown>;
    const results = o.results;
    if (Array.isArray(results)) {
      return normalizeCalloutsField(results);
    }
    if (isCalloutLikeRecord(o)) {
      const one = normalizeCalloutListItem(raw, 0);
      return one ? [one] : [];
    }
  }
  return [];
}

/**
 * Collects callout list items from a datasource record (multilist, `{ results }`, or `children.results`).
 */
export function extractCalloutsFromDatasource(
  ds: Record<string, unknown>,
): CalloutItem[] {
  const fromKeys = [
    normalizeCalloutsField(ds.Callouts),
    normalizeCalloutsField(ds.callouts),
    normalizeCalloutsField(ds.CalloutItems),
    normalizeCalloutsField(ds.calloutItems),
  ];
  for (const list of fromKeys) {
    if (list.length > 0) return list;
  }

  const children = ds.children;
  if (children && typeof children === "object" && children !== null) {
    const results = (children as { results?: unknown }).results;
    const fromChildren = normalizeCalloutsField(results);
    if (fromChildren.length > 0) return fromChildren;
  }

  return [];
}

function hasNonEmptyScalarField(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  return String(value).trim().length > 0;
}

function footnoteHasVisibleContent(
  footnote: Field<string> | undefined,
): boolean {
  const raw = footnote?.value;
  if (typeof raw !== "string") return false;
  const stripped = raw
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return stripped.length > 0;
}

function coalesceRootCalloutLists(fields: CalloutFields): CalloutFields {
  const fromCallouts = normalizeCalloutsField(fields.Callouts);
  if (fromCallouts.length > 0) {
    return { ...fields, Callouts: fromCallouts };
  }
  const fromItems = normalizeCalloutsField(fields.CalloutItems);
  if (fromItems.length > 0) {
    return { ...fields, Callouts: fromItems };
  }
  const fromRoot = extractCalloutsFromDatasource(
    fields as unknown as Record<string, unknown>,
  );
  if (fromRoot.length > 0) {
    return { ...fields, Callouts: fromRoot };
  }
  return fields;
}

function mergeCalloutDatasourceExtras(
  fields: CalloutFields,
  ds: Record<string, unknown> | undefined,
  isEditing: boolean,
): CalloutFields {
  if (!ds) return fields;

  let out = fields;
  const existingCallouts = fields.Callouts?.filter((c) => c?.id) ?? [];

  if (existingCallouts.length === 0) {
    const fromDs = extractCalloutsFromDatasource(ds);
    if (fromDs.length > 0) {
      out = { ...out, Callouts: fromDs };
    }
  }

  if (!hasNonEmptyScalarField(fields.Footnote?.value)) {
    const fn = fieldFromGraphqlNode(ds.Footnote ?? ds.footnote);
    if (fn && (isEditing || footnoteHasVisibleContent(fn))) {
      out = { ...out, Footnote: fn };
    }
  }

  if (
    !calloutLinkFieldHasHref(coalesceCalloutGroupLinkFieldForSdk(fields.Link))
  ) {
    const link = normalizeLinkFieldNode(ds.Link ?? ds.link);
    const merged = link ? coalesceCalloutGroupLinkFieldForSdk(link) : undefined;
    if (merged && (isEditing || calloutLinkFieldHasHref(merged))) {
      out = { ...out, Link: merged };
    }
  }

  if (!hasNonEmptyScalarField(fields.Heading?.value)) {
    const heading = fieldFromGraphqlNode(ds.Heading ?? ds.heading);
    if (heading && (isEditing || hasNonEmptyScalarField(heading.value))) {
      out = { ...out, Heading: heading };
    }
  }

  return out;
}

/**
 * Flattens GraphQL `jsonValue` text fields on each callout row so Prepend/Value/Append render in preview.
 */
export function normalizeCalloutItemsFieldShapes(
  items: CalloutItem[],
): CalloutItem[] {
  return items.map((item) => {
    const raw = item.fields as Record<string, unknown> | undefined;
    if (!raw) return item;
    const normalized = normalizeCalloutItemFields(raw);
    return normalized ? { ...item, fields: normalized } : item;
  });
}

/**
 * Hoists callouts / footnote / link from integrated `data.datasource`, coalesces alternate list keys,
 * and flattens GraphQL `jsonValue` text fields so Prepend/Value/Append render in preview.
 * @param fields - Raw Callout rendering fields from layout or GraphQL.
 * @param isEditing - When true, prefer showing empty fields for XM Cloud Pages.
 */
export function resolveCalloutComponentFields(
  fields: CalloutFields | undefined,
  isEditing: boolean,
): CalloutFields | undefined {
  if (!fields) return undefined;

  let result: CalloutFields = { ...fields };
  result = coalesceRootCalloutLists(result);
  result = {
    ...result,
    Link: coalesceCalloutGroupLinkFieldForSdk(result.Link) ?? result.Link,
  };
  const ds = result.data?.datasource;
  result = mergeCalloutDatasourceExtras(result, ds, isEditing);
  result = {
    ...result,
    Link: coalesceCalloutGroupLinkFieldForSdk(result.Link) ?? result.Link,
  };

  if (result.Callouts?.length) {
    result = {
      ...result,
      Callouts: normalizeCalloutItemsFieldShapes(result.Callouts),
    };
  }

  return result;
}

/**
 * Wraps `Callout.Default` in the component map with merged layout props (embed / placeholder columns).
 *
 * @param componentMap - Map from `.sitecore/component-map` (or patched clone).
 * @param extraCalloutProps - Merged into props for each `Callout.Default` invocation.
 * @returns A new Map; the original is not mutated.
 */
export function patchCalloutDefaultInComponentMap(
  componentMap: unknown,
  extraCalloutProps: Record<string, unknown>,
): Map<string, unknown> {
  const map =
    componentMap instanceof Map
      ? new Map(componentMap as Map<string, unknown>)
      : new Map(
          Object.entries(
            (componentMap as Record<string, unknown> | null | undefined) ?? {},
          ),
        );
  const callout = map.get("Callout");
  if (
    callout &&
    typeof callout === "object" &&
    callout !== null &&
    "Default" in callout &&
    typeof (callout as { Default: unknown }).Default === "function"
  ) {
    const entry = callout as {
      Default: (props: Record<string, unknown>) => unknown;
      [k: string]: unknown;
    };
    const originalDefault = entry.Default;
    map.set("Callout", {
      ...entry,
      Default: (props: Record<string, unknown>) =>
        originalDefault({ ...props, ...extraCalloutProps }),
    });
  }
  return map;
}

/**
 * Aside column under Text and Aside: use Callout **embedded** chrome (no viewport breakout).
 * Cast the return value to SDK `ComponentMap` at the `AppPlaceholder` call site.
 */
export function patchComponentMapForTextAsideAsideCallouts(
  componentMap: unknown,
): Map<string, unknown> {
  return patchCalloutDefaultInComponentMap(componentMap, {
    embeddedLayout: true,
    textAsideAsideLayout: true,
  });
}
