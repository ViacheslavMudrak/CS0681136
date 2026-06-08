import { describe, expect, it } from 'vitest';

import {
  parseQuickLinkGroupStyleTokenList,
  hasPlainTextVisitorValue,
  hasRichTextVisitorValue,
  QUICK_LINK_GROUP_STYLE_TOKEN_ASIDE_PRESS_INQUIRIES,
  shouldShowQuickLinkGroupAsideLayout,
  shouldShowQuickLinkGroupStackedSidebarRail,
} from 'components/quick-link-group/quickLinkGroupUtils';

describe('parseQuickLinkGroupStyleTokenList', () => {
  it('returns empty when Styles param is absent', () => {
    expect(parseQuickLinkGroupStyleTokenList(undefined)).toEqual([]);
    expect(parseQuickLinkGroupStyleTokenList({})).toEqual([]);
  });

  it('parses space-separated tokens from nested Styles Value', () => {
    expect(
      parseQuickLinkGroupStyleTokenList({
        Styles: { Value: { value: 'indent-bottom' } },
      }),
    ).toEqual(['indent-bottom']);
  });

  it('parses comma-separated tokens and lowercase styles key', () => {
    expect(
      parseQuickLinkGroupStyleTokenList({
        styles: { Value: { value: 'indent-bottom,indent-top' } },
      }),
    ).toEqual(['indent-bottom', 'indent-top']);
  });

  it('reads indent from flat string params.Styles', () => {
    expect(
      parseQuickLinkGroupStyleTokenList({
        Styles: 'indent-bottom',
      } as Record<string, unknown>),
    ).toEqual(['indent-bottom']);
  });

  it('includes press-inquiries-aside alongside indent tokens', () => {
    expect(
      parseQuickLinkGroupStyleTokenList({
        Styles: {
          Value: {
            value: `indent-bottom ${QUICK_LINK_GROUP_STYLE_TOKEN_ASIDE_PRESS_INQUIRIES}`,
          },
        },
      }),
    ).toEqual(['indent-bottom', QUICK_LINK_GROUP_STYLE_TOKEN_ASIDE_PRESS_INQUIRIES]);
  });

  it('ignores unknown style values but still returns them as tokens', () => {
    expect(
      parseQuickLinkGroupStyleTokenList({
        Styles: { Value: { value: 'some-other-style' } },
      }),
    ).toEqual(['some-other-style']);
  });
});

describe('hasPlainTextVisitorValue', () => {
  it('is false for undefined or whitespace', () => {
    expect(hasPlainTextVisitorValue(undefined)).toBe(false);
    expect(hasPlainTextVisitorValue('   ')).toBe(false);
  });

  it('is true for non-empty trimmed text', () => {
    expect(hasPlainTextVisitorValue('  Press  ')).toBe(true);
  });
});

describe('hasRichTextVisitorValue', () => {
  it('is false for empty or tag-only HTML', () => {
    expect(hasRichTextVisitorValue(undefined)).toBe(false);
    expect(hasRichTextVisitorValue('<p></p>')).toBe(false);
    expect(hasRichTextVisitorValue('<p><br></p>')).toBe(false);
  });

  it('is true when text remains after stripping tags and nbsp', () => {
    expect(
      hasRichTextVisitorValue(
        '<p>For press inquiries at&nbsp;<a href="mailto:a@b.com">a@b.com</a>.</p>',
      ),
    ).toBe(true);
  });
});

describe('shouldShowQuickLinkGroupAsideLayout', () => {
  it('is false when there are visible items', () => {
    expect(shouldShowQuickLinkGroupAsideLayout(1, false, undefined, undefined)).toBe(
      false,
    );
  });

  it('is true in editing with no items regardless of copy', () => {
    expect(shouldShowQuickLinkGroupAsideLayout(0, true, undefined, undefined)).toBe(
      true,
    );
  });

  it('is true for visitors with headline only', () => {
    expect(shouldShowQuickLinkGroupAsideLayout(0, false, 'Title', undefined)).toBe(
      true,
    );
  });

  it('is false for visitors with no headline and no meaningful body', () => {
    expect(shouldShowQuickLinkGroupAsideLayout(0, false, undefined, '<p></p>')).toBe(
      false,
    );
  });
});

describe('shouldShowQuickLinkGroupStackedSidebarRail', () => {
  it('is true when QuickLinkItems, ListofLinks, and base card type are all present', () => {
    expect(shouldShowQuickLinkGroupStackedSidebarRail(true, true, 'base')).toBe(true);
  });

  it('is false for card type or when supplementary list is absent', () => {
    expect(shouldShowQuickLinkGroupStackedSidebarRail(true, true, 'card')).toBe(false);
    expect(shouldShowQuickLinkGroupStackedSidebarRail(true, false, 'base')).toBe(false);
    expect(shouldShowQuickLinkGroupStackedSidebarRail(false, true, 'base')).toBe(false);
  });
});
