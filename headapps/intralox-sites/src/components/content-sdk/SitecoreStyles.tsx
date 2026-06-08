'use client';
import { LayoutServiceData, HTMLLink } from '@sitecore-content-sdk/nextjs';
import client from 'src/lib/sitecore-client';
import { coerceSitecoreLayoutParamsStylesForHeadLinks } from 'src/utils/coerceSitecoreLayoutParamsStyles';

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
  coerceSitecoreLayoutParamsStylesForHeadLinks(layoutData);
  const headLinks = client.getHeadLinks(layoutData, { enableStyles, enableThemes });

  if (headLinks.length === 0) {
    return null;
  }

  return (
    <>
      {headLinks.map(({ rel, href }: HTMLLink) => (
        <link rel={rel} key={href} href={href} precedence="high" />
      ))}
    </>
  );
};

export default SitecoreStyles;
