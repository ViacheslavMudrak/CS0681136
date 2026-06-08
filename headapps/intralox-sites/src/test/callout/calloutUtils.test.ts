import { describe, it, expect } from 'vitest';

import {
  coalesceMediaTileCalloutPrefixedParams,
  calloutItemHasPreviewContent,
  calloutLinkFieldHasHref,
  coalesceCalloutGroupLinkFieldForSdk,
  isCalloutCardColumnLayout,
  isCalloutCardColumnBaseTypography,
  isCalloutCardColumnHorizontalSplit,
  isCalloutCardColumnSplitXs,
  isCalloutCardColumnSplitSm,
  isCalloutCardIgnoresCmsTextAlign,
  isCalloutCardRowFixedTypography,
  isCalloutCardRowLockedLayout,
  normalizeCalloutItemFields,
  normalizeCalloutsField,
  resolveCalloutComponentFields,
  resolveCalloutConfig,
  mergeCalloutRenderingParams,
  resolveCalloutDirection,
  resolveCalloutDisplayTextAlignment,
  resolveCalloutTextAlignment,
  resolveCalloutTitleSize,
  resolveCalloutStyle,
  patchCalloutDefaultInComponentMap,
  patchComponentMapForTextAsideAsideCallouts,
} from 'components/callout/calloutUtils';
import type { CalloutConfig } from 'components/callout/Callout.type';
import type { CalloutFields } from 'components/callout/Callout.type';

describe('calloutItemHasPreviewContent', () => {
  it('returns false when all segments empty', () => {
    expect(calloutItemHasPreviewContent({})).toBe(false);
    expect(
      calloutItemHasPreviewContent({
        PrependValue: { value: '   ' },
        Value: { value: '' },
        Link: { value: {} },
      }),
    ).toBe(false);
  });

  it('returns true when Value is numeric (Sitecore number field)', () => {
    expect(calloutItemHasPreviewContent({ Value: { value: 42 as unknown as string } })).toBe(true);
  });

  it('returns true for any populated segment or link href', () => {
    expect(calloutItemHasPreviewContent({ PrependValue: { value: 'Up to' } })).toBe(true);
    expect(calloutItemHasPreviewContent({ Value: { value: '50%' } })).toBe(true);
    expect(calloutItemHasPreviewContent({ AppendValue: { value: 'less' } })).toBe(true);
    expect(calloutItemHasPreviewContent({ Label: { value: 'Time saved' } })).toBe(true);
    expect(
      calloutItemHasPreviewContent({
        Link: { value: { href: '/more', text: '' } },
      }),
    ).toBe(true);
  });
});

describe('coalesceMediaTileCalloutPrefixedParams', () => {
  it('lets CalloutStyle override tile Style so Default does not hide Text', () => {
    const cfg = resolveCalloutConfig({
      Style: { Value: { value: 'Default' } },
      CalloutStyle: { Value: { value: 'Text' } },
    } as Record<string, unknown>);
    expect(cfg.style).toBe('text');
  });

  it('reads callout-direction kebab key into Direction', () => {
    const cfg = resolveCalloutConfig({
      'callout-direction': { Value: { value: 'Column' } },
    } as Record<string, unknown>);
    expect(cfg.direction).toBe('column');
  });
});

describe('resolveCalloutConfig (Media Tile prefixed params)', () => {
  it('maps CalloutDirection / CalloutStyle / CalloutTextSize / CalloutTextAlign / CalloutColorScheme without a separate coalesce step', () => {
    const cfg = resolveCalloutConfig({
      CalloutStyle: { Value: { value: 'Text' } },
      CalloutDirection: { Value: { value: 'Column' } },
      CalloutColorScheme: { Value: { value: 'Dark' } },
      CalloutTextAlign: { Value: { value: 'Left' } },
      CalloutTextSize: { Value: { value: 'SM' } },
    } as Record<string, unknown>);
    expect(cfg.style).toBe('text');
    expect(cfg.direction).toBe('column');
    expect(cfg.colorScheme).toBe('dark');
    expect(cfg.textAlignment).toBe('left');
    expect(cfg.titleSize).toBe('sm');
  });
});

describe('resolveCalloutDirection', () => {
  it('maps Sitecore Row to horizontal stat bar', () => {
    expect(resolveCalloutDirection({ Direction: { Value: { value: 'Row' } } })).toBe('row');
  });

  it('maps Sitecore Column to vertical stack', () => {
    expect(resolveCalloutDirection({ Direction: { Value: { value: 'Column' } } })).toBe('column');
  });

  it('defaults to row when unset', () => {
    expect(resolveCalloutDirection({})).toBe('row');
  });

  it('reads flat { value } param shape', () => {
    expect(resolveCalloutDirection({ Direction: { value: 'Column' } } as Record<string, unknown>)).toBe(
      'column',
    );
  });
});

describe('resolveCalloutTitleSize', () => {
  it('reads TextSize from Sitecore params (e.g. SM → sm)', () => {
    expect(resolveCalloutTitleSize({ TextSize: { Value: { value: 'SM' } } })).toBe('sm');
    expect(resolveCalloutTitleSize({ TextSize: { Value: { value: 'base' } } })).toBe('base');
    expect(resolveCalloutTitleSize({ TextSize: { Value: { value: 'XS' } } })).toBe('xs');
  });

  it('reads flat { value } shape', () => {
    expect(resolveCalloutTitleSize({ TextSize: { value: 'sm' } } as Record<string, unknown>)).toBe('sm');
  });

  it('reads camelCase textSize key', () => {
    expect(
      resolveCalloutTitleSize({ textSize: { Value: { value: 'XS' } } } as Record<string, unknown>),
    ).toBe('xs');
  });
});

describe('resolveCalloutStyle', () => {
  it('reads lowercase style key', () => {
    expect(resolveCalloutStyle({ style: { Value: { value: 'Card' } } } as Record<string, unknown>)).toBe(
      'card',
    );
  });

  it('reads item-backed fields.Value on Style', () => {
    expect(
      resolveCalloutStyle({
        Style: { fields: { Value: { value: 'Card' } } },
      } as Record<string, unknown>),
    ).toBe('card');
  });
});

describe('mergeCalloutRenderingParams', () => {
  it('does not let parameters.Style undefined wipe params.Style (placeholder / SDK payloads)', () => {
    const merged = mergeCalloutRenderingParams(
      {
        params: {
          Style: { Value: { value: 'Card' } },
          Direction: { Value: { value: 'Column' } },
          TextSize: { Value: { value: 'XS' } },
        },
        parameters: { DynamicPlaceholderId: '8', Style: undefined },
      } as Record<string, unknown>,
      {},
    );
    expect(resolveCalloutConfig(merged)).toMatchObject({
      style: 'card',
      direction: 'column',
      titleSize: 'xs',
    });
  });

  it('lets rendering.params win over rendering.parameters on the same key', () => {
    const merged = mergeCalloutRenderingParams(
      {
        parameters: { TextAlign: { Value: { value: 'Center' } } },
        params: { TextAlign: { Value: { value: 'Left' } } },
      } as Record<string, unknown>,
      {},
    );
    expect(resolveCalloutTextAlignment(merged)).toBe('left');
  });
});

describe('isCalloutCardIgnoresCmsTextAlign', () => {
  it('is true for style card only', () => {
    expect(
      isCalloutCardIgnoresCmsTextAlign({
        style: 'card',
        direction: 'row',
        titleSize: 'base',
        textAlignment: 'center',
        colorScheme: 'light',
      } as CalloutConfig),
    ).toBe(true);
    expect(
      isCalloutCardIgnoresCmsTextAlign({
        style: 'base',
        direction: 'row',
        titleSize: 'base',
        textAlignment: 'left',
        colorScheme: 'light',
      } as CalloutConfig),
    ).toBe(false);
  });
});

describe('isCalloutCardColumnLayout', () => {
  it('is true for card + column (vertical list; split chrome only when TextSize is base)', () => {
    expect(
      isCalloutCardColumnLayout({
        style: 'card',
        direction: 'column',
        titleSize: 'sm',
        textAlignment: 'center',
        colorScheme: 'dark',
      } as CalloutConfig),
    ).toBe(true);
    expect(
      isCalloutCardColumnLayout({
        style: 'card',
        direction: 'row',
        titleSize: 'base',
        textAlignment: 'left',
        colorScheme: 'light',
      } as CalloutConfig),
    ).toBe(false);
  });
});

describe('isCalloutCardColumnBaseTypography', () => {
  const cardColumn = {
    style: 'card',
    direction: 'column',
    textAlignment: 'left',
    colorScheme: 'light',
  } as const satisfies Partial<CalloutConfig>;

  it('is true only for card + column + TextSize base', () => {
    expect(
      isCalloutCardColumnBaseTypography({ ...cardColumn, titleSize: 'base' } as CalloutConfig),
    ).toBe(true);
    expect(
      isCalloutCardColumnBaseTypography({ ...cardColumn, titleSize: 'sm' } as CalloutConfig),
    ).toBe(false);
    expect(
      isCalloutCardColumnBaseTypography({ ...cardColumn, style: 'text', titleSize: 'base' } as CalloutConfig),
    ).toBe(false);
    expect(
      isCalloutCardColumnBaseTypography({ ...cardColumn, direction: 'row', titleSize: 'base' } as CalloutConfig),
    ).toBe(false);
  });
});

describe('isCalloutCardColumnHorizontalSplit / isCalloutCardColumnSplitXs / isCalloutCardColumnSplitSm', () => {
  const cardColumn = {
    style: 'card',
    direction: 'column',
    textAlignment: 'left',
    colorScheme: 'light',
  } as const satisfies Partial<CalloutConfig>;

  it('horizontal split is true for card + column + xs, sm, or base', () => {
    expect(
      isCalloutCardColumnHorizontalSplit({ ...cardColumn, titleSize: 'base' } as CalloutConfig),
    ).toBe(true);
    expect(
      isCalloutCardColumnHorizontalSplit({ ...cardColumn, titleSize: 'sm' } as CalloutConfig),
    ).toBe(true);
    expect(
      isCalloutCardColumnHorizontalSplit({ ...cardColumn, titleSize: 'xs' } as CalloutConfig),
    ).toBe(true);
    expect(
      isCalloutCardColumnHorizontalSplit({ ...cardColumn, style: 'text', titleSize: 'base' } as CalloutConfig),
    ).toBe(false);
  });

  it('split xs is true only when horizontal split and titleSize xs', () => {
    expect(isCalloutCardColumnSplitXs({ ...cardColumn, titleSize: 'xs' } as CalloutConfig)).toBe(
      true,
    );
    expect(isCalloutCardColumnSplitXs({ ...cardColumn, titleSize: 'sm' } as CalloutConfig)).toBe(
      false,
    );
    expect(isCalloutCardColumnSplitXs({ ...cardColumn, titleSize: 'base' } as CalloutConfig)).toBe(
      false,
    );
  });

  it('split sm is true only when horizontal split and titleSize sm', () => {
    expect(isCalloutCardColumnSplitSm({ ...cardColumn, titleSize: 'sm' } as CalloutConfig)).toBe(
      true,
    );
    expect(isCalloutCardColumnSplitSm({ ...cardColumn, titleSize: 'base' } as CalloutConfig)).toBe(
      false,
    );
    expect(isCalloutCardColumnSplitSm({ ...cardColumn, titleSize: 'xs' } as CalloutConfig)).toBe(
      false,
    );
  });
});

describe('resolveCalloutTextAlignment', () => {
  it('reads TextAlign from Sitecore params', () => {
    expect(resolveCalloutTextAlignment({ TextAlign: { Value: { value: 'Center' } } })).toBe(
      'center',
    );
    expect(resolveCalloutTextAlignment({ TextAlign: { Value: { value: 'Left' } } })).toBe('left');
  });

  it('reads flat { value } shape', () => {
    expect(resolveCalloutTextAlignment({ TextAlign: { value: 'Center' } } as Record<string, unknown>)).toBe(
      'center',
    );
  });
});

describe('resolveCalloutDisplayTextAlignment', () => {
  const baseConfig = {
    style: 'text',
    titleSize: 'base',
    colorScheme: 'light',
  } as const satisfies Partial<CalloutConfig>;

  it('uses Sitecore alignment when direction is row', () => {
    expect(
      resolveCalloutDisplayTextAlignment({
        ...baseConfig,
        direction: 'row',
        textAlignment: 'center',
      } as CalloutConfig),
    ).toBe('center');
  });

  it('forces left when direction is column even if config says center', () => {
    expect(
      resolveCalloutDisplayTextAlignment({
        ...baseConfig,
        direction: 'column',
        textAlignment: 'center',
      } as CalloutConfig),
    ).toBe('left');
  });
});

describe('normalizeCalloutItemFields', () => {
  it('extracts value from GraphQL jsonValue for PrependValue and AppendValue', () => {
    const raw = {
      PrependValue: { jsonValue: { value: 'Up to' } },
      Value: { value: '50%' },
      AppendValue: { jsonValue: { value: 'less' } },
      Label: { value: 'Cleaning time' },
    };
    const out = normalizeCalloutItemFields(raw);
    expect(out?.PrependValue?.value).toBe('Up to');
    expect(out?.AppendValue?.value).toBe('less');
    expect(out?.Value?.value).toBe('50%');
  });
});

describe('normalizeCalloutsField', () => {
  it('maps each array row to a callout item (multi-callout datasource)', () => {
    const raw = [
      { id: 'a', fields: { Value: { value: '18' }, Label: { value: 'Languages' } } },
      { id: 'b', fields: { Value: { value: '99%' }, Label: { value: 'Accuracy' } } },
    ];
    const out = normalizeCalloutsField(raw);
    expect(out).toHaveLength(2);
    expect(out[0]?.id).toBe('a');
    expect(out[1]?.fields?.Value?.value).toBe('99%');
  });

  it('unwraps GraphQL { results: [...] } to the same shape as a layout array', () => {
    const raw = {
      results: [{ id: 'x', fields: { Value: { value: '1' }, Label: { value: 'One' } } }],
    };
    const out = normalizeCalloutsField(raw);
    expect(out).toHaveLength(1);
    expect(out[0]?.id).toBe('x');
  });

  it('wraps a single layout row object as a one-element list', () => {
    const raw = {
      id: 'solo',
      url: '/path',
      name: 'Only',
      fields: { Value: { value: '50%' }, Label: { value: 'Half' } },
    };
    const out = normalizeCalloutsField(raw);
    expect(out).toHaveLength(1);
    expect(out[0]?.id).toBe('solo');
    expect(out[0]?.fields?.Value?.value).toBe('50%');
  });
});

describe('calloutLinkFieldHasHref', () => {
  it('is false for missing, empty, or whitespace href', () => {
    expect(calloutLinkFieldHasHref(undefined)).toBe(false);
    expect(calloutLinkFieldHasHref({ value: {} as { href: string } })).toBe(false);
    expect(calloutLinkFieldHasHref({ value: { href: '' } })).toBe(false);
    expect(calloutLinkFieldHasHref({ value: { href: '  \t' } })).toBe(false);
  });

  it('is true when href is non-empty after trim', () => {
    expect(calloutLinkFieldHasHref({ value: { href: '/foo' } })).toBe(true);
    expect(calloutLinkFieldHasHref({ value: { href: ' /bar ' } })).toBe(true);
  });
});

describe('coalesceCalloutGroupLinkFieldForSdk', () => {
  it('unwraps jsonValue.value link shape for SDK', () => {
    const raw = {
      jsonValue: { value: { href: '/x', text: 'Go' } },
    } as unknown as import('@sitecore-content-sdk/nextjs').LinkField;
    const out = coalesceCalloutGroupLinkFieldForSdk(raw);
    expect(out?.value?.href).toBe('/x');
    expect(out?.value?.text).toBe('Go');
  });
});

describe('resolveCalloutComponentFields', () => {
  it('normalizes callout item fields for standalone rendering', () => {
    const fields = {
      Callouts: [
        {
          id: 'a',
          fields: {
            PrependValue: { jsonValue: { value: 'Up to' } },
            Value: { value: '50%' },
            AppendValue: { jsonValue: { value: 'less' } },
          },
        },
      ],
    } as unknown as CalloutFields;
    const out = resolveCalloutComponentFields(fields, false);
    expect(out?.Callouts?.[0]?.fields?.PrependValue?.value).toBe('Up to');
    expect(out?.Callouts?.[0]?.fields?.AppendValue?.value).toBe('less');
  });

  it('merges group Link from datasource when layout href is empty', () => {
    const fields = {
      Callouts: [{ id: 'a', fields: { Value: { value: '1' } } }],
      Link: { value: { href: '' } },
      data: {
        datasource: {
          Link: { value: { href: '/merged', text: 'More' } },
        },
      },
    } as unknown as CalloutFields;
    const out = resolveCalloutComponentFields(fields, false);
    expect(calloutLinkFieldHasHref(out?.Link)).toBe(true);
    expect(out?.Link?.value?.href).toBe('/merged');
  });

  it('coalesces root Link from GraphQL jsonValue before merge check', () => {
    const fields = {
      Callouts: [{ id: 'a', fields: { Value: { value: '1' } } }],
      Link: { jsonValue: { value: { href: '/g', text: 'G' } } },
    } as unknown as CalloutFields;
    const out = resolveCalloutComponentFields(fields, false);
    expect(out?.Link?.value?.href).toBe('/g');
  });
});

describe('patchCalloutDefaultInComponentMap', () => {
  it('wraps Callout.Default with merged props without mutating the original map', () => {
    const received: Record<string, unknown>[] = [];
    const originalDefault = (props: Record<string, unknown>) => {
      received.push(props);
      return null;
    };
    const input = new Map<string, unknown>([
      ['Callout', { Default: originalDefault, componentName: 'Callout' }],
    ]);
    const patched = patchCalloutDefaultInComponentMap(input, { embeddedLayout: true });
    expect(patched).not.toBe(input);
    expect(input.get('Callout')).toEqual({
      Default: originalDefault,
      componentName: 'Callout',
    });
    const wrapped = (patched.get('Callout') as { Default: typeof originalDefault }).Default;
    wrapped({ fields: {}, params: {}, page: {}, rendering: {} });
    expect(received[0]?.embeddedLayout).toBe(true);
  });
});

describe('patchComponentMapForTextAsideAsideCallouts', () => {
  it('injects embeddedLayout and textAsideAsideLayout on Callout.Default', () => {
    const received: Record<string, unknown>[] = [];
    const input = new Map<string, unknown>([
      [
        'Callout',
        {
          Default: (props: Record<string, unknown>) => {
            received.push(props);
            return null;
          },
        },
      ],
    ]);
    const patched = patchComponentMapForTextAsideAsideCallouts(input);
    (patched.get('Callout') as { Default: (p: Record<string, unknown>) => void }).Default({
      a: 1,
    });
    expect(received[0]).toMatchObject({
      a: 1,
      embeddedLayout: true,
      textAsideAsideLayout: true,
    });
  });
});
