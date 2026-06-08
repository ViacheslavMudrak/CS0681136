import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('getRichTextLabels', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns fallbacks when getTranslations throws', async () => {
    vi.doMock('next-intl/server', () => ({
      getTranslations: vi.fn().mockRejectedValue(new Error('no locale')),
    }));
    const { getRichTextLabels, RICH_TEXT_LABEL_FALLBACKS } = await import('src/lib/rich-text-i18n');
    await expect(getRichTextLabels()).resolves.toEqual(RICH_TEXT_LABEL_FALLBACKS);
  });

  it('returns dictionary emptyHint when translation resolves', async () => {
    vi.doMock('next-intl/server', () => ({
      getTranslations: vi.fn().mockResolvedValue((key: string) => {
        if (key === 'RichText_EmptyHint') return 'Hint from dict';
        return key;
      }),
    }));
    const { getRichTextLabels } = await import('src/lib/rich-text-i18n');
    await expect(getRichTextLabels()).resolves.toEqual({ emptyHint: 'Hint from dict' });
  });

  it('falls back when t returns whitespace or raw key', async () => {
    vi.doMock('next-intl/server', () => ({
      getTranslations: vi.fn().mockResolvedValue((key: string) => {
        if (key === 'RichText_EmptyHint') return 'RichText_EmptyHint';
        return key;
      }),
    }));
    const { getRichTextLabels, RICH_TEXT_LABEL_FALLBACKS } = await import('src/lib/rich-text-i18n');
    await expect(getRichTextLabels()).resolves.toEqual(RICH_TEXT_LABEL_FALLBACKS);
  });

  it('falls back when t throws inside readMessage', async () => {
    vi.doMock('next-intl/server', () => ({
      getTranslations: vi.fn().mockResolvedValue(() => {
        throw new Error('bad');
      }),
    }));
    const { getRichTextLabels, RICH_TEXT_LABEL_FALLBACKS } = await import('src/lib/rich-text-i18n');
    await expect(getRichTextLabels()).resolves.toEqual(RICH_TEXT_LABEL_FALLBACKS);
  });
});
