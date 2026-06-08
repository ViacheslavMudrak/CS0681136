import type { JSX } from 'react';

import { renderingAnchorId } from 'src/utils/renderingAnchorProps';

import type { CookieBannerProps } from './CookieBanner.type';
import {
  COOKIE_BANNER_EMPTY_HINT,
  hasAnyCookieBannerContent,
  resolveBannerTextField,
  resolveButtonLinkField,
} from './cookieBannerUtils';
import { CookieBannerClient } from './partial/CookieBannerClient';
import { cn } from 'lib/utils';

/**
 * Renders the cookie consent strip with Sitecore-authored copy and CTA, delegating dismiss state to the client layer.
 *
 * @param props - Sitecore rendering payload (`fields`, `params`, `page`, `rendering`).
 * @returns Authoring fallback when fields are missing (visitor only), nothing on Pages/editor or when no visitor-visible content exists, or the banner shell.
 */
export const Default = ({
  fields,
  params,
  page,
  rendering,
}: CookieBannerProps): JSX.Element | null => {
  const { styles, RenderingIdentifier } = params;
  const { isEditing } = page.mode;

  if (isEditing) {
    return null;
  }

  if (!fields) {
    return (
      <div
        className={cn("component cookie-banner", styles ?? '')}
        id={renderingAnchorId(RenderingIdentifier)}
      >
        <div className="component-content">
          <span className="is-empty-hint">{COOKIE_BANNER_EMPTY_HINT}</span>
        </div>
      </div>
    );
  }

  if (!hasAnyCookieBannerContent(fields, isEditing)) {
    return null;
  }

  return (
    <CookieBannerClient
      RenderingIdentifier={RenderingIdentifier}
      bannerText={resolveBannerTextField(fields)}
      buttonTextWithLink={resolveButtonLinkField(fields)}
      isEditing={isEditing}
      rendering={rendering}
      styles={styles}
    />
  );
};
