'use client';
import { useEffect, JSX } from 'react';
import { CdpHelper, useSitecore } from '@sitecore-content-sdk/nextjs';
import { pageView } from '@sitecore-cloudsdk/events/browser';
import config from 'sitecore.config';

/** CDP page-view events via Sitecore Cloud SDK (disabled in development). */
const CdpPageView = (): JSX.Element => {
  const {
    page: { layout, siteName, mode },
  } = useSitecore();
  const { route, context } = layout.sitecore;

  /** Skip page-view events in development; wire to cookie consent in production. */
  const disabled = () => {
    return process.env.NODE_ENV === 'development';
  };

  useEffect(() => {
    if (!mode.isNormal || !route?.itemId) {
      return;
    }
    if (disabled()) {
      return;
    }

    const language = route.itemLanguage || config.defaultLanguage;
    const scope = config.personalize?.scope;

    const pageVariantId = CdpHelper.getPageVariantId(
      route.itemId,
      language,
      context.variantId as string,
      scope
    );
    // there can be cases where Events are not initialized which are expected to reject
    pageView({
      channel: 'WEB',
      currency: 'USD',
      page: route.name,
      pageVariantId,
      language,
    }).catch((e) => console.debug(e));
  }, [mode, route, context.variantId, siteName]);

  return <></>;
};

export default CdpPageView;
