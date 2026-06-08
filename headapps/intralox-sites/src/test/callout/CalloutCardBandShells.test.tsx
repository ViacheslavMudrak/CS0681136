import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

import {
  CalloutCardLabelBand,
  CalloutCardStatBand,
  type CalloutCardBandChromeProps,
} from 'components/callout/partial/CalloutCardBandShells';
import { cn } from 'lib/utils';

/** Golden master from pre–IT-INLINE `resolveCalloutCardStatBandClass` (hsplit text-aside + equal bands). */
function legacyStatBandClass(
  ctx: Pick<
    CalloutCardBandChromeProps,
    | 'contentSwitcherSingleHorizontalSplitReference'
    | 'contentSwitcherLayout'
    | 'singleVisibleCallout'
    | 'isCardColumnHorizontalSplit'
    | 'isCardColumnSplitXs'
    | 'isCardColumnSplitSm'
    | 'textAsideFullWidthItem'
  >,
  textAlignment: CalloutCardBandChromeProps['textAlignment'],
  textAsideMultiCardEqualBands: boolean,
): string {
  const region =
    'box-border flex w-max max-w-full min-w-0 shrink-0 flex-col items-center justify-center gap-0 bg-[var(--color-accent-cyan)] py-2 px-4 min-h-0 h-auto rounded-tl-[length:var(--radius-callout-card-stat-column-base)] rounded-bl-[length:var(--radius-callout-card-stat-column-base)] antialiased [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]';
  if (textAsideMultiCardEqualBands && ctx.isCardColumnHorizontalSplit) {
    return `${region} min-h-0 h-full`.replace(/\s+h-auto\b/g, '').trim();
  }
  return region;
}

function legacyLabelBandClass(
  textAsideMultiCardEqualBands: boolean,
  isCardColumnHorizontalSplit: boolean,
  csCompactBelowLg: boolean,
): string {
  let band =
    'box-border flex min-h-0 min-w-0 flex-1 shrink flex-col items-start justify-center overflow-y-auto overflow-x-hidden border-t-0 border-r-0 border-b-0 border-l-4 border-solid border-ink-inverse bg-chrome-stripe py-2 px-4 h-auto rounded-tr-[length:var(--radius-callout-card-stat-column-base)] rounded-br-[length:var(--radius-callout-card-stat-column-base)] antialiased [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]';
  if (textAsideMultiCardEqualBands && isCardColumnHorizontalSplit) {
    band = `${band} min-h-0 h-full w-full`
      .replace(/\s+h-auto\b/g, '')
      .replace(/\bflex-1\s+shrink\b/g, '')
      .trim();
  }
  if (csCompactBelowLg) {
    band = `${band} max-lg:min-w-0 max-lg:max-w-full`;
  }
  return band;
}

const hsplitTextAsideChrome: CalloutCardBandChromeProps = {
  contentSwitcherSingleHorizontalSplitReference: false,
  contentSwitcherLayout: false,
  singleVisibleCallout: false,
  isCardColumnHorizontalSplit: true,
  isCardColumnSplitXs: false,
  isCardColumnSplitSm: false,
  textAsideFullWidthItem: true,
  textAsideSingleReferenceRowLabel: false,
  textAsideMultiCardEqualBands: true,
  textAlignment: 'center',
  csCompactBelowLg: true,
  children: null,
};

describe('CalloutCardBandShells class parity', () => {
  it('stat band applies equal-row hsplit overrides (no h-auto, min/full height)', () => {
    const { container } = render(
      <CalloutCardStatBand {...hsplitTextAsideChrome}>x</CalloutCardStatBand>,
    );
    const received = container.firstElementChild?.className ?? '';
    const legacy = legacyStatBandClass(hsplitTextAsideChrome, 'center', true);
    expect(received).not.toMatch(/\bh-auto\b/);
    expect(legacy).not.toMatch(/\bh-auto\b/);
    expect(received).toContain('min-h-0');
    expect(received).toContain('h-full');
    expect(received).toContain('bg-[var(--color-accent-cyan)]');
  });

  it('label band applies equal-row + compact CS overrides', () => {
    const { container } = render(
      <CalloutCardLabelBand {...hsplitTextAsideChrome}>x</CalloutCardLabelBand>,
    );
    const received = container.firstElementChild?.className ?? '';
    const legacy = legacyLabelBandClass(true, true, true);
    expect(received).not.toMatch(/\bh-auto\b/);
    expect(legacy).not.toMatch(/\bh-auto\b/);
    expect(received).not.toMatch(/\bflex-1\b/);
    expect(legacy).not.toMatch(/\bflex-1\b/);
    expect(received).toContain('min-h-0');
    expect(received).toContain('h-full');
    expect(received).toContain('w-full');
    expect(received).toContain('max-lg:min-w-0');
    expect(received).toContain('max-lg:max-w-full');
  });

  it('sets data-callout-equal-row-band when equalRowBand is true', () => {
    const { container } = render(
      <CalloutCardStatBand {...hsplitTextAsideChrome} equalRowBand>
        x
      </CalloutCardStatBand>,
    );
    expect(container.firstElementChild).toHaveAttribute('data-callout-equal-row-band', 'true');
  });
});
