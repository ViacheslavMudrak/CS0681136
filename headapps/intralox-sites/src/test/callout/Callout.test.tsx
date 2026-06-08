import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('lib/callout-i18n', () => ({
  getCalloutLabels: vi.fn(async () => ({ emptyHint: 'Callout' })),
}));

import { Default } from 'components/callout/Callout';
import type { CalloutProps } from 'components/callout/Callout.type';
import {
  mergeCalloutRenderingParams,
  resolveCalloutStyle,
  resolveCalloutTextAlignment,
} from 'components/callout/calloutUtils';

const basePage = { mode: { isEditing: false } } as CalloutProps['page'];
const baseParams = { styles: '', RenderingIdentifier: 'callout-test' } as CalloutProps['params'];

describe('calloutUtils alignment & params merge', () => {
  it('resolveCalloutTextAlignment reads TextAlign', () => {
    expect(
      resolveCalloutTextAlignment({
        TextAlign: { Value: { value: 'Center' } },
      }),
    ).toBe('center');
  });

  it('mergeCalloutRenderingParams exposes TextAlign from rendering.params', () => {
    const merged = mergeCalloutRenderingParams(
      { params: { TextAlign: { Value: { value: 'center' } } } },
      { styles: '', RenderingIdentifier: 'x' } as Record<string, unknown>,
    );
    expect(resolveCalloutTextAlignment(merged)).toBe('center');
  });

  it('mergeCalloutRenderingParams keeps rendering TextAlign when props pass undefined', () => {
    const merged = mergeCalloutRenderingParams(
      { params: { TextAlign: { Value: { value: 'Center' } } } },
      { TextAlign: undefined } as Record<string, unknown>,
    );
    expect(resolveCalloutTextAlignment(merged)).toBe('center');
  });

  it('resolveCalloutStyle maps compound CMS values like card/base to card', () => {
    expect(
      resolveCalloutStyle({
        Style: { Value: { value: 'card/base' } },
      }),
    ).toBe('card');
    expect(
      resolveCalloutStyle({
        Style: { Value: { value: 'Base / alt' } },
      }),
    ).toBe('base');
  });
});

describe('Callout Default', () => {
  it('renders empty hint when fields are missing', async () => {
    const ui = await Default({
      fields: undefined,
      params: baseParams,
      page: basePage,
      rendering: { componentName: 'Callout' } as CalloutProps['rendering'],
    });
    render(ui);
    expect(screen.getByText(/callout/i)).toBeInTheDocument();
  });

  it('standalone layout uses shared viewport full-bleed outer shell', async () => {
    const ui = await Default({
      fields: {
        Callouts: [
          {
            id: 'c1',
            fields: { Value: { value: '99%' }, Label: { value: 'Efficiency' } },
          },
          {
            id: 'c2',
            fields: { Value: { value: '24/7' }, Label: { value: 'Uptime' } },
          },
        ],
      } as CalloutProps['fields'],
      params: baseParams,
      page: basePage,
      rendering: { componentName: 'Callout' } as CalloutProps['rendering'],
    });
    const { container } = render(ui);
    const section = container.querySelector('section.component.callout');
    expect(section?.className).toContain('calc(50%-50vw)');
    expect(section?.className).toContain('max-w-[100vw]');
  });

  it('keeps left alignment for card + column when TextAlign is center (CMS alignment ignored)', async () => {
    const fields = {
      Callouts: [
        {
          id: 'c1',
          fields: {
            Value: { value: '42' },
            Label: { value: 'Units' },
          },
        },
      ],
    } as CalloutProps['fields'];

    const ui = await Default({
      fields,
      params: {
        styles: '',
        RenderingIdentifier: 'co',
        Style: { Value: { value: 'card' } },
        Direction: { Value: { value: 'column' } },
      } as CalloutProps['params'],
      page: basePage,
      rendering: {
        componentName: 'Callout',
        params: { TextAlign: { Value: { value: 'center' } } },
      } as CalloutProps['rendering'],
    });
    const { container } = render(ui);
    const list = container.querySelector('[role="list"]');
    expect(list?.className).toMatch(/text-left/);
    expect(list?.className).not.toMatch(/text-center/);
  });

  it('content switcher + single card column xs uses split outer (w-max max-w-full, flex-row), honoring CMS Direction', async () => {
    const fields = {
      Callouts: [
        {
          id: 'only',
          fields: {
            Value: { value: '€145,000' },
            Label: { value: 'annual savings with upgrade to PK belting' },
          },
        },
      ],
    } as CalloutProps['fields'];

    const ui = await Default({
      fields,
      params: {
        styles: '',
        RenderingIdentifier: 'cs-belt-materials',
        Style: { Value: { value: 'Card' } },
        Direction: { Value: { value: 'Column' } },
        TextSize: { Value: { value: 'XS' } },
        TextAlign: { Value: { value: 'Left' } },
      } as CalloutProps['params'],
      page: basePage,
      rendering: {
        componentName: 'Callout',
      } as CalloutProps['rendering'],
      contentSwitcherLayout: true,
    });
    const { container } = render(ui);
    const splitOuter = [...container.querySelectorAll('[class*="flex-row"]')].find(
      (el) => {
        const c = el.className;
        return (
          typeof c === 'string' &&
          c.includes('flex-row') &&
          c.includes('w-max') &&
          c.includes('max-w-full') &&
          c.includes('items-stretch') &&
          c.includes('overflow-hidden') &&
          c.includes('min-w-0')
        );
      },
    );
    expect(splitOuter).toBeTruthy();
  });

  it('content switcher + 3 stats: list shell is lg:flex (not grid); tile wrappers match reference w-auto shell; flex-1 on listitem', async () => {
    const fields = {
      Callouts: [
        { id: 'a', fields: { Value: { value: '2–5x' }, Label: { value: 'longer belt life' } } },
        { id: 'b', fields: { Value: { value: '34%' }, Label: { value: 'reduced belt costs' } } },
        { id: 'c', fields: { Value: { value: '12' }, Label: { value: 'payback time on new belts' } } },
      ],
    } as CalloutProps['fields'];

    const ui = await Default({
      fields,
      params: {
        styles: '',
        RenderingIdentifier: 'cs-three',
        Style: { Value: { value: 'Card' } },
        Direction: { Value: { value: 'Column' } },
        TextSize: { Value: { value: 'XS' } },
      } as CalloutProps['params'],
      page: basePage,
      rendering: { componentName: 'Callout' } as CalloutProps['rendering'],
      contentSwitcherLayout: true,
    });
    const { container } = render(ui);
    const list = container.querySelector('[role="list"]');
    expect(list).toBeTruthy();
    expect(list?.className).toContain('lg:flex');
    expect(list?.className).toContain('lg:items-stretch');
    expect(list?.className).toContain('lg:gap-4');
    expect(list?.className).not.toMatch(/\blg:grid\b/);

    const wrappers = [...(list?.children ?? [])];
    expect(wrappers).toHaveLength(3);
    for (const w of wrappers) {
      expect(w.className).toContain('w-auto');
      expect(w.className).toContain('min-w-0');
      expect(w.className).toContain('lg:flex');
      expect(w.className).toContain('lg:self-stretch');
    }

    const items = container.querySelectorAll('[role="listitem"]');
    expect(items.length).toBe(3);
    for (const li of items) {
      expect(li.className).toMatch(/\blg:flex-1\b/);
    }

    for (const li of items) {
      const labelWrap = [...li.querySelectorAll('div')].find(
        (el) =>
          typeof el.className === 'string' &&
          el.className.includes('box-border') &&
          el.className.includes('min-w-0') &&
          el.className.includes('w-full') &&
          el.className.includes('max-w-full') &&
          el.className.includes('[unicode-bidi:isolate]') &&
          !el.className.includes('flex-row'),
      );
      expect(labelWrap).toBeTruthy();
    }
  });

  it('keeps left alignment for card + row when TextAlign is center (locked layout)', async () => {
    const fields = {
      Callouts: [
        {
          id: 'c1',
          fields: {
            Value: { value: '42' },
            Label: { value: 'Units' },
          },
        },
      ],
    } as CalloutProps['fields'];

    const ui = await Default({
      fields,
      params: {
        styles: '',
        RenderingIdentifier: 'co',
        Style: { Value: { value: 'card' } },
        Direction: { Value: { value: 'row' } },
      } as CalloutProps['params'],
      page: basePage,
      rendering: {
        componentName: 'Callout',
        params: { TextAlign: { Value: { value: 'center' } } },
      } as CalloutProps['rendering'],
    });
    const { container } = render(ui);
    const list = container.querySelector('[role="list"]');
    expect(list?.className).toMatch(/text-left/);
    expect(list?.className).not.toMatch(/text-center/);
  });

  it('applies center alignment when TextAlign is only on rendering.params', async () => {
    const fields = {
      Callouts: [
        {
          id: 'c1',
          fields: {
            Value: { value: '42' },
            Label: { value: 'Units' },
          },
        },
      ],
    } as CalloutProps['fields'];

    const ui = await Default({
      fields,
      params: { styles: '', RenderingIdentifier: 'co' } as CalloutProps['params'],
      page: basePage,
      rendering: {
        componentName: 'Callout',
        params: { TextAlign: { Value: { value: 'center' } } },
      } as CalloutProps['rendering'],
    });
    const { container } = render(ui);
    const list = container.querySelector('[role="list"]');
    expect(list).toBeTruthy();
    expect(list?.className).toMatch(/text-center/);
  });

  it('uses full-width single standalone shell (1280 cap) when one callout is visible', async () => {
    const fields = {
      Callouts: [
        {
          id: 'only',
          fields: {
            Value: { value: '100' },
            Label: { value: 'Metric' },
          },
        },
      ],
    } as CalloutProps['fields'];

    const ui = await Default({
      fields,
      params: baseParams,
      page: basePage,
      rendering: { componentName: 'Callout' } as CalloutProps['rendering'],
      embeddedLayout: false,
    });
    const { container } = render(ui);
    const shell = container.querySelector('[class*="max-w-[80rem]"]');
    expect(shell).toBeTruthy();
    expect(shell?.className).toMatch(/min-h-\[116px\]/);
    expect(shell?.className).toMatch(/font-callout/);
    expect(shell?.className).toMatch(/p-4/);
  });

  it('renders every callout row when Callouts has multiple items (same keys as single-callout)', async () => {
    const fields = {
      Callouts: [
        {
          id: '36ad405e-bc09-4340-a9ba-046b683f5435',
          fields: { Label: { value: 'Languages supported' }, Value: { value: '18' } },
        },
        {
          id: '1d6b3407-c334-4800-93d0-fbd2430a9c88',
          fields: {
            PrependValue: { value: 'less' },
            Label: { value: 'customer service accuracy' },
            Value: { value: '99.4%' },
            AppendValue: { value: 'more' },
          },
        },
        {
          id: 'b9e4860f-35dc-4781-9436-6bc51091cbd9',
          fields: { Label: { value: 'on-time rate' }, Value: { value: '99.9%' } },
        },
      ],
      Footnote: { value: '* Footnote' },
    } as CalloutProps['fields'];

    const ui = await Default({
      fields,
      params: {
        styles: '',
        RenderingIdentifier: 'co',
        Direction: { Value: { value: 'Column' } },
      } as CalloutProps['params'],
      page: basePage,
      rendering: { componentName: 'Callout' } as CalloutProps['rendering'],
      embeddedLayout: false,
    });
    render(ui);
    expect(screen.getByText('Languages supported')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('customer service accuracy')).toBeInTheDocument();
    expect(screen.getByText('99.4%')).toBeInTheDocument();
    expect(screen.getByText('on-time rate')).toBeInTheDocument();
    expect(screen.getByText('99.9%')).toBeInTheDocument();
    expect(screen.getByText(/\* Footnote/)).toBeInTheDocument();
    const list = document.querySelector('[role="list"]');
    expect(list?.querySelectorAll('[role="listitem"]').length).toBe(3);
  });

  it('omits inter-item dividers for multi callout when Style is card (row and column)', async () => {
    const fields = {
      Callouts: [
        { id: 'a', fields: { Value: { value: '1' }, Label: { value: 'One' } } },
        { id: 'b', fields: { Value: { value: '2' }, Label: { value: 'Two' } } },
      ],
    } as CalloutProps['fields'];

    const cardRowUi = await Default({
      fields,
      params: {
        ...baseParams,
        Style: { Value: { value: 'card' } },
        Direction: { Value: { value: 'Row' } },
      } as CalloutProps['params'],
      page: basePage,
      rendering: { componentName: 'Callout' } as CalloutProps['rendering'],
    });
    const { container: rowContainer } = render(cardRowUi);
    expect(rowContainer.querySelectorAll('[role="separator"]').length).toBe(0);
    const rowSecond = rowContainer.querySelectorAll('[role="listitem"]')[1];
    expect(rowSecond?.className).not.toMatch(/lg:border-l lg:border-stroke-default/);

    const cardColUi = await Default({
      fields,
      params: {
        ...baseParams,
        Style: { Value: { value: 'card' } },
        Direction: { Value: { value: 'Column' } },
      } as CalloutProps['params'],
      page: basePage,
      rendering: { componentName: 'Callout' } as CalloutProps['rendering'],
    });
    const { container: colContainer } = render(cardColUi);
    const colSecond = colContainer.querySelectorAll('[role="listitem"]')[1];
    expect(colSecond?.className).toMatch(/border-t-0/);
  });

  it('keeps inter-item dividers for multi callout when Style is text (row)', async () => {
    const fields = {
      Callouts: [
        { id: 'a', fields: { Value: { value: '1' }, Label: { value: 'One' } } },
        { id: 'b', fields: { Value: { value: '2' }, Label: { value: 'Two' } } },
      ],
    } as CalloutProps['fields'];

    const ui = await Default({
      fields,
      params: {
        ...baseParams,
        Style: { Value: { value: 'text' } },
        Direction: { Value: { value: 'Row' } },
      } as CalloutProps['params'],
      page: basePage,
      rendering: { componentName: 'Callout' } as CalloutProps['rendering'],
    });
    const { container } = render(ui);
    expect(container.querySelectorAll('[role="separator"]').length).toBeGreaterThan(0);
    const second = container.querySelectorAll('[role="listitem"]')[1];
    expect(second?.className).toMatch(/lg:border-l/);
  });

  it('uses 210px min-height shell for single standalone when Style is card', async () => {
    const fields = {
      Callouts: [
        {
          id: 'only',
          fields: {
            Value: { value: '12' },
            Label: { value: 'Years' },
          },
        },
      ],
    } as CalloutProps['fields'];

    const ui = await Default({
      fields,
      params: {
        ...baseParams,
        Style: { Value: { value: 'card' } },
      } as CalloutProps['params'],
      page: basePage,
      rendering: { componentName: 'Callout' } as CalloutProps['rendering'],
      embeddedLayout: false,
    });
    const { container } = render(ui);
    const shell = container.querySelector('[class*="max-w-[80rem]"]');
    expect(shell?.className).toMatch(/min-h-\[var\(--height-callout-card-shell\)\]/);
  });
});
