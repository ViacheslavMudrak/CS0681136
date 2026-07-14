import type { Field, Item } from '@sitecore-content-sdk/nextjs';

/**
 * A single Script Data item from Sitecore.
 * Authors populate either `inlineScriptCode` or `externalScript` — not both.
 */
export type ScriptDataItem = Item & {
  fields: {
    inlineScriptCode: Field<string>;
    externalScript: Field<string>;
  };
};

/**
 * The Script Settings item referenced by the site's `scriptingSettings` field.
 * Contains two ordered lists of Script Data items for head and body placement.
 */
export type ScriptSettings = {
  globalScriptsInHead: ScriptDataItem[];
  globalScriptsInBody: ScriptDataItem[];
};

/** Attributes parsed from an external `<script>` tag string. */
export type ParsedScriptAttributes = {
  src?: string;
  async?: boolean;
  defer?: boolean;
  type?: string;
  crossorigin?: string;
  integrity?: string;
  id?: string;
  [key: string]: string | boolean | undefined;
};

/** Result of parsing a script field value. */
export type ParsedScript =
  | { kind: 'external'; attributes: ParsedScriptAttributes; innerContent?: string }
  | { kind: 'inline'; code: string }
  | { kind: 'raw'; html: string };
