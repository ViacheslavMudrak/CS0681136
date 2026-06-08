import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('getQuickLinkLabels', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns fallbacks when getTranslations throws', async () => {
    vi.doMock('next-intl/server', () => ({
      getTranslations: vi.fn().mockRejectedValue(new Error('no locale')),
    }));
    const { getQuickLinkLabels, QUICK_LINK_LABEL_FALLBACKS } = await import('src/lib/quick-link-i18n');
    await expect(getQuickLinkLabels()).resolves.toEqual(QUICK_LINK_LABEL_FALLBACKS);
  });

  it('returns dictionary values when translation resolves', async () => {
    vi.doMock('next-intl/server', () => ({
      getTranslations: vi.fn().mockResolvedValue((key: string) => {
        if (key === 'QuickLink_EmptyHint') return 'Empty from dict';
        if (key === 'QuickLink_LinkAriaFallback') return 'Aria from dict';
        return key;
      }),
    }));
    const { getQuickLinkLabels } = await import('src/lib/quick-link-i18n');
    await expect(getQuickLinkLabels()).resolves.toEqual({
      emptyHint: 'Empty from dict',
      linkAriaFallback: 'Aria from dict',
    });
  });

  it('falls back per-field when t returns empty string or raw key', async () => {
    vi.doMock('next-intl/server', () => ({
      getTranslations: vi.fn().mockResolvedValue((key: string) => {
        if (key === 'QuickLink_EmptyHint') return '   ';
        if (key === 'QuickLink_LinkAriaFallback') return 'QuickLink_LinkAriaFallback';
        return key;
      }),
    }));
    const { getQuickLinkLabels, QUICK_LINK_LABEL_FALLBACKS } = await import('src/lib/quick-link-i18n');
    await expect(getQuickLinkLabels()).resolves.toEqual({
      emptyHint: QUICK_LINK_LABEL_FALLBACKS.emptyHint,
      linkAriaFallback: QUICK_LINK_LABEL_FALLBACKS.linkAriaFallback,
    });
  });

  it('falls back when t throws inside readMessage', async () => {
    vi.doMock('next-intl/server', () => ({
      getTranslations: vi.fn().mockResolvedValue(() => {
        throw new Error('bad dict');
      }),
    }));
    const { getQuickLinkLabels, QUICK_LINK_LABEL_FALLBACKS } = await import('src/lib/quick-link-i18n');
    await expect(getQuickLinkLabels()).resolves.toEqual(QUICK_LINK_LABEL_FALLBACKS);
  });
});
