'use client';
import { LayoutServiceData, HTMLLink } from '@sitecore-content-sdk/nextjs';
import client from 'src/lib/sitecore-client';

/**
 * Component to render `<link>` elements for Sitecore styles
 */
const SitecoreStyles = ({
  layoutData,
  enableStyles,
  enableThemes,
}: {
  layoutData: LayoutServiceData;
  enableStyles?: boolean;
  enableThemes?: boolean;
}) => {
  let headLinks: HTMLLink[] = [];
  try {
    headLinks = client.getHeadLinks(layoutData, { enableStyles, enableThemes });
  } catch {
    return null;
  }

  const validLinks = Array.isArray(headLinks)
    ? headLinks.filter(
        (link): link is HTMLLink =>
          link != null &&
          typeof link.href === 'string' &&
          typeof link.rel === 'string'
      )
    : [];

  if (validLinks.length === 0) {
    return null;
  }

  return (
    <>
      {validLinks.map(({ rel, href }) => (
        <link rel={rel} key={href} href={href} precedence="high" />
      ))}
    </>
  );
};

export default SitecoreStyles;
