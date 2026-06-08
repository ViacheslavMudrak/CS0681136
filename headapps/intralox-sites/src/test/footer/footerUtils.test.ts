import { describe, expect, it } from 'vitest';

import {
  resolveCopyrightText,
  getLinkText,
  detectSocialPlatform,
  SocialPlatform,
} from 'components/footer/footerUtils';
import type { FooterSubLinkItem } from 'components/footer/Footer.type';

describe('resolveCopyrightText', () => {
  it('returns empty string when value is undefined', () => {
    expect(resolveCopyrightText(undefined)).toBe('');
  });

  it('returns empty string when value is empty string', () => {
    expect(resolveCopyrightText('')).toBe('');
  });

  it('replaces {{YEAR}} with the current year', () => {
    const year = new Date().getFullYear().toString();
    expect(resolveCopyrightText('© {{YEAR}} Intralox')).toBe(`© ${year} Intralox`);
  });

  it('returns the raw string when no {{YEAR}} placeholder is present', () => {
    expect(resolveCopyrightText('All rights reserved.')).toBe('All rights reserved.');
  });

  it('replaces only the first occurrence of {{YEAR}}', () => {
    const year = new Date().getFullYear().toString();
    const result = resolveCopyrightText('{{YEAR}} – {{YEAR}}');
    expect(result).toContain(year);
  });
});

describe('getLinkText', () => {
  it('returns the Title field value when present', () => {
    const item = {
      displayName: 'Display Name',
      fields: {
        Title: { value: 'Title Text' },
        Link: { value: { text: 'Link Text' } },
      },
    } as unknown as FooterSubLinkItem;
    expect(getLinkText(item)).toBe('Title Text');
  });

  it('falls back to Link text when Title is empty', () => {
    const item = {
      displayName: 'Display Name',
      fields: {
        Title: { value: '' },
        Link: { value: { text: 'Link Text' } },
      },
    } as unknown as FooterSubLinkItem;
    expect(getLinkText(item)).toBe('Link Text');
  });

  it('falls back to Link text when Title field is missing', () => {
    const item = {
      displayName: 'Display Name',
      fields: {
        Link: { value: { text: 'Link Text' } },
      },
    } as unknown as FooterSubLinkItem;
    expect(getLinkText(item)).toBe('Link Text');
  });

  it('falls back to displayName when both Title and Link text are absent', () => {
    const item = {
      displayName: 'Display Name',
      fields: {
        Link: { value: { text: '' } },
      },
    } as unknown as FooterSubLinkItem;
    expect(getLinkText(item)).toBe('Display Name');
  });

  it('returns empty string when all fields are absent', () => {
    const item = {
      fields: {},
    } as unknown as FooterSubLinkItem;
    expect(getLinkText(item)).toBe('');
  });

  it('trims whitespace from Title field value', () => {
    const item = {
      fields: {
        Title: { value: '  Resources  ' },
      },
    } as unknown as FooterSubLinkItem;
    expect(getLinkText(item)).toBe('Resources');
  });
});

describe('detectSocialPlatform', () => {
  it('returns null for undefined href', () => {
    expect(detectSocialPlatform(undefined)).toBeNull();
  });

  it('returns null for empty string href', () => {
    expect(detectSocialPlatform('')).toBeNull();
  });

  it('returns null for unrecognised domain', () => {
    expect(detectSocialPlatform('https://example.com/profile')).toBeNull();
  });

  it('detects linkedin', () => {
    expect(detectSocialPlatform('https://www.linkedin.com/company/intralox')).toBe(
      SocialPlatform.LinkedIn,
    );
  });

  it('detects youtube from youtube.com', () => {
    expect(detectSocialPlatform('https://www.youtube.com/channel/intralox')).toBe(
      SocialPlatform.YouTube,
    );
  });

  it('detects youtube from youtu.be shortlink', () => {
    expect(detectSocialPlatform('https://youtu.be/abc123')).toBe(SocialPlatform.YouTube);
  });

  it('detects facebook', () => {
    expect(detectSocialPlatform('https://www.facebook.com/intralox')).toBe(
      SocialPlatform.Facebook,
    );
  });

  it('detects twitter from twitter.com', () => {
    expect(detectSocialPlatform('https://twitter.com/intralox')).toBe(SocialPlatform.Twitter);
  });

  it('detects twitter from x.com', () => {
    expect(detectSocialPlatform('https://x.com/intralox')).toBe(SocialPlatform.Twitter);
  });

  it('detects instagram', () => {
    expect(detectSocialPlatform('https://www.instagram.com/intralox')).toBe(
      SocialPlatform.Instagram,
    );
  });

  it('is case-insensitive for detection', () => {
    expect(detectSocialPlatform('HTTPS://WWW.LINKEDIN.COM/COMPANY/TEST')).toBe(
      SocialPlatform.LinkedIn,
    );
    expect(detectSocialPlatform('HTTPS://WWW.FACEBOOK.COM/TEST')).toBe(SocialPlatform.Facebook);
  });
});
