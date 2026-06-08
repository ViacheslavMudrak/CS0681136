import type { FooterSubLinkItem } from './Footer.type';

/**
 * Replaces `{{YEAR}}` in copyright text with the current year.
 * @param value - Raw copyright string from Sitecore.
 * @returns The resolved copyright text with the current year inserted.
 */
export const resolveCopyrightText = (value?: string): string =>
  value?.replace('{{YEAR}}', new Date().getFullYear().toString()) ?? '';

/**
 * Extracts display text from a footer sub-link item.
 * Prefers explicit Title field, then Link description, then item display name.
 * @param child - The sub-link item.
 * @returns Resolved text string.
 */
export const getLinkText = (child: FooterSubLinkItem): string => {
  const fromTitle = child.fields?.Title?.value?.toString().trim();
  if (fromTitle) return fromTitle;
  return child.fields?.Link?.value?.text || child.displayName || '';
};

/** Supported social platforms for footer link icon fallbacks. */
export enum SocialPlatform {
  LinkedIn = 'linkedin',
  YouTube = 'youtube',
  Facebook = 'facebook',
  Twitter = 'twitter',
  Instagram = 'instagram',
}

/**
 * Detects the social media platform from a link URL.
 * @param href - The link URL.
 * @returns The detected platform, or null if unrecognised.
 */
export const detectSocialPlatform = (href?: string): SocialPlatform | null => {
  const url = (href ?? '').toLowerCase();
  if (url.includes('linkedin.com')) return SocialPlatform.LinkedIn;
  if (url.includes('youtube.com') || url.includes('youtu.be')) return SocialPlatform.YouTube;
  if (url.includes('facebook.com')) return SocialPlatform.Facebook;
  if (url.includes('twitter.com') || url.includes('x.com')) return SocialPlatform.Twitter;
  if (url.includes('instagram.com')) return SocialPlatform.Instagram;

  return null;
};
