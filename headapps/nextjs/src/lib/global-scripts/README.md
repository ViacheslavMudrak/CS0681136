# Global Scripts

Allows content authors to inject third-party scripts (analytics, widgets, consent managers, tracking pixels) into the site's `<head>` or before `</body>` without a code deployment.

## Architecture

```
Sitecore Script Settings item
  -> globalScriptsInHead (multilist of Script Data items)
  -> globalScriptsInBody (multilist of Script Data items)

Each Script Data item has:
  -> inlineScriptCode  (Multi-Line Text)  — raw JS code
  -> externalScript    (Single-Line Text)  — a full <script> tag with src
```

### Data flow

1. The site item's `scriptingSettings` field references the Script Settings item.
2. `getCustomSiteSettings.graphql.ts` fetches it via `field(name: "scriptingSettings") { jsonValue }`.
3. `CustomLayoutService` merges the result into `layout.sitecore.context.scriptSettings`.
4. `Layout.tsx` reads `context.scriptSettings` and passes it to `<GlobalScripts />`.
5. `GlobalScripts` parses each Script Data item and renders via `next/script`.

### Files

| File | Role |
|------|------|
| `types.ts` | `ScriptDataItem`, `ScriptSettings`, `ParsedScript`, `ParsedScriptAttributes` |
| `script-parser.ts` | Parses `externalScript` tags and strips `<script>` wrappers from `inlineScriptCode` |
| `GlobalScripts.tsx` | React component that renders head/body scripts with correct `next/script` strategies |

### Touched files outside this directory

| File | Change |
|------|--------|
| `src/util/graphql/queries/getCustomSiteSettings.graphql.ts` | Added `scriptingSettings` field |
| `src/models/graphql/custom-site-settings.ts` | Added `scriptingSettings` to response type |
| `src/lib/custom-services/custom-layout-service.ts` | Passes `scriptSettings` into `sitecore.context` |
| `src/ts/sitecore-content-sdk-extended.d.ts` | Augments `LayoutServiceContext` with `scriptSettings` |
| `src/Layout.tsx` | Renders `<GlobalScripts />` |

## Script rendering rules

### Field priority

When both fields are populated on a single Script Data item, `externalScript` takes precedence.

### Placement and strategy mapping

| Multilist field | `next/script` strategy | Renders in |
|-----------------|------------------------|------------|
| `globalScriptsInHead` | `beforeInteractive` | `<head>` |
| `globalScriptsInBody` | `afterInteractive` (default) or `lazyOnload` (if `defer`) | `<body>` |

### Loading strategy for body scripts

| Parsed attribute | Strategy |
|------------------|----------|
| `async` present | `afterInteractive` |
| `defer` present | `lazyOnload` |
| Neither | `afterInteractive` |

Head scripts always use `beforeInteractive` regardless of attributes.

### Multi-script fallback

If a field value contains multiple `<script>` tags, `next/script` is bypassed and the raw HTML is injected via `dangerouslySetInnerHTML` in the body.

## Edge cases

| Scenario | Behavior |
|----------|----------|
| Both fields populated | `externalScript` wins |
| `<script>` tags pasted into `inlineScriptCode` | Wrapping tags are stripped automatically |
| Multiple `<script>` blocks in one field | Falls back to raw HTML injection |
| External tag with inner content (e.g. `<script src="...">var x=1;</script>`) | Rendered as two `next/script` components (one external, one inline) |
| Empty or whitespace-only field value | Treated as unpopulated, item is skipped |

## Example: GA4 setup

Authors create two Script Data items:

**Item 1 -- "GA4 - Loader"**
- `externalScript`: `<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX"></script>`
- `inlineScriptCode`: (empty)

**Item 2 -- "GA4 - Config"**
- `externalScript`: (empty)
- `inlineScriptCode`:
  ```js
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXX');
  ```

Both are added to `globalScriptsInHead` in order: Loader first, Config second. The multilist field order controls execution sequence.

## Sitecore content tree

```
/sitecore/content/Intranet Evolution/DFD/Settings/Script Settings/
  Global Head Scripts/    <-- Script Data items for <head>
  Global Body Scripts/    <-- Script Data items for </body>
```

Script Data items live in these folders. They are activated by selecting them in the `globalScriptsInHead` or `globalScriptsInBody` multilist on the Script Settings item. Items not selected in either list are ignored.
