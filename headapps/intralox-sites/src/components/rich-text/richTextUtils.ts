import type { ComponentRendering, Field } from "@sitecore-content-sdk/nextjs";

import type { RichTextFields } from "./RichText.type";
import {
  PATENTS_TABLE_COL1_WIDTH_MOBILE_PX,
  PATENTS_TABLE_COL2_WIDTH_MOBILE_PX,
  PATENTS_TABLE_COL3_WIDTH_MOBILE_PX,
} from "./richTextTokens";

/**
 * @param rendering - Current component rendering from layout.
 * @param fallbackLabel - Used when neither `displayName` nor `componentName` yields a non-empty string.
 * @returns Accessible name for the rich text region (displayName, else componentName, else fallback).
 */
export function getRichTextRegionAriaLabel(
  rendering: ComponentRendering,
  fallbackLabel: string,
): string {
  const record = rendering as unknown as Record<string, unknown>;
  const displayName = record.displayName;
  if (typeof displayName === "string" && displayName.trim() !== "") {
    return displayName.trim();
  }
  const componentName = record.componentName;
  if (typeof componentName === "string" && componentName.trim() !== "") {
    return componentName.trim();
  }
  return fallbackLabel;
}

/**
 * @param fields - RichText fields from Sitecore layout response.
 * @returns The normalized rich text field when present.
 */
export function getRichTextField(
  fields: RichTextFields | undefined,
): Field<string> | undefined {
  const flat = fields as
    | { Text?: Field<string>; text?: Field<string> }
    | undefined;
  const graphql = fields as
    | {
        data?: {
          datasource?: {
            Text?: { jsonValue?: Field<string> };
            text?: { jsonValue?: Field<string> };
          };
        };
      }
    | undefined;

  return (
    flat?.Text ??
    flat?.text ??
    graphql?.data?.datasource?.Text?.jsonValue ??
    graphql?.data?.datasource?.text?.jsonValue
  );
}

/** Sitecore RTE trademark logo row — live single row (`flex-nowrap`, `w-1/5` from 768px). */
export const RTE_IMAGE_GRID_CLASS = "rte-image-grid";

/** Bottom lone logo band (single tile) — avoids \`__\` in Tailwind arbitrary variant selectors. */
export const RTE_IMAGE_GRID_LONE_CLASS = "rte-image-grid--lone";

/** One logo per flex column after {@link flattenRichTextImageGrid}. */
export const RTE_IMAGE_GRID_ITEM_CLASS = "rte-image-grid__item";

/** 2400×1600 trademark assets — live uses ~66.67% padding-top aspect box (sm/md). */
export const RTE_IMAGE_GRID_ASPECT_CLASS = "rte-image-grid__aspect";

/** Live ImageOptim frame: fixed 131×87.333px at lg (intralox.com/corporate/trademarks). */
export const RTE_IMAGE_GRID_MEDIA_CLASS = "rte-image-grid__media";

export {
  RTE_IMAGE_GRID_LOGO_WIDTH_LG_PX,
  RTE_IMAGE_GRID_LOGO_HEIGHT_LG_PX,
  RTE_IMAGE_GRID_WIDTH_LG_PX,
  RTE_IMAGE_GRID_HEIGHT_LG_PX,
  RICH_TEXT_TABLE_FOOTER_PADDING_MOBILE_PX,
  RICH_TEXT_TABLE_FOOTER_PADDING_DESKTOP_PX,
} from "./richTextTokens";

/**
 * @param html - Raw rich text field HTML
 * @returns True when the field includes a table (patents, trademarks, etc.)
 */
export function richTextContentHasTable(html: string): boolean {
  return /<table\b/i.test(html);
}

/** Added to patents RTE `<table>` for series-divider CSS. */
export const PATENTS_TABLE_CLASS = "patents-table";

/** Single-column trademarks catalog (`/corporate/trademarks`) — styled via {@link RICH_TEXT_TRADEMARK_TABLE_CLASSES}. */
export const TRADEMARKS_TABLE_CLASS = "trademarks-table";

export {
  PATENTS_TABLE_ROW_HEIGHT_PX,
  PATENTS_TABLE_ROW_HEIGHT_MOBILE_PX,
  PATENTS_TABLE_ROW_MIN_HEIGHT_PX,
  PATENTS_TABLE_ROW_LINE_HEIGHT_PX,
  PATENTS_TABLE_ROW_PADDING_Y_PX,
  PATENTS_TABLE_ROW_PADDING_Y_MOBILE_PX,
  PATENTS_TABLE_WIDTH_DESKTOP_PX,
  PATENTS_TABLE_WIDTH_TABLET_PX,
  PATENTS_TABLE_WIDTH_MOBILE_PX,
  PATENTS_TABLE_COL1_WIDTH_PX,
  PATENTS_TABLE_COL1_WIDTH_MOBILE_PX,
  PATENTS_TABLE_COL2_WIDTH_PX,
  PATENTS_TABLE_COL2_WIDTH_MOBILE_PX,
  PATENTS_TABLE_COL3_WIDTH_PX,
  PATENTS_TABLE_COL3_WIDTH_MOBILE_PX,
} from "./richTextTokens";

/** Patents horizontal row divider — live intralox.com `rgb(215, 217, 218)` / `#d7d9da`. */
export const PATENTS_TABLE_ROW_BORDER_RGBA = "rgb(215, 217, 218)";

export {
  PATENTS_BREAKPOINT_MOBILE_MAX_PX,
  PATENTS_BREAKPOINT_TABLET_MIN_PX,
  PATENTS_BREAKPOINT_TABLET_MAX_PX,
  PATENTS_BREAKPOINT_DESKTOP_MIN_PX,
} from "./richTextTokens";

/** Applied in HTML via {@link markPatentsTableSpacerRows}. */
export const PATENTS_TABLE_SPACER_ROW_CLASS = "patents-table-spacer-row";

/** First spacer row (`br` in Style/Patent columns) between series groups. */
export const PATENTS_TABLE_SPACER_ROW_DIVIDER_CLASS =
  "patents-table-spacer-row--divider";

/** Second spacer row (all `&nbsp;`) between series groups. */
export const PATENTS_TABLE_SPACER_ROW_TIGHT_CLASS =
  "patents-table-spacer-row--tight";

/** Series continuation row: empty col 1, product name in col 2. */
export const PATENTS_TABLE_CONTINUATION_ROW_CLASS = "patents-table-continuation-row";

/** Patent catalog row: empty col 1–2, product name in col 3. */
export const PATENTS_TABLE_PATENT_ONLY_ROW_CLASS = "patents-table-patent-only-row";

/** Series row with patents only in col 3 (col 2 empty). */
export const PATENTS_TABLE_COL3_MOBILE_ROW_CLASS = "patents-table-col3-mobile-row";

/** Mobile patents: series block + patent catalog scroll block. */
export const PATENTS_TABLE_MOBILE_ROOT_CLASS = "patents-table-mobile";
export const PATENTS_TABLE_SERIES_BLOCK_CLASS = "patents-table-series-block";
export const PATENTS_TABLE_PATENT_SCROLL_CLASS = "patents-table-patent-scroll";

function appendDivClass(attrs: string, extraClass: string): string {
  const trimmed = attrs.trim();
  const classMatch = trimmed.match(/class\s*=\s*"([^"]*)"/i);
  if (classMatch) {
    const merged = `${classMatch[1]} ${extraClass}`.trim();
    return trimmed.replace(/class\s*=\s*"([^"]*)"/i, `class="${merged}"`);
  }
  return trimmed ? `${trimmed} class="${extraClass}"` : `class="${extraClass}"`;
}

/**
 * @param innerHtml - Inner HTML of a candidate grid wrapper `div`
 * @returns True when block is a multi-logo RTE grid (≥2 images, no visible text)
 */
function richTextBlockVisibleText(innerHtml: string): string {
  return innerHtml
    .replace(/<img\b[^>]*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;|&#xA0;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isRichTextImageGridContent(innerHtml: string): boolean {
  const imgCount = innerHtml.match(/<img\b/gi)?.length ?? 0;
  if (imgCount < 2) {
    return false;
  }
  return richTextBlockVisibleText(innerHtml).length === 0;
}

/** Single-logo Sitecore RTE tile (nested divs, one image, no visible text). */
function isRichTextSingleLogoDiv(innerHtml: string): boolean {
  const imgCount = innerHtml.match(/<img\b/gi)?.length ?? 0;
  if (imgCount < 1) {
    return false;
  }
  return richTextBlockVisibleText(innerHtml).length === 0;
}

/** One visible logo per block (`div`, `p`, or `figure`) with no label copy. */
function isRichTextSingleLogoBlock(innerHtml: string): boolean {
  const imgCount = innerHtml.match(/<img\b/gi)?.length ?? 0;
  if (imgCount < 1) {
    return false;
  }
  return richTextBlockVisibleText(innerHtml).length === 0;
}

/** Bottom-band trademark logo (e.g. CFS) — exactly one image, no label copy. */
function isRichTextLoneLogoBlock(innerHtml: string): boolean {
  const imgCount = innerHtml.match(/<img\b/gi)?.length ?? 0;
  if (imgCount !== 1) {
    return false;
  }
  return richTextBlockVisibleText(innerHtml).length === 0;
}

function buildLoneRichTextImageGrid(imgTag: string): string {
  return (
    `<div class="${RTE_IMAGE_GRID_CLASS} ${RTE_IMAGE_GRID_LONE_CLASS}">` +
    `${buildRichTextLogoTile(imgTag)}</div>`
  );
}

type RichTextLogoBlockTag = "div" | "p" | "figure";

function findSimpleElementBlock(
  html: string,
  openTagStart: number,
  tagName: Exclude<RichTextLogoBlockTag, "div">,
): { end: number; attrs: string; inner: string } | null {
  const slice = html.slice(openTagStart);
  const openMatch = slice.match(new RegExp(`^<${tagName}(\\b[^>]*)>`, "i"));
  if (!openMatch) {
    return null;
  }
  const openEnd = openTagStart + openMatch[0].length;
  const closeTag = `</${tagName}>`;
  const closeIdx = html.indexOf(closeTag, openEnd);
  if (closeIdx === -1) {
    return null;
  }
  return {
    end: closeIdx + closeTag.length,
    attrs: openMatch[1] ?? "",
    inner: html.slice(openEnd, closeIdx),
  };
}

function findRichTextLogoBlock(
  html: string,
  openTagStart: number,
): { end: number; attrs: string; inner: string; tag: RichTextLogoBlockTag } | null {
  const slice = html.slice(openTagStart);
  if (/^<div\b/i.test(slice)) {
    const block = findDivBlock(html, openTagStart);
    return block ? { ...block, tag: "div" } : null;
  }
  if (/^<p\b/i.test(slice)) {
    const block = findSimpleElementBlock(html, openTagStart, "p");
    return block ? { ...block, tag: "p" } : null;
  }
  if (/^<figure\b/i.test(slice)) {
    const block = findSimpleElementBlock(html, openTagStart, "figure");
    return block ? { ...block, tag: "figure" } : null;
  }
  return null;
}

function serializeRichTextLogoBlock(block: {
  tag: RichTextLogoBlockTag;
  attrs: string;
  inner: string;
}): string {
  const attrs = block.attrs.trim();
  const open = attrs ? `<${block.tag} ${attrs}>` : `<${block.tag}>`;
  return `${open}${block.inner}</${block.tag}>`;
}

/**
 * @param rowHtml - Full `<tr>...</tr>` markup
 * @returns True when the row is a single cell with logo image(s) only (no label text)
 */
export function isTrademarkLogoOnlyRow(rowHtml: string): boolean {
  const cells = [...rowHtml.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(
    (match) => match[1],
  );
  if (cells.length !== 1) {
    return false;
  }
  const inner = cells[0] ?? "";
  if ((inner.match(/<img\b/gi)?.length ?? 0) < 1) {
    return false;
  }
  return richTextBlockVisibleText(inner).length === 0;
}

function tbodyHasMultiColumnRows(tbodyInner: string): boolean {
  return [...tbodyInner.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)].some((row) => {
    const cellCount = row[0].match(/<td\b/gi)?.length ?? 0;
    return cellCount >= 2;
  });
}

function normalizeTrademarkLogoImgTag(imgTag: string): string {
  return imgTag
    .replace(/\sstyle\s*=\s*(?:"[^"]*"|'[^']*')/gi, "")
    .replace(/\s(width|height)\s*=\s*(?:"[^"]*"|'[^']*'|\S+)/gi, "");
}

function buildRichTextLogoTile(imgTag: string): string {
  return (
    `<div class="${RTE_IMAGE_GRID_ITEM_CLASS}">` +
    normalizeTrademarkLogoImgTag(imgTag) +
    `</div>`
  );
}

function isTrademarkTableSpacerRow(rowHtml: string): boolean {
  const cells = [...rowHtml.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(
    (match) => match[1],
  );
  if (cells.length !== 1) {
    return false;
  }
  const inner = cells[0] ?? "";
  if ((inner.match(/<img\b/gi)?.length ?? 0) > 0) {
    return false;
  }
  return (
    isPatentsTableSpacerCell(inner) ||
    /<hr\b/i.test(inner)
  );
}

function mergeTrademarkLogoRowsInTbody(tbodyInner: string): string {
  const rows = [...tbodyInner.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)].map(
    (match) => match[0],
  );
  if (rows.length === 0) {
    return tbodyInner;
  }

  const mergedRows: string[] = [];
  let logoRun: string[] = [];

  const flushLogoRun = () => {
    if (logoRun.length >= 1) {
      const trAttrsMatch = /<tr\b([^>]*)>/i.exec(logoRun[0]);
      const trAttrs = trAttrsMatch?.[1] ?? "";
      const combinedInner = logoRun
        .map((row) => {
          const cell = /<td\b[^>]*>([\s\S]*?)<\/td>/i.exec(row);
          return cell?.[1]?.trim() ?? "";
        })
        .filter(Boolean)
        .join("");
      const imgs = [...combinedInner.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
      const tiles = imgs.map(buildRichTextLogoTile).join("");
      mergedRows.push(
        `<tr${trAttrs}><td><div class="${RTE_IMAGE_GRID_CLASS}">${tiles}</div></td></tr>`,
      );
    } else {
      mergedRows.push(...logoRun);
    }
    logoRun = [];
  };

  for (const row of rows) {
    if (isTrademarkLogoOnlyRow(row)) {
      logoRun.push(row);
      continue;
    }
    if (isTrademarkTableSpacerRow(row) && logoRun.length > 0) {
      continue;
    }
    flushLogoRun();
    mergedRows.push(row);
  }
  flushLogoRun();

  return mergedRows.length > 0 ? mergedRows.join("") : tbodyInner;
}

/**
 * Sitecore trademarks often emit one logo per `<tr>`; merge consecutive logo rows so flex layout can render one live row.
 *
 * @param html - Raw rich text field HTML
 * @returns HTML with consecutive single-logo `<tr>` elements collapsed into one grid row
 */
export function mergeTrademarkLogoTableRows(html: string): string {
  return html.replace(/<tbody\b([^>]*)>([\s\S]*?)<\/tbody>/gi, (full, attrs, inner) => {
    if (tbodyHasMultiColumnRows(inner)) {
      return full;
    }
    const merged = mergeTrademarkLogoRowsInTbody(inner);
    return merged === inner ? full : `<tbody${attrs}>${merged}</tbody>`;
  });
}

function replaceDivBlockWithClass(
  html: string,
  openTagStart: number,
  block: { end: number; attrs: string; inner: string },
  extraClass: string,
): string {
  const merged = appendDivClass(block.attrs, extraClass);
  return (
    html.slice(0, openTagStart) +
    `<div ${merged}>${block.inner}</div>` +
    html.slice(block.end)
  );
}

function replaceDivBlockInner(
  html: string,
  openTagStart: number,
  block: { end: number; attrs: string; inner: string },
  newInner: string,
): string {
  const attrs = block.attrs.trim();
  return (
    html.slice(0, openTagStart) +
    (attrs ? `<div ${attrs}>${newInner}</div>` : `<div>${newInner}</div>`) +
    html.slice(block.end)
  );
}

/**
 * Wraps consecutive single-logo siblings (`div`, `p`, or `figure`) into one {@link RTE_IMAGE_GRID_CLASS} row.
 */
function wrapConsecutiveLogoBlocks(html: string, start: number): string | null {
  const blocks: {
    start: number;
    end: number;
    tag: RichTextLogoBlockTag;
    attrs: string;
    inner: string;
  }[] = [];
  let pos = start;
  while (pos < html.length) {
    const rest = html.slice(pos);
    const leading = rest.search(/\S/);
    if (leading === -1) {
      break;
    }
    pos += leading;
    const block = findRichTextLogoBlock(html, pos);
    if (!block || !isRichTextSingleLogoBlock(block.inner)) {
      break;
    }
    blocks.push({
      start: pos,
      end: block.end,
      tag: block.tag,
      attrs: block.attrs,
      inner: block.inner,
    });
    pos = block.end;
  }
  if (blocks.length < 2) {
    return null;
  }
  const inner = blocks.map(serializeRichTextLogoBlock).join("");
  return (
    html.slice(0, blocks[0].start) +
    `<div class="${RTE_IMAGE_GRID_CLASS}">${inner}</div>` +
    html.slice(blocks[blocks.length - 1].end)
  );
}

/**
 * @param html - Full HTML string
 * @param openTagStart - Index of `<div` opening a wrapper to close-match
 * @returns End index (after `</div>`) and inner HTML, or null if unbalanced
 */
export function findDivBlock(
  html: string,
  openTagStart: number,
): { end: number; attrs: string; inner: string } | null {
  const openEnd = html.indexOf(">", openTagStart);
  if (openEnd === -1) {
    return null;
  }
  const attrs = html.slice(openTagStart + 4, openEnd);
  let depth = 1;
  let cursor = openEnd + 1;
  while (cursor < html.length && depth > 0) {
    const nextOpen = html.indexOf("<div", cursor);
    const nextClose = html.indexOf("</div>", cursor);
    if (nextClose === -1) {
      return null;
    }
    if (nextOpen !== -1 && nextOpen < nextClose) {
      const tagEnd = html.indexOf(">", nextOpen);
      depth += 1;
      cursor = tagEnd === -1 ? nextOpen + 4 : tagEnd + 1;
      continue;
    }
    depth -= 1;
    cursor = nextClose + 6;
  }
  if (depth !== 0) {
    return null;
  }
  return {
    end: cursor,
    attrs,
    inner: html.slice(openEnd + 1, cursor - 6),
  };
}

/**
 * Tags one trademark logo block anywhere in the field (including inside table cells).
 *
 * @param html - Rich text field HTML
 * @param searchFrom - Start index for the next `<div` candidate
 * @returns Updated HTML, or the original when no more grids are found
 */
function tagNextRichTextImageGrid(html: string, searchFrom: number): string {
  let pos = searchFrom;
  while (pos < html.length) {
    const leading = html.slice(pos).search(/\S/);
    if (leading === -1) {
      return html;
    }
    pos += leading;

    const wrapped = wrapConsecutiveLogoBlocks(html, pos);
    if (wrapped) {
      return wrapped;
    }

    const divOpen = html.indexOf("<div", pos);
    const pOpen = html.indexOf("<p", pos);
    const figureOpen = html.indexOf("<figure", pos);
    const candidates = [divOpen, pOpen, figureOpen].filter((index) => index !== -1);
    if (candidates.length === 0) {
      return html;
    }
    const nextOpen = Math.min(...candidates);

    if (divOpen === nextOpen) {
      const openTag = html.slice(divOpen, html.indexOf(">", divOpen) + 1);
      if (/\brte-image-grid\b/i.test(openTag)) {
        const skip = findDivBlock(html, divOpen);
        pos = skip?.end ?? divOpen + 4;
        continue;
      }

      const block = findDivBlock(html, divOpen);
      if (!block) {
        pos = divOpen + 4;
        continue;
      }
      if (isRichTextImageGridContent(block.inner)) {
        return replaceDivBlockWithClass(html, divOpen, block, RTE_IMAGE_GRID_CLASS);
      }
      /* Descend to the first nested `<div` (table cells, responsive-table) without re-scanning the same node. */
      const innerDiv = block.inner.search(/<div\b/i);
      if (innerDiv !== -1 && /<img\b/i.test(block.inner)) {
        const openEnd = html.indexOf(">", divOpen) + 1;
        pos = openEnd + innerDiv;
        continue;
      }
      pos = block.end;
      continue;
    }

    const block = findRichTextLogoBlock(html, nextOpen);
    if (!block) {
      pos = nextOpen + 1;
      continue;
    }
    if (isRichTextImageGridContent(block.inner)) {
      if (block.tag === "div") {
        return replaceDivBlockWithClass(html, nextOpen, block, RTE_IMAGE_GRID_CLASS);
      }
      return (
        html.slice(0, nextOpen) +
        `<div class="${RTE_IMAGE_GRID_CLASS}">${serializeRichTextLogoBlock(block)}</div>` +
        html.slice(block.end)
      );
    }
    pos = block.end;
  }
  return html;
}

/**
 * Runs {@link tagNextRichTextImageGrid} until no more logo blocks are found in a fragment.
 *
 * @param fragment - HTML fragment (full field or table cell inner HTML)
 * @returns Fragment with all detected logo grids tagged
 */
function tagRichTextImageGridFragment(fragment: string): string {
  let out = fragment;
  for (let pass = 0; pass < 64; pass += 1) {
    const next = tagNextRichTextImageGrid(out, 0);
    if (next === out) {
      break;
    }
    out = next;
  }
  return out;
}

/**
 * Tags every multi-logo RTE block (trademarks rows inside the catalog table, etc.).
 *
 * @param html - Raw rich text field HTML
 * @returns HTML with `rte-image-grid` on each multi-image wrapper `div`
 */
export function tagRichTextImageGrid(html: string): string {
  if (!/<img\b/i.test(html)) {
    return html;
  }

  /* Sitecore nests logo stacks inside `<td>`; scan each multi-image cell directly. */
  const out = html.replace(/<td(\b[^>]*)>([\s\S]*?)<\/td>/gi, (full, attrs, inner) => {
    const imgCount = inner.match(/<img\b/gi)?.length ?? 0;
    if (imgCount < 2) {
      return full;
    }
    if (/\brte-image-grid\b/i.test(inner)) {
      const tagged = tagRichTextImageGridFragment(inner);
      return tagged === inner ? full : `<td${attrs}>${tagged}</td>`;
    }
    const tagged = tagRichTextImageGridFragment(inner);
    if (tagged !== inner) {
      return `<td${attrs}>${tagged}</td>`;
    }
    /* Logos in `<p>` / `<figure>` (no wrapper `div`) — wrap the whole cell for flex row layout. */
    return `<td${attrs}><div class="${RTE_IMAGE_GRID_CLASS}">${inner}</div></td>`;
  });

  /* Scan full field so logo bands after `</table></div>` are not left with a leading `</div>` fragment. */
  return tagRichTextImageGridFragment(out);
}

/**
 * Wraps lone trademark logos outside the multi-logo band (e.g. CFS after `</table>`).
 * {@link tagRichTextImageGrid} only tags blocks with two or more images.
 */
function tagNextLoneRichTextImageGrid(html: string, searchFrom: number): string {
  let pos = searchFrom;
  while (pos < html.length) {
    const leading = html.slice(pos).search(/\S/);
    if (leading === -1) {
      return html;
    }
    pos += leading;

    const divOpen = html.indexOf("<div", pos);
    const pOpen = html.indexOf("<p", pos);
    const figureOpen = html.indexOf("<figure", pos);
    const candidates = [divOpen, pOpen, figureOpen].filter((index) => index !== -1);
    if (candidates.length === 0) {
      return html;
    }
    const nextOpen = Math.min(...candidates);

    if (divOpen === nextOpen) {
      const openTag = html.slice(divOpen, html.indexOf(">", divOpen) + 1);
      if (/\brte-image-grid\b/i.test(openTag)) {
        const skip = findDivBlock(html, divOpen);
        pos = skip?.end ?? divOpen + 4;
        continue;
      }

      const block = findDivBlock(html, divOpen);
      if (!block) {
        pos = divOpen + 4;
        continue;
      }
      if (isRichTextLoneLogoBlock(block.inner)) {
        const imgTag = block.inner.match(/<img\b[^>]*>/i)?.[0];
        if (imgTag) {
          return (
            html.slice(0, divOpen) +
            buildLoneRichTextImageGrid(imgTag) +
            html.slice(block.end)
          );
        }
      }
      const innerDiv = block.inner.search(/<div\b/i);
      if (innerDiv !== -1 && /<img\b/i.test(block.inner) && !isRichTextImageGridContent(block.inner)) {
        const openEnd = html.indexOf(">", divOpen) + 1;
        pos = openEnd + innerDiv;
        continue;
      }
      pos = block.end;
      continue;
    }

    const block = findRichTextLogoBlock(html, nextOpen);
    if (!block) {
      pos = nextOpen + 1;
      continue;
    }
    if (isRichTextLoneLogoBlock(block.inner)) {
      const imgTag = block.inner.match(/<img\b[^>]*>/i)?.[0];
      if (imgTag) {
        return (
          html.slice(0, nextOpen) +
          buildLoneRichTextImageGrid(imgTag) +
          html.slice(block.end)
        );
      }
    }
    pos = block.end;
  }
  return html;
}

function tagLoneRichTextImageGridBlocks(html: string): string {
  let out = html;
  for (let pass = 0; pass < 64; pass += 1) {
    const next = tagNextLoneRichTextImageGrid(out, 0);
    if (next === out) {
      break;
    }
    out = next;
  }
  return out;
}

/**
 * Sitecore nests all logos under one `div` inside {@link RTE_IMAGE_GRID_CLASS}, so width utilities
 * on `> div` only hit a single ~20% column. Flatten to one tile per `img` (live layout).
 *
 * @param html - HTML after {@link tagRichTextImageGrid}
 * @returns HTML with direct {@link RTE_IMAGE_GRID_ITEM_CLASS} children per logo
 */
function flattenOneRichTextImageGrid(html: string): string {
  const markerRe = new RegExp(
    `<div\\s+class="[^"]*\\b${RTE_IMAGE_GRID_CLASS}\\b[^"]*"`,
    "gi",
  );
  for (const match of html.matchAll(markerRe)) {
    const gridOpen = match.index ?? -1;
    if (gridOpen === -1) {
      continue;
    }

    const block = findDivBlock(html, gridOpen);
    if (!block) {
      continue;
    }

    const imgs = [...block.inner.matchAll(/<img\b[^>]*>/gi)].map((m) =>
      normalizeTrademarkLogoImgTag(m[0]),
    );
    if (imgs.length < 2) {
      continue;
    }

    const flatItemRe = new RegExp(
      `<div\\s+class="[^"]*\\b${RTE_IMAGE_GRID_ITEM_CLASS}\\b[^"]*"[^>]*>\\s*<img\\b`,
      "gi",
    );
    const flatItemCount = block.inner.match(flatItemRe)?.length ?? 0;
    const hasInlineDimensions = /\sstyle\s*=/i.test(block.inner) || /\s(width|height)\s*=/i.test(block.inner);
    if (flatItemCount === imgs.length && !hasInlineDimensions) {
      continue;
    }

    const tiles = imgs.map(buildRichTextLogoTile).join("");
    return replaceDivBlockInner(html, gridOpen, block, tiles);
  }

  return html;
}

/**
 * @param html - HTML after {@link tagRichTextImageGrid}
 * @returns HTML with direct {@link RTE_IMAGE_GRID_ITEM_CLASS} children per logo in every grid
 */
export function flattenRichTextImageGrid(html: string): string {
  let out = html;
  for (let pass = 0; pass < 64; pass += 1) {
    const next = flattenOneRichTextImageGrid(out);
    if (next === out) {
      break;
    }
    out = next;
  }
  return out;
}

/**
 * Marks single-logo {@link RTE_IMAGE_GRID_CLASS} rows with {@link RTE_IMAGE_GRID_LONE_CLASS}
 * so lone sizing utilities can target `--lone` (Tailwind `_` escapes break `__item` selectors).
 *
 * @param html - HTML after {@link flattenRichTextImageGrid}
 * @returns HTML with `rte-image-grid--lone` on single-tile grids
 */
function isLoneRichTextImageGridInner(inner: string): boolean {
  const imgCount = inner.match(/<img\b/gi)?.length ?? 0;
  if (imgCount !== 1) {
    return false;
  }
  const itemCount =
    inner.match(new RegExp(`\\b${RTE_IMAGE_GRID_ITEM_CLASS}\\b`, "gi"))?.length ?? 0;
  if (itemCount > 1) {
    return false;
  }
  return richTextBlockVisibleText(inner).length === 0;
}

/**
 * Strips CKEditor `width` / `height` / `style` from images inside logo grids so CSS can size them.
 */
function stripRichTextImageGridImgDimensions(html: string): string {
  const gridOpenRe = new RegExp(
    `<div\\s+class="[^"]*\\b${RTE_IMAGE_GRID_CLASS}\\b[^"]*"`,
    "gi",
  );
  let out = html;
  const opens = [...html.matchAll(gridOpenRe)]
    .map((match) => match.index ?? -1)
    .filter((open) => open !== -1)
    .reverse();
  for (const open of opens) {
    const block = findDivBlock(out, open);
    if (!block) {
      continue;
    }
    const nextInner = block.inner.replace(/<img\b[^>]*>/gi, (imgTag) =>
      normalizeTrademarkLogoImgTag(imgTag),
    );
    if (nextInner === block.inner) {
      continue;
    }
    out = replaceDivBlockInner(out, open, block, nextInner);
  }
  return out;
}

export function markLoneRichTextImageGrids(html: string): string {
  const gridOpenRe = new RegExp(
    `<div\\s+class="[^"]*\\b${RTE_IMAGE_GRID_CLASS}\\b[^"]*"`,
    "gi",
  );
  let out = html;
  const opens = [...html.matchAll(gridOpenRe)]
    .map((match) => match.index ?? -1)
    .filter((open) => open !== -1)
    .reverse();
  for (const open of opens) {
    const block = findDivBlock(out, open);
    if (!block) {
      continue;
    }
    if (!isLoneRichTextImageGridInner(block.inner)) {
      continue;
    }
    if (new RegExp(`\\b${RTE_IMAGE_GRID_LONE_CLASS}\\b`).test(block.attrs)) {
      continue;
    }
    out = replaceDivBlockWithClass(out, open, block, RTE_IMAGE_GRID_LONE_CLASS);
  }
  return out;
}

function isMergeableBetweenImageGrids(fragment: string): boolean {
  const trimmed = fragment.trim();
  if (!trimmed) {
    return true;
  }
  return /^<hr\b[^>]*\/?>/i.test(trimmed);
}

/**
 * Sitecore sometimes splits the trademark band into consecutive `rte-image-grid` blocks (e.g. 4+1).
 * Live renders one horizontal row — merge siblings into a single grid.
 */
function mergeOneAdjacentRichTextImageGridPair(html: string): string {
  const gridOpenRe = new RegExp(
    `<div\\s+class="[^"]*\\b${RTE_IMAGE_GRID_CLASS}\\b[^"]*"`,
    "gi",
  );
  const grids: { open: number; block: NonNullable<ReturnType<typeof findDivBlock>> }[] = [];

  for (const match of html.matchAll(gridOpenRe)) {
    const open = match.index ?? -1;
    if (open === -1) {
      continue;
    }
    const block = findDivBlock(html, open);
    if (block) {
      grids.push({ open, block });
    }
  }

  for (let index = 0; index < grids.length - 1; index += 1) {
    const first = grids[index];
    const second = grids[index + 1];
    const between = html.slice(first.block.end, second.open);
    if (!isMergeableBetweenImageGrids(between)) {
      continue;
    }

    const imgs = [
      ...first.block.inner.matchAll(/<img\b[^>]*>/gi),
      ...second.block.inner.matchAll(/<img\b[^>]*>/gi),
    ].map((m) => normalizeTrademarkLogoImgTag(m[0]));
    if (imgs.length < 2) {
      continue;
    }

    const mergedTiles = imgs.map(buildRichTextLogoTile).join("");
    const mergedBlock = replaceDivBlockInner(html, first.open, first.block, mergedTiles);
    const secondGridRe = new RegExp(
      `<div\\s+class="[^"]*\\b${RTE_IMAGE_GRID_CLASS}\\b[^"]*"`,
      "gi",
    );
    let secondOpenInMerged = -1;
    let gridCount = 0;
    for (const match of mergedBlock.matchAll(secondGridRe)) {
      gridCount += 1;
      if (gridCount === 2) {
        secondOpenInMerged = match.index ?? -1;
        break;
      }
    }
    if (secondOpenInMerged === -1) {
      return mergedBlock;
    }
    const secondBlock = findDivBlock(mergedBlock, secondOpenInMerged);
    if (!secondBlock) {
      return mergedBlock;
    }
    return mergedBlock.slice(0, secondOpenInMerged) + mergedBlock.slice(secondBlock.end);
  }

  return html;
}

/**
 * @param html - HTML after {@link flattenRichTextImageGrid}
 * @returns HTML with adjacent trademark logo grids collapsed into one row
 */
export function mergeAdjacentRichTextImageGrids(html: string): string {
  let out = html;
  for (let pass = 0; pass < 32; pass += 1) {
    const next = mergeOneAdjacentRichTextImageGridPair(out);
    if (next === out) {
      break;
    }
    out = next;
  }
  return out;
}

/**
 * Bottom-band logos (e.g. CFS) sometimes sit in a lone `<tr>` after an `<hr>` — wrap like the main logo row.
 */
function wrapSingletonTrademarkLogoTableRows(html: string): string {
  return html.replace(
    /<tr(\b[^>]*)>\s*<td(\b[^>]*)>([\s\S]*?)<\/td>\s*<\/tr>/gi,
    (full, trAttrs, tdAttrs, inner) => {
      if (/\brte-image-grid\b/i.test(inner)) {
        return full;
      }
      const imgs = [...inner.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
      if (imgs.length !== 1 || richTextBlockVisibleText(inner).length > 0) {
        return full;
      }
      const tiles = buildRichTextLogoTile(imgs[0]);
      return `<tr${trAttrs}><td${tdAttrs}><div class="${RTE_IMAGE_GRID_CLASS}">${tiles}</div></td></tr>`;
    },
  );
}

function appendTrClass(attrs: string, extraClass: string): string {
  const trimmed = attrs.trim();
  const classMatch = trimmed.match(/class\s*=\s*"([^"]*)"/i);
  if (classMatch) {
    const merged = `${classMatch[1]} ${extraClass}`.trim();
    return trimmed.replace(/class\s*=\s*"([^"]*)"/i, `class="${merged}"`);
  }
  return trimmed ? `${trimmed} class="${extraClass}"` : ` class="${extraClass}"`;
}

/**
 * @param rowInner - Inner HTML of a spacer `<tr>`
 * @returns Row inner HTML with empty `&nbsp;` cells (live uses plain spacer rows, no inline height hacks)
 */
export function applyPatentsSpacerRowStyles(rowInner: string): string {
  return rowInner.replace(/<td(\b[^>]*)>[\s\S]*?<\/td>/gi, (_full: string, attrs: string) => {
    const trimmed = attrs.trim();
    return trimmed ? `<td ${trimmed}>&nbsp;</td>` : "<td>&nbsp;</td>";
  });
}

/**
 * @param html - Rich text fragment containing a `<table>` (or full field HTML)
 * @returns True for the 3-column patents catalog (excludes trademarks / single-column tables)
 */
export function isPatentsTableMarkup(html: string): boolean {
  if (!/<table\b/i.test(html)) {
    return false;
  }
  return [...html.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)].some(
    (row) => getMeaningfulTableCellCountInRow(row[0]) >= 3,
  );
}

/**
 * @param cellInner - Inner HTML of a table cell
 * @returns True when the cell has no visible text (CKEditor spacer column)
 */
function isBlankTableCellInner(cellInner: string): boolean {
  const text = cellInner
    .replace(/<br\s*\/?>/gi, "")
    .replace(/<hr\s*\/?>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;|&#160;|\u00a0/gi, "")
    .trim();
  return text.length === 0;
}

/**
 * @param rowHtml - Full `<tr>...</tr>` markup
 * @returns Count of cells that contain visible content
 */
function getMeaningfulTableCellCountInRow(rowHtml: string): number {
  const cells = [...rowHtml.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)];
  return cells.filter((match) => !isBlankTableCellInner(match[1])).length;
}

/**
 * @param html - Rich text fragment containing a `<table>`
 * @returns True for single-column trademarks catalog tables (not patents)
 */
export function isTrademarksTableMarkup(html: string): boolean {
  if (!/<table\b/i.test(html) || isPatentsTableMarkup(html)) {
    return false;
  }
  const rows = [...html.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)];
  if (rows.length === 0) {
    return false;
  }
  const maxMeaningfulCells = Math.max(
    0,
    ...rows.map((row) => getMeaningfulTableCellCountInRow(row[0])),
  );
  return maxMeaningfulCells <= 1;
}

/**
 * @param html - Rich text field HTML
 * @returns True when the field renders the trademarks name catalog table
 */
export function hasTrademarksCatalogInHtml(html: string): boolean {
  if (!html || !/<table\b/i.test(html)) {
    return false;
  }
  if (/\btrademarks-table\b/i.test(html) || /\bdata-trademarks-catalog\b/i.test(html)) {
    return true;
  }
  return isTrademarksTableMarkup(html);
}

/**
 * @param html - Rich text field HTML containing a table
 * @returns HTML with `patents-table` class on `<table>` when {@link isPatentsTableMarkup}
 */
export function tagPatentsTable(html: string): string {
  if (!isPatentsTableMarkup(html)) {
    return html;
  }
  return html.replace(/<table(\b[^>]*)>/gi, (_match, attrs) => {
    const merged = appendTrClass(attrs, PATENTS_TABLE_CLASS);
    return `<table ${merged}>`;
  });
}

/**
 * @param html - Rich text field HTML containing a trademarks catalog table
 * @returns HTML with `trademarks-table` on single-column non-patents `<table>` elements
 */
export function tagTrademarksTable(html: string): string {
  if (!/<table\b/i.test(html)) {
    return html;
  }
  return html.replace(/<table(\b[^>]*)>([\s\S]*?)<\/table>/gi, (full, tableAttrs, tableInner) => {
    const snippet = `<table${tableAttrs}>${tableInner}</table>`;
    if (!isTrademarksTableMarkup(snippet)) {
      return full;
    }
    const merged = appendTrClass(tableAttrs, TRADEMARKS_TABLE_CLASS);
    const withMarker = /\bdata-trademarks-catalog\b/i.test(merged)
      ? merged
      : `${merged} data-trademarks-catalog="true"`.trim();
    return `<table ${withMarker}>${tableInner}</table>`;
  });
}

/**
 * Removes CKEditor `border` / inline cell borders from trademarks tables (short content-width rules).
 *
 * @param html - Rich text field HTML
 * @returns HTML with presentation borders stripped from trademarks catalog tables
 */
export function stripTrademarksTableCellBorders(html: string): string {
  if (!/<table\b/i.test(html)) {
    return html;
  }

  return html.replace(/<table(\b[^>]*)>([\s\S]*?)<\/table>/gi, (full, tableAttrs, tableInner) => {
    const snippet = `<table${tableAttrs}>${tableInner}</table>`;
    if (
      !/\btrademarks-table\b/i.test(tableAttrs) &&
      !isTrademarksTableMarkup(snippet)
    ) {
      return full;
    }

    const cleanTableAttrs = stripPatentsTableCellOpeningAttrs(tableAttrs);
    const cleanInner = tableInner.replace(
      /<(td|th|tr)(\b[^>]*)>/gi,
      (_cell: string, tag: string, cellAttrs: string) => {
        const cleanCellAttrs = stripPatentsTableCellOpeningAttrs(cellAttrs);
        return cleanCellAttrs ? `<${tag} ${cleanCellAttrs}>` : `<${tag}>`;
      },
    );
    return cleanTableAttrs
      ? `<table ${cleanTableAttrs}>${cleanInner}</table>`
      : `<table>${cleanInner}</table>`;
  });
}

/**
 * Live mobile `<col>`: 172.12 / 298.94 / 194.82 (= {@link PATENTS_TABLE_WIDTH_MOBILE_PX}).
 * Desktop widths restored from 768px in {@link RichText}.
 */
export const PATENTS_TABLE_COLGROUP_HTML =
  `<colgroup>` +
  `<col style="width:${PATENTS_TABLE_COL1_WIDTH_MOBILE_PX}px" />` +
  `<col style="width:${PATENTS_TABLE_COL2_WIDTH_MOBILE_PX}px" />` +
  `<col style="width:${PATENTS_TABLE_COL3_WIDTH_MOBILE_PX}px" />` +
  `</colgroup>`;

/**
 * @param html - Rich text field HTML containing a patents table
 * @returns HTML with measured `<colgroup>` widths after each `patents-table` opening tag
 */
export function tagPatentsTableColgroup(html: string): string {
  return html.replace(
    /<table(\b[^>]*\bpatents-table\b[^>]*)>/gi,
    (match, attrs) => {
      if (/<colgroup\b/i.test(match)) {
        return match;
      }
      return `<table${attrs}>${PATENTS_TABLE_COLGROUP_HTML}`;
    },
  );
}

/**
 * @param innerHtml - Raw `td` inner HTML from Sitecore/CKEditor
 * @returns True when the cell has no visible text (only `&nbsp;`, `<br>`, whitespace)
 */
export function isPatentsTableSpacerCell(innerHtml: string): boolean {
  const text = innerHtml
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;|&#xA0;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length === 0;
}

/**
 * @param rowHtml - Full `<tr>...</tr>` markup
 * @param isHeaderRow - First tbody row (Series / Style / Patent headers)
 * @returns True when Style and Patent columns are spacer-only (Sitecore series dividers)
 */
export function isPatentsTableSpacerRow(
  rowHtml: string,
  isHeaderRow: boolean,
): boolean {
  if (isHeaderRow) {
    return false;
  }
  const cells = [...rowHtml.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(
    (match) => match[1],
  );
  if (cells.length < 3) {
    return false;
  }
  return isPatentsTableSpacerCell(cells[1]) && isPatentsTableSpacerCell(cells[2]);
}

/**
 * Removes Sitecore spacer `<tr>` rows (whitespace / `<br>` in Style + Patent columns).
 * Tailwind cannot emit `:blank` variants reliably; stripping HTML matches live spacing.
 *
 * @param html - Rich text field HTML
 * @returns HTML without patents table spacer rows
 */
export function stripPatentsTableSpacerRows(html: string): string {
  if (!/<table\b/i.test(html)) {
    return html;
  }

  return html.replace(
    /<tbody\b[^>]*>([\s\S]*?)<\/tbody>/gi,
    (tbodyTag: string, tbodyInner: string) => {
      let rowIndex = 0;
      const cleaned = tbodyInner.replace(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi, (rowHtml: string) => {
        const isHeaderRow = rowIndex === 0;
        rowIndex += 1;
        return isPatentsTableSpacerRow(rowHtml, isHeaderRow) ? "" : rowHtml;
      });
      return tbodyTag.replace(tbodyInner, cleaned);
    },
  );
}

const BORDER_STYLE_DECL =
  /\s*(?:border(?:-(?:top|right|bottom|left|color|width|style))?)\s*:\s*[^;]+;?/gi;

function stripLegacyTableBorderAttrs(attrs: string): string {
  let cleaned = attrs;
  cleaned = cleaned.replace(/\sbordercolor\s*=\s*("[^"]*"|'[^']*'|\S+)/gi, "");
  cleaned = cleaned.replace(/\sborder\s*=\s*("[^"]*"|'[^']*'|\S+)/gi, "");
  cleaned = cleaned.replace(/\srules\s*=\s*("[^"]*"|'[^']*'|\S+)/gi, "");
  cleaned = cleaned.replace(/\sframe\s*=\s*("[^"]*"|'[^']*'|\S+)/gi, "");
  cleaned = cleaned.replace(/\scellpadding\s*=\s*("[^"]*"|'[^']*'|\S+)/gi, "");
  cleaned = cleaned.replace(/\scellspacing\s*=\s*("[^"]*"|'[^']*'|\S+)/gi, "");
  return cleaned;
}

function stripBorderFromInlineStyleAttr(attrs: string): string {
  return attrs.replace(
    /\sstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi,
    (_match, doubleQuoted: string, singleQuoted: string) => {
      const style = (doubleQuoted ?? singleQuoted ?? "")
        .replace(BORDER_STYLE_DECL, "")
        .replace(/;\s*;/g, ";")
        .trim()
        .replace(/^;+|;+$/g, "");
      return style ? ` style="${style}"` : "";
    },
  );
}

/** CKEditor table tag: drop inline dimensions and legacy border attributes. */
function stripCkeTableOpeningAttrs(attrs: string): string {
  let cleaned = attrs.replace(/\s*style="[^"]*"/gi, "");
  cleaned = cleaned.replace(/\s*style='[^']*'/gi, "");
  return stripLegacyTableBorderAttrs(cleaned).trim();
}

/** Patents cells: remove border presentation only; keep non-border inline styles and classes. */
function stripPatentsTableCellOpeningAttrs(attrs: string): string {
  return stripLegacyTableBorderAttrs(stripBorderFromInlineStyleAttr(attrs)).trim();
}

/**
 * Sitecore/CKEditor often sets `border="1"`, `rules="cols"`, and inline borders on `<td>` — those paint vertical grid lines.
 *
 * @param html - Rich text field HTML containing a patents catalog table
 * @returns HTML with presentation borders removed from patents table cells
 */
export function stripPatentsTableCellBorders(html: string): string {
  if (!/<table\b/i.test(html)) {
    return html;
  }

  return html.replace(/<table(\b[^>]*)>([\s\S]*?)<\/table>/gi, (full, tableAttrs, tableInner) => {
    const snippet = `<table${tableAttrs}>${tableInner}</table>`;
    if (!/\bpatents-table\b/i.test(tableAttrs) && !isPatentsTableMarkup(snippet)) {
      return full;
    }

    const cleanTableAttrs = stripPatentsTableCellOpeningAttrs(tableAttrs);
    const cleanInner = tableInner.replace(
      /<(td|th|tr)(\b[^>]*)>/gi,
      (_cell: string, tag: string, cellAttrs: string) => {
        const cleanCellAttrs = stripPatentsTableCellOpeningAttrs(cellAttrs);
        return cleanCellAttrs ? `<${tag} ${cleanCellAttrs}>` : `<${tag}>`;
      },
    );
    return cleanTableAttrs
      ? `<table ${cleanTableAttrs}>${cleanInner}</table>`
      : `<table>${cleanInner}</table>`;
  });
}

/**
 * Strips CKEditor `figure.table` / `table` inline dimensions that inflate row gaps on dev.
 *
 * @param html - Rich text field HTML
 * @returns HTML with neutralized table figure styles
 */
export function neutralizeCkeTableFigureMarkup(html: string): string {
  return html
    .replace(/<figure\s+class="table"[^>]*>/gi, '<figure class="table">')
    .replace(/<table(\b[^>]*)>/gi, (_match, attrs: string) => {
      const cleaned = stripCkeTableOpeningAttrs(attrs);
      return cleaned ? `<table ${cleaned}>` : "<table>";
    });
}

/**
 * @param rowHtml - Full `<tr>...</tr>` markup
 * @returns `divider` when row has `<br>` cells (first spacer); else `tight` (second spacer)
 */
export function getPatentsTableSpacerRowVariant(
  rowHtml: string,
): "divider" | "tight" {
  return /<td\b[^>]*>[\s\S]*?<br\s*\/?>/i.test(rowHtml) ? "divider" : "tight";
}

/**
 * CKEditor uses `<br>` in divider spacer cells; live intralox.com uses `<hr>` (see patents table).
 *
 * @param rowInner - Inner HTML of a spacer `<tr>`
 * @returns Row inner HTML with `<hr />` in `br`-only cells
 */
export function transformPatentsDividerRowCellsToHr(rowInner: string): string {
  return rowInner.replace(
    /<td(\b[^>]*)>([\s\S]*?)<\/td>/gi,
    (full: string, attrs: string, cellInner: string) => {
      if (!/<br\s*\/?>/i.test(cellInner)) {
        return full;
      }
      return `<td${attrs}><hr /></td>`;
    },
  );
}

/**
 * Tags Sitecore spacer rows so SCSS can match live: divider row (~44px) + tight row (small gap).
 *
 * @param html - Rich text field HTML
 * @returns HTML with spacer row classes for compact series divider lines
 */
export function markPatentsTableSpacerRows(html: string): string {
  if (!/<table\b/i.test(html)) {
    return html;
  }

  return html.replace(
    /<tbody\b[^>]*>([\s\S]*?)<\/tbody>/gi,
    (tbodyTag: string, tbodyInner: string) => {
      let rowIndex = 0;
      const marked = tbodyInner.replace(
        /<tr\b([^>]*)>([\s\S]*?)<\/tr>/gi,
        (full: string, attrs: string, inner: string) => {
          const isHeaderRow = rowIndex === 0;
          rowIndex += 1;
          if (!isPatentsTableSpacerRow(full, isHeaderRow)) {
            return full;
          }
          const variant = getPatentsTableSpacerRowVariant(full);
          const classes = `${PATENTS_TABLE_SPACER_ROW_CLASS} ${
            variant === "divider"
              ? PATENTS_TABLE_SPACER_ROW_DIVIDER_CLASS
              : PATENTS_TABLE_SPACER_ROW_TIGHT_CLASS
          }`;
          const styledInner = applyPatentsSpacerRowStyles(inner);
          return `<tr ${appendTrClass(attrs, classes)}>${styledInner}</tr>`;
        },
      );
      return tbodyTag.replace(tbodyInner, marked);
    },
  );
}

/**
 * Strips CKEditor alignment padding (`&nbsp;` runs) from table cells so mobile columns align like live.
 *
 * @param html - Rich text field HTML
 * @returns HTML without trailing spacer `&nbsp;` in `<td>` cells
 */
export function stripPatentsTableAlignmentPadding(html: string): string {
  return html.replace(/<td(\b[^>]*)>([\s\S]*?)<\/td>/gi, (_full, attrs, inner) => {
    if (/\brte-image-grid\b/i.test(inner)) {
      return _full;
    }
    let cleaned = inner.replace(
      /(?:\s|&nbsp;|&#160;|&#xA0;)+(?=<\/(?:strong|em|span|p|div)>)/gi,
      "",
    );
    cleaned = cleaned.replace(/(?:\s|&nbsp;|&#160;|&#xA0;|<br\s*\/?>)+$/gi, "");
    cleaned = cleaned.replace(/^(?:\s|&nbsp;|&#160;|&#xA0;|<br\s*\/?>)+/gi, "");
    if (!cleaned.trim() || isPatentsTableSpacerCell(cleaned)) {
      return `<td${attrs}>&nbsp;</td>`;
    }
    return `<td${attrs}>${cleaned}</td>`;
  });
}

/**
 * Marks continuation rows (empty col 1) for live mobile: product names right-aligned, col 1 hidden.
 *
 * @param html - Rich text field HTML
 * @returns HTML with {@link PATENTS_TABLE_CONTINUATION_ROW_CLASS} on matching `<tr>` elements
 */
/**
 * @param rowHtml - Full `<tr>...</tr>` markup
 * @param isHeaderRow - First tbody row (Series / Style / Patent headers)
 * @returns True when only the Patent column has visible text (live mobile patent list)
 */
export function isPatentsTablePatentOnlyRow(
  rowHtml: string,
  isHeaderRow: boolean,
): boolean {
  if (isHeaderRow || isPatentsTableSpacerRow(rowHtml, isHeaderRow)) {
    return false;
  }
  const cells = [...rowHtml.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(
    (match) => match[1],
  );
  if (cells.length < 3) {
    return false;
  }
  return (
    isPatentsTableSpacerCell(cells[0]) &&
    isPatentsTableSpacerCell(cells[1]) &&
    !isPatentsTableSpacerCell(cells[2])
  );
}

/**
 * @param rowHtml - Full `<tr>...</tr>` markup
 * @param isHeaderRow - First tbody row (column headers)
 * @returns True when col 1 has series/product text, col 2 is empty, col 3 has patent numbers
 */
export function isPatentsTableCol3MobileRow(
  rowHtml: string,
  isHeaderRow: boolean,
): boolean {
  if (
    isHeaderRow ||
    isPatentsTableSpacerRow(rowHtml, isHeaderRow) ||
    isPatentsTablePatentOnlyRow(rowHtml, isHeaderRow)
  ) {
    return false;
  }
  const cells = [...rowHtml.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(
    (match) => match[1],
  );
  if (cells.length < 3) {
    return false;
  }
  return (
    !isPatentsTableSpacerCell(cells[0]) &&
    isPatentsTableSpacerCell(cells[1]) &&
    !isPatentsTableSpacerCell(cells[2])
  );
}

/**
 * Tags series rows with patents in col 3 only (e.g. Intralox® Drive Unit + number list) for mobile stack layout.
 *
 * @param html - Rich text field HTML
 * @returns HTML with {@link PATENTS_TABLE_COL3_MOBILE_ROW_CLASS} on matching `<tr>` elements
 */
export function markPatentsTableCol3MobileRows(html: string): string {
  if (!/<table\b/i.test(html)) {
    return html;
  }

  return html.replace(
    /<tbody\b[^>]*>([\s\S]*?)<\/tbody>/gi,
    (tbodyTag: string, tbodyInner: string) => {
      let rowIndex = 0;
      const marked = tbodyInner.replace(
        /<tr\b([^>]*)>([\s\S]*?)<\/tr>/gi,
        (full: string, attrs: string, inner: string) => {
          const isHeaderRow = rowIndex === 0;
          rowIndex += 1;
          if (!isPatentsTableCol3MobileRow(full, isHeaderRow)) {
            return full;
          }
          return `<tr ${appendTrClass(attrs, PATENTS_TABLE_COL3_MOBILE_ROW_CLASS)}>${inner}</tr>`;
        },
      );
      return tbodyTag.replace(tbodyInner, marked);
    },
  );
}

/**
 * Tags patent-only rows (AIM™, CleanLock™, etc.) for live mobile full-width list styling.
 *
 * @param html - Rich text field HTML
 * @returns HTML with {@link PATENTS_TABLE_PATENT_ONLY_ROW_CLASS} on matching `<tr>` elements
 */
export function markPatentsTablePatentOnlyRows(html: string): string {
  if (!/<table\b/i.test(html)) {
    return html;
  }

  return html.replace(
    /<tbody\b[^>]*>([\s\S]*?)<\/tbody>/gi,
    (tbodyTag: string, tbodyInner: string) => {
      let rowIndex = 0;
      const marked = tbodyInner.replace(
        /<tr\b([^>]*)>([\s\S]*?)<\/tr>/gi,
        (full: string, attrs: string, inner: string) => {
          const isHeaderRow = rowIndex === 0;
          rowIndex += 1;
          if (!isPatentsTablePatentOnlyRow(full, isHeaderRow)) {
            return full;
          }
          return `<tr ${appendTrClass(attrs, PATENTS_TABLE_PATENT_ONLY_ROW_CLASS)}>${inner}</tr>`;
        },
      );
      return tbodyTag.replace(tbodyInner, marked);
    },
  );
}

export function markPatentsTableContinuationRows(html: string): string {
  if (!/<table\b/i.test(html)) {
    return html;
  }

  return html.replace(
    /<tbody\b[^>]*>([\s\S]*?)<\/tbody>/gi,
    (tbodyTag: string, tbodyInner: string) => {
      let rowIndex = 0;
      const marked = tbodyInner.replace(
        /<tr\b([^>]*)>([\s\S]*?)<\/tr>/gi,
        (full: string, attrs: string, inner: string) => {
          const isHeaderRow = rowIndex === 0;
          rowIndex += 1;
          if (isHeaderRow || isPatentsTableSpacerRow(full, isHeaderRow)) {
            return full;
          }
          const firstCell = /<td\b[^>]*>([\s\S]*?)<\/td>/i.exec(inner);
          if (!firstCell || !isPatentsTableSpacerCell(firstCell[1])) {
            return full;
          }
          return `<tr ${appendTrClass(attrs, PATENTS_TABLE_CONTINUATION_ROW_CLASS)}>${inner}</tr>`;
        },
      );
      return tbodyTag.replace(tbodyInner, marked);
    },
  );
}

/**
 * Wraps Sitecore/CKEditor `<table>` blocks for live `.responsive-table` scroll + prose layout.
 *
 * @param html - Rich text field HTML
 * @returns HTML with each table inside `<div class="responsive-table">`
 */
export function tagResponsiveTableWrapper(html: string): string {
  if (!/<table\b/i.test(html)) {
    return html;
  }

  let result = html;
  let searchFrom = 0;

  while (searchFrom < result.length) {
    const tableStart = result.indexOf("<table", searchFrom);
    if (tableStart === -1) {
      break;
    }

    const before = result.slice(Math.max(0, tableStart - 120), tableStart);
    if (/class="responsive-table"[^>]*>\s*(?:<figure[^>]*>\s*)?$/i.test(before)) {
      searchFrom = tableStart + 6;
      continue;
    }

    let blockStart = tableStart;
    const figureStart = result.lastIndexOf("<figure", tableStart);
    if (figureStart !== -1 && figureStart >= tableStart - 120) {
      const figureTag = result.slice(figureStart, tableStart);
      if (/\bclass="[^"]*\btable\b/i.test(figureTag)) {
        blockStart = figureStart;
      }
    }

    const tableEnd = result.indexOf("</table>", tableStart);
    if (tableEnd === -1) {
      break;
    }

    let blockEnd = tableEnd + 8;
    const afterTable = result.slice(tableEnd, tableEnd + 16);
    if (/^<\/table>\s*<\/figure>/i.test(afterTable)) {
      blockEnd = result.indexOf("</figure>", tableEnd) + 9;
    }

    const block = result.slice(blockStart, blockEnd);
    result =
      result.slice(0, blockStart) +
      `<div class="responsive-table">${block}</div>` +
      result.slice(blockEnd);
    searchFrom = blockStart + block.length + 28;
  }

  return result;
}

/**
 * @param tbodyInner - Inner HTML of `<tbody>`
 * @returns Each `<tr>...</tr>` fragment in document order
 */
export function extractPatentsTableBodyRows(tbodyInner: string): string[] {
  const rows: string[] = [];
  const rowRe = /<tr\b[^>]*>[\s\S]*?<\/tr>/gi;
  let match = rowRe.exec(tbodyInner);
  while (match) {
    rows.push(match[0]);
    match = rowRe.exec(tbodyInner);
  }
  return rows;
}

/**
 * @param rowHtml - Full `<tr>...</tr>` markup
 * @returns True when row is tagged or matches patent-only detection
 */
export function isPatentsPatentOnlyRowMarkup(rowHtml: string): boolean {
  return new RegExp(`\\b${PATENTS_TABLE_PATENT_ONLY_ROW_CLASS}\\b`).test(rowHtml);
}

/**
 * Splits one patents table into series (100% width, 2-col grid) and patent catalog (horizontal scroll).
 * Avoids forcing min-width on the whole table, which clips Series|Style columns.
 *
 * @param html - HTML after patent-only row marking
 * @returns HTML with {@link PATENTS_TABLE_MOBILE_ROOT_CLASS} wrapper when catalog rows exist
 */
export function splitPatentsMobileCatalogTable(html: string): string {
  if (!isPatentsPatentOnlyRowMarkup(html)) {
    return html;
  }

  return html.replace(
    /<div class="responsive-table">((?:<figure\b[\s\S]*?>)?<table\b([^>]*)>([\s\S]*?)<tbody\b[^>]*>([\s\S]*?)<\/tbody>([\s\S]*?)<\/table>(?:\s*<\/figure>)?)<\/div>/gi,
    (full, inner: string, tableAttrs: string, beforeTbody: string, tbodyInner: string, afterTbody: string) => {
      if (!/\bpatents-table\b/.test(full)) {
        return full;
      }

      const rows = extractPatentsTableBodyRows(tbodyInner);
      const patentStart = rows.findIndex(
        (row, idx) => idx > 0 && isPatentsPatentOnlyRowMarkup(row),
      );
      if (patentStart === -1) {
        return full;
      }

      const seriesRows = rows.slice(0, patentStart);
      const patentRows = rows.slice(patentStart).filter(isPatentsPatentOnlyRowMarkup);
      if (seriesRows.length === 0 || patentRows.length === 0) {
        return full;
      }

      const beforeTable = inner.slice(0, inner.indexOf("<table"));
      const afterTable = inner.slice(inner.indexOf("</table>") + 8);
      const buildTable = (rowHtml: string) =>
        `${beforeTable}<table${tableAttrs}>${beforeTbody}<tbody>${rowHtml}</tbody>${afterTbody}</table>${afterTable}`;

      return (
        `<div class="${PATENTS_TABLE_MOBILE_ROOT_CLASS}">` +
        `<div class="${PATENTS_TABLE_SERIES_BLOCK_CLASS}">` +
        `<div class="responsive-table">${buildTable(seriesRows.join(""))}</div></div>` +
        `<div class="${PATENTS_TABLE_PATENT_SCROLL_CLASS}">` +
        `<div class="responsive-table">${buildTable(patentRows.join(""))}</div></div></div>`
      );
    },
  );
}

export function normalizeRichTextTableHtml(html: string): string {
  if (!html || !/<table\b/i.test(html)) {
    return html;
  }
  const wrapped = tagResponsiveTableWrapper(html);
  const marked = markPatentsTableSpacerRows(wrapped);
  const continuations = markPatentsTableContinuationRows(marked);
  const patentOnly = markPatentsTablePatentOnlyRows(continuations);
  const trimmed = stripPatentsTableAlignmentPadding(patentOnly);
  return stripTrademarksTableCellBorders(
    stripPatentsTableCellBorders(
      neutralizeCkeTableFigureMarkup(
        tagPatentsTableColgroup(tagTrademarksTable(tagPatentsTable(trimmed))),
      ),
    ),
  );
}

/**
 * Visitor RTE: trademark logo grid + patents table spacing (editing mode keeps raw HTML).
 *
 * @param html - Raw field value from Sitecore
 * @returns Normalized HTML for display
 */
export function normalizeRichTextHtml(html: string): string {
  if (!html) {
    return html;
  }
  let out = mergeTrademarkLogoTableRows(html);
  out = tagRichTextImageGrid(out);
  out = tagLoneRichTextImageGridBlocks(out);
  out = flattenRichTextImageGrid(out);
  out = mergeAdjacentRichTextImageGrids(out);
  out = markLoneRichTextImageGrids(out);
  out = wrapSingletonTrademarkLogoTableRows(out);
  out = markLoneRichTextImageGrids(out);
  out = stripRichTextImageGridImgDimensions(out);
  if (/<table\b/i.test(out)) {
    out = normalizeRichTextTableHtml(out);
  }
  return out;
}

/**
 * @param html - Raw field value from Sitecore
 * @returns True when there is no visible text content
 */
export function isRichTextEffectivelyEmpty(
  html: string | undefined | null,
): boolean {
  if (html == null) return true;
  const withoutTags = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return withoutTags.length === 0;
}

