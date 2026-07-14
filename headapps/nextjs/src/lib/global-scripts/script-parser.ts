import type { ParsedScript, ParsedScriptAttributes } from './types';

const SCRIPT_TAG_REGEX = /<script\b[^>]*>[\s\S]*?<\/script\s*>/gi;
const OPENING_TAG_REGEX = /^<script\b([^>]*)>/i;
const CLOSING_TAG_REGEX = /<\/script\s*>$/i;
const ATTRIBUTE_REGEX = /([a-zA-Z][\w-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;

/** Boolean attributes that should be parsed as `true` when present without a value. */
const BOOLEAN_ATTRIBUTES = new Set(['async', 'defer', 'nomodule']);

/**
 * Count the number of `<script>` tags in a string.
 */
function countScriptTags(html: string): number {
  const matches = html.match(SCRIPT_TAG_REGEX);
  return matches ? matches.length : 0;
}

/**
 * Parse attributes from a `<script>` opening tag string.
 *
 * Given `<script async src="https://example.com/sdk.js" data-id="abc">`,
 * returns `{ async: true, src: "https://example.com/sdk.js", "data-id": "abc" }`.
 */
function parseAttributes(openingTag: string): ParsedScriptAttributes {
  const attrs: ParsedScriptAttributes = {};
  let match: RegExpExecArray | null;

  while ((match = ATTRIBUTE_REGEX.exec(openingTag)) !== null) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4];

    if (BOOLEAN_ATTRIBUTES.has(name) && value === undefined) {
      attrs[name] = true;
    } else {
      attrs[name] = value ?? true;
    }
  }

  return attrs;
}

/**
 * Extract attributes and optional inner content from a single `<script>` tag string.
 */
function parseSingleScriptTag(scriptTag: string): {
  attributes: ParsedScriptAttributes;
  innerContent?: string;
} {
  const openingMatch = scriptTag.match(OPENING_TAG_REGEX);
  if (!openingMatch) {
    return { attributes: {} };
  }

  const attributes = parseAttributes(openingMatch[1]);

  // Extract inner content between the opening and closing tags
  const afterOpening = scriptTag.slice(openingMatch[0].length);
  const innerContent = afterOpening.replace(CLOSING_TAG_REGEX, '').trim();

  return {
    attributes,
    innerContent: innerContent || undefined,
  };
}

/**
 * Strip wrapping `<script>` tags from a string, returning only the inner code.
 * If no `<script>` tags are present, returns the input unchanged.
 */
export function stripScriptTags(code: string): string {
  const trimmed = code.trim();

  if (countScriptTags(trimmed) === 1) {
    const openingMatch = trimmed.match(OPENING_TAG_REGEX);
    if (openingMatch) {
      const afterOpening = trimmed.slice(openingMatch[0].length);
      return afterOpening.replace(CLOSING_TAG_REGEX, '').trim();
    }
  }

  return trimmed;
}

/**
 * Parse a value from the `externalScript` field.
 *
 * - Single `<script>` tag with `src` → external parsed result
 * - Single `<script>` tag with `src` and inner content → external with innerContent
 * - Multiple `<script>` tags → raw HTML fallback
 */
export function parseExternalScript(value: string): ParsedScript | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const tagCount = countScriptTags(trimmed);

  // Multiple script tags → fall back to raw HTML injection
  if (tagCount > 1) {
    return { kind: 'raw', html: trimmed };
  }

  // Single script tag → parse attributes
  if (tagCount === 1) {
    const { attributes, innerContent } = parseSingleScriptTag(trimmed);
    return { kind: 'external', attributes, innerContent };
  }

  // No script tags detected — treat as a raw src URL
  return { kind: 'external', attributes: { src: trimmed } };
}

/**
 * Parse a value from the `inlineScriptCode` field.
 *
 * - Strips `<script>` wrappers if present
 * - Detects multiple `<script>` blocks and falls back to raw HTML
 */
export function parseInlineScript(value: string): ParsedScript | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const tagCount = countScriptTags(trimmed);

  // Multiple script tags → fall back to raw HTML injection
  if (tagCount > 1) {
    return { kind: 'raw', html: trimmed };
  }

  // Single script tag wrapper → strip and use as inline code
  if (tagCount === 1) {
    const code = stripScriptTags(trimmed);
    return code ? { kind: 'inline', code } : null;
  }

  // No script tags — use the raw code as-is
  return { kind: 'inline', code: trimmed };
}

/**
 * Parse a Script Data item's fields and return a structured result.
 *
 * Priority: `externalScript` takes precedence when both fields are populated.
 */
export function parseScriptDataItem(
  externalScript: string | undefined,
  inlineScriptCode: string | undefined
): ParsedScript | null {
  const externalValue = externalScript?.trim();
  const inlineValue = inlineScriptCode?.trim();

  // externalScript takes precedence
  if (externalValue) {
    return parseExternalScript(externalValue);
  }

  if (inlineValue) {
    return parseInlineScript(inlineValue);
  }

  return null;
}
