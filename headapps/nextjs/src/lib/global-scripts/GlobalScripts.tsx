import { JSX, useMemo } from 'react';
import Script from 'next/script';
import { parseScriptDataItem } from './script-parser';
import type { ScriptDataItem, ScriptSettings, ParsedScript, ParsedScriptAttributes } from './types';

type Placement = 'head' | 'body';
const userIdSearchKeyword = '${userId}';

interface GlobalScriptsProps {
  scriptSettings: ScriptSettings | null | undefined;
  status: string;
  employeeNumber: string;
}

/**
 * Determine the `next/script` strategy for an external script based on placement
 * and parsed attributes (async / defer).
 *
 * | Placement | async | defer | Neither |
 * |-----------|-------|-------|---------|
 * | head      | beforeInteractive | beforeInteractive | beforeInteractive |
 * | body      | afterInteractive  | lazyOnload        | afterInteractive  |
 */
function getStrategy(
  placement: Placement,
  attributes: ParsedScriptAttributes
): 'beforeInteractive' | 'afterInteractive' | 'lazyOnload' {
  if (placement === 'head') {
    return 'beforeInteractive';
  }

  // Body placement
  if (attributes.defer) {
    return 'lazyOnload';
  }
  return 'afterInteractive';
}

/**
 * Build props for a `next/script` component from parsed external script attributes.
 * Strips `async` and `defer` (handled via strategy) and spreads remaining attributes.
 */
function buildScriptProps(
  attributes: ParsedScriptAttributes,
  strategy: string
): Record<string, string | boolean | undefined> {
  const { src, ...rest } = attributes;
  // Remove async/defer — they are expressed via the next/script strategy prop
  delete rest.async;
  delete rest.defer;
  return {
    src,
    strategy,
    ...rest,
  };
}

/**
 * Render a single parsed script entry as a `next/script` or raw HTML injection.
 */
function renderScript(parsed: ParsedScript, placement: Placement, key: string): JSX.Element | null {
  switch (parsed.kind) {
    case 'external': {
      const strategy = getStrategy(placement, parsed.attributes);
      const props = buildScriptProps(parsed.attributes, strategy);

      // next/script does not support src + dangerouslySetInnerHTML simultaneously.
      // When the external tag also has inner content, render two Script components.
      if (parsed.innerContent) {
        return (
          <>
            <Script key={key} {...props} />
            <Script
              key={`${key}-inline`}
              id={`${key}-inline`}
              strategy={strategy}
              dangerouslySetInnerHTML={{ __html: parsed.innerContent }}
            />
          </>
        );
      }

      return <Script key={key} {...props} />;
    }

    case 'inline': {
      const strategy = placement === 'head' ? 'beforeInteractive' : 'afterInteractive';
      return (
        <Script
          key={key}
          id={key}
          strategy={strategy}
          dangerouslySetInnerHTML={{ __html: parsed.code }}
        />
      );
    }

    case 'raw': {
      // Multi-script fallback — inject raw HTML via dangerouslySetInnerHTML.
      // Rendered in the body regardless of placement since <head> cannot contain wrapper elements.
      return <div key={key} dangerouslySetInnerHTML={{ __html: parsed.html }} />;
    }

    default:
      return null;
  }
}

/**
 * Process an array of Script Data items and return rendered script elements.
 */
function renderScriptItems(
  items: ScriptDataItem[],
  placement: Placement,
  employeeNumber: string
): (JSX.Element | null)[] {
  return items.map((item, index) => {
    const externalValue = item.fields?.externalScript?.value.replaceAll(
      userIdSearchKeyword,
      employeeNumber
    );
    const inlineValue = item.fields?.inlineScriptCode?.value.replaceAll(
      userIdSearchKeyword,
      employeeNumber
    );
    const parsed = parseScriptDataItem(externalValue, inlineValue);

    if (!parsed) return null;

    const itemId = item.id || `global-script-${placement}-${index}`;
    return renderScript(parsed, placement, itemId);
  });
}

/**
 * Renders global scripts from the Sitecore Script Settings into the page.
 *
 * - Head scripts use `strategy="beforeInteractive"` via `next/script`.
 * - Body scripts use `strategy="afterInteractive"` or `"lazyOnload"`.
 * - Multi-script fallback injects raw HTML via `dangerouslySetInnerHTML`.
 */
const GlobalScripts = ({
  scriptSettings,
  status,
  employeeNumber,
}: GlobalScriptsProps): JSX.Element => {
  employeeNumber = employeeNumber || 'USER_ID_GOES_HERE';
  const headScripts = useMemo(
    () =>
      scriptSettings?.globalScriptsInHead?.length
        ? renderScriptItems(scriptSettings.globalScriptsInHead, 'head', employeeNumber)
        : [],
    [scriptSettings?.globalScriptsInHead, employeeNumber]
  );

  const bodyScripts = useMemo(
    () =>
      status !== 'loading' && scriptSettings?.globalScriptsInBody?.length
        ? renderScriptItems(scriptSettings.globalScriptsInBody, 'body', employeeNumber)
        : [],
    [scriptSettings?.globalScriptsInBody, employeeNumber, status]
  );

  if (!headScripts.length && !bodyScripts.length) {
    return <></>;
  }

  return (
    <>
      {headScripts}
      {bodyScripts}
    </>
  );
};

export default GlobalScripts;
